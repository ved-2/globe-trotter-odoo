"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const SelectBudgetOptions = [
  {
    id: 1,
    title: "Cheap",
    desc: "Stay on a budget",
    icon: "💰",
  },
  {
    id: 2,
    title: "Moderate",
    desc: "Keep it simple and comfortable",
    icon: "⚖️",
  },
  {
    id: 3,
    title: "Luxury",
    desc: "Indulge in high-end experiences",
    icon: "💎",
  },
];

const SelectTravellersList = [
  { id: 1, title: "Just Me", desc: "A solo journey of discovery", icon: "🧍" },
  { id: 2, title: "A Couple", desc: "Romantic getaway for two", icon: "👫" },
  { id: 3, title: "Family", desc: "Fun adventures for the whole family", icon: "👪" },
  { id: 4, title: "Friends", desc: "A memorable trip with your crew", icon: "🧑‍🤝‍🧑" },
];

const AI_PROMPT = `You are a trip planner. Return ONLY valid JSON (no prose, no markdown, no backticks).
Schema:
{
  "trip": {
    "location": string,
    "noOfDays": number,
    "budget": string,
    "traveler": string,
    "bestTimeToVisit": string,
    "hotels": [
      {
        "hotelName": string,
        "hotelAddress": string,
        "price": number,
        "rating": number,
        "descriptions": string,
        "hotelImageUrl": string
      }
    ],
    "daily_plan": [
      {
        "day": number,
        "title": string,
        "activities": [
          string | {
            "name": string,
            "details": string,
            "rating": number,
            "imageUrl": string
          }
        ]
      }
    ],
    "disclaimer": string
  }
}
Fill with realistic values.
For the trip to {location} for {noOfDays} days for {traveler} with a {budget} budget.`;

// Hardcoded Gemini API key as requested
const API_KEY = "AIzaSyCjcLQoEQzqzGEO6QTUFw42wUnfyJvTOiU";
const URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

