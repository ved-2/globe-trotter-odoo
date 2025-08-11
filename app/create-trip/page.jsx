"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

// --- All Constants are now in this file ---

const SelectBudgetOptions = [
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

const SelectTravellersList = [
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

const AI_PROMPT =
  "Generate a travel itinerary for a trip to {location} for {noOfDays} days. The traveler is {traveler} on a {budget} budget. Provide a detailed, day-by-day plan with suggestions for places to visit, things to do, and places to eat. The response should be in JSON format with a root object key 'trip'. The 'trip' object should include 'location', 'noOfDays', 'budget', 'traveler', and a 'daily_plan' array. Each object in 'daily_plan' should have 'day', 'title', 'activities' (an array of strings), and 'food_suggestions' (an array of strings).";

const URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyCF2cG4mkMYbKCYg_04GaxEQDXk1sPhYg4";

const SelectionCard = ({ item, isSelected, onClick }) => (
  <div
    onClick={onClick}
    className={`p-4 border rounded-xl cursor-pointer transition-all duration-300
      bg-gray-900 border-gray-700 hover:bg-gray-800 hover:border-gray-600
      ${isSelected && "ring-2 ring-blue-500 border-blue-500 bg-gray-800"}`}
  >
    <h2 className="text-4xl">{item.icon}</h2>
    <h3 className="font-bold text-lg mt-2 text-white">{item.title}</h3>
    <p className="text-sm text-gray-400">{item.desc}</p>
  </div>
);

// --- Main Page Component ---

const Page = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    place: "",
    days: "",
    budget: "",
    travellers: "",
  });

  const handleFormInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenerateTrip = async () => {
    if (
      Number(formData.days) > 5 ||
      Number(formData.days) < 1 ||
      !formData.place ||
      !formData.budget ||
      !formData.travellers
    ) {
      toast.error("Please fill all fields and enter days between 1 and 5.");
      return;
    }

    setLoading(true);

    const FINAL_PROMPT = AI_PROMPT.replace("{location}", formData.place)
      .replace("{noOfDays}", formData.days)
      .replace("{traveler}", formData.travellers)
      .replace("{budget}", formData.budget);

    const payload = {
      contents: [{ parts: [{ text: FINAL_PROMPT }] }],
    };

    try {
      let response = await fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      response = await response.json();
      const tripData = response?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!tripData) {
        throw new Error("No trip plan was returned from the AI.");
      }

      // Clean the JSON response by removing markdown backticks
      let cleanData = tripData.trim();
      if (cleanData.startsWith("```json")) {
        cleanData = cleanData
          .replace(/^```json/, "")
          .replace(/```$/, "")
          .trim();
      }

      localStorage.setItem("tripPlan", cleanData);
      router.push("/travel-plan");
    } catch (err) {
      console.error("Error generating trip:", err);
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black min-h-screen text-gray-200">
      <div className="sm:px-10 md:px-32 lg:px-56 xl:px-72 px-6 py-16">
        <h2 className="font-bold text-4xl text-white">
          Tell us your travel preferences 🏕️🌴
        </h2>
        <p className="mt-4 text-gray-400 text-xl max-w-4xl">
          Provide some basic information, and our AI trip planner will generate
          a customized itinerary just for you.
        </p>

        <div className="flex flex-col gap-12 mt-12">
          {/* Destination */}
          <div>
            <h2 className="text-xl my-3 font-semibold text-white">
              What is your destination of choice?
            </h2>
            <Input
              placeholder="e.g., Goa"
              type="text"
              value={formData.place}
              onChange={(e) => handleFormInputChange("place", e.target.value)}
              className="max-w-md bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-blue-500"
            />
          </div>

          {/* Days */}
          <div>
            <h2 className="text-xl my-3 font-semibold text-white">
              How many days are you planning your trip? (1-5)
            </h2>
            <Input
              placeholder="e.g., 3"
              type="number"
              value={formData.days}
              onChange={(e) => handleFormInputChange("days", e.target.value)}
              className="max-w-md bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-blue-500"
            />
          </div>

          {/* Budget */}
          <div>
            <h2 className="text-xl my-3 font-semibold text-white">
              What is Your Budget?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mt-5">
              {SelectBudgetOptions.map((item) => (
                <SelectionCard
                  key={item.id}
                  item={item}
                  isSelected={formData.budget === item.title}
                  onClick={() => handleFormInputChange("budget", item.title)}
                />
              ))}
            </div>
          </div>

          {/* Travellers */}
          <div>
            <h2 className="text-xl my-3 font-semibold text-white">
              Who are you traveling with?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mt-5">
              {SelectTravellersList.map((item) => (
                <SelectionCard
                  key={item.id}
                  item={item}
                  isSelected={formData.travellers === item.title}
                  onClick={() =>
                    handleFormInputChange("travellers", item.title)
                  }
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 flex justify-end">
          <Button
            onClick={handleGenerateTrip}
            disabled={loading}
            className="text-lg px-6 py-6"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Trip"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Page;
