"use client";
import "@copilotkit/react-ui/styles.css";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { Loader2, MapPin, Calendar, Users, DollarSign } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { CopilotPopup } from "@copilotkit/react-ui";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";

const TravelPlan = () => {
  const params = useParams();
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const chatKey = `chat_${params?.id || 'default'}`;

  // Load chat messages from memory (not localStorage)
  const loadChatMessages = useCallback(() => {
    // Use sessionStorage as fallback since localStorage isn't available
    try {
      const saved = sessionStorage.getItem(chatKey);
      if (saved) {
        setChatMessages(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not load chat messages:', e);
    }
  }, [chatKey]);

  // Save chat messages to memory
  const saveChatMessages = useCallback((messages) => {
    try {
      sessionStorage.setItem(chatKey, JSON.stringify(messages));
      setChatMessages(messages);
    } catch (e) {
      console.warn('Could not save chat messages:', e);
      setChatMessages(messages);
    }
  }, [chatKey]);

  // Expose plan to Copilot
  useCopilotReadable({
    description: "Current travel plan with itinerary, hotels, and trip details",
    value: plan,
  });

  const persistItinerary = useCallback(async (newItinerary) => {
    if (!params?.id) return;
    try {
      const res = await fetch(`/api/trips/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itinerary: newItinerary }),
      });
      if (!res.ok) {
        throw new Error('Failed to save changes');
      }
      // Update local state without full page reload
      setPlan(prev => ({ ...prev, itinerary: newItinerary }));
      return true;
    } catch (e) {
      console.error('Persist failed:', e);
      return false;
    }
  }, [params?.id]);

  const persistPlan = useCallback(async (updatedPlan) => {
    if (!params?.id) return;
    try {
      const res = await fetch(`/api/trips/${params.id}`, {
        method: 'PATCH', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPlan),
      });
      if (!res.ok) {
        throw new Error('Failed to save changes');
      }
      setPlan(prev => ({ ...prev, ...updatedPlan }));
      return true;
    } catch (e) {
      console.error('Persist plan failed:', e);
      return false;
    }
  }, [params?.id]);

  // Helper function to format time properly
  const formatTime = (timeStr) => {
    if (!timeStr) return 'TBD';
    try {
      // Handle various time formats
      if (timeStr.includes(':')) {
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const min = minutes.padStart(2, '0');
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${displayHour}:${min} ${period}`;
      }
      return timeStr;
    } catch (e) {
      return timeStr || 'TBD';
    }
  };

  // Copilot action: Add a new day to itinerary
  useCopilotAction({
    name: "addDayToItinerary",
    description: "Add a new day to the travel itinerary with activities",
    parameters: [
      { name: "theme", type: "string", description: "Theme for the new day (e.g., 'Sightseeing', 'Adventure')" },
      { name: "activities", type: "string", description: "JSON string of activities array for the new day" }
    ],
    handler: async ({ theme, activities }) => {
      if (!plan?.itinerary) return { success: false, error: "No itinerary available" };
      
      try {
        let parsedActivities = [];
        if (activities) {
          parsedActivities = JSON.parse(activities);
        }
        
        const newDay = {
          dayNumber: plan.itinerary.length + 1,
          theme: theme || `Day ${plan.itinerary.length + 1}`,
          activities: parsedActivities
        };
        
        const newItinerary = [...plan.itinerary, newDay];
        const success = await persistItinerary(newItinerary);
        
        if (success) {
          // Update duration
          await persistPlan({ numberOfDays: newItinerary.length, duration: `${newItinerary.length} days` });
          return { success: true, message: `Added ${theme} as Day ${newDay.dayNumber}` };
        }
        return { success: false, error: "Failed to save new day" };
      } catch (e) {
        return { success: false, error: "Invalid activities format" };
      }
    }
  });

  // Copilot action: Remove a day from itinerary
  useCopilotAction({
    name: "removeDayFromItinerary", 
    description: "Remove a day from the travel itinerary",
    parameters: [
      { name: "dayNumber", type: "number", description: "1-based day number to remove" }
    ],
    handler: async ({ dayNumber }) => {
      if (!plan?.itinerary) return { success: false, error: "No itinerary available" };
      
      const dayIdx = Number(dayNumber) - 1;
      if (dayIdx < 0 || dayIdx >= plan.itinerary.length) {
        return { success: false, error: "Day number out of range" };
      }
      
      const newItinerary = plan.itinerary.filter((_, idx) => idx !== dayIdx)
        .map((day, idx) => ({ ...day, dayNumber: idx + 1 }));
      
      const success = await persistItinerary(newItinerary);
      
      if (success) {
        // Update duration
        await persistPlan({ numberOfDays: newItinerary.length, duration: `${newItinerary.length} days` });
        return { success: true, message: `Removed Day ${dayNumber}. Updated day numbers.` };
      }
      return { success: false, error: "Failed to remove day" };
    }
  });

  // Copilot action: Update trip duration
  useCopilotAction({
    name: "updateTripDuration",
    description: "Update the total duration of the trip",
    parameters: [
      { name: "newDuration", type: "number", description: "New duration in days" }
    ],
    handler: async ({ newDuration }) => {
      const days = Number(newDuration);
      if (days < 1 || days > 30) {
        return { success: false, error: "Duration must be between 1 and 30 days" };
      }
      
      let newItinerary = [...(plan?.itinerary || [])];
      
      // Add days if needed
      while (newItinerary.length < days) {
        newItinerary.push({
          dayNumber: newItinerary.length + 1,
          theme: `Day ${newItinerary.length + 1}`,
          activities: []
        });
      }
      
      // Remove days if needed
      if (newItinerary.length > days) {
        newItinerary = newItinerary.slice(0, days);
      }
      
      const success = await persistItinerary(newItinerary);
      if (success) {
        await persistPlan({ 
          numberOfDays: days, 
          duration: `${days} days`
        });
        return { success: true, message: `Updated trip duration to ${days} days` };
      }
      return { success: false, error: "Failed to update duration" };
    }
  });

  // Enhanced move activity action with better time handling
  useCopilotAction({
    name: "moveItineraryActivity",
    description: "Move an activity from one day/index to another day/index in the itinerary.",
    parameters: [
      { name: "fromDay", type: "number", description: "1-based day number to move from" },
      { name: "fromIndex", type: "number", description: "0-based activity index within the source day" },
      { name: "toDay", type: "number", description: "1-based day number to move to" },
      { name: "toIndex", type: "number", description: "0-based target position within destination day" }
    ],
    handler: async ({ fromDay, fromIndex, toDay, toIndex }) => {
      if (!plan?.itinerary) return { success: false, error: "No itinerary available" };
      
      const srcDayIdx = Number(fromDay) - 1;
      const dstDayIdx = Number(toDay) - 1;
      
      if (srcDayIdx < 0 || dstDayIdx < 0 || 
          srcDayIdx >= plan.itinerary.length || dstDayIdx >= plan.itinerary.length) {
        return { success: false, error: "Day out of range" };
      }
      
      const source = plan.itinerary[srcDayIdx];
      const dest = plan.itinerary[dstDayIdx];
      const srcActs = [...(source.activities || [])];
      
      if (fromIndex < 0 || fromIndex >= srcActs.length) {
        return { success: false, error: "Source index out of range" };
      }
      
      const [moved] = srcActs.splice(fromIndex, 1);
      const dstActs = [...(dest.activities || [])];
      const safeToIndex = Math.min(Math.max(Number(toIndex), 0), dstActs.length);
      dstActs.splice(safeToIndex, 0, moved);
      
      const newItin = plan.itinerary.map((d, i) => (
        i === srcDayIdx ? { ...d, activities: srcActs } : 
        i === dstDayIdx ? { ...d, activities: dstActs } : d
      ));
      
      const success = await persistItinerary(newItin);
      return success ? 
        { success: true, message: `Moved activity from Day ${fromDay} to Day ${toDay}` } :
        { success: false, error: "Failed to save changes" };
    }
  });

  // Enhanced remove activity action
  useCopilotAction({
    name: "removeItineraryActivity",
    description: "Remove an activity by day and index from the itinerary.",
    parameters: [
      { name: "day", type: "number", description: "1-based day number" },
      { name: "index", type: "number", description: "0-based activity index in that day" }
    ],
    handler: async ({ day, index }) => {
      if (!plan?.itinerary) return { success: false, error: "No itinerary available" };
      
      const dayIdx = Number(day) - 1;
      if (dayIdx < 0 || dayIdx >= plan.itinerary.length) {
        return { success: false, error: "Day out of range" };
      }
      
      const acts = [...(plan.itinerary[dayIdx].activities || [])];
      if (index < 0 || index >= acts.length) {
        return { success: false, error: "Index out of range" };
      }
      
      const removedActivity = acts[index];
      acts.splice(index, 1);
      const newItin = plan.itinerary.map((d, i) => (i === dayIdx ? { ...d, activities: acts } : d));
      
      const success = await persistItinerary(newItin);
      return success ?
        { success: true, message: `Removed "${removedActivity.title || removedActivity.placeName}" from Day ${day}` } :
        { success: false, error: "Failed to save changes" };
    }
  });

  // Copilot action: Add activity to a specific day
  useCopilotAction({
    name: "addActivityToDay",
    description: "Add a new activity to a specific day",
    parameters: [
      { name: "day", type: "number", description: "1-based day number" },
      { name: "title", type: "string", description: "Activity title" },
      { name: "description", type: "string", description: "Activity description" },
      { name: "time", type: "string", description: "Activity time (e.g., '9:00 AM')" },
      { name: "cost", type: "number", description: "Activity cost (optional)" }
    ],
    handler: async ({ day, title, description, time, cost }) => {
      if (!plan?.itinerary) return { success: false, error: "No itinerary available" };
      
      const dayIdx = Number(day) - 1;
      if (dayIdx < 0 || dayIdx >= plan.itinerary.length) {
        return { success: false, error: "Day out of range" };
      }
      
      const newActivity = {
        title: title || "New Activity",
        description: description || "",
        time: { startTime: time || "TBD" },
        cost: { amount: cost || 0 }
      };
      
      const acts = [...(plan.itinerary[dayIdx].activities || [])];
      acts.push(newActivity);
      
      const newItin = plan.itinerary.map((d, i) => (i === dayIdx ? { ...d, activities: acts } : d));
      
      const success = await persistItinerary(newItin);
      return success ?
        { success: true, message: `Added "${title}" to Day ${day}` } :
        { success: false, error: "Failed to add activity" };
    }
  });

  // Load chat messages on component mount
  useEffect(() => {
    loadChatMessages();
  }, [loadChatMessages]);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  // Fetch trip
  useEffect(() => {
    const fetchTrip = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/trips/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch trip');
        }
        const { trip } = await response.json();
        setPlan(trip);
        setError(null);
      } catch (err) {
        console.error("Error fetching trip:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) {
      fetchTrip();
    }
  }, [params?.id]);

  return (
    <div className="min-h-screen bg-gray-50">
      {(!isLoaded || !isSignedIn) && (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}

      {isLoaded && isSignedIn && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading && (
            <div className="min-h-[40vh] flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600">Loading your travel plan...</p>
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="min-h-[40vh] flex items-center justify-center">
              <div className="text-center">
                <div className="text-red-600 text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Trip</h2>
                <p className="text-gray-600 mb-4">{error}</p>
                <button 
                  onClick={() => window.history.back()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Go Back
                </button>
              </div>
            </div>
          )}

          {!loading && !error && plan && (
            <>
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                      🧳 {plan.title || `${plan.destination?.name || plan.location || 'Your'} Travel Plan`}
                    </h1>
                    <p className="text-gray-600 text-lg">
                      AI-generated itinerary for your perfect trip
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {plan.status || 'Planning'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Destination</p>
                      <p className="font-semibold text-gray-900">
                        {plan.destination?.name || plan.location}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="font-semibold text-gray-900">
                        {plan.numberOfDays || plan.duration || 
                         (plan.itinerary?.length ? `${plan.itinerary.length} days` : 'N/A')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Users className="h-6 w-6 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-500">Travel Group</p>
                      <p className="font-semibold text-gray-900">
                        {plan.travelGroup || plan.travelers}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-6 w-6 text-yellow-600" />
                    <div>
                      <p className="text-sm text-gray-500">Budget</p>
                      <p className="font-semibold text-gray-900">{plan.budget}</p>
                    </div>
                  </div>
                </div>

                {plan.bestTimeToVisit && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Best Time to Visit:</strong> {plan.bestTimeToVisit}
                    </p>
                  </div>
                )}
              </div>

              {plan.hotels && plan.hotels.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    🏨 Hotel Suggestions
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {plan.hotels.map((hotel, idx) => (
                      <div key={idx} className="border rounded-xl p-6 hover:shadow-md transition-shadow">
                        {(hotel.imageUrl || hotel.hotelImageUrl) && (
                          <img
                            src={hotel.imageUrl || hotel.hotelImageUrl}
                            alt={hotel.name || hotel.hotelName}
                            className="w-full h-48 object-cover rounded-lg mb-4"
                          />
                        )}
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {hotel.name || hotel.hotelName}
                        </h3>
                        <p className="text-gray-600 mb-2">
                          {hotel.address || hotel.hotelAddress}
                        </p>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-lg font-semibold text-green-600">
                            ${hotel.price?.amount || hotel.price || 'N/A'}
                          </span>
                          <span className="flex items-center text-yellow-500">
                            {'⭐'.repeat(hotel.rating || 0)}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm">
                          {hotel.description || hotel.descriptions}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {plan.itinerary && plan.itinerary.length > 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    📅 Your Itinerary ({plan.itinerary.length} days)
                  </h2>
                  <div className="space-y-8">
                    {plan.itinerary.map((day, idx) => (
                      <div key={idx} className="border-l-4 border-blue-500 pl-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                          Day {day.dayNumber || idx + 1}: {day.theme}
                        </h3>
                        <div className="space-y-4">
                          {day.activities && day.activities.map((activity, aIdx) => (
                            <div key={aIdx} className="bg-gray-50 rounded-lg p-4">
                              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                {activity.title || activity.placeName}
                              </h4>
                              <p className="text-gray-700 mb-3">
                                {activity.description || activity.placeDetails}
                              </p>
                              <div className="flex items-center justify-between text-sm text-gray-600">
                                <span>⏰ {formatTime(activity.time?.startTime || activity.timeTravelEachLocation)}</span>
                                {(activity.cost?.amount > 0) && (
                                  <span>💰 ${activity.cost.amount}</span>
                                )}
                                {activity.rating && (
                                  <span>⭐ {activity.rating}</span>
                                )}
                              </div>
                            </div>
                          ))}
                          {(!day.activities || day.activities.length === 0) && (
                            <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-500">
                              No activities planned for this day
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                  <div className="text-gray-400 text-6xl mb-4">📋</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Itinerary Available</h3>
                  <p className="text-gray-600">Ask the AI assistant to create a detailed itinerary for your trip.</p>
                </div>
              )}

              {plan.disclaimer && (
                <div className="mt-8 p-6 bg-yellow-50 rounded-xl border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <strong>Disclaimer:</strong> {plan.disclaimer}
                  </p>
                </div>
              )}

              <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
                <p className="mb-2 font-semibold">AI Assistant Commands:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <ul className="list-disc ml-5">
                    <li>"Add a day with sightseeing theme"</li>
                    <li>"Remove day 3 from my itinerary"</li>
                    <li>"Change trip duration to 5 days"</li>
                    <li>"Move activity 1 from Day 1 to Day 3"</li>
                  </ul>
                  <ul className="list-disc ml-5">
                    <li>"Remove activity 2 from Day 4"</li>
                    <li>"Add museum visit to Day 2 at 10:00 AM"</li>
                    <li>"Show me a realistic travel schedule"</li>
                    <li>"Help me optimize my itinerary"</li>
                  </ul>
                </div>
              </div>

              <CopilotPopup
                defaultOpen={false}
                instructions={`You are an expert travel planning assistant with these capabilities:

CORE FUNCTIONS:
1. addDayToItinerary(theme, activities) - Add new days
2. removeDayFromItinerary(dayNumber) - Remove specific days  
3. updateTripDuration(newDuration) - Change total trip length
4. addActivityToDay(day, title, description, time, cost) - Add activities
5. moveItineraryActivity(fromDay, fromIndex, toDay, toIndex) - Reorganize activities
6. removeItineraryActivity(day, index) - Remove activities

RULES:
- ONLY respond to travel-related queries
- Always validate timing and logistics before confirming changes
- Check for impossible schedules (too many distant locations in one day)
- Suggest realistic alternatives for unfeasible plans
- Keep responses concise and actionable
- Always confirm successful changes with brief summaries

TRAVEL VALIDATION:
- Minimum 2-3 hours between distant locations
- Maximum 3-4 major activities per day
- Consider opening hours and travel distances
- Alert about unrealistic budgets or timeframes

If asked about non-travel topics, respond: "I'm here to help with your travel plans only."`}
                messages={chatMessages.length > 0 ? chatMessages : [
                  {
                    id: "1",
                    role: "assistant",
                    content: plan
                      ? `Hi! I can help you modify your ${plan.destination?.name || plan.location} trip. I can add/remove days, move activities, and ensure your itinerary is realistic. What would you like to change?`
                      : "Hi! Tell me your destination and I'll help create a realistic travel plan for you.",
                  },
                ]}
                onMessagesChange={(messages) => {
                  saveChatMessages(messages);
                }}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TravelPlan;