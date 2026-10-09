'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  HiCalendarDays,
  HiChevronDown,
  HiArrowRightOnRectangle,
  HiQueueList,
  HiViewColumns,
} from 'react-icons/hi2';
import { toast } from 'sonner';

interface StudentHeaderProps {
  studentName?: string;
  viewMode?: 'planner' | 'kanban';
  onToggleViewMode?: (mode: 'planner' | 'kanban') => void;
}

export function StudentHeader({
  studentName = 'Student',
  viewMode = 'planner',
  onToggleViewMode,
}: StudentHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success('Logged out successfully');
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  const navLinks = [
    { label: 'My exams', href: '/student/planner' },
    { label: 'My profile', href: '/student/profile' },
    { label: 'Need help', href: '/student/help' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#FFFFFF] border-b border-[#DEDCD1] shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-[72px] max-w-6xl mx-auto px-6 flex items-center justify-between">
        {/* Brand Mark */}
        <Link href="/student/planner" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#E7EEE3] text-[#285742] flex items-center justify-center font-bold">
            <HiCalendarDays className="w-5 h-5" />
          </div>
          <span className="font-semibold text-lg text-[#24352B] tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
            ExamSlot
          </span>
        </Link>

        {/* Center Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-[#F0EEE6] border border-[#DEDCD1]">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href === '/student/planner' && pathname === '/student');
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#E7EEE3] text-[#285742] shadow-xs'
                    : 'text-[#59645B] hover:text-[#24352B]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: View Switcher & Student Pill */}
        <div className="flex items-center gap-3">
          {/* Kanban / List View Toggle */}
          {onToggleViewMode && (
            <div className="hidden sm:flex items-center p-0.5 rounded-lg bg-[#F0EEE6] border border-[#DEDCD1]">
              <button
                type="button"
                onClick={() => onToggleViewMode('planner')}
                className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'planner'
                    ? 'bg-[#FFFFFF] text-[#285742] shadow-xs font-semibold'
                    : 'text-[#59645B] hover:text-[#24352B]'
                }`}
                title="Agenda List View"
              >
                <HiQueueList className="w-3.5 h-3.5" />
                <span>Planner</span>
              </button>
              <button
                type="button"
                onClick={() => onToggleViewMode('kanban')}
                className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'kanban'
                    ? 'bg-[#FFFFFF] text-[#285742] shadow-xs font-semibold'
                    : 'text-[#59645B] hover:text-[#24352B]'
                }`}
                title="Kanban Board View"
              >
                <HiViewColumns className="w-3.5 h-3.5" />
                <span>Kanban</span>
              </button>
            </div>
          )}

          {/* Student Identity Pill */}
          <div className="flex items-center gap-2 bg-[#F7F5EF] px-2.5 py-1.5 rounded-full border border-[#DEDCD1]">
            <div className="w-7 h-7 rounded-full bg-[#E7EEE3] text-[#285742] flex items-center justify-center text-xs font-bold">
              {studentName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .substring(0, 2)
                .toUpperCase() || 'ST'}
            </div>
            <div className="hidden sm:flex flex-col text-left leading-tight">
              <span className="text-xs font-semibold text-[#24352B] truncate max-w-[110px]">
                {studentName}
              </span>
              <span className="text-[10px] text-[#59645B]">Student</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-[#59645B] hover:text-[#A3342F] p-1 transition-colors cursor-pointer ml-1"
              title="Sign Out"
            >
              <HiArrowRightOnRectangle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
