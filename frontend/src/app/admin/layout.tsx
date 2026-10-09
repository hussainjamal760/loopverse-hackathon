'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar, AdminHeader } from '@/features/admin';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [pendingCount, setPendingCount] = useState<number>(8);

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

    fetch('/api/admin/overview')
      .then((res) => res.json())
      .then((data) => {
        if (data?.stats?.pendingRequests !== undefined) {
          setPendingCount(data.stats.pendingRequests);
        }
      })
      .catch(() => {});
  }, [router]);

  return (
    <div className="min-h-screen bg-[#eafeef] text-[#0e1f16] flex font-sans antialiased">
      {/* Auto-Collapsable Sidebar (Expands on Hover, Collapses on Hoverout) */}
      <AdminSidebar
        adminEmail={adminUser?.email}
        adminName={adminUser?.fullName || 'Dr. Tariq Rao'}
        pendingRequestsCount={pendingCount}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Header Bar */}
        <AdminHeader sidebarWidth="pl-[68px]" />

        {/* Content View Container */}
        <main className="relative pt-[72px] pl-[68px] w-full min-h-screen bg-[#eafeef] px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-[1400px] mx-auto space-y-8 pb-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
