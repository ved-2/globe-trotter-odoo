"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const SelectBudgetOptions = [
  { id: 1, title: "Cheap", desc: "Stay on a budget", icon: "💸" },
  { id: 2, title: "Moderate", desc: "Keep it simple and comfortable", icon: "⚖️" },
  { id: 3, title: "Luxury", desc: "Indulge in high-end experiences", icon: "💎" },
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
    className={`p-4 border rounded-xl cursor-pointer transition-all duration-300
      bg-white border-gray-300 hover:bg-gray-100 hover:border-gray-400
      ${isSelected ? "ring-2 ring-blue-500 border-blue-500 bg-blue-50" : ""}`}
  >
    <h2 className="text-4xl">{item.icon}</h2>
    <h3 className="font-bold text-lg mt-2 text-gray-900">{item.title}</h3>
    <p className="text-sm text-gray-600">{item.desc}</p>
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
    <div className="bg-white min-h-screen text-gray-900">
      <div className="sm:px-10 md:px-32 lg:px-56 xl:px-72 px-6 py-16">
        <h2 className="font-bold text-4xl text-gray-900">
          Tell us your travel preferences 🏕🌴
        </h2>
        <p className="mt-4 text-gray-600 text-xl max-w-4xl">
          Provide some basic information, and our AI trip planner will generate
          a customized itinerary just for you.
        </p>

        <div className="flex flex-col gap-12 mt-12">
          {/* Destination */}
          <div>
            <h2 className="text-xl my-3 font-semibold text-gray-900">
              What is your destination of choice?
            </h2>
            <Input
              placeholder="e.g., Goa"
              type="text"
              value={formData.place}
              onChange={(e) => handleFormInputChange("place", e.target.value)}
              className="max-w-md bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus-visible:ring-blue-500"
            />
          </div>

          {/* Days */}
          <div>
            <h2 className="text-xl my-3 font-semibold text-gray-900">
              How many days are you planning your trip? (1-5)
            </h2>
            <Input
              placeholder="e.g., 3"
              type="number"
              value={formData.days}
              onChange={(e) => handleFormInputChange("days", e.target.value)}
              className="max-w-md bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus-visible:ring-blue-500"
            />
          </div>

          {/* Budget */}
          <div>
            <h2 className="text-xl my-3 font-semibold text-gray-900">
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
            <h2 className="text-xl my-3 font-semibold text-gray-900">
              Who are you traveling with?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mt-5">
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
