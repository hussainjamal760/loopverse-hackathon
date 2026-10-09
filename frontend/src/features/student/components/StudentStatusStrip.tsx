'use client';

import React from 'react';
import Link from 'next/link';
import {
  HiMapPin,
  HiBookOpen,
  HiCalendarDays,
  HiLockClosed,
  HiArrowRight,
} from 'react-icons/hi2';

interface StudentStatusStripProps {
  branchName?: string;
  branchAddress?: string;
  totalCourses?: number;
  totalCreditHours?: number;
  selectedCount?: number;
}

export function StudentStatusStrip({
  branchName = 'Karachi Central',
  branchAddress = 'University Road, Karachi',
  totalCourses = 4,
  totalCreditHours = 12,
  selectedCount = 3,
}: StudentStatusStripProps) {
  const percentage = Math.round((selectedCount / totalCourses) * 100);
  const isComplete = selectedCount === totalCourses;

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* Card A: Exam Branch */}
      <div className="bg-[#FFFFFF] border border-[#DEDCD1] rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-4">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl bg-[#E7EEE3] text-[#285742] flex items-center justify-center">
            <HiMapPin className="w-5 h-5" />
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F0EEE6] text-[#285742] text-xs font-medium border border-[#DEDCD1]">
            <HiLockClosed className="w-3.5 h-3.5" />
            <span>Branch selected</span>
          </span>
        </div>

        <div>
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#59645B]">
            Exam Branch
          </span>
          <div className="text-lg font-semibold text-[#24352B] mt-0.5">
            {branchName}
          </div>
          <div className="text-xs text-[#59645B] mt-0.5">
            {branchAddress}
          </div>
        </div>

        <Link
          href="/student/help"
          className="text-xs font-semibold text-[#285742] hover:text-[#204735] inline-flex items-center gap-1 self-start transition-colors"
        >
          <span>Request a change</span>
          <HiArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Card B: Assigned Courses */}
      <div className="bg-[#FFFFFF] border border-[#DEDCD1] rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-4">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl bg-[#E7EEE3] text-[#285742] flex items-center justify-center">
            <HiBookOpen className="w-5 h-5" />
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#E7EEE3] text-[#285742] text-xs font-medium border border-[#DEDCD1]">
            Ready to schedule
          </span>
        </div>

        <div>
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#59645B]">
            Assigned Courses
          </span>
          <div className="text-lg font-semibold text-[#24352B] mt-0.5">
            {totalCourses} courses
          </div>
          <div className="text-xs text-[#59645B] mt-0.5">
            Your course assignments are complete
          </div>
        </div>

        <span className="text-xs text-[#59645B] font-medium">
          {totalCreditHours} total credit hours
        </span>
      </div>

      {/* Card C: Planning Progress */}
      <div className="bg-[#FFFFFF] border border-[#DEDCD1] rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-4">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl bg-[#E7EEE3] text-[#285742] flex items-center justify-center">
            <HiCalendarDays className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-[#285742]">
            {percentage}% Complete
          </span>
        </div>

        <div>
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#59645B]">
            Planning Progress
          </span>
          <div className="text-lg font-semibold text-[#24352B] mt-0.5">
            {selectedCount} of {totalCourses} selected
          </div>
          <div className="text-xs text-[#59645B] mt-0.5">
            {isComplete ? 'All exams scheduled' : `Choose ${totalCourses - selectedCount} more exam time`}
          </div>
        </div>

        <div className="w-full h-2 rounded-full bg-[#F0EEE6] overflow-hidden border border-[#DEDCD1]">
          <div
            className="h-full bg-[#285742] rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </section>
  );
}
