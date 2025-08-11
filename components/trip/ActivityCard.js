import React from 'react';
import { GripVertical, DollarSign, Star } from 'lucide-react';
import TimeDisplay from './TimeDisplay'; // Import the new component

const ActivityCard = ({ activity, listeners, isOverlay = false }) => {
  const cardClasses = `
    bg-white rounded-lg p-4 border flex items-start space-x-4
    ${isOverlay ? 'shadow-2xl' : 'hover:shadow-md transition-shadow hover:border-blue-300'}
  `;

  return (
    <div className={cardClasses}>
      {/* Drag handle */}
      {!isOverlay && listeners && (
        <div {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600 pt-1">
          <GripVertical size={20} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-grow">
        <h4 className="font-bold text-gray-800">{activity.title || activity.placeName}</h4>
        <p className="text-sm text-gray-600 mt-1">{activity.description || activity.placeDetails}</p>
        
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-xs">
          {/* === THIS IS THE UPDATED PART === */}
          <TimeDisplay 
            time={activity.time} 
            timeTravel={activity.timeTravelEachLocation} 
          />
          {/* ============================== */}

          {(activity.cost?.amount > 0) && (
            <span className="flex items-center text-gray-600"><DollarSign size={14} className="mr-1.5 text-green-600" /> ${activity.cost.amount}</span>
          )}
          {activity.rating && (
            <span className="flex items-center text-gray-600"><Star size={14} className="mr-1.5 text-yellow-500" /> {activity.rating}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;