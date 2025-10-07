import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase";

// Get a random dare from selected categories that hasn't been used
export async function getRandomDare(categories, usedDareIds) {
  try {
    const daresRef = collection(db, "dares");
    const q = query(daresRef, where("category", "in", categories));
    const snapshot = await getDocs(q);

    // Filter out used dares
    const availableDares = snapshot.docs
      .filter((doc) => !usedDareIds.includes(doc.id))
      .map((doc) => ({ id: doc.id, ...doc.data() }));

    if (availableDares.length === 0) {
      return null; // No more dares available
    }

    // Return random dare
    const randomIndex = Math.floor(Math.random() * availableDares.length);
    return availableDares[randomIndex];
  } catch (error) {
    console.error("Error getting random dare:", error);
    return null;
  }
}

// Get next player in rotation who hasn't completed this round
export function getNextPlayer(players, rounds, currentPlayerId) {
  const playerIds = Object.keys(players);

  // Find players who haven't completed all their dares
  const incompletePlayers = playerIds.filter(
    (id) => (players[id].daresCompleted || 0) < rounds
  );

  if (incompletePlayers.length === 0) {
    return null; // All players completed all dares
  }

  // If no current player, return first incomplete player
  if (!currentPlayerId) {
    return incompletePlayers[0];
  }

  // Find current player index
  const currentIndex = playerIds.indexOf(currentPlayerId);

  // Get next player in rotation (circular)
  for (let i = 1; i <= playerIds.length; i++) {
    const nextIndex = (currentIndex + i) % playerIds.length;
    const nextPlayerId = playerIds[nextIndex];

    if ((players[nextPlayerId].daresCompleted || 0) < rounds) {
      return nextPlayerId;
    }
  }

  return null;
}

// Calculate voting results
export function calculateVoteResults(votes) {
  if (!votes || votes.length === 0) {
    return { points: 0, result: "No votes received" };
  }

  const completedVotes = votes.filter((v) => v.vote === "completed").length;
  const notCompletedVotes = votes.filter(
    (v) => v.vote === "not_completed"
  ).length;

  if (completedVotes > notCompletedVotes) {
    return { points: 10, result: "Completed" };
  } else if (notCompletedVotes > completedVotes) {
    return { points: 0, result: "Not Completed" };
  } else {
    return { points: 5, result: "Tie" };
  }
}

// Check if all players completed all their dares
export function isGameComplete(players, rounds) {
  return Object.values(players).every(
    (player) => (player.daresCompleted || 0) >= rounds
  );
}

// Check if all players completed the round
export function isRoundComplete(players) {
  return Object.values(players).every((player) => player.hasCompletedRound);
}

// Reset players for next round
export function resetPlayersForNextRound(players) {
  const updatedPlayers = {};
  Object.keys(players).forEach((playerId) => {
    updatedPlayers[playerId] = {
      ...players[playerId],
      hasCompletedRound: false,
    };
  });
  return updatedPlayers;
}
