import React from 'react';

const LoadingSkeleton = () => {
  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <div className="h-8 bg-gray-200 rounded-md w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded-md w-1/2 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="h-10 bg-gray-200 rounded-md"></div>
          <div className="h-10 bg-gray-200 rounded-md"></div>
          <div className="h-10 bg-gray-200 rounded-md"></div>
          <div className="h-10 bg-gray-200 rounded-md"></div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Itinerary Day Skeleton */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="h-7 bg-gray-200 rounded-md w-1/3 mb-6"></div>
            <div className="space-y-4">
              <div className="h-24 bg-gray-100 rounded-lg"></div>
              <div className="h-24 bg-gray-100 rounded-lg"></div>
            </div>
          </div>
           <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="h-7 bg-gray-200 rounded-md w-1/3 mb-6"></div>
            <div className="space-y-4">
              <div className="h-24 bg-gray-100 rounded-lg"></div>
            </div>
          </div>
        </div>
        <div className="mt-8 lg:mt-0">
           <div className="bg-white rounded-2xl shadow-lg p-4 h-80"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;