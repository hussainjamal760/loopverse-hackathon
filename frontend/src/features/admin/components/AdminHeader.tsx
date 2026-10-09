'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { HiUser } from 'react-icons/hi2';

interface AdminHeaderProps {
  sidebarWidth?: string;
}

export function AdminHeader({ sidebarWidth = 'pl-[68px]' }: AdminHeaderProps) {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === '/admin') return 'Overview';
    if (pathname.includes('/branches')) return 'Branches';
    if (pathname.includes('/courses')) return 'Courses';
    if (pathname.includes('/students')) return 'Students';
    if (pathname.includes('/assignments')) return 'Course assignments';
    if (pathname.includes('/schedules')) return 'Exam slots';
    if (pathname.includes('/requests')) return 'Change requests';
    if (pathname.includes('/audit')) return 'Audit log';
    return 'Dashboard';
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-[72px] bg-white/95 backdrop-blur-md border-b border-[#c0c9c2]/40 z-40 px-6 sm:px-8 flex items-center justify-between transition-all duration-300">
      <div className={`flex items-center gap-2 transition-all duration-300 ${sidebarWidth}`}>
        <span className="text-xs sm:text-sm font-medium text-[#414943]">Administration</span>
        <span className="text-xs text-[#717973]">/</span>
        <span className="text-xs sm:text-sm font-semibold text-[#0e1f16]">{getPageTitle()}</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Session Status Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e4f9e9] border border-[#c0c9c2]/40">
          <span className="w-2 h-2 rounded-full bg-[#0d402c] animate-pulse" />
          <span className="text-xs text-[#414943]">
            Exam cycle · <strong className="text-[#0d402c] font-semibold">Fall 2026</strong>
          </span>
        </div>

        <div className="h-6 w-[1px] bg-[#c0c9c2]/50" />

        {/* User Icon Avatar */}
        <div className="relative flex items-center">
          <div className="w-8 h-8 rounded-full bg-[#0d402c] flex items-center justify-center text-white shadow-xs">
            <HiUser className="w-4 h-4" />
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#285742] ring-2 ring-white" />
        </div>
      </div>
    </header>
  );
}
