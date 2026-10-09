import { Suspense } from 'react';
import { StudentEnrollmentPage } from '@/features/student';

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs">Loading onboarding...</div>}>
      <StudentEnrollmentPage />
    </Suspense>
  );
}
