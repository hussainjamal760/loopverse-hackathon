import React from 'react';
import { BranchTable } from '@/features/admin';
import { HiBuildingOffice2 } from 'react-icons/hi2';

export const metadata = {
  title: 'Campus Branches | ExamSlot Admin',
  description: 'Manage official university campus examination centers and capacity',
};

export default function AdminBranchesPage() {
  return (
    <div className="space-y-6">
      {/* Page Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DEDCD1] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#285742] text-white flex items-center justify-center shadow-xs">
            <HiBuildingOffice2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl text-[#24352B] font-normal tracking-tight">
              Campus Exam Branches
            </h1>
            <p className="text-xs text-[#59645B]">
              Configure official test center locations, contact coordinates, and candidate capacity.
            </p>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <BranchTable />
    </div>
  );
}
