import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ActivityCard from './ActivityCard';

const DraggableActivityCard = ({ activity, id, index }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: id, data: { item: activity, index: index }});

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 10,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} >
      <ActivityCard activity={activity} listeners={listeners} />
    </div>
  );
};

export default DraggableActivityCard;