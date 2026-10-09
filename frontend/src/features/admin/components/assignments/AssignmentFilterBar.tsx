'use client';

import React from 'react';
import {
  HiMagnifyingGlass,
  HiXMark,
  HiArrowPath,
  HiFunnel,
} from 'react-icons/hi2';
import { StatusFilterType } from './types';

interface AssignmentFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  program: string;
  onProgramChange: (value: string) => void;
  status: StatusFilterType;
  onStatusChange: (status: StatusFilterType) => void;
  onRefresh: () => void;
  loading: boolean;
  programsList?: string[];
}

export function AssignmentFilterBar({
  search,
  onSearchChange,
  program,
  onProgramChange,
  status,
  onStatusChange,
  onRefresh,
  loading,
  programsList = ['BS Computer Science', 'BS Software Engineering', 'BS Data Science', 'BS Artificial Intelligence'],
}: AssignmentFilterBarProps) {
  const statusOptions: { key: StatusFilterType; label: string }[] = [
    { key: 'ALL', label: 'All Students' },
    { key: 'FINALIZED', label: 'Eligible & Finalized (4-6)' },
    { key: 'INCOMPLETE', label: 'Incomplete (<4)' },
    { key: 'UNASSIGNED', label: 'Unassigned (0)' },
  ];

  return (
    <div className="bg-[#FFFFFF] border border-[#DEDCD1] rounded-2xl p-4 shadow-xs space-y-3.5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717973]" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by student name, registration number, CNIC, or email..."
            className="w-full pl-10 pr-9 py-2 bg-[#F7F5EF] border border-[#DEDCD1] rounded-xl text-xs text-[#24352B] placeholder-[#717973] focus:outline-none focus:border-[#285742] focus:bg-white transition-all"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717973] hover:text-[#24352B]"
            >
              <HiXMark className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Program Filter & Refresh */}
        <div className="flex items-center gap-2.5">
          <div className="relative min-w-[200px]">
            <HiFunnel className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#717973] pointer-events-none" />
            <select
              value={program}
              onChange={(e) => onProgramChange(e.target.value)}
              className="w-full pl-8 pr-8 py-2 bg-[#F7F5EF] border border-[#DEDCD1] rounded-xl text-xs text-[#24352B] focus:outline-none focus:border-[#285742] focus:bg-white transition-all appearance-none cursor-pointer"
            >
              <option value="">All Academic Programs</option>
              {programsList.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] text-[#717973]">
              ▼
            </div>
          </div>

          <button
            onClick={onRefresh}
            disabled={loading}
            title="Refresh records"
            className="p-2 border border-[#DEDCD1] bg-[#F7F5EF] hover:bg-[#FFFFFF] text-[#59645B] hover:text-[#0d402c] rounded-xl transition-colors disabled:opacity-50 shrink-0"
          >
            <HiArrowPath className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-t border-[#EAE7DD] pt-3">
        <span className="text-[11px] font-semibold text-[#717973] uppercase tracking-wider mr-1.5 shrink-0">
          Filter:
        </span>
        {statusOptions.map((opt) => {
          const isActive = status === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => onStatusChange(opt.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#285742] text-white shadow-xs'
                  : 'bg-[#F7F5EF] text-[#59645B] hover:bg-[#EAE7DD] hover:text-[#24352B]'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
