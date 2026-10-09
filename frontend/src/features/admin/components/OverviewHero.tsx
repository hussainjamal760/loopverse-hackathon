'use client';

import React from 'react';
import Link from 'next/link';
import { HiPlus, HiAdjustmentsHorizontal, HiArrowPath } from 'react-icons/hi2';

interface OverviewHeroProps {
  onRunSeed?: () => void;
  isSeeding?: boolean;
}

export function OverviewHero({ onRunSeed, isSeeding }: OverviewHeroProps) {
  return (
    <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
      <div className="flex flex-col max-w-2xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#285742]" />
          <span className="text-xs tracking-wider uppercase text-[#414943] font-semibold">
            Exam Operations
          </span>
        </div>
        <h1 className="text-[28px] sm:text-[36px] font-semibold text-[#0e1f16] leading-tight tracking-tight">
          A clear view of exam readiness.
        </h1>
        <p className="text-sm sm:text-[15px] text-[#414943] mt-1.5 leading-relaxed">
          Manage schedules, support students, and keep exam planning on track across all administrative branches.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 shrink-0">
        <Link
          href="/admin/schedules"
          className="px-4 py-2.5 rounded-xl h-[46px] bg-[#e4f9e9] hover:bg-[#dff3e4] text-[#0e1f16] border border-[#c0c9c2]/60 text-sm font-medium transition-all shadow-xs flex items-center gap-2"
        >
          <HiAdjustmentsHorizontal className="w-5 h-5 text-[#414943]" />
          <span>Manage exam slots</span>
        </Link>

        {onRunSeed && (
          <button
            type="button"
            onClick={onRunSeed}
            disabled={isSeeding}
            className="px-4 py-2.5 rounded-xl h-[46px] bg-white hover:bg-[#e4f9e9] text-[#0d402c] border border-[#285742] text-sm font-medium transition-all shadow-xs flex items-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            <HiArrowPath className={`w-4 h-4 ${isSeeding ? 'animate-spin' : ''}`} />
            <span>{isSeeding ? 'Seeding...' : 'Run Seed Data'}</span>
          </button>
        )}

        <Link
          href="/admin/students/new"
          className="px-5 py-2.5 rounded-xl h-[46px] bg-[#285742] hover:bg-[#0d402c] text-white text-sm font-medium transition-all shadow-xs flex items-center gap-2 active:scale-[0.99]"
        >
          <HiPlus className="w-5 h-5" />
          <span>Add student</span>
        </Link>
      </div>
    </header>
  );
}
