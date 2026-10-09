import React from 'react';
import { StudentForm } from '@/features/admin';

export const metadata = {
  title: 'Enroll New Student | ExamSlot Admin',
  description: 'Register student credentials, guardian information, and academic dossier',
};

export default function AdminNewStudentPage() {
  return <StudentForm />;
}
