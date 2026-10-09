'use client';

import React from 'react';
import Link from 'next/link';
import { HiClock, HiArrowRight } from 'react-icons/hi2';
import { RecentActivityItem } from '../types';

interface RecentActivityCardProps {
  activities?: RecentActivityItem[];
}

function formatRelativeTime(dateString: string): string {
  try {
    const past = new Date(dateString).getTime();
    const now = Date.now();
    const diffSeconds = Math.max(0, Math.floor((now - past) / 1000));

    if (diffSeconds < 60) return 'Just now';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return 'Recently';
  }
}

function formatFriendlyDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '';
  }
}

function parseJsonMetadata(raw?: string | null): Record<string, any> | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) {
    return null;
  }
  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

function parseActivityText(item: RecentActivityItem): { title: string; subtitle: string } {
  const metaObj = parseJsonMetadata(item.metadata);
  const action = (item.action || '').toUpperCase();
  const entityType = item.entityType || '';
  const actor = item.actorEmail || 'System Admin';

  // If metadata is a plain text sentence (e.g. from seed or manual logs)
  if (!metaObj && item.metadata && item.metadata.trim()) {
    return {
      title: item.metadata.trim(),
      subtitle: `${entityType} · ${actor}`,
    };
  }

  // 1. Exam Slot activities
  if (action.includes('EXAM_SLOT') || entityType === 'ExamSlot') {
    const courseCode = metaObj?.courseCode;
    const status = metaObj?.status;
    const dateFormatted = formatFriendlyDate(metaObj?.startsAt);

    let title = 'Updated exam slot';
    if (action.includes('CREATE') || action.includes('PUBLISH')) {
      title = status === 'PUBLISHED'
        ? `Published exam slot${courseCode ? ` for ${courseCode}` : ''}`
        : `Created draft slot${courseCode ? ` for ${courseCode}` : ''}`;
    } else if (status === 'PUBLISHED') {
      title = `Published exam slot${courseCode ? ` for ${courseCode}` : ''}`;
    } else if (courseCode) {
      title = `Updated exam slot for ${courseCode}`;
    }

    const subParts = [dateFormatted, actor].filter(Boolean);
    return {
      title,
      subtitle: subParts.join(' · ') || `${entityType} · ${actor}`,
    };
  }

  // 2. Student activities
  if (action.includes('STUDENT') || entityType === 'Student') {
    const regNo = metaObj?.registrationNumber;
    const program = metaObj?.program;
    const email = metaObj?.email;

    let title = 'Updated student record';
    if (action.includes('CREATE') || action.includes('ENROLL')) {
      title = `Enrolled student ${regNo || email || ''}`.trim();
    } else if (action.includes('DELETE')) {
      title = `Removed student ${regNo || ''}`.trim();
    } else if (regNo) {
      title = `Updated student ${regNo}`;
    }

    const subParts = [program, email || actor].filter(Boolean);
    return {
      title,
      subtitle: subParts.join(' · ') || `${entityType} · ${actor}`,
    };
  }

  // 3. Password & Auth activities
  if (action.includes('PASSWORD') || action.includes('AUTH') || entityType === 'User') {
    const email = metaObj?.email;
    const purpose = metaObj?.purpose;
    const isSetup = purpose === 'SETUP' || action.includes('SETUP');

    return {
      title: `Student account verified (${isSetup ? 'Setup' : 'Reset'})`,
      subtitle: `${email || actor} · Password updated`,
    };
  }

  // 4. Change Request decisions
  if (action.includes('CHANGE_REQUEST') || action.includes('REQUEST') || entityType === 'ChangeRequest') {
    const isApproved = action.includes('APPROVE') || metaObj?.status === 'APPROVED';
    const reqType = metaObj?.type === 'BRANCH' ? 'branch change' : 'date sheet';
    const regNo = metaObj?.studentReg;

    return {
      title: `${isApproved ? 'Approved' : 'Rejected'} ${reqType} request`,
      subtitle: `${regNo ? `Student ${regNo} · ` : ''}${actor}`,
    };
  }

  // 5. Branch activities
  if (action.includes('BRANCH') || entityType === 'Branch') {
    const nameOrCode = metaObj?.name || metaObj?.code || '';
    const isCreate = action.includes('CREATE');
    const isDelete = action.includes('DELETE');

    return {
      title: `${isCreate ? 'Created' : isDelete ? 'Removed' : 'Updated'} campus branch ${nameOrCode}`.trim(),
      subtitle: `${metaObj?.city ? `${metaObj.city} · ` : ''}${actor}`,
    };
  }

  // 6. Course activities
  if (action.includes('COURSE') || entityType === 'Course') {
    const code = metaObj?.code || '';
    const title = metaObj?.title || '';
    const isCreate = action.includes('CREATE');

    return {
      title: `${isCreate ? 'Added' : 'Updated'} course ${code}`.trim(),
      subtitle: `${title ? `${title} · ` : ''}${actor}`,
    };
  }

  // 7. Course Assignments
  if (action.includes('ASSIGNMENT')) {
    const studentReg = metaObj?.studentReg;
    return {
      title: `Updated course assignments${studentReg ? ` for ${studentReg}` : ''}`,
      subtitle: `${metaObj?.count ? `${metaObj.count} courses · ` : ''}${actor}`,
    };
  }

  // Fallback: format action string cleanly
  const friendlyAction = action
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());

  return {
    title: `${friendlyAction} on ${entityType || 'system'}`,
    subtitle: `By ${actor}`,
  };
}

export function RecentActivityCard({ activities = [] }: RecentActivityCardProps) {
  return (
    <div className="bg-white rounded-[20px] p-6 border border-[#c0c9c2]/50 shadow-xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-[#c0c9c2]/30">
          <div className="flex items-center gap-2.5">
            <HiClock className="w-5 h-5 text-[#285742]" />
            <h2 className="text-[17px] font-semibold text-[#0e1f16]">Recent admin activity</h2>
          </div>
          <span className="text-xs text-[#414943] font-medium">Live audit trail</span>
        </div>

        {/* Real Timeline List */}
        <div className="mt-4 relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-[#c0c9c2]/40">
          {activities.length > 0 ? (
            activities.slice(0, 4).map((item, idx) => {
              const { title, subtitle } = parseActivityText(item);
              const isPrimary = idx === 0;

              return (
                <div key={item.id} className="relative flex items-start justify-between gap-3">
                  <span
                    className={`absolute -left-5 top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-white ${
                      isPrimary ? 'bg-[#285742]' : 'bg-[#717973]'
                    }`}
                  />
                  <div className="min-w-0 pr-2">
                    <p className="text-xs sm:text-sm text-[#0e1f16] leading-snug font-medium line-clamp-2">
                      {title}
                    </p>
                    <p className="text-xs text-[#414943] mt-0.5 truncate">{subtitle}</p>
                  </div>
                  <span className="text-xs text-[#414943] whitespace-nowrap shrink-0">
                    {formatRelativeTime(item.createdAt)}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="py-6 text-center text-xs text-[#717973]">
              <p className="font-semibold text-[#0e1f16]">No activity recorded yet</p>
              <p className="mt-1 text-[#414943]">Admin operations and decisions will stream here.</p>
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-[#c0c9c2]/20">
        <Link
          href="/admin/requests"
          className="text-sm font-semibold text-[#0d402c] hover:underline inline-flex items-center gap-1"
        >
          <span>View operational requests</span>
          <HiArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
