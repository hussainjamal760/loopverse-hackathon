import React from 'react';
import { RequestsTable } from '@/features/admin';
import { HiArrowPathRoundedSquare } from 'react-icons/hi2';

export const metadata = {
  title: 'Change Requests | ExamSlot Admin',
  description: 'Review formal student requests for campus branch transfers and date sheet unlocks',
};

export default function AdminRequestsPage() {
  return (
    <div className="space-y-6">
      {/* Page Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DEDCD1] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#285742] text-white flex items-center justify-center shadow-xs">
            <HiArrowPathRoundedSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl text-[#24352B] font-normal tracking-tight">
              Student Change Requests
            </h1>
            <p className="text-xs text-[#59645B]">
              Review formal student submissions for test center branch reallocations and exam schedule adjustments.
            </p>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <RequestsTable />
    </div>
  );
}
