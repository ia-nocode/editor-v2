import React from 'react';
import { Trash2, Edit, GripVertical, PlayCircle } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Lesson } from '../types/lesson';
import VideoModal from './VideoModal';

interface LessonListProps {
  lessons: Lesson[];
  onEditLesson: (lesson: Lesson) => void;
  onDeleteLesson: (lesson: Lesson) => void;
  onReorderLessons: (lessons: Lesson[]) => void;
}

interface SortableLessonProps {
  lesson: Lesson;
  onEdit: (lesson: Lesson) => void;
  onDelete: (lesson: Lesson) => void;
  onVideoPlay: (url: string) => void;
}

function SortableLesson({ lesson, onEdit, onDelete, onVideoPlay }: SortableLessonProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex items-center space-x-4 ${
        isDragging ? 'shadow-lg' : ''
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="text-gray-400 dark:text-gray-500 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-5 w-5" />
      </div>
      
      <div className="flex-grow">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {lesson.title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
          {lesson.content}
        </p>
      </div>

      <div className="flex items-center space-x-2">
        {lesson.videoUrl && (
          <button
            onClick={() => onVideoPlay(lesson.videoUrl!)}
            className="p-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
            title="Lire la vidéo"
          >
            <PlayCircle className="h-5 w-5" />
          </button>
        )}
        <button
          onClick={() => onEdit(lesson)}
          className="p-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
          title="Modifier la leçon"
        >
          <Edit className="h-5 w-5" />
        </button>
        <button
          onClick={() => onDelete(lesson)}
          className="p-2 text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
          title="Supprimer la leçon"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

export default function LessonList({
  lessons,
  onEditLesson,
  onDeleteLesson,
  onReorderLessons,
}: LessonListProps) {
  const [selectedVideo, setSelectedVideo] = React.useState<string | null>(null);
  const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedLessons.findIndex((lesson) => lesson.id === active.id);
      const newIndex = sortedLessons.findIndex((lesson) => lesson.id === over.id);

      const newLessons = [...sortedLessons];
      const [movedLesson] = newLessons.splice(oldIndex, 1);
      newLessons.splice(newIndex, 0, movedLesson);

      // Update order numbers
      const updatedLessons = newLessons.map((lesson, index) => ({
        ...lesson,
        order: index,
      }));

      onReorderLessons(updatedLessons);
    }
  };

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortedLessons.map((lesson) => lesson.id)}
          strategy={verticalListSortingStrategy}
        >
          {sortedLessons.map((lesson) => (
            <SortableLesson
              key={lesson.id}
              lesson={lesson}
              onEdit={onEditLesson}
              onDelete={onDeleteLesson}
              onVideoPlay={(url) => setSelectedVideo(url)}
            />
          ))}
        </SortableContext>
      </DndContext>

      <VideoModal
        isOpen={!!selectedVideo}
        videoUrl={selectedVideo || ''}
        onClose={() => setSelectedVideo(null)}
      />
    </div>
  );
}