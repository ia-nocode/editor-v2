export interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  teacherId: string;
  createdAt: Date;
  lastUpdated: Date;
}

export interface CourseFormData {
  title: string;
  description: string;
  imageUrl: string;
}