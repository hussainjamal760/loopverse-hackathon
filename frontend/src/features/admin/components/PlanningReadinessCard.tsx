'use client';

import React from 'react';
import Link from 'next/link';
import { HiExclamationCircle, HiArrowRight } from 'react-icons/hi2';

export function PlanningReadinessCard() {
  return (
    <div className="bg-white rounded-[20px] p-6 border border-[#c0c9c2]/50 shadow-xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[17px] font-semibold text-[#0e1f16]">Planning readiness</h2>
            <p className="text-xs text-[#414943] mt-0.5">Fall 2026 cohort completion</p>
          </div>
          <span className="text-xs font-semibold text-[#0d402c] bg-[#dff3e4] px-2.5 py-0.5 rounded-md border border-[#c0c9c2]/40 font-mono">
            240 Total
          </span>
        </div>

        {/* Stacked Progress Bar */}
        <div
          className="h-4 rounded-full overflow-hidden flex bg-[#d9edde] mt-5 p-0.5 gap-0.5 border border-[#c0c9c2]/30"
          role="progressbar"
          aria-label="Planning readiness progress"
        >
          <div
            className="h-full bg-[#285742] rounded-l-full transition-all duration-500"
            style={{ width: '70%' }}
            title="168 Saved (70%)"
          />
          <div
            className="h-full bg-[#9fd2b7] transition-all duration-500"
            style={{ width: '22.5%' }}
            title="54 Planning (22.5%)"
          />
          <div
            className="h-full bg-[#ffa182] rounded-r-full transition-all duration-500"
            style={{ width: '7.5%' }}
            title="18 Needs assignment (7.5%)"
          />
        </div>

        {/* Metric Legend Breakdown */}
        <div className="mt-5 space-y-3 text-sm text-[#0e1f16]">
          <div className="flex items-center justify-between py-1.5 border-b border-[#c0c9c2]/20">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#285742] shrink-0" />
              <span className="font-medium text-xs sm:text-sm text-[#0e1f16]">Saved date sheets</span>
            </div>
            <div className="font-mono text-xs sm:text-sm text-[#0d402c] font-semibold">
              168 <span className="font-sans text-xs text-[#414943] font-normal">(70.0%)</span>
            </div>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-[#c0c9c2]/20">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#9fd2b7] shrink-0" />
              <span className="font-medium text-xs sm:text-sm text-[#0e1f16]">Planning in progress</span>
            </div>
            <div className="font-mono text-xs sm:text-sm text-[#644a03] font-semibold">
              54 <span className="font-sans text-xs text-[#414943] font-normal">(22.5%)</span>
            </div>
          </div>

          <div className="flex items-center justify-between py-1.5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ffa182] shrink-0" />
              <span className="font-medium text-xs sm:text-sm text-[#0e1f16]">Need course assignment</span>
            </div>
            <div className="font-mono text-xs sm:text-sm text-[#934a31] font-semibold">
              18 <span className="font-sans text-xs text-[#414943] font-normal">(7.5%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Separated Callout Box */}
      <div className="bg-[#e4f9e9] rounded-xl p-4 border border-[#c0c9c2]/60 mt-6">
        <div className="flex items-start gap-3">
          <HiExclamationCircle className="w-5 h-5 text-[#934a31] shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-[#0e1f16] leading-tight">
              18 students need finalized courses
            </p>
            <p className="text-[11px] text-[#414943] mt-1 leading-snug">
              Enrollment verification holds their ability to lock exam dates.
            </p>
            <Link
              href="/admin/assignments"
              className="text-xs text-[#0d402c] font-semibold hover:underline inline-flex items-center gap-1 mt-2"
            >
              <span>Review assignments</span>
              <HiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
