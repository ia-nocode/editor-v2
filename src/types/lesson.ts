export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  content: string;
  videoUrl?: string;
  order: number;
  createdAt: Date;
  lastUpdated: Date;
}

export interface LessonFormData {
  title: string;
  content: string;
  videoUrl?: string;
  order: number;
}