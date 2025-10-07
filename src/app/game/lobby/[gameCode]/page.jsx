"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
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
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Copy,
  Crown,
  Loader2,
  Users,
  Target,
  Layers,
  ArrowLeft,
  UserPlus,
} from "lucide-react";

export default function LobbyPage() {
  return (
    <ProtectedRoute>
      <LobbyContent />
    </ProtectedRoute>
  );
}

function LobbyContent() {
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);
  const [starting, setStarting] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const gameCode = params.gameCode;

  useEffect(() => {
    if (!gameCode || !user) return;

    const gameRef = doc(db, "games", gameCode);

    // Real-time listener for game updates
    const unsubscribe = onSnapshot(
      gameRef,
      async (docSnap) => {
        if (!docSnap.exists()) {
          setError("Game not found");
          setLoading(false);
          return;
        }

        const gameData = { id: docSnap.id, ...docSnap.data() };
        setGame(gameData);

        // Check if user is in the game
        const isPlayerInGame = gameData.players && gameData.players[user.uid];

        // If game is active, redirect to gameplay
        if (gameData.status === "active" && isPlayerInGame) {
          router.push(`/game/play/${gameCode}`);
        }

        // If game already started and user not in game
        if (gameData.status === "active" && !isPlayerInGame) {
          setError("Game already started, sorry!");
        }

        setLoading(false);
      },
      (err) => {
        console.error("Error listening to game:", err);
        setError("Failed to load game");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [gameCode, user, router]);

  const handleJoinGame = async () => {
    if (joining || !game) return;

    setJoining(true);
    setError("");

    try {
      // Check if already in game
      if (game.players && game.players[user.uid]) {
        setError("You are already in this game");
        setJoining(false);
        return;
      }

      // Check if game already started
      if (game.status !== "waiting") {
        setError("Game already started, sorry!");
        setJoining(false);
        return;
      }

      // Check if max players reached
      const playerCount = Object.keys(game.players || {}).length;
      if (playerCount >= 5) {
        setError("Game is full (max 5 players)");
        setJoining(false);
        return;
      }

      // Get user data
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      let username;
      if (userSnap.exists()) {
        username = userSnap.data().username;
      } else {
        username = user.displayName || user.email?.split("@")[0] || "Player";
      }

      // Add player to game
      const gameRef = doc(db, "games", gameCode);
      await updateDoc(gameRef, {
        [`players.${user.uid}`]: {
          username,
          points: 0,
          daresCompleted: 0, // ADD THIS
          joinedAt: new Date().toISOString(),
        },
      });
    } catch (err) {
      console.error("Error joining game:", err);
      setError("Failed to join game");
    } finally {
      setJoining(false);
    }
  };

  const handleStartGame = async () => {
    if (!game || game.admin !== user.uid) return;

    const playerCount = Object.keys(game.players || {}).length;
    if (playerCount < 2) {
      setError("Need at least 2 players to start");
      return;
    }

    setStarting(true);
    try {
      const gameRef = doc(db, "games", gameCode);
      await updateDoc(gameRef, {
        status: "active",
        startedAt: new Date().toISOString(),
      });
      // Navigation will happen automatically via snapshot listener
    } catch (err) {
      console.error("Error starting game:", err);
      setError("Failed to start game");
      setStarting(false);
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/game/lobby/${gameCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(gameCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-foreground mx-auto" />
        </div>
      </div>
    );
  }

  if (error && !game) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-card p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>{error}</p>
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full"
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isAdmin = game?.admin === user?.uid;
  const playerCount = Object.keys(game?.players || {}).length;
  const players = game?.players || {};
  const isInGame = players[user?.uid];

  return (
    <div className="min-h-screen p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="grid gap-4">
          {/* Game Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center justify-between">
                <span>Game Lobby</span>
                <Badge variant="soft" color="warning">
                  Waiting
                </Badge>
              </CardTitle>
              <CardDescription>
                {isInGame
                  ? "Waiting for more players to join..."
                  : "Preview game details and join when ready"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Game Code */}
              <div className="bg-primary/10 p-6 rounded-lg">
                <div className="text-center space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    Game Code
                  </p>
                  <div className="text-3xl font-bold tracking-widest text-primary">
                    {gameCode}
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={handleCopyCode}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      {copied ? "Copied!" : "Copy Code"}
                    </Button>
                    <Button
                      onClick={handleCopyLink}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Link
                    </Button>
                  </div>
                </div>
              </div>

              {/* Game Settings */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-3 p-2 border border-border rounded-lg">
                  <Layers className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Rounds</p>
                    <p className="text-2xl font-bold">{game?.rounds}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 border border-border rounded-lg">
                  <Target className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Categories</p>
                    <p className="text-2xl font-bold">
                      {game?.categories?.length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Selected Categories
                </p>
                <div className="flex flex-wrap gap-2">
                  {game?.categories?.map((category) => (
                    <Badge key={category} variant="soft" color="accent">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Players Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6" />
                Players ({playerCount}/5)
              </CardTitle>
              <CardDescription>
                {isInGame
                  ? "Waiting for more players to join..."
                  : "Current players in the lobby"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(players).map(([playerId, playerData]) => (
                  <div
                    key={playerId}
                    className="flex items-center gap-3 p-2 border border-border rounded-lg"
                  >
                    <Avatar>
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {playerData.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">{playerData.username}</p>
                      <p className="text-sm text-muted-foreground">
                        {playerId === user?.uid ? "You" : "Player"}
                      </p>
                    </div>
                    {game?.admin === playerId && (
                      <Badge variant="default" className="bg-amber-500">
                        <Crown className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                  </div>
                ))}
              </div>

              {playerCount < 5 && (
                <div className="mt-4 p-2 bg-muted border border-border rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">
                    {isInGame
                      ? `Waiting for more players... (${
                          5 - playerCount
                        } spots left)`
                      : `${5 - playerCount} spots available`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <Card className="border-red-200 bg-destructive/10">
              <CardContent className="pt-6">
                <p className="text-destructive text-center">{error}</p>
              </CardContent>
            </Card>
          )}

          <div className="w-full h-10"></div>

          <div className="fixed bottom-0 left-0 right-0 pb-6 pt-4 px-5 bg-gradient-to-t from-card to-transparent">
            {/* Start Game Button (Admin Only) */}
            {isAdmin && isInGame && (
              <Button
                onClick={handleStartGame}
                disabled={starting || playerCount < 2}
                className="w-full"
                size="xl"
                loading={starting}
                loadingText="Starting Game..."
              >
                Start Game
              </Button>
            )}

            {/* Join Button (if not in game) */}
            {!isInGame && game?.status === "waiting" && (
              <Button
                onClick={handleJoinGame}
                disabled={playerCount >= 5}
                className="w-full"
                size="xl"
                loading={joining}
                loadingText="  Joining..."
              >
                <>
                  <UserPlus className="mr-2 h-5 w-5" />
                  Join Game
                </>
              </Button>
            )}

            {!isAdmin && isInGame && (
              <div className="p-2 bg-success rounded-lg">
                Waiting for the admin to start the game
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
