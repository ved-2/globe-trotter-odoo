import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import DraggableActivityCard from './DraggableActivityCard';

const ItineraryDay = ({ day }) => {
  const { setNodeRef } = useDroppable({ id: `day-${day.dayNumber}` });

  return (
    <div ref={setNodeRef} className="bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-lg shadow-amber-500/20 border border-amber-500/20 p-6">
      <h3 className="text-2xl font-bold text-amber-200 mb-1 border-b border-amber-500/30 pb-3">
        Day {day.dayNumber}: <span className="font-medium text-transparent bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text">{day.theme}</span>
      </h3>
      <div className="mt-4 space-y-4">
        {day.activities && day.activities.length > 0 ? (
          day.activities.map((activity, index) => (
            <DraggableActivityCard 
              key={activity.id || `${day.dayNumber}-${index}`} 
              activity={activity} 
              id={activity.id || activity.title} 
              index={index}
            />
          ))
        ) : (
          <div className="text-center py-6 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg border border-amber-500/10">
            <p className="text-gray-400">No activities planned. Drag one here!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItineraryDay;