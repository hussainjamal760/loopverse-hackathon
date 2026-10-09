import React from 'react';
import { CourseTable } from '@/features/admin';
import { HiBookOpen } from 'react-icons/hi2';

export const metadata = {
  title: 'Academic Courses | ExamSlot Admin',
  description: 'Manage degree examination courses, departments, and credit hours',
};

export default function AdminCoursesPage() {
  return (
    <div className="space-y-6">
      {/* Page Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DEDCD1] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#285742] text-white flex items-center justify-center shadow-xs">
            <HiBookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl text-[#24352B] font-normal tracking-tight">
              Academic Courses Catalog
            </h1>
            <p className="text-xs text-[#59645B]">
              Configure departmental course offerings, credit hour weights, and exam eligibility.
            </p>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <CourseTable />
    </div>
  );
}
