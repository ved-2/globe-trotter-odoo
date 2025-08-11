"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, MapPin, Calendar, Users, DollarSign } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const TravelPlan = () => {
  const params = useParams();
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  // Show loading while checking authentication
  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

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
      } catch (err) {
        console.error("Error fetching trip:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchTrip();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading your travel plan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🧳</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Travel Plan Found</h2>
          <p className="text-gray-600">The trip you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
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

          {/* Trip Details Grid */}
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

        {/* Hotels Section */}
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

        {/* Itinerary Section */}
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

        {/* Disclaimer */}
        {plan.disclaimer && (
          <div className="mt-8 p-6 bg-yellow-50 rounded-xl border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Disclaimer:</strong> {plan.disclaimer}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TravelPlan;
