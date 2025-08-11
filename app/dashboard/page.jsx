"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import "@copilotkit/react-ui/styles.css";
import { 
  Loader2, 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  Plus, 
  Search, 
  Heart,
  Globe,
  TrendingUp,
  Clock,
  Star,
  Edit,
  Trash2,
  Eye
} from "lucide-react";
import { CopilotPopup } from "@copilotkit/react-ui";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import Link from "next/link";
import Heatmap from "@/components/Heatmap";

// Helper for safe date formatting to avoid hydration mismatch
function formatDateYYYYMMDD(dateString) {
  // Only format if dateString is valid
  if (!dateString) return "";
  // Use substring to avoid locale differences
  return dateString.substring(0, 10);
}

const Dashboard = () => {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [bucketList, setBucketList] = useState([]);
  const [showAddTrip, setShowAddTrip] = useState(false);
  const [showAddBucket, setShowAddBucket] = useState(false);
  const [stats, setStats] = useState({
    totalTrips: 0,
    completedTrips: 0,
    upcomingTrips: 0,
    totalDestinations: 0,
    bucketListCount: 0
  });

  // Expose data to Copilot
  useCopilotReadable({
    description: "User's travel dashboard with trips, bucket list, and statistics",
    value: { trips, bucketList, stats }
  });

  // Fetch user's trips
  const fetchTrips = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/trips');
      if (response.ok) {
        const data = await response.json();
        setTrips(data.trips || []);
        updateStats(data.trips || []);
      } else {
        console.error('Failed to fetch trips:', response.status);
        setTrips([]);
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch bucket list from API
  const fetchBucketList = useCallback(async () => {
    try {
      const response = await fetch('/api/bucket-list');
      if (response.ok) {
        const data = await response.json();
        setBucketList(data.bucketList || []);
      } else {
        console.error('Failed to fetch bucket list:', response.status);
        setBucketList([]);
      }
    } catch (error) {
      console.error('Error fetching bucket list:', error);
      setBucketList([]);
    }
  }, []);

  // Update statistics
  const updateStats = useCallback((tripsData) => {
    const completed = tripsData.filter(trip => trip.status === 'completed').length;
    const upcoming = tripsData.filter(trip => trip.status === 'planning' || trip.status === 'booked').length;
    const destinations = new Set(tripsData.map(trip => trip.destination?.name || trip.location)).size;
    
    setStats(prev => ({
      ...prev,
      totalTrips: tripsData.length,
      completedTrips: completed,
      upcomingTrips: upcoming,
      totalDestinations: destinations
    }));
  }, []);

  // Add new trip
  const addNewTrip = useCallback(async (tripData) => {
    try {
      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tripData)
      });
      
      if (response.ok) {
        const newTrip = await response.json();
        setTrips(prev => [...prev, newTrip.trip]);
        setShowAddTrip(false);
        // Update stats with new trip
        updateStats([...trips, newTrip.trip]);
      } else {
        console.error('Failed to create trip:', response.status);
      }
    } catch (error) {
      console.error('Error adding trip:', error);
    }
  }, [trips, updateStats]);
  

  // Add to bucket list
  const addToBucketList = useCallback(async (destination, priority = 'medium', notes = '') => {
    try {
      const response = await fetch('/api/bucket-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination, priority, notes })
      });
      
      if (response.ok) {
        const data = await response.json();
        setBucketList(prev => [...prev, data.bucketItem]);
        updateStats(trips);
        return { success: true, data: data.bucketItem };
      } else {
        const errorData = await response.json();
        console.error('Failed to add to bucket list:', errorData);
        return { success: false, error: errorData.error || 'Failed to add to bucket list' };
      }
    } catch (error) {
      console.error('Error adding to bucket list:', error);
      return { success: false, error: 'Network error' };
    }
  }, [trips, updateStats]);
  const visitedLocations = trips
  .map(trip => {
    const lat = trip.destination?.lat;
    const lng = trip.destination?.lng;
    if (lat && lng) {
      return [lat, lng, 1]; 
    }
    return null;
  })
  .filter(Boolean);
  // Remove from bucket list
  const removeFromBucketList = useCallback(async (id) => {
    try {
      const response = await fetch(`/api/bucket-list?id=${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setBucketList(prev => prev.filter(item => (item._id !== id && item.id !== id)));
        updateStats(trips);
      }
    } catch (error) {
      console.error('Error removing from bucket list:', error);
    }
  }, [trips, updateStats]);

  // Filter trips
  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.destination?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || trip.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  // Load data on component mount
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchTrips();
      fetchBucketList();
    }
  }, [isLoaded, isSignedIn, fetchTrips, fetchBucketList]);

  // Update bucket list count when bucket list changes
  useEffect(() => {
    setStats(prev => ({
      ...prev,
      bucketListCount: bucketList.length
    }));
  }, [bucketList.length]);

  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  // Copilot action: Add destination to bucket list
  useCopilotAction({
    name: "addToBucketList",
    description: "Add a new destination to the user's bucket list",
    parameters: [
      { name: "destination", type: "string", description: "Destination name to add" },
      { name: "priority", type: "string", description: "Priority level (low, medium, high)" },
      { name: "notes", type: "string", description: "Optional notes about the destination" }
    ],
    handler: async ({ destination, priority = 'medium', notes = '' }) => {
      if (!destination) {
        return { success: false, error: "Destination is required" };
      }
      
      await addToBucketList(destination, priority, notes);
      
      return { 
        success: true, 
        message: `Added ${destination} to your bucket list with ${priority} priority` 
      };
    }
  });

  // Copilot action: Create new trip
  useCopilotAction({
    name: "createNewTrip",
    description: "Create a new travel plan",
    parameters: [
      { name: "title", type: "string", description: "Trip title" },
      { name: "destination", type: "string", description: "Destination name" },
      { name: "startDate", type: "string", description: "Start date (YYYY-MM-DD)" },
      { name: "endDate", type: "string", description: "End date (YYYY-MM-DD)" },
      { name: "budget", type: "string", description: "Budget amount" }
    ],
    handler: async ({ title, destination, startDate, endDate, budget }) => {
      if (!title || !destination) {
        return { success: false, error: "Title and destination are required" };
      }

      const tripData = {
        title,
        destination: { name: destination },
        startDate,
        endDate,
        budget,
        status: 'planning',
        travelGroup: 'Solo',
        numberOfDays: startDate && endDate ? 
          Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) : 1
      };
      
      await addNewTrip(tripData);
      return { success: true, message: `Created new trip: ${title} to ${destination}` };
    }
  });

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
          <p className="text-amber-100 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Remove all use of Date.toLocaleDateString() in render to avoid hydration mismatch
  // Instead, use a safe date formatter (formatDateYYYYMMDD)

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 mt-25">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent mb-3">
            ✈️ Welcome back, {user?.firstName || 'Traveler'}!
          </h1>
          <p className="text-amber-100/80 text-xl font-light">
            Curate your journeys, discover new horizons, and craft unforgettable adventures
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-amber-500/20 hover:border-amber-400/40 transition-all duration-300 backdrop-blur-sm">
            <div className="flex items-center">
              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <Globe className="h-6 w-6 text-amber-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-amber-200/70">Total Journeys</p>
                <p className="text-3xl font-bold text-amber-100">{stats.totalTrips}</p>
              </div>
            </div>
          </div>
          

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-emerald-500/20 hover:border-emerald-400/40 transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <Calendar className="h-6 w-6 text-emerald-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-emerald-200/70">Completed</p>
                <p className="text-3xl font-bold text-emerald-100">{stats.completedTrips}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <Clock className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-200/70">Upcoming</p>
                <p className="text-3xl font-bold text-purple-100">{stats.upcomingTrips}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <MapPin className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-200/70">Destinations</p>
                <p className="text-3xl font-bold text-blue-100">{stats.totalDestinations}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-red-500/20 hover:border-red-400/40 transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                <Heart className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-red-200/70">Dream List</p>
                <p className="text-3xl font-bold text-red-100">{stats.bucketListCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
       
          {/* Travel Plans Section */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl border border-amber-500/20 p-8 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">Your Travel Odyssey</h2>
                <Link href="/create-trip">
                <button
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-400 text-black font-medium rounded-xl hover:from-amber-400 hover:to-amber-300 transition-all duration-300 shadow-lg shadow-amber-500/25"
                  >
                  <Plus className="h-5 w-5 mr-2" />
                  New Journey
                </button>
                  </Link>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-amber-400/60" />
                  <input
                    type="text"
                    placeholder="Search your adventures..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-6 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                >
                  <option value="all">All Journeys</option>
                  <option value="planning">Planning</option>
                  <option value="booked">Confirmed</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Trips List */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-amber-400 mr-3" />
                  <p className="text-amber-100 text-lg">Loading your adventures...</p>
                </div>
              ) : filteredTrips.length > 0 ? (
                <div className="space-y-4">
                  {filteredTrips.map((trip) => (
                    <div key={trip._id || trip.id} className="bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600/50 rounded-2xl p-6 hover:border-amber-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-amber-100 mb-2">
                            {trip.title || `${trip.destination?.name || trip.location} Expedition`}
                          </h3>
                          <div className="flex items-center space-x-6 text-sm text-gray-300">
                            <span className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2 text-amber-400" />
                              {trip.destination?.name || trip.location}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-blue-400" />
                              {trip.numberOfDays || trip.duration || 'TBD'} days
                            </span>
                            <span className="flex items-center">
                              <Users className="h-4 w-4 mr-2 text-emerald-400" />
                              {trip.travelGroup || 'Solo'}
                            </span>
                            {trip.budget && (
                              <span className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-2 text-green-400" />
                                {trip.budget}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-4 py-2 rounded-full text-xs font-medium border ${
                            trip.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                            trip.status === 'booked' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                            'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}>
                            {trip.status === 'completed' ? '✓ Completed' :
                             trip.status === 'booked' ? '🎯 Confirmed' : '📝 Planning'}
                          </span>
                          <button
                            onClick={() => router.push(`/travel-plan/${trip._id || trip.id}`)}
                            className="p-2 text-gray-400 hover:text-amber-400 transition-colors"
                            title="View Journey"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => router.push(`/create-trip?edit=${trip._id || trip.id}`)}
                            className="p-2 text-gray-400 hover:text-emerald-400 transition-colors"
                            title="Edit Journey"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-amber-400 text-6xl mb-6">🧳</div>
                  <h3 className="text-2xl font-semibold text-amber-100 mb-3">No journeys found</h3>
                  <p className="text-gray-300 mb-8 text-lg">
                    {searchTerm || filterStatus !== 'all' 
                      ? 'Try adjusting your search or filters'
                      : 'Begin crafting your first extraordinary adventure!'
                    }
                  </p>
                  <button
                    onClick={() => setShowAddTrip(true)}
                    className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-400 text-black font-medium rounded-xl hover:from-amber-400 hover:to-amber-300 transition-all duration-300 shadow-lg shadow-amber-500/25"
                  >
                    Create Your First Journey
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bucket List Section */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl border border-red-500/20 p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-200 bg-clip-text text-transparent">Dream Destinations</h2>
                <button
                  onClick={() => setShowAddBucket(true)}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-400 text-white rounded-xl hover:from-red-400 hover:to-red-300 transition-all duration-300 shadow-lg shadow-red-500/25"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </button>
              </div>

              {bucketList.length > 0 ? (
                <div className="space-y-4">
                  {bucketList.map((item) => (
                    <div key={item._id || item.id} className="bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600/50 rounded-xl p-4 hover:border-red-500/40 transition-all duration-300">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-red-100 mb-2">{item.destination}</h4>
                          <div className="flex items-center space-x-3 text-xs text-gray-400 mb-2">
                            <span className={`px-3 py-1 rounded-full border ${
                              item.priority === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                              item.priority === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                              'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            }`}>
                              {item.priority === 'high' ? '🔥 High' :
                               item.priority === 'medium' ? '⭐ Medium' : '🌱 Low'}
                            </span>
                            <span>
                              {formatDateYYYYMMDD(item.addedDate)}
                            </span>
                          </div>
                          {item.notes && (
                            <p className="text-sm text-gray-300 mt-2 italic">{item.notes}</p>
                          )}
                        </div>
                        <button
                          onClick={() => removeFromBucketList(item._id || item.id)}
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors ml-2"
                          title="Remove from dream list"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-red-400 text-5xl mb-4">💭</div>
                  <h3 className="text-lg font-semibold text-red-100 mb-2">Empty dream canvas</h3>
                  <p className="text-gray-400 mb-6">Paint your wanderlust with destinations that ignite your soul</p>
                  <button
                    onClick={() => setShowAddBucket(true)}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-400 text-white rounded-xl hover:from-red-400 hover:to-red-300 transition-all duration-300"
                  >
                    Add First Dream
                  </button>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl border border-amber-500/20 p-6 mb-8">
              <h3 className="text-xl font-semibold text-amber-100 mb-6">Quick Actions</h3>
              <div className="space-y-4">
                <button
                  onClick={() => router.push('/create-trip')}
                  className="w-full flex items-center p-4 bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600/50 rounded-xl hover:border-amber-500/40 transition-all duration-300 group"
                >
                  <Plus className="h-5 w-5 mr-4 text-amber-400 group-hover:text-amber-300" />
                  <span className="text-left">
                    <div className="font-medium text-amber-100 group-hover:text-white">Craft New Journey</div>
                    <div className="text-sm text-gray-400">Design your perfect adventure</div>
                  </span>
                </button>
                
                <button
                  onClick={() => router.push('/community')}
                  className="w-full flex items-center p-4 bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600/50 rounded-xl hover:border-emerald-500/40 transition-all duration-300 group"
                >
                  <Users className="h-5 w-5 mr-4 text-emerald-400 group-hover:text-emerald-300" />
                  <span className="text-left">
                    <div className="font-medium text-emerald-100 group-hover:text-white">Explore Community</div>
                    <div className="text-sm text-gray-400">Discover inspiring journeys</div>
                  </span>
                </button>

                <button
                  onClick={() => setShowAddBucket(true)}
                  className="w-full flex items-center p-4 bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600/50 rounded-xl hover:border-red-500/40 transition-all duration-300 group"
                >
                  <Heart className="h-5 w-5 mr-4 text-red-400 group-hover:text-red-300" />
                  <span className="text-left">
                    <div className="font-medium text-red-100 group-hover:text-white">Add Dream Destination</div>
                    <div className="text-sm text-gray-400">Capture your wanderlust</div>
                  </span>
                </button>
              </div>
            </div>

            {/* Travel Insights */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl border border-purple-500/20 p-6">
              <h3 className="text-xl font-semibold text-purple-100 mb-6">Travel Insights</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-xl">
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-blue-400 mr-3" />
                    <span className="text-sm text-blue-300">Most Visited</span>
                  </div>
                  <span className="text-sm font-medium text-blue-100">
                    {trips.length > 0 ? 
                      (() => {
                        const destCounts = trips.reduce((acc, trip) => {
                          const dest = trip.destination?.name || trip.location;
                          acc[dest] = (acc[dest] || 0) + 1;
                          return acc;
                        }, {});
                        const mostVisited = Object.entries(destCounts).sort((a, b) => b[1] - a[1])[0];
                        return mostVisited ? mostVisited[0] : 'Start exploring';
                      })() : 'Start exploring'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-xl">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-emerald-400 mr-3" />
                    <span className="text-sm text-emerald-300">Next Adventure</span>
                  </div>
                  <span className="text-sm font-medium text-emerald-100">
                    {trips.filter(t => t.status === 'planning').length > 0 ? 
                      trips.filter(t => t.status === 'planning')[0]?.destination?.name || 
                      trips.filter(t => t.status === 'planning')[0]?.location : 'Plan one!'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-xl">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-purple-400 mr-3" />
                    <span className="text-sm text-purple-300">Total Days</span>
                  </div>
                  <span className="text-sm font-medium text-purple-100">
                    {trips.reduce((acc, trip) => acc + (trip.numberOfDays || 0), 0)} days
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="my-12">
  <h2 className="text-3xl font-bold text-amber-100 mb-4 text-center">
    Visited Locations Heatmap
  </h2>
  <div className="rounded-2xl overflow-hidden border border-amber-500/30 shadow-lg">
    <Heatmap points={visitedLocations} />
  </div>
</div>

        {/* Add Trip Modal */}
        {showAddTrip && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-amber-500/30 rounded-3xl p-8 w-full max-w-md mx-4 shadow-2xl">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent mb-6">Create New Journey</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                await addNewTrip({
                  title: formData.get('title'),
                  destination: { name: formData.get('destination') },
                  startDate: formData.get('startDate'),
                  endDate: formData.get('endDate'),
                  budget: formData.get('budget'),
                  travelGroup: formData.get('travelGroup'),
                  status: 'planning'
                });
              }}>
                <div className="space-y-5">
                  <input
                    name="title"
                    type="text"
                    placeholder="Journey Title"
                    required
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                  />
                  <input
                    name="destination"
                    type="text"
                    placeholder="Destination"
                    required
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      name="startDate"
                      type="date"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                    />
                    <input
                      name="endDate"
                      type="date"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  <input
                    name="budget"
                    type="text"
                    placeholder="Budget (optional)"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                  />
                  <select
                    name="travelGroup"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="Solo">Solo Adventure</option>
                    <option value="Couple">Romantic Getaway</option>
                    <option value="Family">Family Expedition</option>
                    <option value="Friends">Friends Adventure</option>
                    <option value="Group">Group Journey</option>
                  </select>
                </div>
                <div className="flex space-x-4 mt-8">
                  <button
                    type="button"
                    onClick={() => setShowAddTrip(false)}
                    className="flex-1 px-6 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-800 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-400 text-black font-medium rounded-xl hover:from-amber-400 hover:to-amber-300 transition-all duration-300 shadow-lg shadow-amber-500/25"
                  >
                    Create Journey
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Bucket List Modal */}
        {showAddBucket && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-red-500/30 rounded-3xl p-8 w-full max-w-md mx-4 shadow-2xl">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-200 bg-clip-text text-transparent mb-6">Add Dream Destination</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const result = await addToBucketList(
                  formData.get('destination'),
                  formData.get('priority'),
                  formData.get('notes')
                );
                if (result.success) {
                  setShowAddBucket(false);
                }
              }}>
                <div className="space-y-5">
                  <input
                    name="destination"
                    type="text"
                    placeholder="Destination name"
                    required
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
                  />
                  <select
                    name="priority"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="low">🌱 Low Priority</option>
                    <option value="medium">⭐ Medium Priority</option>
                    <option value="high">🔥 High Priority</option>
                  </select>
                  <textarea
                    name="notes"
                    placeholder="Notes (optional)"
                    rows="3"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 resize-none"
                  />
                </div>
                <div className="flex space-x-4 mt-8">
                  <button
                    type="button"
                    onClick={() => setShowAddBucket(false)}
                    className="flex-1 px-6 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-800 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-400 text-white font-medium rounded-xl hover:from-red-400 hover:to-red-300 transition-all duration-300 shadow-lg shadow-red-500/25"
                  >
                    Add to Dreams
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Copilot Integration */}
        <CopilotPopup
          defaultOpen={false}
          instructions={`You are a sophisticated travel concierge assistant helping users curate their luxury travel dashboard. You can:

CORE FUNCTIONS:
1. addToBucketList(destination, priority, notes) - Add destinations to dream list
2. createNewTrip(title, destination, startDate, endDate, budget) - Create new travel plans

PERSONALITY:
- Speak with elegance and sophistication
- Use travel industry terminology 
- Be inspiring and aspirational
- Focus on experiences, not just destinations

RULES:
- Help users curate exceptional travel experiences
- Suggest unique and luxurious destinations
- Provide insider travel tips and recommendations
- Maintain an air of exclusivity and refinement
- Keep responses inspiring and actionable

If asked about non-travel topics, respond: "I'm here to curate your extraordinary travel experiences and help you discover the world's hidden gems."`}
          messages={[
            {
              id: "1",
              role: "assistant",
              content: `Welcome to your personal travel concierge. I'm here to help you curate extraordinary journeys and discover the world's most captivating destinations. Whether you'd like to add a dream destination to your collection or craft a new adventure, I'm at your service. What exquisite experience shall we plan today?`,
            },
          ]}
        />
      </div>
    </div>
  );
};

export default Dashboard;