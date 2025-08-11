"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  CountrySelect,
  StateSelect,
  CitySelect
} from "react-country-state-city";
import "react-country-state-city/dist/react-country-state-city.css"; 

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
    icon: "⚖",
  },
  {
    id: 3,
    title: "Luxury",
    desc: "Indulge in high-end experiences",
    icon: "💎",
  },
];

const AI_PROMPT = `You are a trip planner. Return ONLY valid JSON (no prose, no markdown, no backticks).
Schema:
{
  "trip": {
    "location": string,
    "noOfDays": number,
    "budget": string,
    "travelers": number,
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
For the trip to {location} for {noOfDays} days for {travelers} people with a {budget} budget.`;

const API_KEY = "AIzaSyCjcLQoEQzqzGEO6QTUFw42wUnfyJvTOiU";
const URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

const NumberScroller = ({ value, onChange, min = 1, max = 20, label }) => {
  const [displayValue, setDisplayValue] = useState(value);

  const increment = () => {
    if (displayValue < max) {
      const newValue = displayValue + 1;
      setDisplayValue(newValue);
      onChange(newValue);
    }
  };

  const decrement = () => {
    if (displayValue > min) {
      const newValue = displayValue - 1;
      setDisplayValue(newValue);
      onChange(newValue);
    }
  };

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-sm text-gray-400 font-medium">{label}</div>
      <div className="flex items-center space-x-6 bg-gray-900/70 rounded-2xl p-6 border border-gray-700">
        <Button
          type="button"
          onClick={decrement}
          disabled={displayValue <= min}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/20 
            hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-500/30
            text-amber-300 text-xl font-bold transition-all duration-300 transform hover:scale-110
            disabled:opacity-30 disabled:transform-none"
        >
          −
        </Button>
        <div className="flex flex-col items-center min-w-[80px]">
          <div className="text-4xl font-bold text-white mb-1">{displayValue}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">
            {displayValue === 1 ? 'Person' : 'People'}
          </div>
        </div>
        <Button
          type="button"
          onClick={increment}
          disabled={displayValue >= max}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/20 
            hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-500/30
            text-amber-300 text-xl font-bold transition-all duration-300 transform hover:scale-110
            disabled:opacity-30 disabled:transform-none"
        >
          +
        </Button>
      </div>
    </div>
  );
};

