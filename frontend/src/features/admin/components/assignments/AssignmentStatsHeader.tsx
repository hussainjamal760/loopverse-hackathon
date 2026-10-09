'use client';

import React from 'react';
import {
  HiUsers,
  HiCheckBadge,
  HiExclamationTriangle,
  HiNoSymbol,
} from 'react-icons/hi2';
import { AssignmentStats } from './types';

interface AssignmentStatsHeaderProps {
  stats: AssignmentStats;
  loading?: boolean;
}

export function AssignmentStatsHeader({ stats, loading = false }: AssignmentStatsHeaderProps) {
  const cards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      description: 'Active cohort roster',
      icon: HiUsers,
      color: 'text-[#285742]',
      bg: 'bg-[#E7EEE3]',
      border: 'border-[#285742]/20',
    },
    {
      title: 'Eligible & Finalized',
      value: stats.finalizedCount,
      percentage: stats.totalStudents > 0 ? ((stats.finalizedCount / stats.totalStudents) * 100).toFixed(1) : '0',
      description: 'Ready to generate date sheet (4-6 courses)',
      icon: HiCheckBadge,
      color: 'text-[#1e613b]',
      bg: 'bg-[#ddf2e4]',
      border: 'border-[#1e613b]/25',
    },
    {
      title: 'Incomplete (<4 Courses)',
      value: stats.incompleteCount,
      percentage: stats.totalStudents > 0 ? ((stats.incompleteCount / stats.totalStudents) * 100).toFixed(1) : '0',
      description: 'Requires additional courses',
      icon: HiExclamationTriangle,
      color: 'text-[#854d0e]',
      bg: 'bg-[#fef9c3]',
      border: 'border-[#ca8a04]/30',
    },
    {
      title: 'Unassigned (0 Courses)',
      value: stats.unassignedCount,
      percentage: stats.totalStudents > 0 ? ((stats.unassignedCount / stats.totalStudents) * 100).toFixed(1) : '0',
      description: 'Pending semester enrollment',
      icon: HiNoSymbol,
      color: 'text-[#991b1b]',
      bg: 'bg-[#fee2e2]',
      border: 'border-[#ef4444]/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <div
            key={idx}
            className="bg-[#FFFFFF] border border-[#DEDCD1] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#59645B]">
                  {c.title}
                </p>
                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="font-serif text-2xl sm:text-3xl font-bold text-[#24352B]">
                    {loading ? '...' : c.value}
                  </span>
                  {c.percentage && !loading && (
                    <span className="text-xs font-medium text-[#59645B]">
                      ({c.percentage}%)
                    </span>
                  )}
                </div>
              </div>
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${c.bg} ${c.color} ${c.border}`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <p className="text-[11px] text-[#59645B] mt-3 border-t border-[#EAE7DD] pt-2.5">
              {c.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
