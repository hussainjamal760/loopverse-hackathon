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

function parseActivityText(item: RecentActivityItem): { title: string; subtitle: string } {
  const meta = item.metadata || '';
  const action = item.action.toUpperCase();

  if (meta) {
    return {
      title: meta,
      subtitle: `${item.entityType} · ${item.actorEmail || 'System Admin'}`,
    };
  }

  // Fallback to formatted action names
  const friendlyName = action
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());

  return {
    title: `${friendlyName} on ${item.entityType}`,
    subtitle: `By ${item.actorEmail || 'System Admin'}`,
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
                    <p className="text-xs sm:text-sm text-[#0e1f16] leading-snug font-normal line-clamp-2">
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
