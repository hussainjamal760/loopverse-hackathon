'use client';

import React from 'react';
import {
  HiClipboardDocumentCheck,
  HiCheckCircle,
  HiLockClosed,
  HiArrowRight,
  HiExclamationTriangle,
} from 'react-icons/hi2';

export interface AgendaItem {
  courseCode: string;
  courseTitle: string;
  month: string;
  day: string;
  timeText: string;
  location: string;
  isPlanned: boolean;
}

export interface ExamAgendaPanelProps {
  items: AgendaItem[];
  plannedCount: number;
  totalCount: number;
  hasConflict?: boolean;
  onOpenReview: () => void;
}

export function ExamAgendaPanel({
  items,
  plannedCount,
  totalCount,
  hasConflict = false,
  onOpenReview,
}: ExamAgendaPanelProps) {
  const isAllPlanned = plannedCount === totalCount && !hasConflict;

  return (
    <div className="bg-[#FFFFFF] border border-[#DEDCD1] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col gap-5 sticky top-[92px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-[#DEDCD1]/60">
        <div>
          <h2 className="text-lg font-semibold text-[#24352B] tracking-tight">
            Your exam agenda
          </h2>
          <span className="text-xs text-[#59645B]">
            {plannedCount} of {totalCount} courses planned
          </span>
        </div>
        <div className="w-8 h-8 rounded-lg bg-[#E7EEE3] text-[#285742] flex items-center justify-center">
          <HiClipboardDocumentCheck className="w-5 h-5" />
        </div>
      </div>

      {/* Chronological List of Tiles */}
      <div className="flex flex-col gap-2.5">
        {items.map((item) => (
          <div
            key={item.courseCode}
            className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
              item.isPlanned
                ? 'bg-[#F7F5EF] border-[#DEDCD1]'
                : 'bg-[#F0EEE6]/60 border-dashed border-[#DEDCD1] opacity-75'
            }`}
          >
            {/* Date Tile */}
            <div
              className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 border ${
                item.isPlanned
                  ? 'bg-[#E7EEE3] text-[#285742] border-[#285742]/20'
                  : 'bg-[#FFFFFF] text-[#59645B] border-[#DEDCD1]'
              }`}
            >
              <span className="text-[10px] uppercase font-bold leading-none">
                {item.month}
              </span>
              <span className="text-base font-bold leading-tight mt-0.5">
                {item.day}
              </span>
            </div>

            {/* Course & Slot Info */}
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-xs font-bold text-[#285742]">
                  {item.courseCode}
                </span>
                <span className="text-[#59645B] text-xs">·</span>
                <span className="text-xs text-[#24352B] truncate font-medium">
                  {item.courseTitle}
                </span>
              </div>
              <span className="text-[11px] text-[#59645B] mt-0.5">
                {item.isPlanned
                  ? `${item.timeText} · ${item.location}`
                  : 'Choose a time to complete plan.'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Conflict / Overlap Alert Badge */}
      {hasConflict ? (
        <div className="p-3 rounded-xl bg-[#FAEAE7] border border-[#A3342F]/30 flex items-center gap-2.5 text-[#A3342F] text-xs">
          <HiExclamationTriangle className="w-5 h-5 shrink-0 text-[#A3342F]" />
          <span className="font-medium">
            Schedule conflict detected. Adjust overlapping slots.
          </span>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-[#E7EEE3] border border-[#285742]/20 flex items-center gap-2 text-[#285742] text-xs">
          <HiCheckCircle className="w-4 h-4 shrink-0 text-[#285742]" />
          <span className="font-medium">
            No overlapping exams in your current choices.
          </span>
        </div>
      )}

      {/* Notice Box */}
      <div className="bg-[#F7F5EF] p-4 rounded-xl border border-[#DEDCD1] flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-[#285742] text-xs font-semibold">
          <HiLockClosed className="w-4 h-4" />
          <span>Save once, plan carefully.</span>
        </div>
        <p className="text-xs text-[#59645B] leading-relaxed">
          After saving, changes require academic administrator approval. Please review all dates thoroughly.
        </p>
      </div>

      {/* Full-width Review CTA */}
      <div className="flex flex-col gap-1.5 pt-1">
        <button
          type="button"
          disabled={!isAllPlanned}
          onClick={onOpenReview}
          className={`w-full h-12 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs ${
            isAllPlanned
              ? 'bg-[#285742] hover:bg-[#204735] text-white cursor-pointer'
              : 'bg-[#F0EEE6] text-[#59645B] cursor-not-allowed border border-[#DEDCD1]'
          }`}
        >
          <span>Review date sheet</span>
          <HiArrowRight className="w-4 h-4" />
        </button>

        <span className="text-[11px] text-[#59645B] text-center">
          {isAllPlanned
            ? `All ${totalCount} courses scheduled. Ready to finalize.`
            : `Select a time for all courses to continue.`}
        </span>
      </div>
    </div>
  );
}
