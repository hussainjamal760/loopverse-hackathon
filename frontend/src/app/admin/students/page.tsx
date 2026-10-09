import React from 'react';
import { StudentTable } from '@/features/admin';
import { HiUsers } from 'react-icons/hi2';

export const metadata = {
  title: 'Students Directory | ExamSlot Admin',
  description: 'Manage student registrations, academic dossiers, credentials, and safe deactivations',
};

export default function AdminStudentsPage() {
  return (
    <div className="space-y-6">
      {/* Page Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DEDCD1] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#285742] text-white flex items-center justify-center shadow-xs">
            <HiUsers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl text-[#24352B] font-normal tracking-tight">
              Enrolled Students Directory
            </h1>
            <p className="text-xs text-[#59645B]">
              Inspect student dossiers, track portal activation status, and manage academic enrollments.
            </p>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <StudentTable />
    </div>
  );
}
