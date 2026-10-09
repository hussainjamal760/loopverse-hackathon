'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  OverviewHero,
  KpiMetricsSection,
  AdminAnalyticsSection,
  PendingRequestsTable,
  PlanningReadinessCard,
  UpcomingExamSlotsCard,
  RecentActivityCard,
  RequestReviewDrawer,
  AdminFooter,
  PendingRequestItem,
  UpcomingSlotItem,
  RecentActivityItem,
  BranchMetric,
  DepartmentSlotMetric,
  RequestBreakdownMetric,
  AdminStats,
} from '@/features/admin';

function formatRaisedTime(dateStr?: string): string {
  if (!dateStr) return 'Recently';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Recently';
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();
    const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    if (isToday) return `Today, ${timeStr}`;
    if (isYesterday) return `Yesterday, ${timeStr}`;
    return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${timeStr}`;
  } catch {
    return 'Recently';
  }
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | undefined>(undefined);
  const [recentRequests, setRecentRequests] = useState<PendingRequestItem[]>([]);
  const [upcomingSlots, setUpcomingSlots] = useState<UpcomingSlotItem[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);
  const [branchMetrics, setBranchMetrics] = useState<BranchMetric[]>([]);
  const [departmentSlotMetrics, setDepartmentSlotMetrics] = useState<DepartmentSlotMetric[]>([]);
  const [requestBreakdown, setRequestBreakdown] = useState<RequestBreakdownMetric[]>([]);

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
        setBranchMetrics(data.branchMetrics || []);
        setDepartmentSlotMetrics(data.departmentSlotMetrics || []);
        setRequestBreakdown(data.requestBreakdown || []);
        setUpcomingSlots(data.upcomingSlots || []);
        setRecentActivity(data.recentActivity || []);

        if (Array.isArray(data.recentRequests)) {
          const formatted: PendingRequestItem[] = data.recentRequests.map((r: any, idx: number) => ({
            id: r.id || r._id || String(idx),
            studentName: r.studentName || r.studentId?.fullName || 'Student',
            registrationNumber: r.registrationNumber || r.studentId?.registrationNumber || 'N/A',
            initials: (r.studentName || r.studentId?.fullName || 'ST')
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2),
            requestType:
              r.requestType || (r.type === 'BRANCH' ? 'Branch change' : 'Date sheet change'),
            raisedTime: formatRaisedTime(r.createdAt),
            reason: r.reason,
          }));
          setRecentRequests(formatted);
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error('Failed to fetch admin overview', errData);
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
    if (!confirm('This will seed demo campus branches, courses, exam slots, student accounts, and audit events. Continue?')) {
      return;
    }

    try {
      setSeeding(true);
      const res = await fetch('/api/seed');
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Database seeded successfully with live demo data!');
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

      {/* 2. Four Dynamic KPI Metric Cards */}
      <KpiMetricsSection stats={stats} />

      {/* 3. Session Analytics & Capacity Charts (Dynamic Recharts visuals) */}
      <AdminAnalyticsSection
        branchMetrics={branchMetrics}
        departmentSlotMetrics={departmentSlotMetrics}
        requestBreakdown={requestBreakdown}
        onRefresh={fetchOverview}
        isLoading={loading}
      />

      {/* 4. Main Operational Grid: Requests Table (8 cols) + Planning Readiness (4 cols) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8">
          <PendingRequestsTable
            requests={recentRequests}
            pendingCount={stats?.pendingRequests}
            onSelectReview={(req) => setSelectedReviewRequest(req)}
          />
        </div>
        <div className="lg:col-span-4">
          <PlanningReadinessCard stats={stats} />
        </div>
      </section>

      {/* 5. Main Operational Grid: Upcoming Exam Slots (7 cols) + Recent Admin Activity (5 cols) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7">
          <UpcomingExamSlotsCard slots={upcomingSlots} />
        </div>
        <div className="lg:col-span-5">
          <RecentActivityCard activities={recentActivity} />
        </div>
      </section>

      {/* 6. Request Review Drawer Companion Workspace */}
      <RequestReviewDrawer
        selectedRequest={selectedReviewRequest}
        onClear={() => setSelectedReviewRequest(null)}
      />

      {/* 7. System Status Footer */}
      <AdminFooter />
    </div>
  );
}
