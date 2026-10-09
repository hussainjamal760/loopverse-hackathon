'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  HiSquares2X2,
  HiBuildingOffice2,
  HiBookOpen,
  HiUsers,
  HiCalendarDays,
  HiClipboardDocumentCheck,
  HiArrowRightOnRectangle,
  HiBars3,
  HiXMark,
} from 'react-icons/hi2';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch('/api/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated || data.user.role !== 'ADMIN') {
          router.push('/login');
        } else {
          setAdminUser(data.user);
        }
      })
      .catch(() => router.push('/login'));
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const navItems = [
    { label: 'Overview', href: '/admin', icon: HiSquares2X2 },
    { label: 'Branches', href: '/admin/branches', icon: HiBuildingOffice2 },
    { label: 'Courses', href: '/admin/courses', icon: HiBookOpen },
    { label: 'Students', href: '/admin/students', icon: HiUsers },
    { label: 'Exam Slots', href: '/admin/schedules', icon: HiCalendarDays },
    { label: 'Change Requests', href: '/admin/requests', icon: HiClipboardDocumentCheck },
  ];

  return (
    <div className="min-h-screen bg-[var(--canvas)] flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 232px Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[232px] bg-[var(--surface)] border-r border-[var(--border)] flex flex-col justify-between transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Logo Branding */}
          <div className="h-[72px] px-6 flex items-center border-b border-[var(--border)] justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-[var(--sage)] text-[var(--primary)] flex items-center justify-center font-bold">
                <HiCalendarDays className="w-5 h-5" />
              </div>
              <span className="font-semibold text-lg text-[var(--ink)] font-serif">ExamSlot</span>
            </div>
            <button
              className="lg:hidden text-[var(--ink-muted)] hover:text-[var(--ink)]"
              onClick={() => setSidebarOpen(false)}
            >
              <HiXMark className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-[var(--radius-control)] text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[var(--selected)] text-[var(--primary)] font-semibold shadow-xs'
                      : 'text-[var(--ink-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--ink)]'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[var(--primary)]' : 'text-[var(--ink-muted)]'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Admin Identity */}
        <div className="p-4 border-t border-[var(--border)]">
          <div className="px-3 py-2 mb-2">
            <div className="text-xs text-[var(--ink-muted)]">Signed in as</div>
            <div className="text-xs font-medium text-[var(--ink)] truncate">{adminUser?.email}</div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-[var(--danger)] hover:bg-[var(--danger-soft)] rounded-[var(--radius-control)] transition-colors cursor-pointer"
          >
            <HiArrowRightOnRectangle className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-[72px] px-6 bg-[var(--surface)] border-b border-[var(--border)] flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <button
              className="lg:hidden text-[var(--ink-muted)] hover:text-[var(--ink)]"
              onClick={() => setSidebarOpen(true)}
            >
              <HiBars3 className="w-6 h-6" />
            </button>
            <div className="text-sm font-medium text-[var(--ink-muted)] capitalize">
              Admin Portal / <span className="text-[var(--ink)] font-semibold">{pathname.split('/')[2] || 'Overview'}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium px-2.5 py-1 bg-[var(--sage)] text-[var(--primary)] rounded-full">
              System Admin
            </span>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 p-6 max-w-[1280px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
