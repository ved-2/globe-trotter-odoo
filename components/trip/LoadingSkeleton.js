import React from 'react';

const LoadingSkeleton = () => {
  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse bg-black">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-lg shadow-amber-500/10 border border-amber-500/20 p-8 mb-8">
        <div className="h-8 bg-gradient-to-r from-amber-400/20 to-amber-600/20 rounded-md w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-800 rounded-md w-1/2 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="h-10 bg-gradient-to-r from-amber-500/10 to-amber-600/10 rounded-md border border-amber-500/20"></div>
          <div className="h-10 bg-gradient-to-r from-amber-500/10 to-amber-600/10 rounded-md border border-amber-500/20"></div>
          <div className="h-10 bg-gradient-to-r from-amber-500/10 to-amber-600/10 rounded-md border border-amber-500/20"></div>
          <div className="h-10 bg-gradient-to-r from-amber-500/10 to-amber-600/10 rounded-md border border-amber-500/20"></div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Itinerary Day Skeleton */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-lg shadow-amber-500/10 border border-amber-500/20 p-6">
            <div className="h-7 bg-gradient-to-r from-amber-400/30 to-amber-600/30 rounded-md w-1/3 mb-6"></div>
            <div className="space-y-4">
              <div className="h-24 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg border border-amber-500/10"></div>
              <div className="h-24 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg border border-amber-500/10"></div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-lg shadow-amber-500/10 border border-amber-500/20 p-6">
            <div className="h-7 bg-gradient-to-r from-amber-400/30 to-amber-600/30 rounded-md w-1/3 mb-6"></div>
            <div className="space-y-4">
              <div className="h-24 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg border border-amber-500/10"></div>
            </div>
          </div>
        </div>
        <div className="mt-8 lg:mt-0">
           <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-lg shadow-amber-500/10 border border-amber-500/20 p-4 h-80"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;