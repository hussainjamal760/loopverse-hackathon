'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiSquares2X2,
  HiBuildingOffice2,
  HiBookOpen,
  HiUsers,
  HiAcademicCap,
  HiCalendarDays,
  HiArrowPathRoundedSquare,
  HiDocumentText,
  HiArrowRightOnRectangle,
  HiChevronRight,
  HiLockOpen,
  HiLockClosed,
  HiCheck,
} from 'react-icons/hi2';

interface AdminSidebarProps {
  adminEmail?: string;
  adminName?: string;
  pendingRequestsCount?: number;
}

export function AdminSidebar({
  adminEmail = 'admin@examslot.edu.pk',
  adminName = 'Dr. Tariq Rao',
  pendingRequestsCount = 8,
}: AdminSidebarProps) {
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
    { label: 'Overview', href: '/admin', icon: HiSquares2X2 },
    { label: 'Branches', href: '/admin/branches', icon: HiBuildingOffice2 },
    { label: 'Courses', href: '/admin/courses', icon: HiBookOpen },
    { label: 'Students', href: '/admin/students', icon: HiUsers },
    { label: 'Course assignments', href: '/admin/assignments', icon: HiAcademicCap },
    { label: 'Exam slots', href: '/admin/schedules', icon: HiCalendarDays },
    {
      label: 'Change requests',
      href: '/admin/requests',
      icon: HiArrowPathRoundedSquare,
      badge: pendingRequestsCount,
    },
    { label: 'Audit log', href: '/admin/audit', icon: HiDocumentText },
  ];

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed left-0 top-0 h-full z-50 bg-[#e4f9e9] border-r border-[#c0c9c2]/40 flex flex-col justify-between select-none transition-all duration-300 ease-in-out shadow-lg ${
        isExpanded ? 'w-[236px]' : 'w-[68px]'
      }`}
    >
      <div className="flex flex-col flex-1 min-h-0">
        {/* Header Branding */}
        <div className="px-3.5 pt-4 pb-3 border-b border-[#c0c9c2]/30 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Logo Mark */}
            <div className="w-9 h-9 rounded-lg bg-white border border-[#c0c9c2] grid grid-cols-2 p-1 gap-0.5 shadow-xs shrink-0">
              <div className="bg-[#285742] rounded-[2px] flex items-center justify-center">
                <HiCheck className="text-white w-2.5 h-2.5 stroke-[2]" />
              </div>
              <div className="bg-[#d3e7d9] rounded-[2px]" />
              <div className="bg-[#d3e7d9] rounded-[2px]" />
              <div className="bg-[#d3e7d9] rounded-[2px]" />
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
                  <div className="font-semibold text-[#0d402c] tracking-tight leading-none text-base">
                    ExamSlot
                  </div>
                  <div className="text-[10px] tracking-wider text-[#414943] font-semibold mt-1 uppercase">
                    ADMINISTRATION
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Pin/Lock Toggle button (Visible when expanded) */}
          {isExpanded && (
            <button
              onClick={() => setIsPinned(!isPinned)}
              title={isPinned ? 'Unpin Sidebar (Auto-collapse)' : 'Pin Sidebar Open'}
              className="text-[#717973] hover:text-[#0d402c] p-1 rounded hover:bg-[#d9edde] transition-colors"
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
        <nav className="flex-1 overflow-y-auto px-2 py-3 flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-[#d9edde] text-[#0d402c] font-semibold shadow-xs'
                    : 'text-[#414943] hover:bg-[#dff3e4] hover:text-[#0e1f16]'
                }`}
                title={!isExpanded ? item.label : undefined}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-transform ${
                      isActive ? 'text-[#0d402c]' : 'text-[#717973] group-hover:text-[#0e1f16]'
                    }`}
                  />
                  {isExpanded && (
                    <span className="text-sm font-medium truncate whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                </div>

                {/* Badge for items like Change Requests */}
                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[11px] font-semibold shrink-0 transition-opacity ${
                      isExpanded ? 'opacity-100' : 'opacity-0 lg:opacity-100'
                    } ${
                      isActive
                        ? 'bg-[#285742] text-white'
                        : 'bg-[#ffdf9e] text-[#261a00] border border-[#e7c273]/60'
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

      {/* User Profile Footer */}
      <div className="p-2 border-t border-[#c0c9c2]/30 bg-[#e4f9e9]">
        <div className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#dff3e4] transition-colors cursor-pointer group">
          <div className="w-9 h-9 rounded-full bg-[#285742] text-white text-xs font-semibold flex items-center justify-center shrink-0 shadow-xs">
            {adminName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2) || 'DR'}
          </div>

          {isExpanded && (
            <div className="flex items-center justify-between min-w-0 flex-1">
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-[#0e1f16] truncate">
                  {adminName}
                </span>
                <span className="text-[11px] text-[#414943] truncate">
                  Administrator
                </span>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="text-[#717973] hover:text-[#ba1a1a] p-1 rounded hover:bg-[#ffdad6] transition-colors ml-1"
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
