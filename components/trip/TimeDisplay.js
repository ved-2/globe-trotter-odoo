import React from 'react';
import { Clock, Hourglass } from 'lucide-react';
import { parse, format, differenceInMinutes } from 'date-fns';

// A robust function to parse time strings like "09:00" or "14:30"
const parseTimeString = (timeStr) => {
  try {
    return parse(timeStr, 'HH:mm', new Date());
  } catch {
    return null;
  }
};

// A helper to format the duration in a readable way (e.g., "1 hr 30 min")
const formatDuration = (minutes) => {
  if (minutes < 1) return '';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  let result = '';
  if (hours > 0) result += `${hours} hr `;
  if (mins > 0) result += `${mins} min`;
  return result.trim();
};


const TimeDisplay = ({ time, timeTravel }) => {
  if (!time && !timeTravel) {
    return (
      <span className="flex items-center text-gray-500">
        <Clock size={14} className="mr-1.5" />
        Time TBD
      </span>
    );
  }

  // Handle travel time first if it exists
  if (timeTravel) {
    return (
        <span className="flex items-center text-purple-600">
            <Hourglass size={14} className="mr-1.5" />
            {timeTravel}
        </span>
    );
  }

  const { startTime, endTime } = time || {};

  const start = startTime ? parseTimeString(startTime) : null;
  const end = endTime ? parseTimeString(endTime) : null;

  let timeString = 'Time TBD';
  let durationString = '';

  if (start && end) {
    // Case 1: Start and End time exist
    timeString = `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
    const duration = differenceInMinutes(end, start);
    durationString = formatDuration(duration);
  } else if (start) {
    // Case 2: Only Start time exists
    timeString = `Starts at ${format(start, 'h:mm a')}`;
  } else if (time.duration) {
    // Case 3: Only a duration string is provided
    timeString = `Duration: ${time.duration}`;
  }
  
  return (
    <div className="flex items-center space-x-4">
        <span className="flex items-center text-gray-700 font-medium">
            <Clock size={14} className="mr-1.5 text-gray-500" />
            {timeString}
        </span>
        {durationString && (
            <span className="flex items-center text-sm text-gray-500">
                <Hourglass size={12} className="mr-1" />
                {durationString}
            </span>
        )}
    </div>
  );
};

export default TimeDisplay;