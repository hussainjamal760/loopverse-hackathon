'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiCalendarDays,
  HiIdentification,
  HiQuestionMarkCircle,
  HiArrowRightOnRectangle,
  HiLockClosed,
  HiLockOpen,
} from 'react-icons/hi2';

interface StudentSidebarProps {
  studentName?: string;
  registrationNumber?: string;
  program?: string;
  pendingRequestsCount?: number;
}

export function StudentSidebar({
  studentName = 'Student',
  registrationNumber = '',
  program: _program = 'Degree Program',
  pendingRequestsCount = 0,
}: StudentSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  const isExpanded = isHovered || isPinned;

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.push('/login');
    }
  };

  const navItems = [
    {
      label: 'Exam Planner',
      sublabel: 'Timetable & Date Sheet',
      href: '/student/planner',
      icon: HiCalendarDays,
    },
    {
      label: 'Student Profile',
      sublabel: 'Verified Academic Record',
      href: '/student/profile',
      icon: HiIdentification,
    },
    {
      label: 'Need Help / Requests',
      sublabel: 'Branch & Timetable Changes',
      href: '/student/help',
      icon: HiQuestionMarkCircle,
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined,
    },
  ];

  const initials = studentName
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'ST';

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed left-0 top-0 h-full z-50 bg-[#FFFFFF] border-r border-[#DEDCD1] flex flex-col justify-between select-none transition-all duration-300 ease-in-out shadow-sm print:hidden ${
        isExpanded ? 'w-[240px]' : 'w-[68px]'
      }`}
    >
      <div className="flex flex-col flex-1 min-h-0">
        {/* Header Branding */}
        <div className="px-3.5 pt-4 pb-3 border-b border-[#DEDCD1] flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Logo Mark */}
            <div className="w-9 h-9 rounded-xl bg-[#E7EEE3] text-[#285742] flex items-center justify-center font-bold text-sm border border-[#285742]/20 shadow-xs shrink-0">
              <HiCalendarDays className="w-5 h-5 text-[#285742]" />
            </div>

            {/* Logo Text (Visible on Expand) */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.15 }}
                  className="whitespace-nowrap min-w-0"
                >
                  <div
                    className="font-semibold text-[#24352B] tracking-tight leading-none text-base"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    ExamSlot
                  </div>
                  <div className="text-[10px] tracking-wider text-[#285742] font-bold mt-1 uppercase">
                    STUDENT PORTAL
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Pin/Lock Toggle button (Visible when expanded) */}
          {isExpanded && (
            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              title={isPinned ? 'Unpin Sidebar (Auto-collapse)' : 'Pin Sidebar Open'}
              className="text-[#717973] hover:text-[#285742] p-1 rounded-lg hover:bg-[#F7F5EF] transition-colors cursor-pointer"
            >
              {isPinned ? (
                <HiLockClosed className="w-4 h-4 text-[#285742]" />
              ) : (
                <HiLockOpen className="w-4 h-4 text-[#717973]" />
              )}
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-2 py-3.5 flex flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href === '/student/planner' && pathname === '/student');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-[#E7EEE3] text-[#285742] font-semibold shadow-xs'
                    : 'text-[#59645B] hover:bg-[#F7F5EF] hover:text-[#24352B]'
                }`}
                title={!isExpanded ? item.label : undefined}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-transform ${
                      isActive ? 'text-[#285742]' : 'text-[#7B8578] group-hover:text-[#285742]'
                    }`}
                  />
                  {isExpanded && (
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold truncate whitespace-nowrap">
                        {item.label}
                      </span>
                      <span className="text-[10px] text-[#59645B] truncate font-normal">
                        {item.sublabel}
                      </span>
                    </div>
                  )}
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 transition-opacity ${
                      isExpanded ? 'opacity-100' : 'opacity-0 lg:opacity-100'
                    } ${
                      isActive
                        ? 'bg-[#285742] text-white'
                        : 'bg-[#F5EDCE] text-[#795D18] border border-[#795D18]/20'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Student Profile Footer */}
      <div className="p-2 border-t border-[#DEDCD1] bg-[#F7F5EF]/80">
        <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#FFFFFF] transition-colors group">
          <div className="w-9 h-9 rounded-xl bg-[#E7EEE3] text-[#285742] text-xs font-bold flex items-center justify-center shrink-0 border border-[#285742]/20 shadow-xs">
            {initials}
          </div>

          {isExpanded && (
            <div className="flex items-center justify-between min-w-0 flex-1">
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-[#24352B] truncate">
                  {studentName}
                </span>
                <span className="text-[10px] font-mono text-[#59645B] truncate">
                  {registrationNumber || 'Student ID'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                title="Sign out of student account"
                className="text-[#717973] hover:text-[#A3342F] p-1.5 rounded-lg hover:bg-[#FAEAE7] transition-colors ml-1 cursor-pointer"
              >
                <HiArrowRightOnRectangle className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
