import React, { Suspense } from 'react';
import { AssignmentManagementView } from '@/features/admin';
import { HiAcademicCap } from 'react-icons/hi2';

export const metadata = {
  title: 'Course Assignments | ExamSlot Admin',
  description: 'Manage student course assignments, eligibility, and date-sheet planning readiness',
};

export default function AdminAssignmentsPage() {
  return (
    <div className="space-y-6">
      {/* Page Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DEDCD1] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#285742] text-white flex items-center justify-center shadow-xs shrink-0">
            <HiAcademicCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl text-[#24352B] font-normal tracking-tight">
              Student Course Assignments
            </h1>
            <p className="text-xs text-[#59645B]">
              Assign semester courses, edit enrolled modules, verify 4–6 course exam eligibility, and monitor date-sheet readiness.
            </p>
          </div>
        </div>
      </div>

      {/* Main Feature View */}
      <Suspense fallback={<div className="p-8 text-center text-xs text-[#59645B]">Loading assignments workspace...</div>}>
        <AssignmentManagementView />
      </Suspense>
    </div>
  );
}
