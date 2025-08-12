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
    ? <p style={{ fontSize: '0.8rem' }}>You have {tripDays.length} days selected.</p> 
    : <p style={{ fontSize: '0.8rem' }}>Please select a day.</p>;

  // Diagonally shrink: use a CSS transform: scale and rotate
  return (
    <div
      style={{
        maxWidth: 180,
        margin: '0 auto',
        transform: 'scale(1) ',
        transformOrigin: 'top left',
        boxShadow: '0 2px 12px 0 rgba(0,0,0,0.10)',
        borderRadius: 10,
        overflow: 'hidden',
      }}
    >
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
          caption_label: { fontWeight: 'bold', fontSize: '0.85rem' },
          head_cell: { color: '#4a5568', fontSize: '0.75rem', padding: 1 },
          day: { fontSize: '0.75rem', width: 22, height: 22, lineHeight: '22px' },
          day_selected: { 
            backgroundColor: '#3b82f6', 
            color: 'white',
            fontWeight: 'bold',
            borderRadius: '5px',
          },
          day_today: { color: '#3b82f6', border: '1px solid #3b82f6', borderRadius: '5px' },
          wrapper: {
            backgroundColor: 'black',
            color: 'amber',
            fontSize: '0.8rem',
            padding: 0,
            maxWidth: 180,
          },
          table: { minWidth: 0 },
        }}
      />
    </div>
  );
};

export default CalendarView;