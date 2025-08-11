import React from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';

const CalendarView = ({ tripDays }) => {
  const handleDayClick = (day) => {
    // Find the day number (1-based index)
    const dayIndex = tripDays.findIndex(d => format(d, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'));
    if (dayIndex !== -1) {
      const dayNumber = dayIndex + 1;
      const element = document.getElementById(`day-${dayNumber}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };
  
  const footer = tripDays.length > 0 
    ? <p>You have {tripDays.length} days selected.</p> 
    : <p>Please select a day.</p>;

  return (
    <DayPicker
      mode="multiple"
      min={1}
      selected={tripDays}
      onDayClick={handleDayClick}
      showOutsideDays
      fixedWeeks
      month={tripDays[0] || new Date()}
      footer={footer}
      styles={{
        caption_label: { fontWeight: 'bold' },
        head_cell: { color: '#4a5568' },
        day_selected: { 
          backgroundColor: '#3b82f6', 
          color: 'white',
          fontWeight: 'bold',
        },
        day_today: { color: '#3b82f6' },
        wrapper: {
          backgroundColor: 'black',
          color: 'amber',
        },
      }}
    />
  );
};

export default CalendarView;