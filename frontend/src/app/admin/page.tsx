'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  HiUsers,
  HiBuildingOffice2,
  HiBookOpen,
  HiCalendarDays,
  HiClipboardDocumentCheck,
  HiArrowTopRightOnSquare,
  HiClock,
  HiCheckCircle,
  HiArrowPath,
} from 'react-icons/hi2';
import { toast } from 'sonner';

interface OverviewStats {
  totalStudents: number;
  totalBranches: number;
  totalCourses: number;
  totalSlots: number;
  publishedSlots: number;
  draftSlots: number;
  pendingRequests: number;
  totalSavedSheets: number;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/overview');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setRecentRequests(data.recentRequests || []);
      }
    } catch (err) {
      console.error('Failed to load overview data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleRunSeed = async () => {
    if (!confirm('This will seed initial branches, courses, exam slots, and demo accounts. Continue?')) {
      return;
    }

    try {
      setSeeding(true);
      const res = await fetch('/api/seed');
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Database seeded successfully with initial data!');
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
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#DEDCD1]">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-normal text-[#24352B] tracking-tight"
            style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}
          >
            Academic Operations Overview
          </h1>
          <p className="text-sm text-[#59645B] mt-1">
            Exam scheduling, student onboarding, and change request management for Spring 2026.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOverview}
            disabled={loading}
            className="px-3.5 py-2 text-xs font-medium text-[#24352B] bg-[#FFFFFF] border border-[#7B8578] rounded-[12px] hover:bg-[#F0EEE6] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <HiArrowPath className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleRunSeed}
            disabled={seeding}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#285742] hover:bg-[#204735] rounded-[12px] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-60"
          >
            <HiArrowPath className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
            <span>{seeding ? 'Seeding...' : 'Run Seed Data'}</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Students */}
        <div className="bg-[#FFFFFF] border border-[#DEDCD1] rounded-[16px] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#59645B]">
              Enrolled Students
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#E7EEE3] text-[#285742] flex items-center justify-center">
              <HiUsers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-[#24352B] mt-3">
            {loading ? '—' : stats?.totalStudents ?? 0}
          </div>
          <div className="text-xs text-[#59645B] mt-1 flex items-center gap-1">
            <span className="font-medium text-[#285742]">
              {stats?.totalSavedSheets ?? 0}
            </span>{' '}
            date sheets finalized
          </div>
        </div>

        {/* Card 2: Branches */}
        <div className="bg-[#FFFFFF] border border-[#DEDCD1] rounded-[16px] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#59645B]">
              Campus Branches
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#E7EEE3] text-[#285742] flex items-center justify-center">
              <HiBuildingOffice2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-[#24352B] mt-3">
            {loading ? '—' : stats?.totalBranches ?? 0}
          </div>
          <div className="text-xs text-[#59645B] mt-1">
            Karachi, Lahore & Islamabad
          </div>
        </div>

        {/* Card 3: Exam Slots */}
        <div className="bg-[#FFFFFF] border border-[#DEDCD1] rounded-[16px] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#59645B]">
              Published Slots
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#E7EEE3] text-[#285742] flex items-center justify-center">
              <HiCalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-[#24352B] mt-3">
            {loading ? '—' : stats?.publishedSlots ?? 0}
          </div>
          <div className="text-xs text-[#59645B] mt-1">
            {stats?.draftSlots ?? 0} draft slots pending publish
          </div>
        </div>

        {/* Card 4: Change Requests */}
        <div className="bg-[#FFFFFF] border border-[#DEDCD1] rounded-[16px] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#59645B]">
              Pending Requests
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#F5EDCE] text-[#795D18] flex items-center justify-center">
              <HiClipboardDocumentCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-[#795D18] mt-3">
            {loading ? '—' : stats?.pendingRequests ?? 0}
          </div>
          <div className="text-xs text-[#59645B] mt-1">
            Requires admin grant review
          </div>
        </div>
      </div>

      {/* Two Column Section: Quick Actions & Pending Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Change Requests */}
        <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#DEDCD1] rounded-[20px] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-[#24352B]">
                Recent Change Requests
              </h2>
              <p className="text-xs text-[#59645B]">
                Student requests for branch transfer or date sheet modification
              </p>
            </div>
            <Link
              href="/admin/requests"
              className="text-xs font-medium text-[#285742] hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <HiArrowTopRightOnSquare className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-[#59645B]">
              Loading change requests...
            </div>
          ) : recentRequests.length === 0 ? (
            <div className="py-8 text-center bg-[#F7F5EF] rounded-[12px] border border-dashed border-[#DEDCD1]">
              <HiCheckCircle className="w-6 h-6 text-[#285742] mx-auto mb-1" />
              <p className="text-xs font-medium text-[#24352B]">
                All change requests resolved
              </p>
              <p className="text-[11px] text-[#59645B] mt-0.5">
                No pending student submissions in queue.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#DEDCD1]">
              {recentRequests.map((req) => (
                <div
                  key={req._id}
                  className="py-3.5 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#24352B] truncate">
                        {req.studentId?.fullName || 'Student'}
                      </span>
                      <span className="text-[11px] text-[#59645B] font-mono">
                        {req.studentId?.registrationNumber}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${
                          req.status === 'PENDING'
                            ? 'bg-[#F5EDCE] text-[#795D18]'
                            : req.status === 'APPROVED'
                            ? 'bg-[#E7EEE3] text-[#285742]'
                            : 'bg-[#FAEAE7] text-[#A3342F]'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#59645B] truncate mt-0.5">
                      <strong>{req.type}:</strong> {req.reason}
                    </p>
                  </div>

                  <Link
                    href={`/admin/requests`}
                    className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-[#285742] bg-[#E7EEE3] hover:bg-[#d8e3d3] rounded-[10px] transition-colors"
                  >
                    Review
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Quick Links and System Security */}
        <div className="space-y-6">
          {/* Quick Navigation Panel */}
          <div className="bg-[#FFFFFF] border border-[#DEDCD1] rounded-[20px] p-6 shadow-xs">
            <h2 className="text-base font-semibold text-[#24352B] mb-1">
              Quick Actions
            </h2>
            <p className="text-xs text-[#59645B] mb-4">
              Direct administrative navigation
            </p>

            <div className="space-y-2">
              <Link
                href="/admin/students"
                className="w-full flex items-center justify-between p-3 rounded-[12px] bg-[#F7F5EF] hover:bg-[#F0EEE6] border border-[#DEDCD1] text-xs font-medium text-[#24352B] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <HiUsers className="w-4 h-4 text-[#285742]" />
                  <span>Manage Students</span>
                </div>
                <span className="text-[#59645B]">→</span>
              </Link>

              <Link
                href="/admin/courses"
                className="w-full flex items-center justify-between p-3 rounded-[12px] bg-[#F7F5EF] hover:bg-[#F0EEE6] border border-[#DEDCD1] text-xs font-medium text-[#24352B] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <HiBookOpen className="w-4 h-4 text-[#285742]" />
                  <span>Course Catalog</span>
                </div>
                <span className="text-[#59645B]">→</span>
              </Link>

              <Link
                href="/admin/schedules"
                className="w-full flex items-center justify-between p-3 rounded-[12px] bg-[#F7F5EF] hover:bg-[#F0EEE6] border border-[#DEDCD1] text-xs font-medium text-[#24352B] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <HiCalendarDays className="w-4 h-4 text-[#285742]" />
                  <span>Exam Slot Schedules</span>
                </div>
                <span className="text-[#59645B]">→</span>
              </Link>

              <Link
                href="/admin/branches"
                className="w-full flex items-center justify-between p-3 rounded-[12px] bg-[#F7F5EF] hover:bg-[#F0EEE6] border border-[#DEDCD1] text-xs font-medium text-[#24352B] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <HiBuildingOffice2 className="w-4 h-4 text-[#285742]" />
                  <span>Campus Branches</span>
                </div>
                <span className="text-[#59645B]">→</span>
              </Link>
            </div>
          </div>

          {/* System Security Status */}
          <div className="bg-[#FFFFFF] border border-[#DEDCD1] rounded-[20px] p-6 shadow-xs">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#59645B] mb-3">
              Session & Security Integrity
            </h3>
            <ul className="space-y-2 text-xs text-[#59645B]">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#285742]" />
                <span>Opaque Database Session Active (12h TTL)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#285742]" />
                <span>HttpOnly Secure Lax Cookie Guard</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#285742]" />
                <span>Bcrypt Password Hashes Enforced</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
