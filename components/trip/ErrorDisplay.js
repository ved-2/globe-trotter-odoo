import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ErrorDisplay = ({ error }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full text-center">
        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something Went Wrong</h2>
        <p className="text-gray-600 mb-6">
          We couldn't load your travel plan. Please check your connection or try again later.
        </p>
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md mb-6">
          <strong>Error:</strong> {error || 'An unknown error occurred.'}
        </p>
        <button
          onClick={() => window.history.back()}
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default ErrorDisplay;