'use client';

import React from 'react';
import {
  HiCheckCircle,
  HiCalendar,
  HiClock,
  HiInformationCircle,
} from 'react-icons/hi2';

export interface CourseSlot {
  id: string;
  time: string;
  location: string;
  seatsText: string;
  selected?: boolean;
}

export interface CourseCardProps {
  courseCode: string;
  title: string;
  creditHours: number;
  examDate: string;
  slots: CourseSlot[];
  selectedSlotId: string | null;
  onSelectSlot: (slotId: string) => void;
  helperText?: string;
}

export function CourseCard({
  courseCode,
  title,
  creditHours,
  examDate,
  slots,
  selectedSlotId,
  onSelectSlot,
  helperText,
}: CourseCardProps) {
  const isSelected = Boolean(selectedSlotId);

  return (
    <div className="bg-[#FFFFFF] border border-[#DEDCD1] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col gap-4 transition-shadow">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold text-[#285742]">
              {courseCode}
            </span>
            <span className="text-[#59645B]">·</span>
            <span className="text-xs text-[#59645B]">{creditHours} credit hours</span>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-[#24352B] mt-0.5">
            {title}
          </h3>
        </div>

        {isSelected ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7EEE3] text-[#285742] text-xs font-semibold self-start sm:self-auto border border-[#285742]/20">
            <HiCheckCircle className="w-4 h-4 text-[#285742]" />
            <span>Selected</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5EDCE] text-[#795D18] text-xs font-semibold self-start sm:self-auto border border-[#795D18]/20">
            <HiClock className="w-4 h-4 text-[#795D18]" />
            <span>Choose a time</span>
          </span>
        )}
      </div>

      {/* Date Pill */}
      <div className="flex items-center gap-2 text-xs font-medium text-[#24352B] py-0.5">
        <HiCalendar className="w-4 h-4 text-[#285742]" />
        <span>{examDate}</span>
      </div>

      {/* Slot Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {slots.map((slot) => {
          const isSlotActive = selectedSlotId === slot.id;

          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => onSelectSlot(slot.id)}
              className={`w-full text-left p-4 rounded-xl flex items-center justify-between border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#285742] ${
                isSlotActive
                  ? 'bg-[#E7EEE3] border-[#285742] shadow-xs'
                  : 'bg-[#F7F5EF] hover:bg-[#F0EEE6] border-[#DEDCD1] opacity-90'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                    isSlotActive
                      ? 'text-[#285742]'
                      : 'text-[#7B8578] border border-[#7B8578]'
                  }`}
                >
                  {isSlotActive ? (
                    <HiCheckCircle className="w-5 h-5 text-[#285742]" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-transparent" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span
                    className={`text-sm font-semibold ${
                      isSlotActive ? 'text-[#285742]' : 'text-[#24352B]'
                    }`}
                  >
                    {slot.time}
                  </span>
                  <span className="text-xs text-[#59645B] mt-0.5">
                    {slot.location}
                  </span>
                </div>
              </div>

              <span
                className={`text-xs font-medium ${
                  isSlotActive ? 'text-[#285742] font-semibold' : 'text-[#59645B]'
                }`}
              >
                {isSlotActive ? 'Selected' : slot.seatsText}
              </span>
            </button>
          );
        })}
      </div>

      {helperText && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#F0EEE6] text-[#59645B] text-xs">
          <HiInformationCircle className="w-4 h-4 text-[#285742] shrink-0" />
          <span>{helperText}</span>
        </div>
      )}
    </div>
  );
}
