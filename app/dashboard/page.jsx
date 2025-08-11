"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { 
  Loader2, 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  Plus, 
  Search, 
  Filter,
  Heart,
  Bookmark,
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🧳 Welcome back, {user?.firstName || 'Traveler'}!
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your trips, explore new destinations, and plan your next adventure
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Trips</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTrips}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedTrips}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingTrips}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <MapPin className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Destinations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDestinations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bucket List</p>
                <p className="text-2xl font-bold text-gray-900">{stats.bucketListCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Travel Plans Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Your Travel Plans</h2>
                <button
                  onClick={() => setShowAddTrip(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Trip
                </button>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search trips..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="planning">Planning</option>
                  <option value="booked">Booked</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Trips List */}
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-3" />
                  <p className="text-gray-600">Loading your trips...</p>
                </div>
              ) : filteredTrips.length > 0 ? (
                <div className="space-y-4">
                  {filteredTrips.map((trip) => (
                    <div key={trip._id || trip.id} className="border rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {trip.title || `${trip.destination?.name || trip.location} Trip`}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {trip.destination?.name || trip.location}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {trip.numberOfDays || trip.duration || 'N/A'}
                            </span>
                            <span className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              {trip.travelGroup || 'Solo'}
                            </span>
                            {trip.budget && (
                              <span className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-1" />
                                {trip.budget}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            trip.status === 'completed' ? 'bg-green-100 text-green-800' :
                            trip.status === 'booked' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {trip.status || 'planning'}
                          </span>
                          <button
                            onClick={() => router.push(`/travel-plan/${trip._id || trip.id}`)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="View Trip"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => router.push(`/create-trip?edit=${trip._id || trip.id}`)}
                            className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                            title="Edit Trip"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-4">🧳</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No trips found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || filterStatus !== 'all' 
                      ? 'Try adjusting your search or filters'
                      : 'Start planning your first adventure!'
                    }
                  </p>
                  <button
                    onClick={() => setShowAddTrip(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create Your First Trip
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bucket List Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Bucket List</h2>
                <button
                  onClick={() => setShowAddBucket(true)}
                  className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </button>
              </div>

              {bucketList.length > 0 ? (
                                 <div className="space-y-3">
                   {bucketList.map((item) => (
                     <div key={item._id || item.id} className="border rounded-lg p-3 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">{item.destination}</h4>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span className={`px-2 py-1 rounded-full ${
                              item.priority === 'high' ? 'bg-red-100 text-red-800' :
                              item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {item.priority}
                            </span>
                            <span>{new Date(item.addedDate).toLocaleDateString()}</span>
                          </div>
                          {item.notes && (
                            <p className="text-sm text-gray-600 mt-2">{item.notes}</p>
                          )}
                        </div>
                                                 <button
                           onClick={() => removeFromBucketList(item._id || item.id)}
                           className="p-1 text-gray-400 hover:text-red-600 transition-colors ml-2"
                           title="Remove from bucket list"
                         >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-4">💭</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Empty bucket list</h3>
                  <p className="text-gray-600 mb-4">Add destinations you dream of visiting</p>
                  <button
                    onClick={() => setShowAddBucket(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Add Destination
                  </button>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/create-trip')}
                  className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-3 text-blue-600" />
                  <span className="text-left">
                    <div className="font-medium text-gray-900">Plan New Trip</div>
                    <div className="text-sm text-gray-600">Create a detailed travel plan</div>
                  </span>
                </button>
                
                <button
                  onClick={() => router.push('/community')}
                  className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Users className="h-4 w-4 mr-3 text-green-600" />
                  <span className="text-left">
                    <div className="font-medium text-gray-900">Explore Community</div>
                    <div className="text-sm text-gray-600">Discover travel inspiration</div>
                  </span>
                </button>

                <button
                  onClick={() => setShowAddBucket(true)}
                  className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Heart className="h-4 w-4 mr-3 text-red-600" />
                  <span className="text-left">
                    <div className="font-medium text-gray-900">Add to Bucket List</div>
                    <div className="text-sm text-gray-600">Save dream destinations</div>
                  </span>
                </button>
              </div>
            </div>

            {/* Travel Insights */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Travel Insights</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="text-sm text-blue-800">Most Visited</span>
                  </div>
                  <span className="text-sm font-medium text-blue-900">
                    {trips.length > 0 ? 
                      (() => {
                        const destCounts = trips.reduce((acc, trip) => {
                          const dest = trip.destination?.name || trip.location;
                          acc[dest] = (acc[dest] || 0) + 1;
                          return acc;
                        }, {});
                        const mostVisited = Object.entries(destCounts).sort((a, b) => b[1] - a[1])[0];
                        return mostVisited ? mostVisited[0] : 'No trips yet';
                      })() : 'No trips yet'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-sm text-green-800">Next Adventure</span>
                  </div>
                  <span className="text-sm font-medium text-green-900">
                    {trips.filter(t => t.status === 'planning').length > 0 ? 
                      trips.filter(t => t.status === 'planning')[0]?.destination?.name || 
                      trips.filter(t => t.status === 'planning')[0]?.location : 'Plan one!'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-purple-600 mr-3" />
                    <span className="text-sm text-purple-800">Total Days</span>
                  </div>
                  <span className="text-sm font-medium text-purple-900">
                    {trips.reduce((acc, trip) => acc + (trip.numberOfDays || 0), 0)} days
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Trip Modal */}
        {showAddTrip && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Trip</h3>
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
                <div className="space-y-4">
                  <input
                    name="title"
                    type="text"
                    placeholder="Trip Title"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    name="destination"
                    type="text"
                    placeholder="Destination"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      name="startDate"
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      name="endDate"
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <input
                    name="budget"
                    type="text"
                    placeholder="Budget (optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    name="travelGroup"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Solo">Solo</option>
                    <option value="Couple">Couple</option>
                    <option value="Family">Family</option>
                    <option value="Friends">Friends</option>
                    <option value="Group">Group</option>
                  </select>
                </div>
                <div className="flex space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddTrip(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create Trip
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Bucket List Modal */}
        {showAddBucket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Add to Bucket List</h3>
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
                <div className="space-y-4">
                  <input
                    name="destination"
                    type="text"
                    placeholder="Destination name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    name="priority"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                  <textarea
                    name="notes"
                    placeholder="Notes (optional)"
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddBucket(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Add to Bucket List
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Copilot Integration */}
        <CopilotPopup
          defaultOpen={false}
          instructions={`You are a travel planning assistant helping users manage their dashboard. You can:

CORE FUNCTIONS:
1. addToBucketList(destination, priority, notes) - Add destinations to bucket list
2. createNewTrip(title, destination, startDate, endDate, budget) - Create new travel plans

RULES:
- Help users organize their travel plans and bucket list
- Suggest destinations based on their interests
- Help prioritize bucket list items
- Provide travel planning tips and advice
- Keep responses helpful and actionable

If asked about non-travel topics, respond: "I'm here to help with your travel planning and bucket list management."`}
          messages={[
            {
              id: "1",
              role: "assistant",
              content: `Hi! I can help you manage your travel dashboard. I can add destinations to your bucket list, create new trips, and help you organize your travel plans. What would you like to do?`,
            },
          ]}
        />
      </div>
    </div>
  );
};

export default Dashboard;
