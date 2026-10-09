'use client';

import React from 'react';
import Link from 'next/link';
import { HiCalendarDays, HiClock, HiArrowRight } from 'react-icons/hi2';
import { UpcomingSlotItem } from '../types';

interface UpcomingExamSlotsCardProps {
  slots?: UpcomingSlotItem[];
}

function formatSlotDate(dateString: string) {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) {
      return { month: 'TBD', day: '--' };
    }
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    const day = d.getDate().toString().padStart(2, '0');
    return { month, day };
  } catch {
    return { month: 'TBD', day: '--' };
  }
}

function formatSlotTimeRange(startsAt: string, endsAt: string) {
  try {
    const s = new Date(startsAt);
    const e = new Date(endsAt);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) {
      return 'Time TBA';
    }
    const startStr = s.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const endStr = e.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${startStr} – ${endStr}`;
  } catch {
    return 'Time TBA';
  }
}

export function UpcomingExamSlotsCard({ slots = [] }: UpcomingExamSlotsCardProps) {
  return (
    <div className="bg-white rounded-[20px] p-6 border border-[#c0c9c2]/50 shadow-xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-[#c0c9c2]/30">
          <div className="flex items-center gap-2.5">
            <HiCalendarDays className="w-5 h-5 text-[#0d402c]" />
            <h2 className="text-[17px] font-semibold text-[#0e1f16]">Upcoming exam slots</h2>
          </div>
          <span className="text-xs text-[#414943] bg-[#e4f9e9] px-2.5 py-0.5 rounded border border-[#c0c9c2]/40 tracking-tight font-medium">
            Asia/Karachi
          </span>
        </div>

        {/* Real Slot Tiles */}
        <div className="mt-4 space-y-3">
          {slots.length > 0 ? (
            slots.slice(0, 4).map((slot) => {
              const { month, day } = formatSlotDate(slot.startsAt);
              const timeRange = formatSlotTimeRange(slot.startsAt, slot.endsAt);

              return (
                <div
                  key={slot.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-[#c0c9c2]/40 hover:border-[#717973] transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-[#e4f9e9] flex flex-col items-center justify-center shrink-0 border border-[#c0c9c2]/40">
                      <span className="text-[10px] uppercase text-[#414943] font-semibold leading-none">
                        {month}
                      </span>
                      <span className="text-base font-semibold text-[#0d402c] leading-tight mt-0.5">
                        {day}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-semibold text-[#0e1f16] truncate">
                        {slot.courseCode} · {slot.courseTitle}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-[#414943]">
                        <span className="flex items-center gap-1">
                          <HiClock className="w-3.5 h-3.5 text-[#717973]" />
                          <span>{timeRange}</span>
                        </span>
                        <span>•</span>
                        <span className="truncate">{slot.department}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-[#0d402c] font-semibold bg-[#d9edde] px-2.5 py-1 rounded-full border border-[#9fd2b7]/50 shrink-0 ml-3">
                    {slot.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center rounded-xl bg-[#e4f9e9]/30 border border-dashed border-[#c0c9c2] text-xs text-[#717973]">
              <p className="font-semibold text-[#0e1f16]">No published exam slots scheduled yet</p>
              <p className="mt-1 text-[#414943]">Exam slots configured in schedules will show here.</p>
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-[#c0c9c2]/20">
        <Link
          href="/admin/schedules"
          className="text-sm font-semibold text-[#0d402c] hover:underline inline-flex items-center gap-1"
        >
          <span>Manage all exam slots</span>
          <HiArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
