import React, { useState } from 'react';
import { DndContext, closestCorners, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import ItineraryDay from './ItineraryDay';
import ActivityCard from './ActivityCard';

const ItineraryView = ({ itinerary, onItineraryChange }) => {
  const [activeItem, setActiveItem] = useState(null);

  const handleDragStart = (event) => {
    setActiveItem(event.active.data.current.item);
  };

  const handleDragEnd = (event) => {
    setActiveItem(null);
    const { active, over } = event;
    if (!over) return;

    const activeContainer = active.data.current.sortable.containerId;
    const overContainer = over.data.current.sortable.containerId;
    
    let newItinerary = JSON.parse(JSON.stringify(itinerary)); // Deep copy

    if (activeContainer === overContainer) {
      // Reordering within the same day
      const dayIndex = newItinerary.findIndex(day => `day-${day.dayNumber}` === activeContainer);
      if (dayIndex === -1) return;
      
      const oldIndex = active.data.current.sortable.index;
      const newIndex = over.data.current.sortable.index;
      
      newItinerary[dayIndex].activities = arrayMove(newItinerary[dayIndex].activities, oldIndex, newIndex);

    } else {
      // Moving between different days
      const activeDayIndex = newItinerary.findIndex(day => `day-${day.dayNumber}` === activeContainer);
      const overDayIndex = newItinerary.findIndex(day => `day-${day.dayNumber}` === overContainer);
      if (activeDayIndex === -1 || overDayIndex === -1) return;

      const [movedItem] = newItinerary[activeDayIndex].activities.splice(active.data.current.sortable.index, 1);
      
      const overIndex = over.data.current?.sortable?.index ?? newItinerary[overDayIndex].activities.length;
      newItinerary[overDayIndex].activities.splice(overIndex, 0, movedItem);
    }
    
    onItineraryChange(newItinerary);
  };

  if (!itinerary || itinerary.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="text-gray-400 text-6xl mb-4">📋</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Itinerary Yet</h3>
        <p className="text-gray-600">Use the AI assistant on the right to build your travel plan!</p>
      </div>
    );
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
      <div className="space-y-8">
        {itinerary.map(day => (
          <SortableContext key={`day-${day.dayNumber}`} items={day.activities.map(act => act.id || act.title)} strategy={verticalListSortingStrategy}>
            <ItineraryDay day={day} />
          </SortableContext>
        ))}
      </div>
       <DragOverlay>
        {activeItem ? <ActivityCard activity={activeItem} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
};

export default ItineraryView;