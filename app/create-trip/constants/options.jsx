// File: /constants/options.js

export const SelectBudgetOptions = [
  {
    id: 1,
    title: "Cheap",
    desc: "Stay on a budget",
    icon: " frugal",
  },
  {
    id: 2,
    title: "Moderate",
    desc: "Keep it simple and comfortable",
    icon: " balanced",
  },
  {
    id: 3,
    title: "Luxury",
    desc: "Indulge in high-end experiences",
    icon: "💎",
  },
];

export const SelectTravellersList = [
  {
    id: 1,
    title: "Just Me",
    desc: "A solo journey of discovery",
    icon: "🧍",
  },
  {
    id: 2,
    title: "A Couple",
    desc: "Romantic getaway for two",
    icon: "👫",
  },
  {
    id: 3,
    title: "Family",
    desc: "Fun adventures for the whole family",
    icon: "👪",
  },
  {
    id: 4,
    title: "Friends",
    desc: "A memorable trip with your crew",
    icon: "🧑‍🤝‍🧑",
  },
];

export const AI_PROMPT =
  "Generate a travel itinerary for a trip to {location} for {noOfDays} days. The traveler is {traveler} on a {budget} budget. Provide a detailed, day-by-day plan with suggestions for places to visit, things to do, and places to eat. The response should be in JSON format with a root object key 'trip'. The 'trip' object should include 'location', 'noOfDays', 'budget', 'traveler', and a 'daily_plan' array. Each object in 'daily_plan' should have 'day', 'title', 'activities' (an array of strings), and 'food_suggestions' (an array of strings).";

// IMPORTANT: Replace with your actual Google Gemini API key and endpoint
export const URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyDPvoInudLgatW19QQIR229nGq0uDREA_0";
