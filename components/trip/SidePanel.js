import React from 'react';
import CalendarView from './CalenderView';
import CommandSuggestions from './CommandSuggestions';

const SidePanel = ({ tripDays, destination }) => {
  return (
    <aside className="space-y-6 sticky top-8 w-full=">
      <section className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-xl shadow-lg border border-amber-600/30 p-5">
        <CalendarView tripDays={tripDays} />
      </section>

      <section className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-xl shadow-lg border border-amber-600/30 p-5">
        <CommandSuggestions destination={destination} />
      </section>
    </aside>
  );
};

export default SidePanel;
