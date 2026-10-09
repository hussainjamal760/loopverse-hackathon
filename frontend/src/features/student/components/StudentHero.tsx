'use client';

import React from 'react';
import { HiCalendar, HiShieldCheck } from 'react-icons/hi2';

interface StudentHeroProps {
  studentName?: string;
  registrationNumber?: string;
  program?: string;
  semester?: number;
}

export function StudentHero({
  studentName = 'Student',
  registrationNumber = '',
  program = '',
  semester = 1,
}: StudentHeroProps) {
  const initials = studentName
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'ST';

  return (
    <section className="flex flex-col gap-4 mb-8">
      {/* Title & Session Badge */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-wider font-bold text-[#285742]">
            Student Portal
          </span>
          <h1
            className="text-2xl sm:text-4xl text-[#24352B] tracking-tight mt-1 font-normal"
            style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}
          >
            Your exams, thoughtfully planned.
          </h1>
          <p className="text-sm sm:text-base text-[#59645B] mt-1">
            Choose your exam times, review your schedule, and save your date sheet.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#E7EEE3] text-[#285742] text-xs font-semibold self-start md:self-auto border border-[#DEDCD1] shadow-xs">
          <HiCalendar className="w-4 h-4 text-[#285742]" />
          <span>Fall 2026</span>
        </div>
      </div>

      {/* Student Identity Strip */}
      <div className="bg-[#FFFFFF] rounded-2xl p-4 sm:p-5 border border-[#DEDCD1] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-[#E7EEE3] text-[#285742] flex items-center justify-center font-bold text-base border border-[#DEDCD1]">
            {initials}
          </div>
          <div>
            <div className="font-semibold text-base text-[#24352B] leading-tight">
              {studentName}
            </div>
            <div className="text-xs text-[#59645B] mt-0.5">
              {registrationNumber} · {program} · Semester {semester}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[#59645B] text-xs bg-[#F0EEE6] px-3 py-1.5 rounded-lg border border-[#DEDCD1] self-start sm:self-auto">
          <HiShieldCheck className="w-4 h-4 text-[#285742]" />
          <span className="font-medium text-[#24352B]">Identity Verified · Student ID Active</span>
        </div>
      </div>
    </section>
  );
}
