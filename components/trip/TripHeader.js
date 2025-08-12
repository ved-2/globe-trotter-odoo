import React from 'react';
import { MapPin, Calendar, Users, DollarSign } from 'lucide-react';

const InfoPill = ({ icon: Icon, label, value }) => (
  <div className="flex items-center space-x-3 bg-black p-3 rounded-lg border border-amber-500">
    <Icon className="h-6 w-6 text-amber-400 flex-shrink-0" />
    <div>
      <p className="text-sm text-amber-300">{label}</p>
      <p className="font-semibold text-amber-100">{value}</p>
    </div>
  </div>
);

const TripHeader = ({ plan }) => {
  return (
    <header className="bg-black rounded-2xl shadow-lg p-8 border border-amber-700">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold text-amber-200 mb-1">
            🧳 {plan.title || `${plan.destination?.name || plan.location || 'Your'} Trip`}
          </h1>
          <p className="text-amber-400 text-lg">Your AI-powered travel plan awaits.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-900 text-amber-300 border border-amber-700">
            {plan.status || 'Planning'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <InfoPill icon={MapPin} label="Destination" value={plan.destination?.name || plan.location} />
        <InfoPill 
          icon={Calendar} 
          label="Duration" 
          value={plan.numberOfDays ? `${plan.numberOfDays} days` : (plan.itinerary?.length ? `${plan.itinerary.length} days` : 'N/A')}
        />
        <InfoPill icon={Users} label="Travel Group" value={plan.travelGroup || plan.travelers} />
        <InfoPill icon={DollarSign} label="Budget" value={plan.budget} />
      </div>
    </header>
  );
};

export default TripHeader;