const SelectionCard = ({ item, isSelected, onClick }) => (
  <div
    onClick={onClick}
    className={`group relative p-6 border rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02]
      bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 
      hover:from-gray-800 hover:to-gray-700 hover:border-amber-500/50
      hover:shadow-lg hover:shadow-amber-500/10
      ${isSelected && "ring-2 ring-amber-500 border-amber-500"}`}
  >
    <div className="flex flex-col items-center text-center">
      <div className={`text-4xl mb-3 ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}>
        {item.icon}
      </div>
      <h3 className={`${isSelected ? 'text-amber-300' : 'text-white'} font-bold text-lg`}>
        {item.title}
      </h3>
      <p className="text-sm text-gray-400">{item.desc}</p>
    </div>
  </div>
);

const Page = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    countryId: null,
    stateId: null,
    place: "",
    travelers: 2,
    days: "",
    budget: "",
  });

  const handleFormInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerateTrip = async () => {
    if (
      Number(formData.days) > 5 ||
      Number(formData.days) < 1 ||
      !formData.place ||
      !formData.budget ||
      !formData.travelers
    ) {
      toast.error("Please fill all fields and enter days between 1 and 5.");
      return;
    }

    setLoading(true);

    const FINAL_PROMPT = AI_PROMPT.replace("{location}", formData.place)
      .replace("{noOfDays}", formData.days)
      .replace("{travelers}", formData.travelers)
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
        toast.error(`API error: ${response.status} ${response.statusText}`);
        setLoading(false);
        return;
      }

      response = await response.json();
      const tripData = response?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!tripData) throw new Error("No trip plan was returned from the AI.");

      let clean = tripData.trim();
      const firstBrace = clean.indexOf("{");
      const lastBrace = clean.lastIndexOf("}");
      clean = clean.slice(firstBrace, lastBrace + 1);

      let parsed = JSON.parse(clean);
      const base = parsed?.trip ? parsed.trip : parsed;

      const suggestedItinerary = Array.isArray(base?.daily_plan)
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
        duration: base.noOfDays || formData.days,
        budget: base.budget || formData.budget,
        travelers: base.travelers || formData.travelers,
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
      {/* Custom CSS for dropdown styling */}
      <style jsx global>{`
        .csc-select,
        .csc-select select,
        .csc-select__control,
        .csc-select__single-value,
        .csc-select__placeholder {
          background: rgb(0, 0, 0) !important;
          border: 2px solid rgb(245, 158, 11) !important;
          color: rgb(229, 231, 235) !important;
          border-radius: 16px !important;
          padding: 12px 16px !important;
          font-size: 16px !important;
          transition: all 0.3s ease !important;
        }
        
        .csc-select:hover,
        .csc-select__control:hover {
          border-color: rgb(245, 158, 11) !important;
          box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.3) !important;
        }
        
        .csc-select__control--is-focused,
        .csc-select__control--is-focused:hover {
          border-color: rgb(245, 158, 11) !important;
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.5) !important;
        }
        
        .csc-select__menu {
          background: rgb(0, 0, 0) !important;
          border: 2px solid rgb(245, 158, 11) !important;
          border-radius: 16px !important;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.8) !important;
          overflow: hidden !important;
        }
        
        .csc-select__option {
          background: transparent !important;
          color: rgb(229, 231, 235) !important;
          padding: 12px 16px !important;
          cursor: pointer !important;
        }
        
        .csc-select__option:hover,
        .csc-select__option--is-focused {
          background: rgba(245, 158, 11, 0.2) !important;
          color: rgb(245, 158, 11) !important;
        }
        
        .csc-select__option--is-selected {
          background: rgba(245, 158, 11, 0.3) !important;
          color: rgb(245, 158, 11) !important;
        }
        
        .csc-select__indicator-separator {
          background-color: rgb(245, 158, 11) !important;
        }
        
        .csc-select__dropdown-indicator {
          color: rgb(245, 158, 11) !important;
        }
        
        .csc-select__dropdown-indicator:hover {
          color: rgb(251, 191, 36) !important;
        }
      `}</style>
      
      <div className="relative z-10 sm:px-10 md:px-32 lg:px-56 xl:px-72 px-6 py-16">
        {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
              Plan Your Perfect Journey
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Tell us your preferences and let AI craft a personalized travel experience just for you
            </p>
          </div>

          {/* Destination Section */}
       <div className="space-y-6 mb-16">
  <div className="text-center mb-8">
    <h2 className="text-3xl font-bold text-white mb-3 flex items-center justify-center gap-3">
      <span className="text-4xl"></span>
      Choose Your Destination
    </h2>
    <p className="text-gray-400 text-lg">
      Select the country, state, and city where your adventure begins
    </p>
  </div>

  <div className="space-y-4">
    {/* Country */}
    <div>
      <label className="block text-sm font-semibold text-gray-300 mb-2 ml-2">
         Country
      </label>
      <div className="rounded-2xl border-4 border-amber-500 bg-black">
        <CountrySelect
          className="dropdown-black"
          onChange={(selectedCountry) => {
            setFormData((prev) => ({
              ...prev,
              countryId: selectedCountry.id,
              stateId: null,
              place: "",
            }));
          }}
          placeHolder="Select your destination country"
        />
      </div>
    </div>

    {/* State */}
    <div>
      <label className="block text-sm font-semibold text-gray-300 mb-2 ml-2">
         State/Province
      </label>
      <div className="rounded-2xl border-4 border-amber-500 bg-black">
        <StateSelect
          className="dropdown-black"
          countryid={formData.countryId}
          onChange={(selectedState) => {
            setFormData((prev) => ({
              ...prev,
              stateId: selectedState.id,
              place: "",
            }));
          }}
          placeHolder="Select state or province"
        />
      </div>
    </div>

    {/* City */}
    <div>
      <label className="block text-sm font-semibold text-gray-300 mb-2 ml-2">
         City
      </label>
      <div className="rounded-2xl border-4 border-amber-500 bg-black">
        <CitySelect
          className="dropdown-black"
          countryid={formData.countryId}
          stateid={formData.stateId}
          onChange={(selectedCity) => {
            handleFormInputChange("place", selectedCity.name);
          }}
          placeHolder="Select your destination city"
        />
      </div>
    </div>
  </div>
</div>


          {/* Travelers Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-3 flex items-center justify-center gap-3">
              <span className="text-4xl"></span>
              Travel Party Size
            </h2>
            <p className="text-gray-400 text-lg">
              How many adventurers will be joining this journey?
            </p>
          </div>
          
          <NumberScroller
            value={formData.travelers}
            onChange={(value) => handleFormInputChange("travelers", value)}
            min={1}
            max={20}
            label=""
          />
        </div>

        {/* Budget Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-3 flex items-center justify-center gap-3">
              <span className="text-4xl"></span>
              Budget Preference
            </h2>
            <p className="text-gray-400 text-lg">
              Choose your comfort level and spending preference for this trip
            </p>
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

        {/* Duration Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-3 flex items-center justify-center gap-3">
              <span className="text-4xl"></span>
              Trip Duration
            </h2>
            <p className="text-gray-400 text-lg">
              How many days would you like your adventure to last? (1-5 days)
            </p>
          </div>
          
          <div className="flex justify-center">
            <Input
              placeholder="Enter number of days (1-5)"
              type="number"
              min="1"
              max="5"
              value={formData.days}
              onChange={(e) => handleFormInputChange("days", e.target.value)}
              className="max-w-md bg-gray-900/70 border-gray-700 text-white text-center text-lg py-4 px-6 rounded-2xl
                focus:border-amber-500 focus:ring-amber-500/50 placeholder:text-gray-500
                hover:border-amber-500/50 transition-all duration-300"
            />
          </div>
        </div>

        {/* Generate Button */}
        <div className="text-center">
          <Button
            onClick={handleGenerateTrip}
            disabled={loading}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 
              text-black font-bold text-lg py-6 px-12 rounded-2xl transform hover:scale-105 
              transition-all duration-300 shadow-lg hover:shadow-amber-500/25
              disabled:transform-none disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                <span className="text-xl">Crafting Your Perfect Journey...</span>
              </>
            ) : (
              <>
                <span className="mr-3 text-2xl">✨</span>
                <span className="text-xl">Generate My Dream Trip</span>
              </>
            )}
          </Button>
          
          {!loading && (
            <p className="mt-4 text-gray-500 text-sm">
              Click to create your personalized travel itinerary with AI magic
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;