const SelectionCard = ({ item, isSelected, onClick }) => (
  <div
    onClick={onClick}
    className={`group relative p-6 border rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02]
      bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 
      hover:from-gray-800 hover:to-gray-700 hover:border-amber-500/50
      hover:shadow-lg hover:shadow-amber-500/10
      ${isSelected && 
        "ring-2 ring-amber-500 border-amber-500 bg-gradient-to-br from-amber-500/10 to-gray-800 shadow-lg shadow-amber-500/20"
      }`}
  >
    <div className="flex flex-col items-center text-center">
      <div className={`text-4xl mb-3 transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}>
        {item.icon}
      </div>
      <h3 className={`font-bold text-lg mb-2 transition-colors duration-300 ${
        isSelected ? 'text-amber-300' : 'text-white group-hover:text-amber-200'
      }`}>
        {item.title}
      </h3>
      <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
        {item.desc}
      </p>
    </div>
    
    {/* Subtle glow effect */}
    <div className={`absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 pointer-events-none
      ${isSelected ? 'opacity-100' : 'group-hover:opacity-50'}
      bg-gradient-to-r from-transparent via-amber-500/5 to-transparent`} 
    />
  </div>
);

const Page = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    place: "",
    days: "",
    budget: "",
    travellers: "",
  });


  useEffect(() => {
    console.log("Form data updated:", formData);
  }, [formData]);

  const handleFormInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      contents: [{ parts: [{ text: FINAL_PROMPT }] }]
    };

    try {
      let response = await fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMsg = `API error: ${response.status} ${response.statusText}`;
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorJson = await response.json();
            errorMsg += `\n${JSON.stringify(errorJson, null, 2)}`;
          } else {
            const errorText = await response.text();
            errorMsg += `\n${errorText}`;
          }
        } catch (e) {
          errorMsg += '\n[Could not parse error body]';
        }
        console.error(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
        return;
      }

      response = await response.json();
      const tripData = response?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!tripData) throw new Error("No trip plan was returned from the AI.");

      // Clean potential markdown fences and parse JSON safely
      let clean = tripData.trim();
      if (clean.startsWith("```")) {
        clean = clean.replace(/^```(?:json)?/, "").replace(/```$/, "").trim();
      }

      // Fallback: slice to first/last brace if extra text present
      const firstBrace = clean.indexOf("{");
      const lastBrace = clean.lastIndexOf("}");
      if (firstBrace === -1 || lastBrace === -1) {
        console.error("AI response did not contain JSON braces:", clean);
        toast.error("AI returned non-JSON content. Please try again.");
        setLoading(false);
        return;
      }
      clean = clean.slice(firstBrace, lastBrace + 1);

      let parsed;
      try {
        parsed = JSON.parse(clean);
      } catch (e) {
        console.error("Failed to parse AI trip JSON:", e, clean);
        toast.error("AI returned invalid trip data. Please try again.");
        setLoading(false);
        return;
      }

      // Unwrap if API returned { trip: { ... } }
      const base = parsed?.trip ? parsed.trip : parsed;

      // Transform into structure expected by travel plan page
      const suggestedItinerary = Array.isArray(base?.suggestedItinerary)
        ? base.suggestedItinerary
        : Array.isArray(base?.daily_plan)
          ? base.daily_plan.map((d, idx) => ({
              theme: d.title || `Day ${d.day || idx + 1}`,
              plan: Array.isArray(d.activities)
                ? d.activities.map((act) => ({
                    placeName: typeof act === "string" ? act : act?.name || "Activity",
                    placeDetails: typeof act === "string" ? "" : act?.details || "",
                    rating: typeof act === "object" && act?.rating ? act.rating : "",
                    timeTravelEachLocation: "",
                    placeImageUrl: typeof act === "object" ? act?.imageUrl : undefined,
                  }))
                : [],
            }))
          : [];

      const targetPlan = {
        location: base.location || base.destination || formData.place,
        duration: base.noOfDays || base.duration || formData.days,
        budget: base.budget || formData.budget,
        travelers: base.traveler || base.travelers || formData.travellers,
        bestTimeToVisit: base.bestTimeToVisit || "",
        hotels: Array.isArray(base.hotels) ? base.hotels : [],
        suggestedItinerary,
        disclaimer: base.disclaimer || "This is an AI-generated plan. Please verify details before booking.",
      };

      localStorage.setItem("tripPlan", JSON.stringify(targetPlan));
      router.push("/travel-plan");
    } catch (err) {
      console.error("Error generating trip:", err);
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black min-h-screen text-gray-200 relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900/5 via-transparent to-amber-800/5" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/3 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-600/3 rounded-full blur-3xl" />
      
      <div className="relative z-10 sm:px-10 md:px-32 lg:px-56 xl:px-72 px-6 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-full mb-6 border border-amber-500/30">
            <span className="text-3xl">✈️</span>
          </div>
          <h1 className="font-bold text-5xl md:text-6xl bg-gradient-to-r from-white via-amber-100 to-amber-200 bg-clip-text text-transparent mb-4">
            Plan Your Dream Trip
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-amber-400 mx-auto mb-6" />
          <p className="text-gray-400 text-xl max-w-3xl mx-auto leading-relaxed">
            Share your travel preferences and let our AI craft the perfect itinerary tailored just for you
          </p>
        </div>

        <div className="flex flex-col gap-16 max-w-6xl mx-auto">
          {/* Destination */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                1
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-amber-100 bg-clip-text text-transparent">
                Where would you like to go?
              </h2>
            </div>
            <Input
              placeholder="e.g., Paris, Tokyo, Bali..."
              type="text"
              value={formData.place}
              onChange={(e) => handleFormInputChange("place", e.target.value)}
              className="max-w-md bg-gray-900/70 border-gray-700 text-white placeholder:text-gray-500 
                focus-visible:ring-amber-500 focus-visible:border-amber-500 rounded-xl px-4 py-3 text-lg
                backdrop-blur-sm transition-all duration-300 hover:bg-gray-800/70"
            />
          </div>

          {/* Days */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                2
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-amber-100 bg-clip-text text-transparent">
                How many days? (1-5 days)
              </h2>
            </div>
            <Input
              placeholder="e.g., 3"
              type="number"
              min="1"
              max="5"
              value={formData.days}
              onChange={(e) => handleFormInputChange("days", e.target.value)}
              className="max-w-md bg-gray-900/70 border-gray-700 text-white placeholder:text-gray-500 
                focus-visible:ring-amber-500 focus-visible:border-amber-500 rounded-xl px-4 py-3 text-lg
                backdrop-blur-sm transition-all duration-300 hover:bg-gray-800/70"
            />
          </div>

          {/* Budget */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                3
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-amber-100 bg-clip-text text-transparent">
                What's your budget range?
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                4
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-amber-100 bg-clip-text text-transparent">
                Who's joining the adventure?
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {SelectTravellersList.map((item) => (
                <SelectionCard
                  key={item.id}
                  item={item}
                  isSelected={formData.travellers === item.title}
                  onClick={() => handleFormInputChange("travellers", item.title)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-20 flex justify-center">
          <Button
            onClick={handleGenerateTrip}
            disabled={loading}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 
              text-black font-bold text-lg px-12 py-4 rounded-xl shadow-lg shadow-amber-500/25
              transition-all duration-300 transform hover:scale-105 hover:shadow-amber-500/40
              disabled:opacity-50 disabled:transform-none disabled:shadow-none"
          >
            {loading ? (
              <>
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                Crafting Your Journey...
              </>
            ) : (
              <>
                <span className="mr-2">🗺️</span>
                Generate My Trip
              </>
            )}
          </Button>
        </div>

        {/* Footer decoration */}
        <div className="mt-20 flex justify-center">
          <div className="flex items-center gap-2 text-gray-500">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-amber-500/50" />
            <span className="text-amber-400/60">✨</span>
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-amber-500/50" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;