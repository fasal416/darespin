// Dare Categories
const DARE_CATEGORIES = {
  funny: [
    {
      id: 1,
      text: "Do your best impression of a celebrity for 30 seconds",
      time: 30,
      category: "funny",
    },
    {
      id: 2,
      text: "Speak in a funny accent for the next 2 minutes",
      time: 120,
      category: "funny",
    },
    { id: 3, text: "Tell your funniest joke", time: 20, category: "funny" },
    {
      id: 4,
      text: "Make everyone laugh without speaking",
      time: 30,
      category: "funny",
    },
    {
      id: 5,
      text: "Do the chicken dance for 20 seconds",
      time: 20,
      category: "funny",
    },
  ],
  creative: [
    {
      id: 6,
      text: "Create a short rap about the weather",
      time: 45,
      category: "creative",
    },
    {
      id: 7,
      text: "Draw a portrait of another player blindfolded",
      time: 60,
      category: "creative",
    },
    {
      id: 8,
      text: "Make up a 30-second song about pizza",
      time: 30,
      category: "creative",
    },
    {
      id: 9,
      text: "Tell a story using only 5 words repeatedly",
      time: 30,
      category: "creative",
    },
    {
      id: 10,
      text: "Create a handshake with another player",
      time: 45,
      category: "creative",
    },
  ],
  physical: [
    { id: 11, text: "Do 10 jumping jacks", time: 30, category: "physical" },
    {
      id: 12,
      text: "Hold a plank position for 20 seconds",
      time: 20,
      category: "physical",
    },
    { id: 13, text: "Do 5 push-ups", time: 30, category: "physical" },
    {
      id: 14,
      text: "Balance on one foot for 30 seconds",
      time: 30,
      category: "physical",
    },
    {
      id: 15,
      text: "Spin around 10 times and walk in a straight line",
      time: 30,
      category: "physical",
    },
  ],
  social: [
    {
      id: 16,
      text: "Compliment every player in the game",
      time: 45,
      category: "social",
    },
    {
      id: 17,
      text: "Share an embarrassing story",
      time: 45,
      category: "social",
    },
    {
      id: 18,
      text: "Give a motivational speech to the group",
      time: 40,
      category: "social",
    },
    {
      id: 19,
      text: "Describe your perfect day in detail",
      time: 45,
      category: "social",
    },
    {
      id: 20,
      text: "Share three things you're grateful for",
      time: 30,
      category: "social",
    },
  ],
};

export const ALL_DARES = Object.values(DARE_CATEGORIES).flat();
