'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  OverviewHero,
  KpiMetricsSection,
  PendingRequestsTable,
  PlanningReadinessCard,
  UpcomingExamSlotsCard,
  RecentActivityCard,
  RequestReviewDrawer,
  AdminFooter,
  PendingRequestItem,
} from '@/features/admin';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [selectedReviewRequest, setSelectedReviewRequest] = useState<PendingRequestItem | null>(null);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/overview');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        if (data.recentRequests?.length > 0) {
          const formatted = data.recentRequests.map((r: any, idx: number) => ({
            id: r._id || String(idx),
            studentName: r.studentId?.fullName || 'Student',
            registrationNumber: r.studentId?.registrationNumber || 'VU-2026-0000',
            initials: (r.studentId?.fullName || 'ST')
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2),
            requestType: r.type === 'BRANCH_CHANGE' ? 'Branch change' : 'Date sheet change',
            raisedTime: 'Today, 10:24 AM',
          }));
          setRecentRequests(formatted);
        }
      }
    } catch (err) {
      console.error('Failed to fetch admin overview', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleRunSeed = async () => {
    if (!confirm('This will seed initial demo branches, courses, exam slots, and student accounts. Continue?')) {
      return;
    }

    try {
      setSeeding(true);
      const res = await fetch('/api/seed');
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Database seeded successfully with Fall 2026 demo data!');
        await fetchOverview();
      } else {
        toast.error(data.error || 'Failed to seed database');
      }
    } catch (err: any) {
      toast.error('Seed execution error: ' + err.message);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="flex flex-col w-full space-y-8">
      {/* 1. Page Introduction Header */}
      <OverviewHero onRunSeed={handleRunSeed} isSeeding={seeding} />

      {/* 2. Four Compact KPI Metric Cards */}
      <KpiMetricsSection stats={stats} />

      {/* 3. Main Grid Row 1 (Requests Table ~65% + Planning Readiness ~35%) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8">
          <PendingRequestsTable
            requests={recentRequests.length > 0 ? recentRequests : undefined}
            onSelectReview={(req) => setSelectedReviewRequest(req)}
          />
        </div>
        <div className="lg:col-span-4">
          <PlanningReadinessCard />
        </div>
      </section>

      {/* 4. Main Grid Row 2 (Upcoming Exam Slots ~58% + Recent Admin Activity ~42%) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7">
          <UpcomingExamSlotsCard />
        </div>
        <div className="lg:col-span-5">
          <RecentActivityCard />
        </div>
      </section>

      {/* 5. Realistic Request Review Drawer / Companion Workspace */}
      <RequestReviewDrawer
        selectedRequest={selectedReviewRequest}
        onClear={() => setSelectedReviewRequest(null)}
      />

      {/* 6. Subtle System Status Footer */}
      <AdminFooter />
    </div>
  );
}
