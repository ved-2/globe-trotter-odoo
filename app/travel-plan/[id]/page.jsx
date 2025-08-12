"use client";
import "@copilotkit/react-ui/styles.css";
import "react-day-picker/dist/style.css";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser, useAuth } from "@clerk/nextjs";
import { CopilotPopup } from "@copilotkit/react-ui";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { addDays, format } from 'date-fns';

// Import your components
import TripHeader from "@/components/trip/TripHeader";
import ItineraryView from "@/components/trip/ItineraryView";
import SidePanel from "@/components/trip/SidePanel";
import HotelSuggestions from "@/components/trip/HotelSuggestions";
import LoadingSkeleton from "@/components/trip/LoadingSkeleton";
import ErrorDisplay from "@/components/trip/ErrorDisplay";
import { generateTravelPDF } from "@/lib/generateTravelPdf";

const TravelPlan = () => {
  const params = useParams();
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const chatKey = `chat_${params?.id || 'default'}`;

  // Make plan data readable to CopilotKit
  useCopilotReadable({
    description: "Current travel plan data including itinerary, hotels, and trip details",
    value: plan
  });

  // Enhanced Gemini-powered activity search and addition
  const searchAndAddActivity = async (activityName, dayNumber, destination) => {
    try {
      const response = await fetch('/api/gemini/activity-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getToken()}`
        },
        body: JSON.stringify({
          activityName,
          destination: destination || plan?.destination?.name || plan?.location,
          existingPlan: plan
        })
      });

      if (!response.ok) throw new Error('Failed to fetch activity details');
      
      const activityDetails = await response.json();
      
      // Add the enhanced activity to the specified day
      const updatedItinerary = [...(plan.itinerary || [])];
      const dayIndex = dayNumber - 1;
      
      if (dayIndex >= 0 && dayIndex < updatedItinerary.length) {
        if (!updatedItinerary[dayIndex].activities) {
          updatedItinerary[dayIndex].activities = [];
        }
        
        const newActivity = {
          id: Date.now().toString(),
          placeName: activityDetails.name,
          placeDetails: activityDetails.description,
          timeTravelEachLocation: activityDetails.duration || "2-3 hours",
          rating: activityDetails.rating || "4.5",
          placeImageUrl: activityDetails.imageUrl || "",
          location: activityDetails.location || "",
          cost: activityDetails.cost || "",
          tips: activityDetails.tips || "",
          completed: false
        };
        
        updatedItinerary[dayIndex].activities.push(newActivity);
        
        const success = await persistPlan({ itinerary: updatedItinerary });
        return success ? activityDetails : null;
      }
      
      return null;
    } catch (error) {
      console.error('Error searching and adding activity:', error);
      return null;
    }
  };

  // CopilotKit Actions for database operations
  useCopilotAction({
    name: "addActivityWithSearch",
    description: "Search for and add a new activity to a specific day using AI to find detailed information",
    parameters: [
      {
        name: "dayNumber",
        type: "number",
        description: "Day number (1-based) to add the activity to",
        required: true
      },
      {
        name: "activityName",
        type: "string", 
        description: "Name or description of the activity to search for (e.g., 'local market', 'traditional restaurant', 'historical monument')",
        required: true
      }
    ],
    handler: async ({ dayNumber, activityName }) => {
      try {
        const activityDetails = await searchAndAddActivity(activityName, dayNumber, plan?.destination?.name || plan?.location);
        
        if (activityDetails) {
          return `✅ Successfully added "${activityDetails.name}" to Day ${dayNumber}!\n\n📍 ${activityDetails.description}\n⭐ Rating: ${activityDetails.rating}\n⏰ Duration: ${activityDetails.duration}\n${activityDetails.tips ? `💡 Tip: ${activityDetails.tips}` : ''}`;
        } else {
          throw new Error("Could not find or add the activity");
        }
      } catch (error) {
        return `❌ Error adding activity: ${error.message}`;
      }
    }
  });

  useCopilotAction({
    name: "addActivityToDay",
    description: "Add a new activity to a specific day in the itinerary",
    parameters: [
      {
        name: "dayNumber",
        type: "number",
        description: "Day number (1-based) to add the activity to",
        required: true
      },
      {
        name: "activity",
        type: "object",
        description: "Activity object with title, time, description, location",
        properties: {
          title: { type: "string", description: "Activity title" },
          time: { type: "string", description: "Time in HH:MM format" },
          description: { type: "string", description: "Activity description" },
          location: { type: "string", description: "Activity location" },
          duration: { type: "string", description: "Duration (e.g., '2 hours')" },
          cost: { type: "string", description: "Estimated cost" }
        },
        required: true
      }
    ],
    handler: async ({ dayNumber, activity }) => {
      try {
        const updatedItinerary = [...(plan.itinerary || [])];
        const dayIndex = dayNumber - 1;
        
        if (dayIndex >= 0 && dayIndex < updatedItinerary.length) {
          if (!updatedItinerary[dayIndex].activities) {
            updatedItinerary[dayIndex].activities = [];
          }
          updatedItinerary[dayIndex].activities.push({
            id: Date.now().toString(),
            ...activity,
            completed: false
          });
          
          const success = await persistPlan({ itinerary: updatedItinerary });
          if (success) {
            return `✅ Added "${activity.title}" to Day ${dayNumber}`;
          } else {
            throw new Error("Failed to save changes");
          }
        } else {
          throw new Error(`Invalid day number: ${dayNumber}`);
        }
      } catch (error) {
        return `❌ Error adding activity: ${error.message}`;
      }
    }
  });

  useCopilotAction({
    name: "removeActivity",
    description: "Remove an activity from the itinerary",
    parameters: [
      {
        name: "dayNumber",
        type: "number",
        description: "Day number containing the activity",
        required: true
      },
      {
        name: "activityTitle",
        type: "string",
        description: "Title of the activity to remove",
        required: true
      }
    ],
    handler: async ({ dayNumber, activityTitle }) => {
      try {
        const updatedItinerary = [...(plan.itinerary || [])];
        const dayIndex = dayNumber - 1;
        
        if (dayIndex >= 0 && dayIndex < updatedItinerary.length) {
          const activities = updatedItinerary[dayIndex].activities || [];
          const filteredActivities = activities.filter(
            activity => activity.title !== activityTitle && !activity.placeName?.toLowerCase().includes(activityTitle.toLowerCase())
          );
          
          if (filteredActivities.length === activities.length) {
            return `❌ Activity "${activityTitle}" not found on Day ${dayNumber}`;
          }
          
          updatedItinerary[dayIndex].activities = filteredActivities;
          
          const success = await persistPlan({ itinerary: updatedItinerary });
          if (success) {
            return `✅ Removed "${activityTitle}" from Day ${dayNumber}`;
          } else {
            throw new Error("Failed to save changes");
          }
        } else {
          throw new Error(`Invalid day number: ${dayNumber}`);
        }
      } catch (error) {
        return `❌ Error removing activity: ${error.message}`;
      }
    }
  });

  useCopilotAction({
    name: "addNewDayWithActivities",
    description: "Add a new day to the itinerary with AI-generated activities based on the destination",
    parameters: [
      {
        name: "dayTheme",
        type: "string",
        description: "Theme or focus for the new day (e.g., 'cultural exploration', 'adventure activities', 'relaxation day')",
        required: false
      },
      {
        name: "activityCount",
        type: "number",
        description: "Number of activities to generate (default: 3-4)",
        required: false
      }
    ],
    handler: async ({ dayTheme, activityCount = 4 }) => {
      try {
        const response = await fetch('/api/gemini/generate-day', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await getToken()}`
          },
          body: JSON.stringify({
            destination: plan?.destination?.name || plan?.location,
            dayTheme,
            activityCount,
            existingPlan: plan,
            dayNumber: (plan?.itinerary?.length || 0) + 1
          })
        });

        if (!response.ok) throw new Error('Failed to generate new day');
        
        const newDayData = await response.json();
        
        const updatedItinerary = [...(plan.itinerary || [])];
        const newDayNumber = updatedItinerary.length + 1;
        
        const newDay = {
          dayNumber: newDayNumber,
          title: newDayData.title || `Day ${newDayNumber}`,
          theme: dayTheme || newDayData.theme,
          date: format(addDays(new Date(plan.startDate || new Date()), newDayNumber - 1), 'yyyy-MM-dd'),
          activities: newDayData.activities.map(activity => ({
            id: Date.now().toString() + Math.random(),
            placeName: activity.placeName,
            placeDetails: activity.placeDetails,
            timeTravelEachLocation: activity.timeTravelEachLocation,
            rating: activity.rating,
            placeImageUrl: activity.placeImageUrl || "",
            completed: false
          }))
        };
        
        updatedItinerary.push(newDay);
        
        const success = await persistPlan({ itinerary: updatedItinerary });
        if (success) {
          return `✅ Added new Day ${newDayNumber}: ${newDay.title}\n\n🎯 Theme: ${newDay.theme}\n📅 ${newDayData.activities.length} activities planned\n\nActivities added:\n${newDayData.activities.map(a => `• ${a.placeName}`).join('\n')}`;
        } else {
          throw new Error("Failed to save new day");
        }
      } catch (error) {
        return `❌ Error adding new day: ${error.message}`;
      }
    }
  });

  useCopilotAction({
    name: "addNewDay",
    description: "Add a new day to the itinerary",
    parameters: [
      {
        name: "dayTitle",
        type: "string",
        description: "Title for the new day",
        required: false
      },
      {
        name: "activities",
        type: "array",
        description: "Array of activities for the new day",
        required: false
      }
    ],
    handler: async ({ dayTitle, activities = [] }) => {
      try {
        const updatedItinerary = [...(plan.itinerary || [])];
        const newDayNumber = updatedItinerary.length + 1;
        
        const newDay = {
          dayNumber: newDayNumber,
          title: dayTitle || `Day ${newDayNumber}`,
          date: format(addDays(new Date(plan.startDate || new Date()), newDayNumber - 1), 'yyyy-MM-dd'),
          activities: activities.map(activity => ({
            id: Date.now().toString() + Math.random(),
            ...activity,
            completed: false
          }))
        };
        
        updatedItinerary.push(newDay);
        
        const success = await persistPlan({ itinerary: updatedItinerary });
        if (success) {
          return `✅ Added new Day ${newDayNumber}: ${newDay.title}`;
        } else {
          throw new Error("Failed to save changes");
        }
      } catch (error) {
        return `❌ Error adding new day: ${error.message}`;
      }
    }
  });

  useCopilotAction({
    name: "updateTripDetails",
    description: "Update trip details like title, destination, or budget",
    parameters: [
      {
        name: "updates",
        type: "object",
        description: "Object containing fields to update",
        properties: {
          title: { type: "string", description: "Trip title" },
          destination: { type: "string", description: "Destination name" },
          budget: { type: "number", description: "Trip budget" },
          notes: { type: "string", description: "Trip notes" }
        },
        required: true
      }
    ],
    handler: async ({ updates }) => {
      try {
        const success = await persistPlan(updates);
        if (success) {
          const updatedFields = Object.keys(updates).join(", ");
          return `✅ Updated trip details: ${updatedFields}`;
        } else {
          throw new Error("Failed to save changes");
        }
      } catch (error) {
        return `❌ Error updating trip: ${error.message}`;
      }
    }
  });

  useCopilotAction({
    name: "suggestHotels",
    description: "Get AI-powered hotel suggestions for the destination",
    parameters: [
      {
        name: "priceRange",
        type: "string",
        description: "Preferred price range (budget, mid-range, luxury)",
        required: false
      },
      {
        name: "hotelCount",
        type: "number",
        description: "Number of hotels to suggest (default: 5)",
        required: false
      }
    ],
    handler: async ({ priceRange, hotelCount = 5 }) => {
      try {
        const response = await fetch('/api/gemini/hotel-suggestions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await getToken()}`
          },
          body: JSON.stringify({
            destination: plan?.destination?.name || plan?.location,
            priceRange,
            hotelCount,
            budget: plan?.budget,
            existingPlan: plan
          })
        });

        if (!response.ok) throw new Error('Failed to get hotel suggestions');
        
        const hotelData = await response.json();
        
        const success = await persistPlan({ hotels: hotelData.hotels });
        if (success) {
          return `✅ Added ${hotelData.hotels.length} hotel suggestions!\n\n🏨 Hotels range from ${priceRange || 'various price ranges'}\n\nTop recommendations:\n${hotelData.hotels.slice(0, 3).map(h => `• ${h.hotelName} - ${h.price} (⭐${h.rating})`).join('\n')}`;
        } else {
          throw new Error("Failed to save hotel suggestions");
        }
      } catch (error) {
        return `❌ Error getting hotels: ${error.message}`;
      }
    }
  });

  useCopilotAction({
    name: "generatePDF",
    description: "Generate and download a PDF of the travel plan",
    parameters: [],
    handler: async () => {
      try {
        await generatePDF();
        return "✅ PDF generated and downloaded successfully!";
      } catch (error) {
        return `❌ Error generating PDF: ${error.message}`;
      }
    }
  });

  const generatePDF = () => {
    if (!plan) {
      alert('No travel plan data available');
      return;
    }
    setIsGeneratingPDF(true);
    try {
      generateTravelPDF(plan);
    } catch (e) {
      alert('Error generating PDF');
      console.error(e);
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  
  const persistPlan = useCallback(async (updatedFields) => {
    if (!params?.id) return false;
    try {
      const token = await getToken();
      const res = await fetch(`/api/trips/${params.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedFields),
      });
      if (!res.ok) throw new Error('Failed to save changes');
      setPlan(prev => ({ ...prev, ...updatedFields }));
      return true;
    } catch (e) {
      console.error('Persist failed:', e);
      return false;
    }
  }, [params?.id, getToken]);

  const handleItineraryChange = useCallback(async (newItinerary) => {
    const renumberedItinerary = newItinerary.map((day, index) => ({
      ...day,
      dayNumber: index + 1,
    }));
    return await persistPlan({ itinerary: renumberedItinerary });
  }, [persistPlan]);

  const saveChatMessages = useCallback((messages) => {
    try {
      sessionStorage.setItem(chatKey, JSON.stringify(messages));
    } finally {
      setChatMessages(messages);
    }
  }, [chatKey]);

  // Redirect to sign-in if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  // Fetch trip data with authentication
  useEffect(() => {
    const fetchTrip = async () => {
      if (!params?.id || !isSignedIn) return;
      setLoading(true);
      try {
        const token = await getToken();
        const res = await fetch(`/api/trips/${params.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Trip not found or access denied.");
        const { trip } = await res.json();
        trip.itinerary = trip.itinerary || [];
        setPlan(trip);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [params?.id, isSignedIn, getToken]);

  // Load chat messages from sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem(chatKey);
        if (saved) {
          setChatMessages(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Failed to load chat messages:', e);
      }
    }
  }, [chatKey]);

  const tripStartDate = plan?.startDate ? new Date(plan.startDate) : new Date();
  const tripDays = Array.from({ length: plan?.itinerary?.length || 0 }, (_, i) => addDays(tripStartDate, i));

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900">
        <ErrorDisplay error={error} />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center p-8 bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-600/50">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-slate-200 mb-2">Could not load travel plan</h2>
          <p className="text-slate-400">Please try refreshing the page or go back to your trips.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 relative">
      {/* Top spacing with background only, no other color showing above */}
      <div className="w-full h-10 bg-slate-900" />
      {/* Subtle background gradient */}
      <div className="absolute inset-0 mt-15 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Trip Header */}
        <div className="mb-8">
          <TripHeader 
            plan={plan} 
            onGeneratePDF={generatePDF} 
            isGenerating={isGeneratingPDF}
          />
        </div>
        

        <main className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Itinerary Section - Takes up more space */}
          <div className="lg:col-span-3">
            <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-600/40 rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div>

                </div>
                
                <div>
              
                </div>
                
              </div>
              <ItineraryView 
                itinerary={plan.itinerary}
                onItineraryChange={handleItineraryChange}
              />
            </div>
          </div>

          {/* Side Panel - Compact */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-600/40 rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-">
                <span className="text-xl">🗓️</span>
                <h2 className="text-lg font-semibold text-slate-100">Overview</h2>
              </div>
              <SidePanel
                tripDays={tripDays}
                destination={plan.destination?.name || plan.location}
              />
            </div>
          </div>
        </main>

        {/* Hotels Section - Only show if hotels exist */}
        {plan.hotels && plan.hotels.length > 0 && (
          <div className="mt-8">
            <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-600/40 rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">🏨</span>
                <h2 className="text-xl font-semibold text-slate-100">Recommended Hotels</h2>
                <span className="bg-green-500/20 text-green-200 px-3 py-1 rounded-full text-sm font-medium">
                  {plan.hotels.length} options
                </span>
              </div>
              <HotelSuggestions hotels={plan.hotels} />
              <button
  onClick={() => window.print()}
  className="px-4 py-2 bg-amber-600 text-black rounded hover:bg-amber-700 transition mt-10"
>
  Print Page
</button>
            </div>
          
          </div>
        )}

        {/* AI Assistant Info */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-sm text-blue-200">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
            AI Assistant ready to help with your trip planning
          </div>
        </div>
      </div>

      {/* Enhanced CopilotPopup */}
      <CopilotPopup
        instructions={`You are an advanced AI travel planning assistant powered by Gemini AI. You have access to intelligent activity search and trip planning capabilities.

**KEY CAPABILITIES:**

1. **Smart Activity Search & Addition** - Use "addActivityWithSearch" action:
   - When users say "add local market to day 1" or similar, I'll search for detailed information
   - I'll find ratings, descriptions, timings, costs, and local tips automatically
   - No need for users to provide details - I'll research everything

2. **Basic Activity Addition** - Use "addActivityToDay" action:
   - Add simple activities with manual details like time, location, description

3. **Intelligent Day Planning** - Use "addNewDayWithActivities" action:
   - I can generate complete new days with themed activities
   - Suggest 3-4 activities per day based on destination and preferences

4. **Simple Day Addition** - Use "addNewDay" action:
   - Add empty days or days with basic activities

5. **Activity Management** - Use "removeActivity" action:
   - Remove unwanted activities from any day

6. **Trip Updates** - Use "updateTripDetails" action:
   - Modify trip title, destination, budget, or notes

7. **Hotel Recommendations** - Use "suggestHotels" action:
   - AI-powered hotel suggestions based on budget and preferences

8. **PDF Generation** - Use "generatePDF" action:
   - Create professional travel plan documents

**CURRENT TRIP:**
- Destination: ${plan.destination?.name || plan.location || 'Unknown'}
- Duration: ${plan.itinerary?.length || 0} days
- Budget: ${plan.budget || 'Not specified'}

**HOW TO USE:**
- Say "add temple visit to day 2" for AI-powered activity search
- Ask "create a cultural day" to generate a full themed day
- Request "suggest luxury hotels" for hotel recommendations
- Say "remove museum from day 1" to edit your itinerary
- Ask "generate PDF" to create a downloadable document

I can handle natural language requests and provide both simple and AI-enhanced planning assistance!`}
        messages={chatMessages}
        onMessagesChange={saveChatMessages}
        defaultOpen={false}
        labels={{
          title: "🤖 AI Travel Assistant",
          initial: `Hi! I'm your AI-powered travel planning assistant with enhanced capabilities for ${plan.destination?.name || plan.location || 'your destination'}.

✨ **What I can do:**
• 🔍 **Smart Activity Search**: "add temple visit to day 2" - I'll find the best options with full details
• 📝 **Manual Activity Addition**: Add activities with your own details like time and location  
• 📅 **Generate Complete Days**: "create a cultural day" - I'll plan 3-4 perfect themed activities
• ✏️ **Edit Your Itinerary**: Add, remove, or modify any part of your ${plan.itinerary?.length || 0}-day trip
• 🏨 **Hotel Recommendations**: Get AI-curated suggestions based on your budget
• 📄 **Create PDF**: Generate professional travel documents

**Quick Examples:**
- "Add a cooking class to day 2" (AI search)
- "Create a nature day with hiking" (themed day)
- "Suggest mid-range hotels" (hotel search)
- "Remove the museum from day 1" (edit itinerary)
- "Generate a PDF of my trip" (export)

What would you like to add to your ${plan.destination?.name || 'trip'} adventure?`,
        }}
        style={{
          '--copilot-kit-primary-color': '#3b82f6',
          '--copilot-kit-secondary-color': '#1e293b',
          '--copilot-kit-muted-color': '#64748b',
          '--copilot-kit-separator-color': '#334155',
          '--copilot-kit-background-color': '#0f172a',
          '--copilot-kit-contrast-color': '#f1f5f9',
        }}
      />

      {/* Enhanced CSS for better theming */}
      <style jsx global>{`
        .copilot-popup {
          --copilot-kit-primary-color: #3b82f6 !important;
          --copilot-kit-secondary-color: #1e293b !important;
          --copilot-kit-muted-color: #64748b !important;
          --copilot-kit-separator-color: #334155 !important;
          --copilot-kit-background-color: #0f172a !important;
          --copilot-kit-contrast-color: #f1f5f9 !important;
        }
        
        [data-copilot-kit] {
          background-color: #0f172a !important;
          border-color: #334155 !important;
          color: #f1f5f9 !important;
        }
        
        [data-copilot-kit] input,
        [data-copilot-kit] textarea {
          background-color: #1e293b !important;
          border-color: #475569 !important;
          color: #f1f5f9 !important;
        }
        
        [data-copilot-kit] button {
          background-color: #3b82f6 !important;
          color: #ffffff !important;
          border: none !important;
        }
        
        [data-copilot-kit] button:hover {
          background-color: #2563eb !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        [data-copilot-kit] .copilot-message {
          background-color: #1e293b !important;
          border: 1px solid #334155 !important;
        }

        [data-copilot-kit] .copilot-message.copilot-message-assistant {
          background-color: #0f172a !important;
          border-color: #3b82f6 !important;
        }
      `}</style>
    </div>
  );
};

export default TravelPlan;