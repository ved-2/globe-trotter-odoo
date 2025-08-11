import React from 'react';
import CalendarView from './CalenderView';
import CommandSuggestions from './CommandSuggestions';

const SidePanel = ({ tripDays, destination }) => {
  return (
    <aside className="space-y-8 sticky top-8">
      <div className="bg-gradient-to-br from-black to-gray-900 rounded-2xl shadow-lg shadow-amber-500/20 border border-amber-500/20 p-4">
        <CalendarView tripDays={tripDays} />
      </div>
      <div className="bg-gradient-to-br from-black to-gray-900 rounded-2xl shadow-lg shadow-amber-500/20 border border-amber-500/20 p-6">
        <CommandSuggestions destination={destination} />
      </div>
    </aside>
  );
};

export default SidePanel;