'use client';

import React from 'react';
import { HiAcademicCap, HiCalendarDays, HiClock, HiExclamationTriangle } from 'react-icons/hi2';
import { AdminStats } from '../types';

interface KpiMetricsSectionProps {
  stats?: AdminStats;
}

export function KpiMetricsSection({ stats }: KpiMetricsSectionProps) {
  const totalStudents = stats?.totalStudents ?? 0;
  const savedSheets = stats?.totalSavedSheets ?? 0;
  const totalBranches = stats?.totalBranches ?? 0;
  const needAssignment = stats?.needAssignment ?? 0;
  const inProgress = stats?.planningInProgress ?? Math.max(0, totalStudents - savedSheets - needAssignment);
  const percentageSaved = totalStudents > 0 ? ((savedSheets / totalStudents) * 100).toFixed(1) : '0';

  return (
    <section aria-label="Key Performance Indicators" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Card 1: Registered Students */}
      <div className="bg-white rounded-[20px] p-5 border border-[#c0c9c2]/50 shadow-xs flex flex-col justify-between transition-all hover:border-[#717973] hover:shadow-md">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-full bg-[#d9edde] flex items-center justify-center text-[#285742]">
            <HiAcademicCap className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-[#414943] bg-[#e4f9e9] px-2.5 py-0.5 rounded-full border border-[#c0c9c2]/40">
            Registered
          </span>
        </div>
        <div>
          <div className="text-[32px] font-semibold text-[#0e1f16] tracking-tight tabular-nums">
            {totalStudents}
          </div>
          <div className="text-sm font-medium text-[#0e1f16] mt-1">Total students</div>
          <div className="text-xs text-[#414943] mt-0.5">
            Across {totalBranches} {totalBranches === 1 ? 'exam branch' : 'exam branches'}
          </div>
        </div>
      </div>

      {/* Card 2: Date Sheets Saved */}
      <div className="bg-white rounded-[20px] p-5 border border-[#c0c9c2]/50 shadow-xs flex flex-col justify-between transition-all hover:border-[#717973] hover:shadow-md">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-full bg-[#bbeed2]/50 flex items-center justify-center text-[#0d402c]">
            <HiCalendarDays className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-[#0d402c] bg-[#e4f9e9] px-2.5 py-0.5 rounded-full border border-[#9fd2b7]/40">
            {percentageSaved}%
          </span>
        </div>
        <div>
          <div className="text-[32px] font-semibold text-[#0d402c] tracking-tight tabular-nums">
            {savedSheets}
          </div>
          <div className="text-sm font-medium text-[#0e1f16] mt-1">Date sheets saved</div>
          <div className="text-xs text-[#414943] mt-0.5">Finalized schedule confirmed</div>
        </div>
      </div>

      {/* Card 3: Planning In Progress */}
      <div className="bg-white rounded-[20px] p-5 border border-[#c0c9c2]/50 shadow-xs flex flex-col justify-between transition-all hover:border-[#717973] hover:shadow-md">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-full bg-[#ffdf9e]/60 flex items-center justify-center text-[#644a03]">
            <HiClock className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-[#483400] bg-[#ffdf9e]/40 px-2.5 py-0.5 rounded-full border border-[#e7c273]/40">
            In progress
          </span>
        </div>
        <div>
          <div className="text-[32px] font-semibold text-[#483400] tracking-tight tabular-nums">
            {inProgress}
          </div>
          <div className="text-sm font-medium text-[#0e1f16] mt-1">Planning in progress</div>
          <div className="text-xs text-[#414943] mt-0.5">Assigned, awaiting sheet save</div>
        </div>
      </div>

      {/* Card 4: Needs Course Assignment */}
      <div className="bg-white rounded-[20px] p-5 border border-[#c0c9c2]/50 shadow-xs flex flex-col justify-between transition-all hover:border-[#717973] hover:shadow-md">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-full bg-[#ffdbd0]/60 flex items-center justify-center text-[#934a31]">
            <HiExclamationTriangle className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-[#934a31] bg-[#ffdbd0]/40 px-2.5 py-0.5 rounded-full border border-[#ffb59d]/40">
            Pending action
          </span>
        </div>
        <div>
          <div className="text-[32px] font-semibold text-[#934a31] tracking-tight tabular-nums">
            {needAssignment}
          </div>
          <div className="text-sm font-medium text-[#0e1f16] mt-1">Needs course assignment</div>
          <div className="text-xs text-[#414943] mt-0.5">Draft enrollment status</div>
        </div>
      </div>
    </section>
  );
}
