import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import DraggableActivityCard from './DraggableActivityCard';

const ItineraryDay = ({ day }) => {
  const { setNodeRef } = useDroppable({ id: `day-${day.dayNumber}` });

  return (
    <div ref={setNodeRef} className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-1 border-b pb-3">
        Day {day.dayNumber}: <span className="font-medium text-blue-600">{day.theme}</span>
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
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No activities planned. Drag one here!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItineraryDay;