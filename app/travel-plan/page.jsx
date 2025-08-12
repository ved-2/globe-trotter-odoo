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

  // Enhanced CopilotKit Actions
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
        name: "activityName",
        type: "string",
        description: "Name of the activity to remove",
        required: true
      }
    ],
    handler: async ({ dayNumber, activityName }) => {
      try {
        const updatedItinerary = [...(plan.itinerary || [])];
        const dayIndex = dayNumber - 1;
        
        if (dayIndex >= 0 && dayIndex < updatedItinerary.length) {
          const activities = updatedItinerary[dayIndex].activities || [];
          const filteredActivities = activities.filter(
            activity => !activity.placeName.toLowerCase().includes(activityName.toLowerCase())
          );
          
          if (filteredActivities.length === activities.length) {
            return `❌ Activity "${activityName}" not found on Day ${dayNumber}`;
          }
          
          updatedItinerary[dayIndex].activities = filteredActivities;
          
          const success = await persistPlan({ itinerary: updatedItinerary });
          if (success) {
            return `✅ Removed "${activityName}" from Day ${dayNumber}`;
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <ErrorDisplay error={error} />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center p-8 bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-600/50">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-white mb-2">Could not load travel plan</h2>
          <p className="text-slate-400">Please try refreshing the page or go back to your trips.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative">
      {/* Subtle background effects */}
      <div className="absolute inset-0 bg-gradient-radial from-blue-500/5 via-transparent to-slate-900/50" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Trip Header with PDF Button */}
        <div className="mb-8">
          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-600/40 rounded-xl p-6 shadow-2xl">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex-1">
                <TripHeader 
                  plan={plan} 
                  onGeneratePDF={generatePDF} 
                  isGenerating={isGeneratingPDF}
                />
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={generatePDF}
                  disabled={isGeneratingPDF || !plan}
                  className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 
                             hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed
                             text-white font-semibold rounded-xl shadow-lg hover:shadow-xl 
                             transform hover:-translate-y-0.5 transition-all duration-200 
                             border border-blue-500/30"
                >
                  {isGeneratingPDF ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Creating PDF...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <main className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Itinerary Section */}
          <div className="lg:col-span-3">
            <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-600/40 rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">📅</span>
                <h2 className="text-xl font-semibold text-white">Your Itinerary</h2>
                <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                  {plan.itinerary?.length || 0} days
                </span>
              </div>
              <ItineraryView 
                itinerary={plan.itinerary}
                onItineraryChange={handleItineraryChange}
              />
            </div>
          </div>

          {/* Side Panel */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-600/40 rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xl">🗓️</span>
                <h2 className="text-lg font-semibold text-white">Overview</h2>
              </div>
              <SidePanel
                tripDays={tripDays}
                destination={plan.destination?.name || plan.location}
              />
            </div>
          </div>
        </main>

        {/* Hotels Section */}
        {plan.hotels && plan.hotels.length > 0 && (
          <div className="mt-8">
            <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-600/40 rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">🏨</span>
                <h2 className="text-xl font-semibold text-white">Recommended Hotels</h2>
                <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                  {plan.hotels.length} options
                </span>
              </div>
              <HotelSuggestions hotels={plan.hotels} />
            </div>
          </div>
        )}

        {/* AI Assistant Status */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-400/20 rounded-full text-sm text-blue-300">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
            AI Assistant ready - Enhanced with Gemini-powered activity search
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

2. **Intelligent Day Planning** - Use "addNewDayWithActivities" action:
   - I can generate complete new days with themed activities
   - Suggest 3-4 activities per day based on destination and preferences
   - Create realistic itineraries with proper timing and logistics

3. **Hotel Recommendations** - Use "suggestHotels" action:
   - AI-powered hotel suggestions based on budget and preferences
   - Real recommendations with pricing, ratings, and amenities

4. **PDF Generation** - Use "generatePDF" action:
   - Create professional travel plan documents
   - Perfect for sharing with family or keeping offline

**CURRENT TRIP:**
- Destination: ${plan.destination?.name || plan.location || 'Unknown'}
- Duration: ${plan.itinerary?.length || 0} days
- Budget: ${plan.budget || 'Not specified'}

**HOW TO USE:**
- Just say "add temple visit to day 2" and I'll find the best temples with details
- Ask "create a cultural day" and I'll generate a full day of cultural activities
- Say "suggest luxury hotels" and I'll find the best options in your price range
- Request "remove museum from day 1" to edit your itinerary
- Ask "generate PDF" to create a downloadable document

I can handle natural language requests and automatically fill in all the details using AI research. What would you like to add to your trip?`}

        messages={chatMessages}
        onMessagesChange={saveChatMessages}
        defaultOpen={false}
        
        labels={{
          title: "🤖 AI Travel Assistant",
          initial: `Hi! I'm your AI-powered travel assistant with access to real-time information about ${plan.destination?.name || plan.location || 'your destination'}. 

✨ **What I can do:**
• 🔍 **Smart Activity Search**: Just say "add local market to day 1" and I'll find the best options with full details
• 📅 **Generate Complete Days**: Ask for "a cultural day" or "adventure day" and I'll plan 3-4 perfect activities  
• 🏨 **Hotel Recommendations**: Get AI-curated hotel suggestions based on your budget
• ✏️ **Edit Your Itinerary**: Add, remove, or modify any part of your ${plan.itinerary?.length || 0}-day trip
• 📄 **Create PDF**: Generate professional travel documents for sharing

**Quick Examples:**
- "Add a cooking class to day 2"
- "Create a nature day with hiking"
- "Suggest mid-range hotels"
- "Remove the museum from day 1"
- "Generate a PDF of my trip"

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