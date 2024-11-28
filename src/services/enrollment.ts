import { collection, query, where, getDocs, addDoc, deleteDoc, doc, serverTimestamp, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { EnrollmentWithUserDetails } from '../types/enrollment';
import { getUserById } from './users';

export async function fetchEnrollments(courseId: string): Promise<EnrollmentWithUserDetails[]> {
  try {
    const enrollmentsRef = collection(db, 'enrolled');
    const q = query(enrollmentsRef, where('courseId', '==', courseId));
    const snapshot = await getDocs(q);
    
    const enrollmentsWithDetails = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const enrollmentData = doc.data();
        const user = await getUserById(enrollmentData.userId);
        
        let enrollmentDate = new Date();
        if (enrollmentData.enrollmentDate) {
          enrollmentDate = enrollmentData.enrollmentDate instanceof Timestamp 
            ? enrollmentData.enrollmentDate.toDate()
            : new Date(enrollmentData.enrollmentDate);
        }
        
        return {
          id: doc.id,
          userId: enrollmentData.userId,
          courseId: enrollmentData.courseId,
          enrollmentDate,
          progress: enrollmentData.progress || 0,
          status: enrollmentData.status || 'active',
          userDetails: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
          }
        };
      })
    );
    
    return enrollmentsWithDetails;
  } catch (error) {
    console.error('Error in fetchEnrollments:', error);
    throw new Error('Failed to fetch enrollments');
  }
}

export async function enrollUser(courseId: string, userId: string): Promise<void> {
  try {
    // Check if user exists
    await getUserById(userId);
    
    // Check if user is already enrolled
    const existingEnrollment = await checkExistingEnrollment(courseId, userId);
    if (existingEnrollment) {
      throw new Error('L\'étudiant est déjà inscrit à ce cours');
    }

    const enrollmentDoc = {
      userId,
      courseId,
      enrollmentDate: serverTimestamp(),
      progress: 0,
      status: 'active' as const
    };

    await addDoc(collection(db, 'enrolled'), enrollmentDoc);
  } catch (error) {
    console.error('Error in enrollUser:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to enroll user');
  }
}

export async function unenrollUser(enrollmentId: string): Promise<void> {
  try {
    const enrollmentRef = doc(db, 'enrolled', enrollmentId);
    const enrollmentDoc = await getDoc(enrollmentRef);
    
    if (!enrollmentDoc.exists()) {
      throw new Error('Inscription non trouvée');
    }
    
    await deleteDoc(enrollmentRef);
  } catch (error) {
    console.error('Error in unenrollUser:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to unenroll user');
  }
}

async function checkExistingEnrollment(courseId: string, userId: string): Promise<boolean> {
  try {
    const enrollmentsRef = collection(db, 'enrolled');
    const q = query(
      enrollmentsRef,
      where('courseId', '==', courseId),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking existing enrollment:', error);
    throw new Error('Failed to check existing enrollment');
  }
}