"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Minus, MapPin, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
// Install with: npm install react-country-state-city
import { GetCountries, GetState, GetCity } from "react-country-state-city";

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
  { id: 1, title: "Just Me", desc: "A solo journey of discovery", icon: "🧍", defaultMembers: 1 },
  { id: 2, title: "A Couple", desc: "Romantic getaway for two", icon: "👫", defaultMembers: 2 },
  { id: 3, title: "Family", desc: "Fun adventures for the whole family", icon: "👪", defaultMembers: 4 },
  { id: 4, title: "Friends", desc: "A memorable trip with your crew", icon: "🧑‍🤝‍🧑", defaultMembers: 5 },
  { id: 5, title: "Custom", desc: "Set your own group size", icon: "👥", defaultMembers: 1 },
];

const AI_PROMPT = `You are a trip planner. Return ONLY valid JSON (no prose, no markdown, no backticks).
Schema:
{
  "trip": {
    "location": string,
    "noOfDays": number,
    "budget": string,
    "traveler": string,
    "numberOfMembers": number,
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
For the trip to {location} for {noOfDays} days for {traveler} with {numberOfMembers} members and a {budget} budget.`;

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

const LocationSelector = ({ selectedLocation, onLocationChange }) => {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState({ countries: true, states: false, cities: false });

  // Load countries on component mount
  useEffect(() => {
    let isMounted = true;
    
    const loadCountries = async () => {
      try {
        setLoading(prev => ({ ...prev, countries: true }));
        const countryList = await GetCountries();
        if (isMounted) {
          setCountries(countryList);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error loading countries:", error);
          toast.error("Failed to load countries. Please refresh the page.");
        }
      } finally {
        if (isMounted) {
          setLoading(prev => ({ ...prev, countries: false }));
        }
      }
    };

    loadCountries();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Load states when country changes
  useEffect(() => {
    let isMounted = true;
    
    const loadStates = async () => {
      if (!selectedCountry) {
        if (isMounted) {
          setStates([]);
          setSelectedState(null);
          setCities([]);
          setSelectedCity(null);
        }
        return;
      }

      try {
        if (isMounted) {
          setLoading(prev => ({ ...prev, states: true }));
        }
        const stateList = await GetState(selectedCountry.id);
        if (isMounted) {
          setStates(stateList || []);
          setSelectedState(null);
          setCities([]);
          setSelectedCity(null);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error loading states:", error);
          toast.error("Failed to load states/provinces.");
          setStates([]);
        }
      } finally {
        if (isMounted) {
          setLoading(prev => ({ ...prev, states: false }));
        }
      }
    };

    loadStates();
    
    return () => {
      isMounted = false;
    };
  }, [selectedCountry]);

  // Load cities when state changes
  useEffect(() => {
    let isMounted = true;
    
    const loadCities = async () => {
      if (!selectedState) {
        if (isMounted) {
          setCities([]);
          setSelectedCity(null);
        }
        return;
      }

      try {
        if (isMounted) {
          setLoading(prev => ({ ...prev, cities: true }));
        }
        const cityList = await GetCity(selectedCountry.id, selectedState.id);
        if (isMounted) {
          setCities(cityList || []);
          setSelectedCity(null);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error loading cities:", error);
          toast.error("Failed to load cities.");
          setCities([]);
        }
      } finally {
        if (isMounted) {
          setLoading(prev => ({ ...prev, cities: false }));
        }
      }
    };

    loadCities();
    
    return () => {
      isMounted = false;
    };
  }, [selectedState, selectedCountry]);

  // FIXED: Update selected location when city changes - with proper dependency management
  useEffect(() => {
    if (selectedCity && selectedState && selectedCountry) {
      const locationString = `${selectedCity.name}, ${selectedState.name}, ${selectedCountry.name}`;
      if (locationString !== selectedLocation) {
        onLocationChange(locationString);
      }
    } else if (selectedState && selectedCountry && cities.length === 0 && !loading.cities) {
      // If no cities available, use state and country
      const locationString = `${selectedState.name}, ${selectedCountry.name}`;
      if (locationString !== selectedLocation) {
        onLocationChange(locationString);
      }
    } else if (selectedCountry && states.length === 0 && !loading.states) {
      // If no states available, use just country
      if (selectedCountry.name !== selectedLocation) {
        onLocationChange(selectedCountry.name);
      }
    }
  }, [
    selectedCity, 
    selectedState, 
    selectedCountry, 
    cities.length, 
    states.length, 
    loading.cities, 
    loading.states,
    selectedLocation,
    onLocationChange
  ]);

  const handleCountryChange = (e) => {
    const countryId = parseInt(e.target.value);
    const country = countries.find(c => c.id === countryId);
    setSelectedCountry(country || null);
  };

  const handleStateChange = (e) => {
    const stateId = parseInt(e.target.value);
    const state = states.find(s => s.id === stateId);
    setSelectedState(state || null);
  };

  const handleCityChange = (e) => {
    const cityId = parseInt(e.target.value);
    const city = cities.find(c => c.id === cityId);
    setSelectedCity(city || null);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Country Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Country
          </label>
          <select
            value={selectedCountry?.id || ''}
            onChange={handleCountryChange}
            disabled={loading.countries}
            className="w-full bg-gray-900/70 border-gray-700 text-white rounded-xl px-4 py-3 
              focus:ring-amber-500 focus:border-amber-500 backdrop-blur-sm transition-all duration-300
              hover:bg-gray-800/70 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">
              {loading.countries ? "Loading countries..." : "Select Country"}
            </option>
            {countries.map((country) => (
              <option key={country.id} value={country.id}>
                {country.name}
              </option>
            ))}
          </select>
        </div>

        {/* State Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            State/Province
          </label>
          <select
            value={selectedState?.id || ''}
            onChange={handleStateChange}
            disabled={!selectedCountry || loading.states}
            className="w-full bg-gray-900/70 border-gray-700 text-white rounded-xl px-4 py-3 
              focus:ring-amber-500 focus:border-amber-500 backdrop-blur-sm transition-all duration-300
              hover:bg-gray-800/70 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">
              {loading.states ? "Loading states..." : 
               !selectedCountry ? "Select country first" : 
               states.length === 0 ? "No states available" : "Select State"}
            </option>
            {states.map((state) => (
              <option key={state.id} value={state.id}>
                {state.name}
              </option>
            ))}
          </select>
        </div>

        {/* City Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            City
          </label>
          <select
            value={selectedCity?.id || ''}
            onChange={handleCityChange}
            disabled={!selectedState || loading.cities}
            className="w-full bg-gray-900/70 border-gray-700 text-white rounded-xl px-4 py-3 
              focus:ring-amber-500 focus:border-amber-500 backdrop-blur-sm transition-all duration-300
              hover:bg-gray-800/70 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">
              {loading.cities ? "Loading cities..." : 
               !selectedState ? "Select state first" : 
               cities.length === 0 ? "No cities available" : "Select City"}
            </option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedLocation && (
        <div className="mt-4 p-4 bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/30 rounded-xl">
          <p className="text-amber-200 font-medium flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Selected Destination: {selectedLocation}
          </p>
        </div>
      )}

      {/* Loading indicators */}
      {(loading.countries || loading.states || loading.cities) && (
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>
            {loading.countries && "Loading countries..."}
            {loading.states && "Loading states..."}
            {loading.cities && "Loading cities..."}
          </span>
        </div>
      )}
    </div>
  );
};

const MemberCounter = ({ members, onMembersChange, travellerType }) => {
  const incrementMembers = () => {
    if (members < 20) {
      onMembersChange(members + 1);
    }
  };

  const decrementMembers = () => {
    if (members > 1) {
      onMembersChange(members - 1);
    }
  };

  const getMemberIcon = (count) => {
    if (count === 1) return "🧍";
    if (count === 2) return "👫";
    if (count <= 4) return "👪";
    if (count <= 8) return "👥";
    return "🏢";
  };

  const getMemberText = (count) => {
    if (count === 1) return "traveler";
    return "travelers";
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-6xl mb-2 transition-all duration-300">
        {getMemberIcon(members)}
      </div>
      
      <div className="flex items-center space-x-6">
        <Button
          onClick={decrementMembers}
          disabled={members <= 1}
          variant="outline"
          size="icon"
          className="w-12 h-12 rounded-full bg-gray-900/70 border-gray-700 text-white hover:bg-amber-500/20 
            hover:border-amber-500/50 disabled:opacity-30 transition-all duration-300"
        >
          <Minus className="h-5 w-5" />
        </Button>
        
        <div className="text-center min-w-[120px]">
          <div className="text-4xl font-bold text-amber-400 mb-1">
            {members}
          </div>
          <div className="text-sm text-gray-400">
            {getMemberText(members)}
          </div>
        </div>
        
        <Button
          onClick={incrementMembers}
          disabled={members >= 20}
          variant="outline"
          size="icon"
          className="w-12 h-12 rounded-full bg-gray-900/70 border-gray-700 text-white hover:bg-amber-500/20 
            hover:border-amber-500/50 disabled:opacity-30 transition-all duration-300"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="text-center">
        <p className="text-gray-400 text-sm">
          Perfect for <span className="text-amber-400 font-medium">{travellerType || "your group"}</span>
        </p>
        {members > 10 && (
          <p className="text-amber-300 text-xs mt-1">
            🎉 That's quite an adventure crew!
          </p>
        )}
      </div>
    </div>
  );
};

const Page = () => {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    place: "",
    days: "",
    budget: "",
    travellers: "",
    numberOfMembers: 1,
  });

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  // FIXED: Properly memoized callback functions
  const handleFormInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const onLocationChange = useCallback((location) => {
    handleFormInputChange("place", location);
  }, [handleFormInputChange]);

  // FIXED: Added missing handleTravellerChange function
  const handleTravellerChange = useCallback((travellerType) => {
    const traveller = SelectTravellersList.find(t => t.title === travellerType);
    setFormData(prev => ({
      ...prev,
      travellers: travellerType,
      numberOfMembers: traveller ? traveller.defaultMembers : prev.numberOfMembers
    }));
  }, []);

  const handleGenerateTrip = async () => {
    if (
      Number(formData.days) > 5 ||
      Number(formData.days) < 1 ||
      !formData.place ||
      !formData.budget ||
      !formData.travellers ||
      formData.numberOfMembers < 1
    ) {
      toast.error("Please fill all fields and enter days between 1 and 5.");
      return;
    }

    setLoading(true);

    const FINAL_PROMPT = AI_PROMPT.replace("{location}", formData.place)
      .replace("{noOfDays}", formData.days)
      .replace("{traveler}", formData.travellers)
      .replace("{numberOfMembers}", formData.numberOfMembers)
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

      // Attempt strict parse, then try a few safe repairs if needed
      const normalizeJsonText = (text) => {
        return text
          .replace(/[\u2018\u2019]/g, "'")
          .replace(/[\u201C\u201D]/g, '"')
          .replace(/`/g, '');
      };

      const repairJsonText = (text) => {
        let t = text;
        // Insert commas between adjacent objects/arrays
        t = t.replace(/}\s*{/g, '},{');
        t = t.replace(/]\s*\[/g, '],[');
        // Remove trailing commas before closing braces/brackets
        t = t.replace(/,(\s*[}\]])/g, '$1');
        return t;
      };

      let parsed;
      try {
        parsed = JSON.parse(clean);
      } catch (e1) {
        try {
          const normalized = normalizeJsonText(clean);
          parsed = JSON.parse(normalized);
        } catch (e2) {
          try {
            const repaired = repairJsonText(normalizeJsonText(clean));
            parsed = JSON.parse(repaired);
          } catch (e3) {
            console.error("Failed to parse AI trip JSON after repairs:", e3, clean);
            toast.error("AI returned malformed JSON. Please try again.");
            setLoading(false);
            return;
          }
        }
      }

      // Unwrap if API returned { trip: { ... } }
      const base = parsed?.trip ? parsed.trip : parsed;

      // Transform into structure expected by travel plan page
      const suggestedItinerary = Array.isArray(base?.suggestedItinerary)
        ? base.suggestedItinerary
        : Array.isArray(base?.daily_plan)
          ? base.daily_plan.map((d, idx) => ({
              dayNumber: idx + 1,
              date: new Date(Date.now() + idx * 24 * 60 * 60 * 1000), // Future dates
              theme: ((d.title || `Day ${d.day || idx + 1}`)?.toString() || '').slice(0, 100),
              activities: Array.isArray(d.activities)
                ? d.activities.map((act) => {
                    const rawTitle = typeof act === 'string' ? act : (act?.name || 'Activity');
                    const safeTitle = (rawTitle || 'Activity').toString().trim().slice(0, 200);
                    const locName = typeof act === 'string' ? act : (act?.name || 'Location');
                    return ({
                      title: safeTitle,
                      description: typeof act === 'string' ? act : (act?.details || 'Activity details'),
                      date: new Date(Date.now() + idx * 24 * 60 * 60 * 1000),
                      time: {
                        startTime: '09:00',
                        endTime: '17:00'
                      },
                      location: {
                        name: locName,
                        address: ''
                      },
                      cost: {
                        amount: 0,
                        currency: 'USD',
                        category: 'other'
                      },
                      rating: typeof act === 'object' && act?.rating ? act.rating : 0,
                      isCompleted: false,
                      priority: 'medium'
                    });
                  })
                : [],
              summary: "",
              totalCost: {
                amount: 0,
                currency: "USD"
              }
            }))
          : [];

      // Create proper trip structure for MongoDB
      const tripDataForMongo = {
        // Required fields
        title: `${formData.place} Trip - ${formData.days} Days`,
        destination: {
          name: base.location || base.destination || formData.place,
          country: "Unknown", // You might want to get this from a location API
          coordinates: {
            latitude: 0,
            longitude: 0
          }
        },
        startDate: new Date(),
        endDate: new Date(Date.now() + (formData.days - 1) * 24 * 60 * 60 * 1000),
        numberOfDays: parseInt(formData.days),
        budget: formData.budget,
        travelGroup: formData.travellers,
        numberOfMembers: formData.numberOfMembers,
        
        // Optional fields
        bestTimeToVisit: base.bestTimeToVisit || "",
        itinerary: suggestedItinerary,
        hotels: Array.isArray(base.hotels) ? base.hotels.map(hotel => ({
          name: hotel.hotelName || hotel.name || "Hotel",
          address: hotel.hotelAddress || hotel.address || "Address not specified",
          price: {
            amount: hotel.price || 0,
            currency: "USD",
            perNight: true
          },
          rating: hotel.rating || 0,
          description: hotel.descriptions || hotel.description || "",
          imageUrl: hotel.hotelImageUrl || hotel.imageUrl || "",
          amenities: [],
          bookingReference: ""
        })) : [],
        
        // AI metadata
        aiPrompt: FINAL_PROMPT,
        
        // Set default values for required fields
        status: "planning",
        isPublic: false,
        notes: "",
        tags: []
      };

      console.log('Generated trip data:', tripDataForMongo);
      toast.success(`Trip generated for ${formData.numberOfMembers} ${formData.numberOfMembers === 1 ? 'person' : 'people'}!`);

      // For demo purposes, we'll just show the success message
      // In your actual implementation, save to MongoDB and navigate
      
      try {
        const response = await fetch('/api/trips', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tripDataForMongo)
        });

        if (!response.ok) {
          throw new Error('Failed to save trip');
        }

        const { trip } = await response.json();
        router.push(`/travel-plan/${trip._id}`);
      } catch (saveError) {
        console.error('Error saving trip:', saveError);
        toast.error(`Failed to save trip: ${saveError.message}`);
      }
      

    } catch (err) {
      console.error("Error generating trip:", err);
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking authentication
  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-gray-200 relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 mt-10 bg-gradient-to-br from-amber-900/5 via-transparent to-amber-800/5" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/3 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-600/3 rounded-full blur-3xl" />
      
      <div className="relative z-10 mt-7 sm:px-10 md:px-32 lg:px-56 xl:px-72 px-6 py-16">
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
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                1
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-amber-100 bg-clip-text text-transparent">
                Where would you like to go?
              </h2>
            </div>
            <LocationSelector
              selectedLocation={formData.place}
              onLocationChange={onLocationChange}
            />
          </div>

          {/* Days */}
          <div className="space-y-6">
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
                What type of trip is this?
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {SelectTravellersList.map((item) => (
                <SelectionCard
                  key={item.id}
                  item={item}
                  isSelected={formData.travellers === item.title}
                  onClick={() => handleTravellerChange(item.title)}
                />
              ))}
            </div>
          </div>

          {/* Member Counter */}
          {formData.travellers && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  5
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-amber-100 bg-clip-text text-transparent flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  How many people are traveling?
                </h2>
              </div>
              <div className="flex justify-center">
                <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8 shadow-2xl">
                  <MemberCounter
                    members={formData.numberOfMembers}
                    onMembersChange={(count) => handleFormInputChange("numberOfMembers", count)}
                    travellerType={formData.travellers}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Generate Button */}
        <div className="mt-20 flex justify-center">
          <Button
            onClick={handleGenerateTrip}
            disabled={loading || !formData.place || !formData.days || !formData.budget || !formData.travellers}
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
                Generate Trip for {formData.numberOfMembers} {formData.numberOfMembers === 1 ? 'Person' : 'People'}
              </>
            )}
          </Button>
        </div>

        {/* Trip Summary Preview */}
        {(formData.place || formData.days || formData.budget || formData.travellers) && (
          <div className="mt-16 flex justify-center">
            <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/30 rounded-2xl p-6 max-w-2xl w-full">
              <h3 className="text-xl font-bold text-amber-200 mb-4 text-center flex items-center justify-center gap-2">
                <span>🎯</span>
                Trip Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {formData.place && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    <span className="font-medium">Destination:</span>
                    <span>{formData.place}</span>
                  </div>
                )}
                {formData.days && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <span className="text-amber-400">📅</span>
                    <span className="font-medium">Duration:</span>
                    <span>{formData.days} days</span>
                  </div>
                )}
                {formData.budget && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <span className="text-amber-400">💰</span>
                    <span className="font-medium">Budget:</span>
                    <span>{formData.budget}</span>
                  </div>
                )}
                {formData.travellers && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <Users className="w-4 h-4 text-amber-400" />
                    <span className="font-medium">Group:</span>
                    <span>{formData.travellers} ({formData.numberOfMembers} {formData.numberOfMembers === 1 ? 'person' : 'people'})</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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