"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gamepad2, LogOut, Plus, Users } from "lucide-react";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const [gameCode, setGameCode] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleCreateGame = () => {
    router.push("/game/create");
  };

  const handleJoinGame = async (e) => {
    e.preventDefault();
    setError("");

    if (!gameCode.trim() || gameCode.length !== 8) {
      setError("Please enter a valid 8-digit game code");
      return;
    }

    router.push(`/game/lobby/${gameCode}`);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth");
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Gamepad2 className="h-8 w-8" />
            <h1 className="text-3xl font-bold">DareSpin</h1>
          </div>
          <Button variant="soft" onClick={handleSignOut} color="destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {/* Welcome Section */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Welcome back! 👋</h2>
          <p className="text-muted-foreground">
            Ready to play some dares with friends?
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
          {/* Create Game Card */}
          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground mb-4 mx-auto">
                <Plus className="h-8 w-8" />
              </div>
              <CardTitle className="text-center text-2xl">
                Create Game
              </CardTitle>
              <CardDescription className="text-center text-muted-foreground">
                Start a new game and invite your friends to join
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleCreateGame}
                color="primary"
                size="xl"
                className="w-full"
              >
                Create New Game
              </Button>
            </CardContent>
          </Card>

          {/* Join Game Card */}
          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-accent text-accent-foreground mb-4 mx-auto">
                <Users className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-center text-2xl">Join Game</CardTitle>
              <CardDescription className="text-center text-muted-foreground">
                Enter a game code to join your friends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinGame} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    id="gameCode"
                    type="text"
                    placeholder="Enter 8-digit code"
                    value={gameCode}
                    onChange={(e) =>
                      setGameCode(e.target.value.replace(/\D/g, "").slice(0, 8))
                    }
                    maxLength={8}
                    className="text-center text-lg tracking-widest font-bold h-12"
                  />
                </div>

                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md text-center">
                    {error}
                  </div>
                )}

                <Button
                  color="accent"
                  type="submit"
                  size="xl"
                  className="w-full"
                >
                  Join Game
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <div className="mt-6 max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">How to Play</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold">
                  1
                </div>
                <p>Create a game or join using a game code</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold">
                  2
                </div>
                <p>Wait for all players to join (2-5 players)</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold">
                  3
                </div>
                <p>Complete dares and vote on other players' performances</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold">
                  4
                </div>
                <p>Earn points and compete to win!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
