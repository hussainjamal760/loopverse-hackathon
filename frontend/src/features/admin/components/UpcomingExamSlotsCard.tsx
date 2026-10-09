'use client';

import React from 'react';
import Link from 'next/link';
import { HiCalendarDays, HiClock, HiArrowRight } from 'react-icons/hi2';

export function UpcomingExamSlotsCard() {
  const slots = [
    {
      id: '1',
      day: '12',
      month: 'Nov',
      courseCode: 'CS101',
      courseTitle: 'Introduction to Computing',
      time: '9:00 – 10:30 AM',
      location: 'Hall A (Cap: 80)',
      status: 'Published',
    },
    {
      id: '2',
      day: '12',
      month: 'Nov',
      courseCode: 'MTH101',
      courseTitle: 'Calculus & Analytical Geom',
      time: '11:00 AM – 12:30 PM',
      location: 'Hall B (Cap: 65)',
      status: 'Published',
    },
    {
      id: '3',
      day: '13',
      month: 'Nov',
      courseCode: 'ENG101',
      courseTitle: 'English Composition & Writing',
      time: '9:00 – 10:30 AM',
      location: 'Hall A & C (Cap: 110)',
      status: 'Published',
    },
  ];

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

        {/* 3 published slot tiles */}
        <div className="mt-4 space-y-3">
          {slots.map((slot) => (
            <div
              key={slot.id}
              className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-[#c0c9c2]/40 hover:border-[#717973] transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-lg bg-[#e4f9e9] flex flex-col items-center justify-center shrink-0 border border-[#c0c9c2]/40">
                  <span className="text-[10px] uppercase text-[#414943] font-semibold leading-none">
                    {slot.month}
                  </span>
                  <span className="text-base font-semibold text-[#0d402c] leading-tight mt-0.5">
                    {slot.day}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-semibold text-[#0e1f16] truncate">
                    {slot.courseCode} · {slot.courseTitle}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-[#414943]">
                    <span className="flex items-center gap-1">
                      <HiClock className="w-3.5 h-3.5 text-[#717973]" />
                      <span>{slot.time}</span>
                    </span>
                    <span>•</span>
                    <span>{slot.location}</span>
                  </div>
                </div>
              </div>
              <span className="text-xs text-[#0d402c] font-semibold bg-[#d9edde] px-2.5 py-1 rounded-full border border-[#9fd2b7]/50 shrink-0 ml-3">
                {slot.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-[#c0c9c2]/20">
        <Link
          href="/admin/schedules"
          className="text-sm font-semibold text-[#0d402c] hover:underline inline-flex items-center gap-1"
        >
          <span>Manage all slots</span>
          <HiArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
