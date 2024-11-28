export type EnrollmentStatus = 'active' | 'completed' | 'dropped';

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrollmentDate: Date;
  progress: number;
  status: EnrollmentStatus;
}

export interface UserDetails {
  firstName: string;
  lastName: string;
  email: string;
}

export interface EnrollmentWithUserDetails extends Enrollment {
  userDetails: UserDetails;
}