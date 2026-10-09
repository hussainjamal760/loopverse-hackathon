'use client';

import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  HiClock,
  HiCheckCircle,
  HiLockClosed,
  HiCursorArrowRays,
  HiClipboardDocumentCheck,
  HiExclamationTriangle,
  HiArrowRight,
} from 'react-icons/hi2';
import { toast } from 'sonner';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';

export interface KanbanCourse {
  code: string;
  title: string;
  creditHours: number;
  examDate: string;
  selectedSlotTime: string | null;
  selectedHall: string | null;
  status: 'UNSCHEDULED' | 'SCHEDULED' | 'LOCKED';
  availableSlots: Array<{
    id: string;
    time: string;
    location: string;
    seats: string;
  }>;
}

interface StudentKanbanBoardProps {
  courses: KanbanCourse[];
  onSelectSlot: (courseCode: string, slotId: string) => void;
  isDateSheetLocked?: boolean;
  onSaveDateSheet?: () => void;
  hasConflict?: boolean;
}

export function StudentKanbanBoard({
  courses,
  onSelectSlot,
  isDateSheetLocked = false,
  onSaveDateSheet,
  hasConflict = false,
}: StudentKanbanBoardProps) {
  const [draggedCourseCode, setDraggedCourseCode] = useState<string | null>(null);
  const [activeTargetColumn, setActiveTargetColumn] = useState<
    'UNSCHEDULED' | 'SCHEDULED' | 'LOCKED' | null
  >(null);

  // Group courses by current status
  const unscheduledCourses = courses.filter(
    (c) => c.status === 'UNSCHEDULED' && !isDateSheetLocked
  );
  const scheduledCourses = courses.filter(
    (c) => c.status === 'SCHEDULED' && !isDateSheetLocked
  );
  const lockedCourses = isDateSheetLocked ? courses : [];

  const isAllScheduled = courses.length > 0 && unscheduledCourses.length === 0;
  const canSave = isAllScheduled && !hasConflict && !isDateSheetLocked;

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent, courseCode: string) => {
    if (isDateSheetLocked) return;
    setDraggedCourseCode(courseCode);
    e.dataTransfer.setData('text/plain', courseCode);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedCourseCode(null);
    setActiveTargetColumn(null);
  };

  const handleDragOver = (
    e: React.DragEvent,
    targetCol: 'UNSCHEDULED' | 'SCHEDULED' | 'LOCKED'
  ) => {
    e.preventDefault();
    if (isDateSheetLocked) return;
    e.dataTransfer.dropEffect = 'move';
    if (activeTargetColumn !== targetCol) {
      setActiveTargetColumn(targetCol);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setActiveTargetColumn(null);
    }
  };

  const handleDrop = (
    e: React.DragEvent,
    targetCol: 'UNSCHEDULED' | 'SCHEDULED' | 'LOCKED'
  ) => {
    e.preventDefault();
    setActiveTargetColumn(null);
    const code = e.dataTransfer.getData('text/plain') || draggedCourseCode;
    setDraggedCourseCode(null);

    if (!code || isDateSheetLocked) return;

    const targetCourse = courses.find((c) => c.code === code);
    if (!targetCourse) return;

    if (targetCol === 'SCHEDULED') {
      if (targetCourse.status === 'SCHEDULED') {
        toast.info(`${targetCourse.code} is already scheduled.`);
        return;
      }
      // Assign default first slot if unscheduled
      const defaultSlot = targetCourse.availableSlots[0];
      if (defaultSlot) {
        onSelectSlot(targetCourse.code, defaultSlot.id);
        toast.success(`Scheduled ${targetCourse.code} (${defaultSlot.time}) via Drag & Drop!`);
      }
    } else if (targetCol === 'UNSCHEDULED') {
      if (targetCourse.status === 'UNSCHEDULED') {
        return;
      }
      onSelectSlot(targetCourse.code, '');
      toast.info(`Unscheduled ${targetCourse.code}. Moved back to To Schedule column.`);
    } else if (targetCol === 'LOCKED') {
      if (hasConflict) {
        toast.error('Cannot lock: Please resolve exam timetable conflicts first.');
        return;
      }

      if (canSave && onSaveDateSheet) {
        onSaveDateSheet();
      } else {
        toast.info(
          `Schedule all ${courses.length} courses first to lock and finalize your date sheet.`
        );
      }
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Board Header Intro with Save Date Sheet Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DEDCD1]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-[#24352B]">
              Exam Planning Kanban Board
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-[#285742] bg-[#E7EEE3] px-2.5 py-0.5 rounded-full border border-[#285742]/20">
              <HiCursorArrowRays className="w-3.5 h-3.5" />
              <span>Drag & Drop Enabled</span>
            </span>
          </div>
          <p className="text-xs text-[#59645B] mt-0.5">
            Drag course cards between columns to manage exam scheduling interactively.
          </p>
        </div>

        {/* Prominent Save Date Sheet Button in Header */}
        <div className="flex items-center gap-3">
          {onSaveDateSheet && !isDateSheetLocked && (
            <button
              type="button"
              disabled={!canSave}
              onClick={onSaveDateSheet}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-colors shadow-xs ${
                canSave
                  ? 'bg-[#285742] hover:bg-[#204735] text-white cursor-pointer'
                  : 'bg-[#F0EEE6] text-[#59645B] cursor-not-allowed border border-[#DEDCD1]'
              }`}
            >
              <HiClipboardDocumentCheck className="w-4 h-4" />
              <span>Save Date Sheet</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-2 text-xs text-[#59645B]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#285742] animate-pulse" />
            <span>{scheduledCourses.length} of {courses.length} scheduled</span>
          </div>
        </div>
      </div>

      {/* Conflict Alert Banner if any */}
      {hasConflict && (
        <div className="p-3.5 rounded-xl bg-[#FAEAE7] border border-[#A3342F]/30 flex items-center gap-2.5 text-[#A3342F] text-xs">
          <HiExclamationTriangle className="w-5 h-5 shrink-0" />
          <span className="font-medium">
            Schedule Conflict: Two or more exams share an overlapping time. Adjust slots to enable saving.
          </span>
        </div>
      )}

      {/* 3-Column Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        {/* Column 1: To Schedule */}
        <KanbanColumn
          id="UNSCHEDULED"
          title="To Schedule"
          dotColorClass="bg-[#795D18]"
          badgeBgClass="bg-[#F5EDCE]"
          badgeTextClass="text-[#795D18] border-[#795D18]/20"
          count={unscheduledCourses.length}
          isLocked={isDateSheetLocked}
          isTargetActive={activeTargetColumn === 'UNSCHEDULED'}
          onDragOver={(e) => handleDragOver(e, 'UNSCHEDULED')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'UNSCHEDULED')}
          emptyStateIcon={<HiCheckCircle className="w-7 h-7 text-[#285742]" />}
          emptyStateTitle="All courses slotted"
          emptyStateSub="No unscheduled exams remaining. All courses are in your agenda."
        >
          <AnimatePresence mode="popLayout">
            {unscheduledCourses.map((course) => (
              <KanbanCard
                key={course.code}
                course={course}
                isLocked={isDateSheetLocked}
                isDragging={draggedCourseCode === course.code}
                onSelectSlot={onSelectSlot}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              />
            ))}
          </AnimatePresence>
        </KanbanColumn>

        {/* Column 2: Scheduled / In Agenda */}
        <KanbanColumn
          id="SCHEDULED"
          title="Scheduled / In Agenda"
          dotColorClass="bg-[#285742]"
          badgeBgClass="bg-[#E7EEE3]"
          badgeTextClass="text-[#285742] border-[#285742]/20"
          count={scheduledCourses.length}
          isLocked={isDateSheetLocked}
          isTargetActive={activeTargetColumn === 'SCHEDULED'}
          onDragOver={(e) => handleDragOver(e, 'SCHEDULED')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'SCHEDULED')}
          emptyStateIcon={<HiClock className="w-7 h-7 text-[#795D18]" />}
          emptyStateTitle="No exams selected yet"
          emptyStateSub="Drag course cards here from 'To Schedule' or pick slot options."
        >
          <AnimatePresence mode="popLayout">
            {scheduledCourses.map((course) => (
              <KanbanCard
                key={course.code}
                course={course}
                isLocked={isDateSheetLocked}
                isDragging={draggedCourseCode === course.code}
                onSelectSlot={onSelectSlot}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              />
            ))}
          </AnimatePresence>
        </KanbanColumn>

        {/* Column 3: Saved & Finalized */}
        <KanbanColumn
          id="LOCKED"
          title="Saved & Finalized"
          dotColorClass="bg-[#59645B]"
          badgeBgClass="bg-[#F0EEE6]"
          badgeTextClass="text-[#59645B] border-[#DEDCD1]"
          count={lockedCourses.length}
          isLocked={isDateSheetLocked}
          isTargetActive={activeTargetColumn === 'LOCKED'}
          onDragOver={(e) => handleDragOver(e, 'LOCKED')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'LOCKED')}
          emptyStateIcon={<HiLockClosed className="w-7 h-7 text-[#59645B]" />}
          emptyStateTitle={isAllScheduled ? 'Ready to Lock' : 'Draft Mode'}
          emptyStateSub={
            isAllScheduled
              ? 'All courses scheduled! Click the save button below or drag here to confirm.'
              : `Schedule all courses to finalize your date sheet (${scheduledCourses.length}/${courses.length} ready).`
          }
        >
          {/* Action Card inside Column 3 when all scheduled */}
          {!isDateSheetLocked && isAllScheduled && onSaveDateSheet && (
            <div className="p-4 rounded-xl bg-[#E7EEE3] border border-[#285742] flex flex-col gap-2.5 mb-3 shadow-xs">
              <div className="flex items-center gap-2 text-[#285742] font-semibold text-xs">
                <HiCheckCircle className="w-5 h-5 shrink-0" />
                <span>All {courses.length} courses scheduled!</span>
              </div>
              <p className="text-[11px] text-[#24352B] leading-relaxed">
                You have chosen dates and times for all assigned courses. Save your date sheet now.
              </p>
              <button
                type="button"
                onClick={onSaveDateSheet}
                className="w-full py-2.5 rounded-xl bg-[#285742] hover:bg-[#204735] text-white text-xs font-semibold inline-flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                <HiClipboardDocumentCheck className="w-4 h-4" />
                <span>Save Date Sheet</span>
              </button>
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {lockedCourses.map((course) => (
              <KanbanCard
                key={course.code}
                course={course}
                isLocked={true}
                isDragging={false}
                onSelectSlot={onSelectSlot}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              />
            ))}
          </AnimatePresence>
        </KanbanColumn>
      </div>

      {/* Bottom Sticky Action Bar in Kanban Mode */}
      {!isDateSheetLocked && onSaveDateSheet && (
        <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#DEDCD1] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                canSave
                  ? 'bg-[#E7EEE3] text-[#285742]'
                  : 'bg-[#F0EEE6] text-[#59645B]'
              }`}
            >
              {scheduledCourses.length}/{courses.length}
            </div>
            <div>
              <div className="text-xs font-semibold text-[#24352B]">
                {canSave
                  ? 'Ready to confirm exam schedule'
                  : `Please schedule remaining ${courses.length - scheduledCourses.length} course(s)`}
              </div>
              <div className="text-[11px] text-[#59645B]">
                {hasConflict
                  ? 'Overlapping exam times detected. Resolve conflicts to proceed.'
                  : canSave
                  ? 'Click "Save Date Sheet" to review and lock your timetable in database.'
                  : 'Drag unscheduled cards to the center column or choose available time slots.'}
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={!canSave}
            onClick={onSaveDateSheet}
            className={`px-6 py-3 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors shadow-xs ${
              canSave
                ? 'bg-[#285742] hover:bg-[#204735] text-white cursor-pointer'
                : 'bg-[#F0EEE6] text-[#59645B] cursor-not-allowed border border-[#DEDCD1]'
            }`}
          >
            <HiClipboardDocumentCheck className="w-4 h-4" />
            <span>Save Date Sheet</span>
            <HiArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
