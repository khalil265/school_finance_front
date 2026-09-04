export interface Student {
  id?: string;
  registrationNumber: string;
  firstName: string;
  lastName: string;
  gender: 'MALE' | 'FEMALE';
  dateOfBirth?: string;
  placeOfBirth?: string;
  nationality?: string;
  phone?: string;
  email?: string;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  status?: string;
  photoBase64?: string;
  currentClassName?: string;
  currentAcademicYearLabel?: string;
}

export interface Enrollment {
  id?: string;
  studentId: string;
  academicYearId: string;
  schoolClassId: string;
  classNumber?: number;
  enrollmentDate: string;
  notes?: string;
}