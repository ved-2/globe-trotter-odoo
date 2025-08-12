import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ErrorDisplay = ({ error }) => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-amber-900/80 to-black border border-amber-700 shadow-2xl rounded-2xl p-8 max-w-md w-full text-center">
        <AlertTriangle className="h-16 w-16 text-amber-400 mx-auto mb-4 drop-shadow" />
        <h2 className="text-2xl font-bold text-amber-200 mb-2">Oops! Something Went Wrong</h2>
        <p className="text-amber-300 mb-6">
          We couldn't load your travel plan. Please check your connection or try again later.
        </p>
        <p className="text-sm text-amber-100 bg-amber-900/60 border border-amber-700 p-3 rounded-md mb-6">
          <strong className="text-amber-400">Error:</strong> {error || 'An unknown error occurred.'}
        </p>
        <button
          onClick={() => window.history.back()}
          className="px-6 py-2 bg-amber-600 text-black font-semibold rounded-lg hover:bg-amber-700 hover:text-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-50 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default ErrorDisplay;