"use client";
import "@copilotkit/react-ui/styles.css";

import React, { useEffect, useState, useCallback } from "react";
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

  // Expose plan to Copilot
  useCopilotReadable({
    description: "Current travel plan fetched from MongoDB (server API)",
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
      router.refresh?.();
      if (typeof window !== 'undefined') window.location.reload();
    } catch (e) {
      console.error('Persist failed:', e);
    }
  }, [params?.id, router]);

  // Copilot actions: move and remove itinerary activities
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
      if (
        srcDayIdx < 0 || dstDayIdx < 0 ||
        srcDayIdx >= plan.itinerary.length || dstDayIdx >= plan.itinerary.length
      ) {
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
        i === srcDayIdx ? { ...d, activities: srcActs } : i === dstDayIdx ? { ...d, activities: dstActs } : d
      ));
      await persistItinerary(newItin);
      return { success: true };
    }
  });

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
      acts.splice(index, 1);
      const newItin = plan.itinerary.map((d, i) => (i === dayIdx ? { ...d, activities: acts } : d));
      await persistItinerary(newItin);
      return { success: true };
    }
  });

  // Legacy window helpers (optional)
  useEffect(() => {
    if (!plan) return;
    window.moveActivity = (dayFrom, indexFrom, dayTo, indexTo) => {
      try {
        const fromIdx = Number(dayFrom) - 1;
        const toIdx = Number(dayTo) - 1;
        const src = plan.itinerary?.[fromIdx];
        const dst = plan.itinerary?.[toIdx];
        if (!src || !dst) throw new Error('Invalid day');
        const activities = [...(src.activities || [])];
        const [moved] = activities.splice(indexFrom, 1);
        const newDstActs = [...(dst.activities || [])];
        newDstActs.splice(indexTo, 0, moved);
        const newItin = plan.itinerary.map((d, i) => (
          i === fromIdx ? { ...d, activities } : i === toIdx ? { ...d, activities: newDstActs } : d
        ));
        persistItinerary(newItin);
      } catch (err) {
        console.error('moveActivity error:', err);
      }
    };

    window.removeActivity = (dayNumber, index) => {
      try {
        const dIdx = Number(dayNumber) - 1;
        const day = plan.itinerary?.[dIdx];
        if (!day) throw new Error('Invalid day');
        const acts = [...(day.activities || [])];
        acts.splice(index, 1);
        const newItin = plan.itinerary.map((d, i) => (i === dIdx ? { ...d, activities: acts } : d));
        persistItinerary(newItin);
      } catch (err) {
        console.error('removeActivity error:', err);
      }
    };

    return () => {
      delete window.moveActivity;
      delete window.removeActivity;
    };
  }, [plan, persistItinerary]);

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
                      🧳 {plan.title || `${plan.destination?.name || 'Your'} Travel Plan`}
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
                      <p className="font-semibold text-gray-900">{plan.destination?.name || plan.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="font-semibold text-gray-900">{plan.numberOfDays || plan.duration} days</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Users className="h-6 w-6 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-500">Travel Group</p>
                      <p className="font-semibold text-gray-900">{plan.travelGroup || plan.travelers}</p>
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
                        {hotel.imageUrl && (
                          <img
                            src={hotel.imageUrl}
                            alt={hotel.name}
                            className="w-full h-48 object-cover rounded-lg mb-4"
                          />
                        )}
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{hotel.name}</h3>
                        <p className="text-gray-600 mb-2">{hotel.address}</p>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-lg font-semibold text-green-600">
                            ${hotel.price?.amount || 'N/A'}
                          </span>
                          <span className="flex items-center text-yellow-500">
                            {'⭐'.repeat(hotel.rating || 0)}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm">{hotel.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {plan.itinerary && plan.itinerary.length > 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    📅 Your Itinerary
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
                                <span>⏰ {activity.time?.startTime || 'TBD'}</span>
                                {activity.cost?.amount > 0 && (
                                  <span>💰 ${activity.cost.amount}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                  <div className="text-gray-400 text-6xl mb-4">📋</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Itinerary Available</h3>
                  <p className="text-gray-600">The AI didn't generate a detailed itinerary for this trip.</p>
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
                <p className="mb-2 font-semibold">Copilot quick actions:</p>
                <ul className="list-disc ml-5">
                  <li>“Move activity 1 from Day 1 to Day 3 at position 0”</li>
                  <li>“Remove activity 2 from Day 4”</li>
                </ul>
              </div>

              <CopilotPopup
                defaultOpen={true}
                instructions={`You are a strict trip-planning assistant.
Use the available actions to modify the itinerary:
- moveItineraryActivity(fromDay, fromIndex, toDay, toIndex)
- removeItineraryActivity(day, index)
After changes, confirm succinctly.`}
                messages={[
                  {
                    id: "1",
                    role: "assistant",
                    content: plan
                      ? `I can update your itinerary. Try: Move activity 1 from Day 1 to Day 2 at position 0.`
                      : "Hi! Tell me your destination and I’ll help plan a realistic trip for you.",
                  },
                ]}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TravelPlan;
