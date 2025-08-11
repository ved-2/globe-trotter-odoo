"use client";
import "@copilotkit/react-ui/styles.css";
import "react-day-picker/dist/style.css"; // Styles for the calendar

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { CopilotPopup } from "@copilotkit/react-ui";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { Loader2 } from "lucide-react";
import { addDays, format } from 'date-fns';

// Import the new components
import TripHeader from "@/components/trip/TripHeader";
import ItineraryView from "@/components/trip/ItineraryView";
import SidePanel from "@/components/trip/SidePanel";
import HotelSuggestions from "@/components/trip/HotelSuggestions";
import LoadingSkeleton from "@/components/trip/LoadingSkeleton";
import ErrorDisplay from "@/components/trip/ErrorDisplay";

const TravelPlan = () => {
  const params = useParams();
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const chatKey = `chat_${params?.id || 'default'}`;

  // --- Chat Message Persistence (Unchanged) ---
  const loadChatMessages = useCallback(() => {
    try {
      const saved = sessionStorage.getItem(chatKey);
      if (saved) setChatMessages(JSON.parse(saved));
    } catch (e) { console.warn('Could not load chat messages:', e); }
  }, [chatKey]);

  const saveChatMessages = useCallback((messages) => {
    try {
      sessionStorage.setItem(chatKey, JSON.stringify(messages));
    } finally {
      setChatMessages(messages);
    }
  }, [chatKey]);

  // --- Data Persistence ---
  // A single, robust function to patch any part of the trip plan
  const persistPlan = useCallback(async (updatedFields) => {
    if (!params?.id) return false;
    try {
      const res = await fetch(`/api/trips/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });
      if (!res.ok) throw new Error('Failed to save changes');
      
      setPlan(prev => ({ ...prev, ...updatedFields }));
      return true;
    } catch (e) {
      console.error('Persist failed:', e);
      // Optional: Add user-facing error feedback here
      return false;
    }
  }, [params?.id]);

  // A specific handler for the itinerary which is also used by Drag-and-Drop
  const handleItineraryChange = useCallback(async (newItinerary) => {
    // Renumber days consistently
    const renumberedItinerary = newItinerary.map((day, index) => ({
      ...day,
      dayNumber: index + 1,
    }));
    return await persistPlan({ itinerary: renumberedItinerary });
  }, [persistPlan]);


  // --- CopilotKit Hooks ---
  useCopilotReadable({
    description: "The user's current travel plan, including destination, duration, hotels, and a detailed daily itinerary.",
    value: plan,
  });

  // Simplified Copilot actions using the new `persistPlan` function
  useCopilotAction({
    name: "updateTripDetails",
    description: "Update high-level details of the trip like title, budget, or travelers.",
    parameters: [
      { name: "title", type: "string", description: "The new title for the trip.", optional: true },
      { name: "budget", type: "string", description: "The new budget (e.g., '$2000 Economy').", optional: true },
      { name: "travelers", type: "string", description: "Description of the travel group (e.g., '2 Adults').", optional: true },
    ],
    handler: async (details) => {
      const success = await persistPlan(details);
      return success 
        ? { success: true, message: "Trip details updated successfully." }
        : { success: false, error: "Failed to update trip details." };
    },
  });
   useCopilotAction({
    name: "generateRealisticScheduleForDay",
    description: "Automatically generates an estimated, realistic schedule for all activities on a specific day.",
    parameters: [
      { name: "dayNumber", type: "number", description: "The 1-based number of the day to schedule." }
    ],
    handler: async ({ dayNumber }) => {
      if (!plan?.itinerary) {
        return { success: false, error: "The itinerary is not available." };
      }

      const dayIndex = dayNumber - 1;
      if (dayIndex < 0 || dayIndex >= plan.itinerary.length) {
        return { success: false, error: `Day ${dayNumber} does not exist in the itinerary.` };
      }

      // --- Configuration for the Scheduler ---
      const DAY_START_TIME = "09:00"; // Activities will start at 9:00 AM
      const TRAVEL_BUFFER_MINUTES = 30; // Assume 30 mins travel/break between activities

      /**
       * This helper function estimates an activity's duration based on keywords.
       * You can easily customize this logic!
       * @param {object} activity The activity object.
       * @returns {number} The estimated duration in minutes.
       */
      const estimateActivityDuration = (activity) => {
        const title = (activity.title || activity.placeName || '').toLowerCase();
        if (title.includes('lunch') || title.includes('dinner') || title.includes('breakfast')) return 60; // 1 hour for meals
        if (title.includes('museum') || title.includes('gallery') || title.includes('tour')) return 120; // 2 hours for major tours
        if (title.includes('park') || title.includes('hike') || title.includes('beach')) return 90; // 1.5 hours for outdoor activities
        if (title.includes('shop') || title.includes('market')) return 75; // 1.25 hours for shopping
        
        // Default duration for any other activity
        return 60; 
      };

      const originalDay = plan.itinerary[dayIndex];
      const activitiesToSchedule = originalDay.activities || [];

      if (activitiesToSchedule.length === 0) {
        return { success: true, message: `Day ${dayNumber} has no activities to schedule.` };
      }

      // Initialize the clock for the day
      let currentTime = parse(DAY_START_TIME, 'HH:mm', new Date());
      
      const scheduledActivities = activitiesToSchedule.map(activity => {
        const startTime = currentTime;
        const duration = estimateActivityDuration(activity);
        const endTime = addMinutes(startTime, duration);

        // Create the new time object
        const newTime = {
          startTime: format(startTime, 'HH:mm'),
          endTime: format(endTime, 'HH:mm'),
        };

        // Set the clock for the START of the NEXT activity
        currentTime = addMinutes(endTime, TRAVEL_BUFFER_MINUTES);

        return { ...activity, time: newTime };
      });
      
      // --- Update the plan with the new schedule ---
      const newItinerary = [...plan.itinerary];
      newItinerary[dayIndex] = { ...originalDay, activities: scheduledActivities };

      const success = await persistPlan({ itinerary: newItinerary });
        
        if (success) {
        return { success: true, message: `I've generated a realistic schedule for Day ${dayNumber}. Please review it.` };
      } else {
        return { success: false, error: "I failed to save the new schedule." };
      }
    }
  });

  // Keep other Copilot actions (addDay, removeDay, addActivity, etc.) as they are.
  // They can be simplified to use `persistPlan` as well. Example:
  useCopilotAction({
    name: "removeDayFromItinerary", 
    description: "Remove a day from the travel itinerary",
    parameters: [{ name: "dayNumber", type: "number", description: "1-based day number to remove" }],
    handler: async ({ dayNumber }) => {
        if (!plan?.itinerary) return { success: false, error: "No itinerary." };
      
      const dayIdx = Number(dayNumber) - 1;
      if (dayIdx < 0 || dayIdx >= plan.itinerary.length) {
            return { success: false, error: "Day number out of range." };
        }

        const newItinerary = plan.itinerary.filter((_, idx) => idx !== dayIdx);
        const success = await handleItineraryChange(newItinerary);

      if (success) {
        await persistPlan({ 
                numberOfDays: newItinerary.length,
                duration: `${newItinerary.length} days`
            });
            return { success: true, message: `Removed Day ${dayNumber}.` };
        }
        return { success: false, error: "Failed to remove day." };
    },
  });
  // ... include your other well-defined Copilot actions here ...


  // --- Effects ---
  useEffect(() => {
    loadChatMessages();
  }, [loadChatMessages]);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    const fetchTrip = async () => {
      if (!params?.id) return;
      try {
        setLoading(true);
        const response = await fetch(`/api/trips/${params.id}`);
        if (!response.ok) throw new Error('Trip not found or access denied.');
        const { trip } = await response.json();
        
        // Ensure itinerary exists and is an array for safety
        if (!trip.itinerary) {
          trip.itinerary = [];
        }

        setPlan(trip);
        setError(null);
      } catch (err) {
        console.error("Error fetching trip:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (isSignedIn) {
      fetchTrip();
    }
  }, [params?.id, isSignedIn]);

  // --- Derivations for Calendar ---
  const tripStartDate = plan?.startDate ? new Date(plan.startDate) : new Date();
  const tripDays = Array.from({ length: plan?.itinerary?.length || 0 }, (_, i) => addDays(tripStartDate, i));

  // --- Render Logic ---
  if (!isLoaded || loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }
  
  if (!plan) {
    return <div className="text-center p-8">Could not load travel plan.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TripHeader plan={plan} />

        <main className="mt-8 grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
          {/* Main Content: Itinerary */}
          <div className="lg:col-span-2">
            <ItineraryView 
              itinerary={plan.itinerary}
              onItineraryChange={handleItineraryChange}
            />
                </div>

          {/* Sidebar: Calendar & AI Commands */}
          <div className="mt-8 lg:mt-0">
            <SidePanel
                tripDays={tripDays}
                destination={plan.destination?.name || plan.location}
            />
                    </div>
        </main>
        
        <HotelSuggestions hotels={plan.hotels} />
        
        {plan.disclaimer && (
            <div className="mt-8 p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
                <strong>Disclaimer:</strong> {plan.disclaimer}
                  </div>
                )}
              </div>

              <CopilotPopup
        // Your CopilotPopup props remain the same
        instructions="Your detailed instructions..."
        messages={chatMessages}
        onMessagesChange={saveChatMessages}
                defaultOpen={false}
      />
    </div>
  );
};

export default TravelPlan;