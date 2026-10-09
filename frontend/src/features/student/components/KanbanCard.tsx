'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  HiCalendar,
  HiCheckCircle,
  HiMapPin,
  HiBars2,
} from 'react-icons/hi2';
import type { KanbanCourse } from './StudentKanbanBoard';

interface KanbanCardProps {
  course: KanbanCourse;
  isLocked?: boolean;
  isDragging?: boolean;
  onSelectSlot: (courseCode: string, slotId: string) => void;
  onDragStart: (e: React.DragEvent, courseCode: string) => void;
  onDragEnd: () => void;
}

export function KanbanCard({
  course,
  isLocked = false,
  isDragging = false,
  onSelectSlot,
  onDragStart,
  onDragEnd,
}: KanbanCardProps) {
  const isScheduled = course.status === 'SCHEDULED';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isDragging ? 0.4 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      draggable={!isLocked}
      onDragStart={(e: any) => onDragStart(e as React.DragEvent, course.code)}
      onDragEnd={onDragEnd}
      className={`group relative bg-[#FFFFFF] rounded-xl p-4 shadow-xs border transition-all duration-200 select-none ${
        isLocked
          ? 'border-[#DEDCD1] cursor-default'
          : isScheduled
          ? 'border-[#285742]/30 hover:border-[#285742] hover:shadow-md cursor-grab active:cursor-grabbing'
          : 'border-[#DEDCD1] hover:border-[#795D18] hover:shadow-md cursor-grab active:cursor-grabbing'
      } ${isDragging ? 'ring-2 ring-[#285742] ring-offset-1 scale-[1.02]' : ''}`}
    >
      {/* Drag Indicator Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {!isLocked && (
            <div
              className="text-[#9BA39B] group-hover:text-[#24352B] transition-colors p-0.5 rounded"
              title="Drag card to move between columns"
            >
              <HiBars2 className="w-4 h-4" />
            </div>
          )}
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-md ${
              isScheduled
                ? 'text-[#285742] bg-[#E7EEE3]'
                : 'text-[#795D18] bg-[#F5EDCE]'
            }`}
          >
            {course.code}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-medium text-[#59645B]">
            {course.creditHours} Cr
          </span>
          {isScheduled && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#285742]">
              <HiCheckCircle className="w-3.5 h-3.5" />
              <span>Slotted</span>
            </span>
          )}
        </div>
      </div>

      {/* Course Title & Date */}
      <div className="mb-3">
        <h4 className="text-sm font-semibold text-[#24352B] leading-snug">
          {course.title}
        </h4>
        <div className="flex items-center gap-1.5 text-xs text-[#59645B] mt-1">
          <HiCalendar className="w-3.5 h-3.5 text-[#285742]" />
          <span>{course.examDate}</span>
        </div>
      </div>

      {/* Conditional Content based on status */}
      {isScheduled ? (
        <div className="bg-[#E7EEE3]/60 p-2.5 rounded-lg border border-[#285742]/20 flex flex-col gap-0.5">
          <div className="text-xs font-semibold text-[#285742]">
            {course.selectedSlotTime}
          </div>
          <div className="text-[11px] text-[#59645B] flex items-center gap-1">
            <HiMapPin className="w-3 h-3 text-[#59645B]" />
            <span className="truncate">{course.selectedHall}</span>
          </div>
        </div>
      ) : (
        /* Slot selection options for unscheduled card */
        <div className="flex flex-col gap-1.5 pt-1">
          <span className="text-[10px] uppercase font-bold text-[#59645B] tracking-wider">
            Select Slot:
          </span>
          {course.availableSlots.map((slot) => (
            <button
              key={slot.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectSlot(course.code, slot.id);
              }}
              className="w-full text-left p-2 rounded-lg bg-[#F7F5EF] hover:bg-[#E7EEE3] border border-[#DEDCD1] hover:border-[#285742]/30 text-xs transition-colors flex items-center justify-between cursor-pointer"
            >
              <span className="font-semibold text-[#24352B]">{slot.time}</span>
              <span className="text-[10px] text-[#59645B]">{slot.seats}</span>
            </button>
          ))}
        </div>
      )}

      {/* Drag tooltip indicator */}
      {!isLocked && (
        <div className="mt-2.5 text-[10px] text-[#8C968E] flex items-center justify-between border-t border-[#F0EEE6] pt-1.5">
          <span>{isScheduled ? '⇄ Drag left to unschedule' : '⇄ Drag right to schedule'}</span>
          <span className="font-semibold text-[#285742]">Drag & Drop</span>
        </div>
      )}
    </motion.div>
  );
}
