'use client';

import React from 'react';
import Link from 'next/link';
import { HiExclamationCircle, HiCheckCircle, HiArrowRight } from 'react-icons/hi2';
import { AdminStats } from '../types';

interface PlanningReadinessCardProps {
  stats?: AdminStats;
}

export function PlanningReadinessCard({ stats }: PlanningReadinessCardProps) {
  const total = stats?.totalStudents ?? 0;
  const saved = stats?.totalSavedSheets ?? 0;
  const needAssignment = stats?.needAssignment ?? 0;
  const planning = stats?.planningInProgress ?? Math.max(0, total - saved - needAssignment);

  const safeTotal = total > 0 ? total : 1;
  const savedPct = total > 0 ? ((saved / safeTotal) * 100).toFixed(1) : '0.0';
  const planningPct = total > 0 ? ((planning / safeTotal) * 100).toFixed(1) : '0.0';
  const needAssignmentPct = total > 0 ? ((needAssignment / safeTotal) * 100).toFixed(1) : '0.0';

  return (
    <div className="bg-white rounded-[20px] p-6 border border-[#c0c9c2]/50 shadow-xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[17px] font-semibold text-[#0e1f16]">Planning readiness</h2>
            <p className="text-xs text-[#414943] mt-0.5">Cohort date sheet completion</p>
          </div>
          <span className="text-xs font-semibold text-[#0d402c] bg-[#dff3e4] px-2.5 py-0.5 rounded-md border border-[#c0c9c2]/40 font-mono">
            {total} Total
          </span>
        </div>

        {/* Dynamic Stacked Progress Bar */}
        <div
          className="h-4 rounded-full overflow-hidden flex bg-[#d9edde] mt-5 p-0.5 gap-0.5 border border-[#c0c9c2]/30"
          role="progressbar"
          aria-label="Planning readiness progress"
        >
          {Number(savedPct) > 0 && (
            <div
              className="h-full bg-[#285742] rounded-l-full transition-all duration-500"
              style={{ width: `${savedPct}%` }}
              title={`${saved} Saved (${savedPct}%)`}
            />
          )}
          {Number(planningPct) > 0 && (
            <div
              className={`h-full bg-[#9fd2b7] transition-all duration-500 ${
                Number(savedPct) === 0 ? 'rounded-l-full' : ''
              } ${Number(needAssignmentPct) === 0 ? 'rounded-r-full' : ''}`}
              style={{ width: `${planningPct}%` }}
              title={`${planning} Planning (${planningPct}%)`}
            />
          )}
          {Number(needAssignmentPct) > 0 && (
            <div
              className="h-full bg-[#ffa182] rounded-r-full transition-all duration-500"
              style={{ width: `${needAssignmentPct}%` }}
              title={`${needAssignment} Needs assignment (${needAssignmentPct}%)`}
            />
          )}
        </div>

        {/* Metric Legend Breakdown */}
        <div className="mt-5 space-y-3 text-sm text-[#0e1f16]">
          <div className="flex items-center justify-between py-1.5 border-b border-[#c0c9c2]/20">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#285742] shrink-0" />
              <span className="font-medium text-xs sm:text-sm text-[#0e1f16]">Saved date sheets</span>
            </div>
            <div className="font-mono text-xs sm:text-sm text-[#0d402c] font-semibold">
              {saved} <span className="font-sans text-xs text-[#414943] font-normal">({savedPct}%)</span>
            </div>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-[#c0c9c2]/20">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#9fd2b7] shrink-0" />
              <span className="font-medium text-xs sm:text-sm text-[#0e1f16]">Planning in progress</span>
            </div>
            <div className="font-mono text-xs sm:text-sm text-[#644a03] font-semibold">
              {planning} <span className="font-sans text-xs text-[#414943] font-normal">({planningPct}%)</span>
            </div>
          </div>

          <div className="flex items-center justify-between py-1.5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ffa182] shrink-0" />
              <span className="font-medium text-xs sm:text-sm text-[#0e1f16]">Need course assignment</span>
            </div>
            <div className="font-mono text-xs sm:text-sm text-[#934a31] font-semibold">
              {needAssignment} <span className="font-sans text-xs text-[#414943] font-normal">({needAssignmentPct}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Action Callout Box */}
      {needAssignment > 0 ? (
        <div className="bg-[#fff4f0] rounded-xl p-4 border border-[#ffa182]/50 mt-6">
          <div className="flex items-start gap-3">
            <HiExclamationCircle className="w-5 h-5 text-[#934a31] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-[#0e1f16] leading-tight">
                {needAssignment} {needAssignment === 1 ? 'student needs' : 'students need'} course finalization
              </p>
              <p className="text-[11px] text-[#414943] mt-1 leading-snug">
                Unassigned courses hold the student ability to finalize exam date sheets.
              </p>
              <Link
                href="/admin/students"
                className="text-xs text-[#934a31] font-semibold hover:underline inline-flex items-center gap-1 mt-2"
              >
                <span>Manage student assignments</span>
                <HiArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#e4f9e9] rounded-xl p-4 border border-[#9fd2b7]/60 mt-6">
          <div className="flex items-start gap-3">
            <HiCheckCircle className="w-5 h-5 text-[#285742] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-[#0e1f16] leading-tight">
                All course assignments finalized
              </p>
              <p className="text-[11px] text-[#414943] mt-1 leading-snug">
                All registered students have their semester curriculum ready for scheduling.
              </p>
              <Link
                href="/admin/schedules"
                className="text-xs text-[#0d402c] font-semibold hover:underline inline-flex items-center gap-1 mt-2"
              >
                <span>View examination slots</span>
                <HiArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
