import React from 'react';
import { ScheduleTable } from '@/features/admin';
import { HiCalendarDays } from 'react-icons/hi2';

export const metadata = {
  title: 'Exam Schedules & Slots | ExamSlot Admin',
  description: 'Manage course examination slot dates, timings, publishing state, and protected bookings',
};

export default function AdminSchedulesPage() {
  return (
    <div className="space-y-6">
      {/* Page Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DEDCD1] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#285742] text-white flex items-center justify-center shadow-xs">
            <HiCalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl text-[#24352B] font-normal tracking-tight">
              Exam Schedule Management
            </h1>
            <p className="text-xs text-[#59645B]">
              Configure examination sittings per course with dates and time intervals. Slots selected by students are strictly protected.
            </p>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <ScheduleTable />
    </div>
  );
}
