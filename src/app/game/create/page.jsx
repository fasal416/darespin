"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { generateGameCode } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Loader2 } from "lucide-react";

const CATEGORIES = [
  "Silly Challenges",
  "Creative Tasks",
  "Physical Challenges",
  "Brain Teasers",
  "Social Dares",
];

export default function CreateGamePage() {
  return (
    <ProtectedRoute>
      <CreateGameContent />
    </ProtectedRoute>
  );
}

function CreateGameContent() {
  const [rounds, setRounds] = useState("3");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { user } = useAuth();

  const handleCategoryToggle = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const generateUniqueGameCode = async () => {
    let code = generateGameCode();
    let isUnique = false;

    while (!isUnique) {
      const gamesRef = collection(db, "games");
      const q = query(gamesRef, where("__name__", "==", code));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        isUnique = true;
      } else {
        code = generateGameCode();
      }
    }

    return code;
  };

  const handleCreateGame = async () => {
    setError("");

    // Validation
    if (selectedCategories.length === 0) {
      setError("Please select at least one category");
      return;
    }

    setLoading(true);

    try {
      console.log("Current user:", user);

      // Get user data from Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      let username;
      if (userSnap.exists()) {
        username = userSnap.data().username;
      } else {
        // Fallback if user document doesn't exist yet
        username = user.displayName || user.email?.split("@")[0] || "Player";
      }

      console.log("Username:", username);

      // Generate unique game code
      const gameCode = await generateUniqueGameCode();
      console.log("Generated game code:", gameCode);

      // Create game document
      const gameRef = doc(db, "games", gameCode);
      const gameData = {
        admin: user.uid,
        status: "waiting",
        rounds: parseInt(rounds),
        categories: selectedCategories,
        players: {
          [user.uid]: {
            username,
            points: 0,
            daresCompleted: 0, // ADD THIS
            joinedAt: new Date().toISOString(),
          },
        },
        currentRound: 1,
        currentDare: null,
        usedDareIds: [],
        createdAt: new Date().toISOString(),
      };

      console.log("Game data to create:", gameData);

      await setDoc(gameRef, gameData);

      console.log("Game created successfully!");

      // Redirect to lobby
      router.push(`/game/lobby/${gameCode}`);
    } catch (err) {
      console.error("Error creating game:", err);
      console.error("Error code:", err.code);
      console.error("Error message:", err.message);
      setError("Failed to create game. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-4">
      <div className="container mx-auto max-w-2xl py-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard")}
          className="mb-6 text-white hover:bg-white/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Create New Game</CardTitle>
            <CardDescription>
              Set up your game settings and invite your friends
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Number of Rounds */}
            <div className="space-y-2">
              <Label htmlFor="rounds" className="text-lg font-semibold">
                Number of Rounds
              </Label>
              <Select value={rounds} onValueChange={setRounds}>
                <SelectTrigger id="rounds" className="h-12 text-lg">
                  <SelectValue placeholder="Select rounds" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? "Round" : "Rounds"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Each round, every player gets one dare
              </p>
            </div>

            {/* Dare Categories */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold">Dare Categories</Label>
              <p className="text-sm text-muted-foreground">
                Select the types of dares you want in your game
              </p>
              <div className="space-y-3 border rounded-lg p-4 bg-slate-50">
                {CATEGORIES.map((category) => (
                  <div key={category} className="flex items-center space-x-3">
                    <Checkbox
                      id={category}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => handleCategoryToggle(category)}
                    />
                    <label
                      htmlFor={category}
                      className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {category}
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Selected: {selectedCategories.length} / {CATEGORIES.length}
              </p>
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button
              onClick={handleCreateGame}
              disabled={loading || selectedCategories.length === 0}
              className="w-full h-12 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Game...
                </>
              ) : (
                "Create Game"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
