"use client";

import React, { useEffect } from "react";
import { Provider, useSelector, useDispatch } from "react-redux";
import { configureStore, createSlice } from "@reduxjs/toolkit";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ALL_DARES } from "@/constants/dares";

// Load leaderboard from localStorage
const loadLeaderboard = () => {
  try {
    const saved = localStorage.getItem("daremaster-leaderboard");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

// Save leaderboard to localStorage
const saveLeaderboard = (leaderboard) => {
  try {
    localStorage.setItem("daremaster-leaderboard", JSON.stringify(leaderboard));
  } catch (e) {
    console.error("Failed to save leaderboard", e);
  }
};

// Redux Slice
const gameSlice = createSlice({
  name: "game",
  initialState: {
    page: "home",
    player: { name: "", school: "" },
    numRounds: 3,
    currentRound: 0,
    currentDare: null,
    timeLeft: 0,
    isTimerRunning: false,
    score: 0,
    usedDareIds: [],
    leaderboard: [],
    savedToLeaderboard: false,
  },
  reducers: {
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setPlayerName: (state, action) => {
      state.player.name = action.payload;
    },
    setPlayerSchool: (state, action) => {
      state.player.school = action.payload;
    },
    setNumRounds: (state, action) => {
      state.numRounds = action.payload;
    },
    startGame: (state) => {
      state.page = "game";
      state.currentRound = 1;
      state.score = 0;
      state.usedDareIds = [];
      state.savedToLeaderboard = false;

      const pool = ALL_DARES;
      const random = pool[Math.floor(Math.random() * pool.length)];

      state.currentDare = random;
      state.timeLeft = random.time;
      state.isTimerRunning = true;
      state.usedDareIds = [random.id];
    },
    completeDare: (state, action) => {
      const completed = action.payload;
      if (completed) {
        state.score += 10;
      }

      state.isTimerRunning = false;
      state.currentDare = null;
      state.timeLeft = 0;

      if (state.currentRound >= state.numRounds) {
        state.page = "results";
      }
    },
    selectNextDare: (state) => {
      state.currentRound += 1;

      if (state.currentRound > state.numRounds) {
        state.page = "results";
        return;
      }

      const remaining = ALL_DARES.filter(
        (d) => !state.usedDareIds.includes(d.id)
      );
      const pool = remaining.length > 0 ? remaining : ALL_DARES;

      const random = pool[Math.floor(Math.random() * pool.length)];
      state.currentDare = random;
      state.timeLeft = random.time;
      state.isTimerRunning = true;

      if (!state.usedDareIds.includes(random.id)) {
        state.usedDareIds.push(random.id);
      }
    },
    decrementTime: (state) => {
      if (state.timeLeft > 0) {
        state.timeLeft -= 1;
      } else if (state.isTimerRunning && state.timeLeft === 0) {
        state.isTimerRunning = false;
        state.currentDare = null;
        state.timeLeft = 0;

        if (state.currentRound >= state.numRounds) {
          state.page = "results";
        }
      }
    },
    saveResultToLeaderboard: (state) => {
      if (state.savedToLeaderboard) return;

      const entry = {
        name: state.player.name.trim(),
        school: state.player.school.trim(),
        score: state.score,
        rounds: state.numRounds,
        dateISO: new Date().toISOString(),
      };

      state.leaderboard.push(entry);
      state.leaderboard.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime();
      });
      state.leaderboard = state.leaderboard.slice(0, 50);
      state.savedToLeaderboard = true;

      // Save to localStorage
      saveLeaderboard(state.leaderboard);
    },
    resetToHome: (state) => {
      state.page = "home";
      state.player = { name: "", school: "" };
      state.numRounds = 3;
      state.currentRound = 0;
      state.currentDare = null;
      state.timeLeft = 0;
      state.isTimerRunning = false;
      state.score = 0;
      state.usedDareIds = [];
      state.savedToLeaderboard = false;
    },
    resetGame: (state) => {
      state.page = "game";
      state.currentRound = 1;
      state.score = 0;
      state.usedDareIds = [];
      state.savedToLeaderboard = false;

      const pool = ALL_DARES;
      const random = pool[Math.floor(Math.random() * pool.length)];

      state.currentDare = random;
      state.timeLeft = random.time;
      state.isTimerRunning = true;
      state.usedDareIds = [random.id];
    },
  },
});

