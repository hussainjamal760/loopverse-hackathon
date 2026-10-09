'use client';

import React from 'react';
import { HiMagnifyingGlass, HiFunnel, HiXMark } from 'react-icons/hi2';

interface RequestFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedStatus: 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';
  onStatusChange: (status: 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED') => void;
  selectedType: 'ALL' | 'BRANCH' | 'DATE_SHEET';
  onTypeChange: (type: 'ALL' | 'BRANCH' | 'DATE_SHEET') => void;
  counts?: {
    ALL: number;
    PENDING: number;
    APPROVED: number;
    REJECTED: number;
  };
}

export function RequestFilterBar({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedType,
  onTypeChange,
  counts = { ALL: 0, PENDING: 0, APPROVED: 0, REJECTED: 0 },
}: RequestFilterBarProps) {
  const statusTabs: Array<{
    id: 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';
    label: string;
    count: number;
  }> = [
    { id: 'ALL', label: 'All Requests', count: counts.ALL },
    { id: 'PENDING', label: 'Pending', count: counts.PENDING },
    { id: 'APPROVED', label: 'Approved', count: counts.APPROVED },
    { id: 'REJECTED', label: 'Rejected', count: counts.REJECTED },
  ];

  return (
    <div className="bg-white rounded-[20px] p-4 sm:p-5 border border-[#c0c9c2]/50 shadow-xs flex flex-col gap-4">
      {/* Top row: Status Tabs & Type Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {statusTabs.map((tab) => {
            const isActive = selectedStatus === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onStatusChange(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#285742] text-white shadow-xs'
                    : 'bg-[#f4f3ef] text-[#414943] hover:bg-[#e4f9e9] hover:text-[#0e1f16]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-[#c0c9c2]/30 text-[#414943]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right side: Type Select */}
        <div className="flex items-center gap-2 self-start lg:self-auto">
          <div className="flex items-center gap-1.5 text-xs text-[#414943] font-semibold">
            <HiFunnel className="w-4 h-4 text-[#285742]" />
            <span>Type:</span>
          </div>
          <select
            value={selectedType}
            onChange={(e) =>
              onTypeChange(e.target.value as 'ALL' | 'BRANCH' | 'DATE_SHEET')
            }
            className="bg-[#f4f3ef] border border-[#c0c9c2]/50 text-[#0e1f16] text-xs font-medium rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#285742]/20 cursor-pointer"
          >
            <option value="ALL">All Types</option>
            <option value="BRANCH">Branch Change</option>
            <option value="DATE_SHEET">Date Sheet Change</option>
          </select>
        </div>
      </div>

      {/* Bottom row: Search Input */}
      <div className="relative w-full">
        <HiMagnifyingGlass className="w-4 h-4 text-[#717973] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search requests by student name, registration number, or reason..."
          className="w-full bg-[#f4f3ef] border border-[#c0c9c2]/50 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-[#0e1f16] placeholder-[#717973] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#285742]/20 focus:border-[#285742] transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717973] hover:text-[#0e1f16] p-1"
          >
            <HiXMark className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
