"use client";
import { createSlice, configureStore } from "@reduxjs/toolkit";
import { ALL_DARES } from "../constants/dares";

// ---------- Helpers ----------
const loadData = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save data", e);
  }
};

// ---------- Slice ----------
const gameSlice = createSlice({
  name: "game",
  initialState: {
    page: "home",
    currentPlayer: null,
    players: [], // registry of players
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

    // Player registry actions
    loadPlayers: (state) => {
      state.players = loadData("daremaster-players");
    },
    addPlayer: (state, action) => {
      const player = action.payload;
      state.players.push(player);
      saveData("daremaster-players", state.players);
      state.currentPlayer = player;
    },
    selectExistingPlayer: (state, action) => {
      const selected = state.players.find((p) => p.id === action.payload);
      if (selected) state.currentPlayer = selected;
    },

    // Game setup
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
      if (state.savedToLeaderboard || !state.currentPlayer) return;

      const leaderboard = loadData("daremaster-leaderboard");

      const entry = {
        name: state.currentPlayer.name,
        school: state.currentPlayer.school,
        score: state.score,
        rounds: state.numRounds,
        dateISO: new Date().toISOString(),
      };

      leaderboard.push(entry);
      leaderboard.sort((a, b) => b.score - a.score);
      const top50 = leaderboard.slice(0, 50);

      saveData("daremaster-leaderboard", top50);
      state.leaderboard = top50;
      state.savedToLeaderboard = true;
    },

    resetToHome: (state) => {
      state.page = "home";
      state.currentRound = 0;
      state.currentDare = null;
      state.timeLeft = 0;
      state.isTimerRunning = false;
      state.score = 0;
      state.usedDareIds = [];
      state.savedToLeaderboard = false;
      state.currentPlayer = null;
    },
  },
});

export const {
  setPage,
  loadPlayers,
  addPlayer,
  selectExistingPlayer,
  setNumRounds,
  startGame,
  selectNextDare,
  completeDare,
  decrementTime,
  saveResultToLeaderboard,
  resetToHome,
} = gameSlice.actions;

export const store = configureStore({
  reducer: { game: gameSlice.reducer },
  preloadedState: {
    game: {
      page: "home",
      currentPlayer: null,
      players: loadData("daremaster-players"),
      numRounds: 3,
      currentRound: 0,
      currentDare: null,
      timeLeft: 0,
      isTimerRunning: false,
      score: 0,
      usedDareIds: [],
      leaderboard: loadData("daremaster-leaderboard"),
      savedToLeaderboard: false,
    },
  },
});