const {
  setPage,
  setPlayerName,
  setPlayerSchool,
  setNumRounds,
  startGame,
  selectNextDare,
  completeDare,
  decrementTime,
  saveResultToLeaderboard,
  resetToHome,
  resetGame,
} = gameSlice.actions;

const store = configureStore({
  reducer: { game: gameSlice.reducer },
  preloadedState: {
    game: {
      page: "home",
      player: { name: "", school: "" },
      numRounds: 3,
      currentRound: 0,
      currentDare: null,
      timeLeft: 0,
      isTimerRunning: false,
      score: 0,
      usedDareIds: [],
      leaderboard: loadLeaderboard(),
      savedToLeaderboard: false,
    },
  },
});

const Shell = ({ children, className = "" }) => {
  const dispatch = useDispatch();
  const page = useSelector((s) => s.game.page);

  return (
    <div
      className={`min-h-screen bg-gradient-to-b from-background to-muted/40 px-4 py-8 sm:py-12 ${className}`}
    >
      <div className="mx-auto w-full max-w-5xl">
        {page !== "leaderboard" && (
          <div className="mb-6 flex justify-end">
            <Button
              variant="outline"
              onClick={() => dispatch(setPage("leaderboard"))}
            >
              View Leaderboard
            </Button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

const HomePage = () => {
  const dispatch = useDispatch();
  return (
    <Shell>
      <div className="grid place-items-center">
        <Card className="w-full max-w-2xl overflow-hidden">
          <CardHeader className="text-center space-y-3 pb-2">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 grid place-items-center text-primary font-bold">
              DM
            </div>
            <CardTitle className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              Dare Master
            </CardTitle>
            <CardDescription className="text-base sm:text-lg">
              Single player. Timed dares. Score big. Climb the leaderboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 pb-8">
            <div className="flex flex-col items-center gap-4">
              <Button
                size="lg"
                className="h-12 w-full max-w-sm"
                onClick={() => dispatch(setPage("setup"))}
              >
                Start Game
              </Button>
              <p className="text-sm text-muted-foreground">
                Your scores are saved locally on this device.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
};

const SetupPage = () => {
  const dispatch = useDispatch();
  const { player, numRounds } = useSelector((s) => s.game);

  const canStart =
    player.name.trim() !== "" && player.school.trim() !== "" && numRounds > 0;

  const handleStart = () => {
    if (canStart) {
      dispatch(startGame());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-lg shadow-lg border-border">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl text-center">
            Player Setup
          </CardTitle>
          <CardDescription className="text-center">
            Enter your details to begin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Player Name</Label>
            <Input
              placeholder="Your name"
              value={player.name}
              onChange={(e) => dispatch(setPlayerName(e.target.value))}
              className="h-10"
            />
          </div>
          <div className="space-y-3">
            <Label>School / College</Label>
            <Input
              placeholder="Your school or college"
              value={player.school}
              onChange={(e) => dispatch(setPlayerSchool(e.target.value))}
              className="h-10"
            />
          </div>
          <div className="space-y-3">
            <Label>Number of Rounds</Label>
            <Select
              value={numRounds.toString()}
              onValueChange={(v) => dispatch(setNumRounds(parseInt(v)))}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Choose rounds" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <SelectItem key={n} value={n.toString()}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            className="w-full h-11 mt-4"
            disabled={!canStart}
            onClick={handleStart}
          >
            Start Game
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

const GamePage = () => {
  const dispatch = useDispatch();
  const {
    currentRound,
    numRounds,
    currentDare,
    timeLeft,
    isTimerRunning,
    score,
  } = useSelector((s) => s.game);

  useEffect(() => {
    let id;
    if (isTimerRunning && timeLeft > 0) {
      id = setInterval(() => dispatch(decrementTime()), 1000);
    }
    return () => clearInterval(id);
  }, [isTimerRunning, timeLeft, dispatch]);

  const progress = currentDare
    ? ((currentDare.time - timeLeft) / currentDare.time) * 100
    : 0;

  return (
    <Shell>
      <div className="grid gap-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="sm:col-span-1">
            <CardHeader className="pb-2">
              <CardDescription>Round</CardDescription>
              <CardTitle className="text-2xl">
                {currentRound} / {numRounds}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="sm:col-span-1">
            <CardHeader className="pb-2">
              <CardDescription>Score</CardDescription>
              <CardTitle className="text-2xl">{score}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="sm:col-span-1">
            <CardHeader className="pb-2">
              <CardDescription>Status</CardDescription>
              <CardTitle className="text-2xl">
                {currentDare ? "In progress" : "Waiting"}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            {!currentDare ? (
              <div className="py-10 text-center space-y-6">
                <p className="text-lg">Ready for the next dare?</p>
                <Button
                  size="lg"
                  className="h-12 px-8"
                  onClick={() => dispatch(selectNextDare())}
                >
                  Get Next Dare
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="space-y-2 text-center">
                  <h3 className="text-2xl sm:text-3xl font-bold">Your Dare</h3>
                  <p className="text-base sm:text-lg px-2">
                    {currentDare.text}
                  </p>
                </div>

                <div className="max-w-xl mx-auto space-y-3">
                  <Progress value={progress} className="h-3" />
                  <p className="text-5xl sm:text-6xl font-extrabold text-primary text-center tabular-nums">
                    {timeLeft}s
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto pt-2">
                  <Button
                    className="h-12 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => dispatch(completeDare(true))}
                  >
                    Completed
                  </Button>
                  <Button
                    className="h-12 bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => dispatch(completeDare(false))}
                  >
                    Not Completed
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
};

const ResultsPage = () => {
  const dispatch = useDispatch();
  const { player, score, numRounds, leaderboard, savedToLeaderboard } =
    useSelector((s) => s.game);

  useEffect(() => {
    if (!savedToLeaderboard) dispatch(saveResultToLeaderboard());
  }, [dispatch, savedToLeaderboard]);

  return (
    <Shell>
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl">Game Over</CardTitle>
            <CardDescription className="text-base">Nice run</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border bg-muted/30 p-4">
              <div className="text-sm text-muted-foreground">Player</div>
              <div className="text-xl font-semibold">{player.name}</div>
              <div className="text-sm text-muted-foreground">
                {player.school}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border bg-muted/30 p-4">
                <div className="text-sm text-muted-foreground">Score</div>
                <div className="text-2xl font-bold">{score}</div>
              </div>
              <div className="rounded-xl border bg-muted/30 p-4">
                <div className="text-sm text-muted-foreground">Rounds</div>
                <div className="text-2xl font-bold">{numRounds}</div>
              </div>
            </div>

            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button className="h-11" onClick={() => dispatch(resetGame())}>
                Play Again
              </Button>
              <Button
                variant="secondary"
                className="h-11"
                onClick={() => dispatch(resetToHome())}
              >
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
            <CardDescription>Top scores on this device</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {leaderboard.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No scores yet. Play to set the first record.
              </p>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry, idx) => (
                  <div
                    key={`${entry.name}-${entry.dateISO}-${idx}`}
                    className={`flex items-center justify-between gap-3 rounded-lg border p-3 ${
                      idx === 0 ? "bg-accent/20 border-accent" : "bg-card"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-full bg-primary/10 grid place-items-center text-sm font-semibold text-primary">
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{entry.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {entry.school}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{entry.score} pts</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(entry.dateISO).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
};

const LeaderboardPage = () => {
  const dispatch = useDispatch();
  const { leaderboard } = useSelector((s) => s.game);

  return (
    <Shell>
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl">Leaderboard</CardTitle>
              <CardDescription>Top scores on this device</CardDescription>
            </div>
            <Button variant="outline" onClick={() => dispatch(setPage("home"))}>
              Back to Home
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {leaderboard.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No scores yet. Play to set the first record.
            </p>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry, idx) => (
                <div
                  key={`${entry.name}-${entry.dateISO}-${idx}`}
                  className={`flex items-center justify-between gap-3 rounded-lg border p-3 ${
                    idx === 0 ? "bg-accent/20 border-accent" : "bg-card"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-full bg-primary/10 grid place-items-center text-sm font-semibold text-primary">
                      {idx + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{entry.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {entry.school}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{entry.score} pts</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(entry.dateISO).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Shell>
  );
};

const App = () => {
  const page = useSelector((s) => s.game.page);
  return (
    <>
      {page === "home" && <HomePage />}
      {page === "setup" && <SetupPage />}
      {page === "game" && <GamePage />}
      {page === "results" && <ResultsPage />}
      {page === "leaderboard" && <LeaderboardPage />}
    </>
  );
};

export default function DareGame() {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}
