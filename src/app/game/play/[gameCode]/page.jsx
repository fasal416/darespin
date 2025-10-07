"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { doc, onSnapshot, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  getRandomDare,
  getNextPlayer,
  calculateVoteResults,
  isRoundComplete,
  resetPlayersForNextRound,
} from "@/lib/gameHelpers";
import { formatTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Trophy,
  Clock,
  Target,
  CheckCircle2,
  XCircle,
  Timer,
  AlertCircle,
} from "lucide-react";

export default function GamePlayPage() {
  return (
    <ProtectedRoute>
      <GamePlayContent />
    </ProtectedRoute>
  );
}

function GamePlayContent() {
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dareTimeLeft, setDareTimeLeft] = useState(0);
  const [votingTimeLeft, setVotingTimeLeft] = useState(60);
  const [hasVoted, setHasVoted] = useState(false);
  const [processing, setProcessing] = useState(false);
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const gameCode = params.gameCode;

  // Real-time game listener
  useEffect(() => {
    if (!gameCode || !user) return;

    const gameRef = doc(db, "games", gameCode);
    const unsubscribe = onSnapshot(
      gameRef,
      (docSnap) => {
        if (!docSnap.exists()) {
          router.push("/dashboard");
          return;
        }

        const gameData = { id: docSnap.id, ...docSnap.data() };
        setGame(gameData);

        // Check if user is in game
        if (!gameData.players || !gameData.players[user.uid]) {
          router.push("/dashboard");
          return;
        }

        // If game completed, redirect to results
        if (gameData.status === "completed") {
          router.push(`/game/results/${gameCode}`);
          return;
        }

        // Check if user already voted
        if (gameData.currentDare?.votes) {
          const userVote = gameData.currentDare.votes.find(
            (v) => v.userId === user.uid
          );
          setHasVoted(!!userVote);
        } else {
          setHasVoted(false);
        }

        setLoading(false);
      },
      (error) => {
        console.error("Error listening to game:", error);
        router.push("/dashboard");
      }
    );

    return () => unsubscribe();
  }, [gameCode, user, router]);

  // Dare timer (for active dares)
  // Dare timer (for active dares) - ADMIN ONLY PROCESSES
  useEffect(() => {
    if (!game?.currentDare || game.currentDare.status !== "active") {
      return;
    }

    const dareStartTime = new Date(game.currentDare.assignedAt).getTime();
    const timeLimit = game.currentDare.timeLimit * 1000; // Convert to milliseconds

    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = now - dareStartTime;
      const remaining = Math.max(0, Math.ceil((timeLimit - elapsed) / 1000));

      setDareTimeLeft(remaining);

      // Only admin handles timeout
      const isAdmin = game.admin === user?.uid;
      if (remaining === 0 && !processing && isAdmin) {
        clearInterval(timer);
        handleDareTimeout();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [game?.currentDare, game?.admin, user?.uid, processing]);

  // Voting timer
  useEffect(() => {
    if (!game?.currentDare || game.currentDare.status !== "voting") {
      return;
    }

    // Only admin processes results
    const isAdmin = game.admin === user?.uid;
    if (!isAdmin) return;

    const votingStartTime = new Date(
      game.currentDare.votingStartedAt
    ).getTime();
    const votingDuration = 60 * 1000; // 60 seconds

    // Check if all eligible voters have voted
    const playerCount = Object.keys(game.players || {}).length;
    const eligibleVoters = playerCount - 1; // Exclude dare-doer
    const currentVotes = game.currentDare.votes?.length || 0;

    // If everyone voted, process immediately
    if (currentVotes >= eligibleVoters && eligibleVoters > 0 && !processing) {
      console.log("All players voted! Processing results immediately...");
      processVotingResults();
      return;
    }

    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = now - votingStartTime;
      const remaining = Math.max(
        0,
        Math.ceil((votingDuration - elapsed) / 1000)
      );

      setVotingTimeLeft(remaining);

      // Check again if all voted (in case votes came in during this interval)
      const latestVotes = game.currentDare.votes?.length || 0;
      if (latestVotes >= eligibleVoters && eligibleVoters > 0 && !processing) {
        clearInterval(timer);
        console.log("All players voted! Processing results immediately...");
        processVotingResults();
        return;
      }

      // Auto-process voting when time expires
      if (remaining === 0 && !processing) {
        clearInterval(timer);
        processVotingResults();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [game?.currentDare, game?.players, game?.admin, user?.uid, processing]);

  // Initialize first dare if needed (ADMIN ONLY)
  useEffect(() => {
    if (!game || game.status !== "active" || processing) return;
    if (game.currentDare) return; // Already has a dare

    // Only admin assigns dares
    const isAdmin = game.admin === user?.uid;
    if (!isAdmin) return;

    assignNextDare();
  }, [game, processing, user?.uid]);

  // Initialize first dare if needed
  useEffect(() => {
    if (!game || game.status !== "active" || processing) return;
    if (game.currentDare) return; // Already has a dare

    assignNextDare();
  }, [game, processing]);

  const assignNextDare = async () => {
    // Only admin can assign dares
    if (game.admin !== user?.uid) return;

    if (processing) return;
    setProcessing(true);

    try {
      const gameRef = doc(db, "games", gameCode);

      // Get next player
      const nextPlayerId = getNextPlayer(
        game.players,
        game.rounds,
        game.currentDare?.playerId
      );

      if (!nextPlayerId) {
        // All players completed all dares - end game
        await updateDoc(gameRef, {
          status: "completed",
          completedAt: new Date().toISOString(),
          currentDare: null,
        });
        return;
      }

      // Get random dare
      const dare = await getRandomDare(game.categories, game.usedDareIds || []);

      if (!dare) {
        // No more dares available, end game
        await updateDoc(gameRef, {
          status: "completed",
          completedAt: new Date().toISOString(),
        });
        return;
      }

      // Assign dare
      await updateDoc(gameRef, {
        currentDare: {
          playerId: nextPlayerId,
          dareId: dare.id,
          dareText: dare.text,
          dareCategory: dare.category,
          timeLimit: dare.timeLimit,
          status: "active",
          votes: [],
          assignedAt: new Date().toISOString(),
        },
        usedDareIds: [...(game.usedDareIds || []), dare.id],
      });
    } catch (error) {
      console.error("Error assigning dare:", error);
    } finally {
      setProcessing(false);
    }
  };

  const handleDareTimeout = async () => {
    // Only admin can process timeout
    if (game.admin !== user?.uid) return;

    if (!game?.currentDare || processing) return;
    setProcessing(true);

    try {
      const gameRef = doc(db, "games", gameCode);

      // Player failed - give 0 points, increment dares completed
      await updateDoc(gameRef, {
        [`players.${game.currentDare.playerId}.daresCompleted`]: increment(1),
        currentDare: null,
      });

      // Small delay before assigning next dare
      setTimeout(() => {
        assignNextDare();
      }, 2000);
    } catch (error) {
      console.error("Error handling timeout:", error);
      setProcessing(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!game?.currentDare || game.currentDare.playerId !== user.uid) return;
    if (processing) return;

    setProcessing(true);
    try {
      const gameRef = doc(db, "games", gameCode);
      await updateDoc(gameRef, {
        "currentDare.status": "voting",
        "currentDare.votingStartedAt": new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error marking complete:", error);
    } finally {
      setProcessing(false);
    }
  };

  const handleVote = async (voteType) => {
    if (!game?.currentDare || hasVoted || processing) return;
    if (game.currentDare.playerId === user.uid) return; // Can't vote on own dare

    setProcessing(true);
    try {
      const gameRef = doc(db, "games", gameCode);
      const newVote = {
        userId: user.uid,
        vote: voteType,
        votedAt: new Date().toISOString(),
      };

      await updateDoc(gameRef, {
        "currentDare.votes": [...(game.currentDare.votes || []), newVote],
      });

      setHasVoted(true);
    } catch (error) {
      console.error("Error voting:", error);
    } finally {
      setProcessing(false);
    }
  };

  const processVotingResults = async () => {
    // Only admin can process results
    if (game.admin !== user?.uid) return;

    if (!game?.currentDare || processing) return;
    setProcessing(true);

    try {
      const gameRef = doc(db, "games", gameCode);
      const { points } = calculateVoteResults(game.currentDare.votes || []);

      // Update player points and dares completed
      await updateDoc(gameRef, {
        [`players.${game.currentDare.playerId}.points`]: increment(points),
        [`players.${game.currentDare.playerId}.daresCompleted`]: increment(1),
        currentDare: null,
      });

      // Small delay before assigning next dare
      setTimeout(() => {
        assignNextDare();
      }, 2000);
    } catch (error) {
      console.error("Error processing results:", error);
      setProcessing(false);
    }
  };

  const handleRoundComplete = async () => {
    // Only admin can handle round completion
    if (game.admin !== user?.uid) return;

    try {
      const gameRef = doc(db, "games", gameCode);

      // Check if this was the last round
      if (game.currentRound >= game.rounds) {
        await updateDoc(gameRef, {
          status: "completed",
          completedAt: new Date().toISOString(),
          currentDare: null,
        });
        return;
      }

      // Move to next round
      const updatedPlayers = resetPlayersForNextRound(game.players);
      await updateDoc(gameRef, {
        currentRound: increment(1),
        players: updatedPlayers,
        currentDare: null,
      });

      // Assign first dare of new round
      setTimeout(() => {
        setProcessing(false);
      }, 2000);
    } catch (error) {
      console.error("Error handling round complete:", error);
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto" />
          <p className="text-lg">Loading game...</p>
        </div>
      </div>
    );
  }

  const currentDare = game?.currentDare;
  const isCurrentPlayer = currentDare?.playerId === user?.uid;
  const isDareActive = currentDare?.status === "active";
  const isVoting = currentDare?.status === "voting";
  const playerCount = Object.keys(game?.players || {}).length;
  const eligibleVoters = playerCount - 1; // Exclude dare-doer
  const currentVotes = currentDare?.votes?.length || 0;

  return (
    <div className="min-h-screen p-4">
      <div className="container mx-auto max-w-6xl py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Game Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Round Progress */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-6 w-6" />
                    Game Progress
                  </CardTitle>
                  <Badge variant="soft" color="success" size="md">
                    Playing
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Total Rounds: {game?.rounds}</span>
                    <span>
                      {Object.values(game?.players || {}).reduce(
                        (sum, p) => sum + (p.daresCompleted || 0),
                        0
                      )}{" "}
                      / {Object.keys(game?.players || {}).length * game?.rounds}{" "}
                      Dares
                    </span>
                  </div>
                  <Progress
                    value={
                      (Object.values(game?.players || {}).reduce(
                        (sum, p) => sum + (p.daresCompleted || 0),
                        0
                      ) /
                        (Object.keys(game?.players || {}).length *
                          game?.rounds)) *
                      100
                    }
                    className="h-3"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Current Dare */}
            {!currentDare && !processing && (
              <Card className="border-1 border-dashed border-border">
                <CardContent className="py-12 text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg text-muted-foreground">
                    Preparing next dare...
                  </p>
                </CardContent>
              </Card>
            )}

            {currentDare && (
              <Card className="border border-border">
                <CardHeader>
                  <div className="flex items-center gap-3 justify-between">
                    <div>
                      <CardTitle className="text-xl mb-2">
                        {isCurrentPlayer
                          ? "Your Dare!"
                          : `${
                              game.players[currentDare.playerId]?.username
                            }'s Turn`}
                      </CardTitle>
                      <Badge variant="soft" size="md">
                        {currentDare.dareCategory}
                      </Badge>
                    </div>
                    {isDareActive && (
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Clock
                            className={`h-6 w-6 ${
                              dareTimeLeft <= 10
                                ? "text-red-500 animate-pulse"
                                : "text-purple-600"
                            }`}
                          />
                          <span
                            className={`text-xl font-bold ${
                              dareTimeLeft <= 10
                                ? "text-red-500"
                                : "text-purple-600"
                            }`}
                          >
                            {formatTime(dareTimeLeft)}
                          </span>
                        </div>
                        <Progress
                          value={(dareTimeLeft / currentDare.timeLimit) * 100}
                          className="h-2 w-24"
                        />
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Dare Text */}
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <p className="text-lg font-medium text-center">
                      {currentDare.dareText}
                    </p>
                  </div>

                  {/* Time Warning */}
                  {isDareActive && dareTimeLeft <= 10 && dareTimeLeft > 0 && (
                    <div className="flex items-center gap-2 p-3 bg-destructive/10 border-2 border-destructive/50 rounded-lg animate-pulse">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                      <p className="text-destructive font-semibold">
                        Hurry! Time is running out!
                      </p>
                    </div>
                  )}

                  {/* Active Dare - Mark Complete Button */}
                  {isDareActive && isCurrentPlayer && (
                    <Button
                      onClick={handleMarkComplete}
                      className="w-full"
                      loading={processing}
                      loadingText="Processing..."
                      size="xl"
                    >
                      <>
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        Mark as Completed
                      </>
                    </Button>
                  )}

                  {isDareActive && !isCurrentPlayer && (
                    <div className="text-center p-3 bg-info/10 border border-info/50 rounded-lg">
                      <p className="text-info-foreground">
                        Waiting for{" "}
                        {game.players[currentDare.playerId]?.username} to
                        complete the dare...
                      </p>
                      <p className="text-sm text-info-foreground/60 mt-1">
                        Time remaining: {formatTime(dareTimeLeft)}
                      </p>
                    </div>
                  )}

                  {/* Voting */}
                  {isVoting && (
                    <div className="space-y-4">
                      <Separator />

                      {/* Voting Timer */}
                      <div className="text-center space-y-2">
                        <div className="flex items-center justify-center gap-2">
                          <Timer className="h-5 w-5 text-orange-500" />
                          <span className="text-2xl font-bold text-orange-500">
                            {formatTime(votingTimeLeft)}
                          </span>
                        </div>
                        <Progress
                          value={(votingTimeLeft / 60) * 100}
                          className="h-2"
                        />
                      </div>

                      {/* Vote Buttons */}
                      {!isCurrentPlayer && !hasVoted && (
                        <div className="grid grid-cols-2 gap-4">
                          <Button
                            onClick={() => handleVote("completed")}
                            disabled={processing}
                            className="w-full"
                            size="xl"
                            color="success"
                          >
                            Completed
                          </Button>
                          <Button
                            onClick={() => handleVote("not_completed")}
                            disabled={processing}
                            variant="solid"
                            className="w-full"
                            color="destructive"
                            size="xl"
                          >
                            Not Completed
                          </Button>
                        </div>
                      )}

                      {!isCurrentPlayer && hasVoted && (
                        <div className="text-center p-4 bg-success/10 border border-success/50 rounded-lg">
                          <CheckCircle2 className="h-8 w-8 text-success-foreground mx-auto mb-2" />
                          <p className="text-green-700 font-medium">
                            Vote submitted! Waiting for others...
                          </p>
                        </div>
                      )}

                      {isCurrentPlayer && (
                        <div className="text-center p-3 bg-primary/10 rounded-lg">
                          <p className="text-purple-700">
                            Other players are voting on your performance...
                          </p>
                        </div>
                      )}

                      {/* Vote Count */}
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                          Votes received: {currentVotes} / {eligibleVoters}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Scoreboard Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-amber-500" />
                  Scoreboard
                </CardTitle>
                <CardDescription>Live standings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(game?.players || {})
                    .sort(([, a], [, b]) => b.points - a.points)
                    .map(([playerId, playerData], index) => (
                      <div
                        key={playerId}
                        className={`flex items-center gap-3 p-3 rounded-lg ${
                          playerId === user?.uid
                            ? "bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300"
                            : "bg-slate-50"
                        }`}
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-cyan-400 text-white">
                            {playerData.username?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">
                            {playerData.username}
                            {playerId === user?.uid && (
                              <span className="text-purple-600 ml-1">
                                (You)
                              </span>
                            )}
                          </p>
                          <div className="flex items-center gap-2 text-sm">
                            <Badge variant="secondary" className="text-xs">
                              {playerData.points} pts
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {playerData.daresCompleted || 0}/{game?.rounds}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
