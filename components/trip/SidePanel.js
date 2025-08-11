import React from 'react';


import CalendarView from './CalenderView';
import CommandSuggestions from './CommandSuggestions';

const SidePanel = ({ tripDays, destination }) => {
  return (
    <aside className="space-y-8 sticky top-8">
      <div className="bg-white rounded-2xl shadow-lg p-4">
        <CalendarView tripDays={tripDays} />
      </div>
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <CommandSuggestions destination={destination} />
      </div>
    </aside>
  );
};

export default SidePanel;