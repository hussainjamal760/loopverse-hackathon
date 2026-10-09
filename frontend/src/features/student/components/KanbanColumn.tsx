'use client';

import React from 'react';
import { HiArrowDownOnSquare } from 'react-icons/hi2';

interface KanbanColumnProps {
  id: 'UNSCHEDULED' | 'SCHEDULED' | 'LOCKED';
  title: string;
  dotColorClass: string;
  badgeBgClass: string;
  badgeTextClass: string;
  count: number;
  isLocked?: boolean;
  isTargetActive?: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  emptyStateIcon: React.ReactNode;
  emptyStateTitle: string;
  emptyStateSub: string;
  children: React.ReactNode;
}

export function KanbanColumn({
  id,
  title,
  dotColorClass,
  badgeBgClass,
  badgeTextClass,
  count,
  isLocked = false,
  isTargetActive = false,
  onDragOver,
  onDragLeave,
  onDrop,
  emptyStateIcon,
  emptyStateTitle,
  emptyStateSub,
  children,
}: KanbanColumnProps) {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`relative bg-[#F7F5EF] border rounded-2xl p-4 flex flex-col gap-3 min-h-[420px] transition-all duration-200 ${
        isTargetActive
          ? id === 'SCHEDULED'
            ? 'border-[#285742] bg-[#E7EEE3]/50 ring-2 ring-[#285742]/40 shadow-md'
            : id === 'UNSCHEDULED'
            ? 'border-[#795D18] bg-[#F5EDCE]/40 ring-2 ring-[#795D18]/40 shadow-md'
            : 'border-[#59645B] bg-[#EAE8E0]'
          : 'border-[#DEDCD1]'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#DEDCD1]">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${dotColorClass}`} />
          <h3 className="text-xs uppercase font-bold text-[#24352B] tracking-wider">
            {title}
          </h3>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${badgeBgClass} ${badgeTextClass}`}
        >
          {count}
        </span>
      </div>

      {/* Drop overlay active indicator */}
      {isTargetActive && !isLocked && (
        <div className="absolute inset-x-2 top-12 bottom-2 z-10 bg-[#FFFFFF]/90 backdrop-blur-xs border-2 border-dashed border-[#285742] rounded-xl flex flex-col items-center justify-center gap-2 text-center p-4 animate-fade-in pointer-events-none">
          <HiArrowDownOnSquare className="w-8 h-8 text-[#285742] animate-bounce" />
          <p className="text-sm font-bold text-[#24352B]">
            Drop course card here
          </p>
          <p className="text-xs text-[#59645B]">
            {id === 'SCHEDULED'
              ? 'Will auto-assign available exam slot'
              : id === 'UNSCHEDULED'
              ? 'Will move course back to unscheduled pool'
              : 'Date sheet locked'}
          </p>
        </div>
      )}

      {/* Column Content */}
      {count === 0 ? (
        <div className="my-auto py-10 text-center text-xs text-[#59645B] border border-dashed border-[#DEDCD1] rounded-xl bg-[#FFFFFF]/60 p-5 flex flex-col items-center justify-center gap-1.5">
          {emptyStateIcon}
          <p className="font-semibold text-[#24352B] mt-1">{emptyStateTitle}</p>
          <p className="text-[11px] text-[#59645B] max-w-[200px]">
            {emptyStateSub}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 flex-1">{children}</div>
      )}
    </div>
  );
}
