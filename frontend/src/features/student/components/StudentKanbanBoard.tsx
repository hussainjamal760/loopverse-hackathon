'use client';

import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  HiClock,
  HiCheckCircle,
  HiLockClosed,
  HiCursorArrowRays,
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
}

export function StudentKanbanBoard({
  courses,
  onSelectSlot,
  isDateSheetLocked = false,
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
    // Only clear target if moving outside container boundaries
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
      toast.warning(
        'Date sheet must be reviewed & confirmed in the planner before locking final schedule.'
      );
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Board Header Intro */}
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

        <div className="flex items-center gap-2 text-xs text-[#59645B]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#285742] animate-pulse" />
          <span>Live drag & drop sync active</span>
        </div>
      </div>

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
          emptyStateTitle="Draft Mode"
          emptyStateSub="Complete all course times and click 'Review date sheet' in the planner to lock your final schedule."
        >
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
    </div>
  );
}
