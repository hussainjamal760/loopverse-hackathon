'use client';

import React from 'react';
import Link from 'next/link';
import { HiArrowRight, HiInbox } from 'react-icons/hi2';
import { PendingRequestItem } from '../types';

export { type PendingRequestItem };

interface PendingRequestsTableProps {
  onSelectReview?: (request: PendingRequestItem) => void;
  requests?: PendingRequestItem[];
  pendingCount?: number;
}

export function PendingRequestsTable({
  onSelectReview,
  requests = [],
  pendingCount,
}: PendingRequestsTableProps) {
  const displayCount = pendingCount !== undefined ? pendingCount : requests.length;

  return (
    <div className="bg-white rounded-[20px] p-6 border border-[#c0c9c2]/50 shadow-xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-5 border-b border-[#c0c9c2]/30">
          <div className="flex items-center gap-3">
            <h2 className="text-[17px] font-semibold text-[#0e1f16]">Requests awaiting review</h2>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                displayCount > 0
                  ? 'bg-[#ffdf9e] text-[#261a00] border-[#e7c273]/50'
                  : 'bg-[#e4f9e9] text-[#0d402c] border-[#9fd2b7]/50'
              }`}
            >
              {displayCount} pending
            </span>
          </div>
          <Link
            href="/admin/requests"
            className="text-sm text-[#0d402c] font-medium hover:underline inline-flex items-center gap-1"
          >
            <span>View all requests</span>
            <HiArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Operational Table */}
        {requests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#c0c9c2]/30 text-[#414943] uppercase tracking-wider text-[11px] font-semibold">
                  <th className="py-3 px-3">Student</th>
                  <th className="py-3 px-3">Request</th>
                  <th className="py-3 px-3">Raised</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c0c9c2]/20 text-sm text-[#0e1f16]">
                {requests.map((item) => (
                  <tr key={item.id} className="hover:bg-[#e4f9e9]/50 transition-colors group">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#d9edde] text-[#285742] text-xs font-semibold flex items-center justify-center shrink-0 border border-[#c0c9c2]/40">
                          {item.initials}
                        </div>
                        <div>
                          <div className="font-semibold text-[#0e1f16]">{item.studentName}</div>
                          <div className="text-xs text-[#414943] font-mono font-medium">
                            {item.registrationNumber}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      {item.requestType === 'Branch change' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#d9edde] text-[#0d402c] font-semibold text-xs border border-[#9fd2b7]/50">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0d402c]" />
                          Branch change
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#e4f9e9] text-[#0e1f16] border border-[#c0c9c2]/50 text-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#285742]" />
                          Date sheet change
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-[#414943] text-xs">{item.raisedTime}</td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => onSelectReview?.(item)}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-white border border-[#c0c9c2] text-[#285742] hover:bg-[#e4f9e9] text-xs font-medium transition-all shadow-xs cursor-pointer"
                      >
                        <span>Review</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center text-[#717973] space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#e4f9e9] flex items-center justify-center text-[#0d402c]">
              <HiInbox className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-[#0e1f16]">All caught up!</p>
            <p className="text-xs text-[#414943] max-w-sm">
              No change requests are currently awaiting review. New student branch and date sheet requests will show here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
