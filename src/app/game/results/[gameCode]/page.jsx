"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Trophy, Medal, Award, Sparkles, Home, Loader2 } from "lucide-react";

export default function ResultsPage() {
  return (
    <ProtectedRoute>
      <ResultsContent />
    </ProtectedRoute>
  );
}

function ResultsContent() {
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const gameCode = params.gameCode;

  useEffect(() => {
    if (!gameCode || !user) return;

    const loadGame = async () => {
      try {
        const gameRef = doc(db, "games", gameCode);
        const gameSnap = await getDoc(gameRef);

        if (!gameSnap.exists()) {
          router.push("/dashboard");
          return;
        }

        const gameData = { id: gameSnap.id, ...gameSnap.data() };

        // Check if user was in this game
        if (!gameData.players || !gameData.players[user.uid]) {
          router.push("/dashboard");
          return;
        }

        // Check if game is actually completed
        if (gameData.status !== "completed") {
          router.push(`/game/play/${gameCode}`);
          return;
        }

        setGame(gameData);
        setLoading(false);
      } catch (error) {
        console.error("Error loading game results:", error);
        router.push("/dashboard");
      }
    };

    loadGame();
  }, [gameCode, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-foreground mx-auto" />
          <p className="text-lg">Loading results...</p>
        </div>
      </div>
    );
  }

  // Sort players by points
  const sortedPlayers = Object.entries(game?.players || {}).sort(
    ([, a], [, b]) => b.points - a.points
  );

  const winner = sortedPlayers[0];
  const isUserWinner = winner && winner[0] === user?.uid;

  const getMedalIcon = (position) => {
    switch (position) {
      case 0:
        return <Trophy className="h-6 w-6 text-amber-500" />;
      case 1:
        return <Medal className="h-6 w-6 text-slate-400" />;
      case 2:
        return <Award className="h-6 w-6 text-amber-700" />;
      default:
        return null;
    }
  };

  const getMedalColor = (position) => {
    switch (position) {
      case 0:
        return "from-amber-400 to-yellow-500";
      case 1:
        return "from-slate-300 to-slate-400";
      case 2:
        return "from-amber-600 to-amber-800";
      default:
        return "from-slate-200 to-slate-300";
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="container mx-auto max-w-4xl py-8">
        {/* Celebration Header */}
        <div className="text-center mb-8 space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="h-12 w-12 animate-pulse text-primary" />
            <h1 className="text-2xl font-bold text-white">Game Over!</h1>
            <Sparkles className="h-12 w-12 animate-pulse text-accent" />
          </div>

          {isUserWinner ? (
            <div className="bg-success backdrop-blur border border-border rounded-2xl p-6 inline-block">
              <p className="text-2xl font-bold mb-2">🎉 Congratulations! 🎉</p>
              <p className="text-xl">You won the game!</p>
            </div>
          ) : (
            <div className="bg-card backdrop-blur border border-border rounded-2xl p-6 inline-block">
              <p className="text-2xl font-bold text-white">
                Thanks for playing!
              </p>
            </div>
          )}
        </div>

        {/* Winner Spotlight */}
        {winner && (
          <Card className="mb-8 border-4 border-amber-400 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-amber-400 to-yellow-500 p-6">
              <div className="flex items-center justify-center gap-4">
                <Trophy className="h-16 w-16 text-white" />
                <div className="text-center">
                  <p className="text-white/90 text-lg font-semibold mb-1">
                    WINNER
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {winner[1].username}
                  </p>
                  <p className="text-2xl font-bold text-white/90 mt-2">
                    {winner[1].points} Points
                  </p>
                </div>
                <Trophy className="h-16 w-16 text-white" />
              </div>
            </div>
          </Card>
        )}

        {/* Final Standings */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Trophy className="h-8 w-8 text-amber-500" />
              Final Standings
            </CardTitle>
            <CardDescription>
              Game completed after {game?.rounds} round
              {game?.rounds !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sortedPlayers.map(([playerId, playerData], index) => (
              <div key={playerId}>
                <div
                  className={`flex items-center gap-4 p-2 rounded-xl ${
                    playerId === user?.uid
                      ? "bg-card border border-border"
                      : index === 0
                      ? "bg-card border border-border"
                      : "bg-card"
                  }`}
                >
                  {/* Position */}
                  <div className="flex-shrink-0">
                    {index < 3 ? (
                      <div
                        className={`w-12 h-12 rounded-full bg-gradient-to-br ${getMedalColor(
                          index
                        )} flex items-center justify-center shadow-lg`}
                      >
                        {getMedalIcon(index)}
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center shadow text-2xl font-bold text-slate-600">
                        {index + 1}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="font-medium">
                      {playerData.username}
                      {playerId === user?.uid && (
                        <span className="text-purple-600 ml-2">(You)</span>
                      )}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={index === 0 ? "default" : "secondary"}
                        className={`text-base px-3 py-1 ${
                          index === 0 ? "bg-amber-500 hover:bg-amber-600" : ""
                        }`}
                      >
                        {playerData.points} points
                      </Badge>
                      {index === 0 && (
                        <Badge
                          variant="outline"
                          className="text-amber-600 border-amber-600"
                        >
                          Champion
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Trophy for winner */}
                  {index === 0 && (
                    <Trophy className="h-8 w-8 text-amber-500 animate-pulse" />
                  )}
                </div>

                {index < sortedPlayers.length - 1 && (
                  <Separator className="my-4" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Game Stats */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Game Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 border border-border rounded-lg">
                <p className="text-3xl font-bold text-purple-600">
                  {game?.rounds}
                </p>
                <p className="text-sm text-muted-foreground">Rounds Played</p>
              </div>
              <div className="text-center p-3 border border-border rounded-lg">
                <p className="text-3xl font-bold text-pink-600">
                  {Object.keys(game?.players || {}).length}
                </p>
                <p className="text-sm text-muted-foreground">Total Players</p>
              </div>
              <div className="text-center p-3 border border-border rounded-lg">
                <p className="text-3xl font-bold text-orange-600">
                  {game?.usedDareIds?.length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Dares Completed</p>
              </div>
              <div className="text-center p-3 border border-border rounded-lg">
                <p className="text-3xl font-bold text-amber-600">
                  {winner?.[1]?.points || 0}
                </p>
                <p className="text-sm text-muted-foreground">Highest Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories Used */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="">Categories Played</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {game?.categories?.map((category) => (
                <Badge key={category} variant="soft" size="md">
                  {category}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => router.push("/dashboard")}
            className="w-full"
            size="xl"
          >
            <Home className="mr-2 h-5 w-5" />
            Back to Dashboard
          </Button>
        </div>

        {/* Footer Message */}
        <div className="mt-8 text-center">
          <Card className="">
            <CardContent className="py-6">
              <p className="text-lg font-medium">
                Thanks for playing! 🎮
              </p>
              <p className="text-muted-foreground mt-2">
                Create a new game or join another to keep the fun going!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
