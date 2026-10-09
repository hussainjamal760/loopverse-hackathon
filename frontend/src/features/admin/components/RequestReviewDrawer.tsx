'use client';

import React, { useState } from 'react';
import {
  HiPaperClip,
  HiArrowPathRoundedSquare,
  HiInformationCircle,
  HiCheckCircle,
  HiXMark,
} from 'react-icons/hi2';
import { toast } from 'sonner';
import { PendingRequestItem } from './PendingRequestsTable';

interface RequestReviewDrawerProps {
  selectedRequest?: PendingRequestItem | null;
  onClear?: () => void;
}

export function RequestReviewDrawer({ selectedRequest, onClear }: RequestReviewDrawerProps) {
  const [remark, setRemark] = useState('Verified medical submission via campus clinic registry.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const studentName = selectedRequest?.studentName || 'Ayesha Khan';
  const regNo = selectedRequest?.registrationNumber || 'VU-2026-0142';
  const initials = selectedRequest?.initials || 'AK';
  const requestType = selectedRequest?.requestType || 'Date sheet change';

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      toast.success(`Approved change request for ${studentName}`);
      onClear?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    setIsSubmitting(true);
    try {
      toast.info(`Rejected request for ${studentName}`);
      onClear?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-white rounded-[20px] p-6 lg:p-8 border border-[#c0c9c2]/50 shadow-xs relative overflow-hidden">
      {onClear && selectedRequest && (
        <button
          onClick={onClear}
          className="absolute top-4 right-4 text-[#717973] hover:text-[#0e1f16] p-1 rounded-lg hover:bg-[#e4f9e9] transition-colors"
          title="Close review panel"
        >
          <HiXMark className="w-5 h-5" />
        </button>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#c0c9c2]/30">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-[#d9edde] text-[#285742] text-lg font-semibold flex items-center justify-center shrink-0 border border-[#c0c9c2]/50">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[18px] font-semibold text-[#0e1f16]">{studentName}</h3>
              <span className="font-mono text-xs text-[#414943] bg-[#dff3e4] px-2 py-0.5 rounded border border-[#c0c9c2]/30 font-medium">
                {regNo}
              </span>
            </div>
            <p className="text-xs text-[#414943] mt-0.5">
              Computer Science Dept · Lahore Branch · 4 of 5 courses booked
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-[#ffdf9e] text-[#261a00] px-3 py-1 rounded-full text-xs font-semibold border border-[#e7c273]/50">
            Request: {requestType}
          </span>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Student statement & booking state */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#e4f9e9] rounded-xl p-4 border border-[#c0c9c2]/50">
            <span className="text-[11px] text-[#414943] uppercase tracking-wider font-semibold block mb-1">
              Student's Stated Reason
            </span>
            <p className="text-sm text-[#0e1f16] italic leading-relaxed">
              “Medical appointment conflict on Nov 12 morning slot; need to re-select afternoon slot for CS101.”
            </p>
            <div className="mt-3 pt-3 border-t border-[#c0c9c2]/30 flex items-center gap-4 text-xs text-[#414943]">
              <span className="flex items-center gap-1 font-medium">
                <HiPaperClip className="w-4 h-4 text-[#0d402c]" />
                <span>clinic-slip-nov12.pdf</span>
              </span>
              <span>•</span>
              <span className="text-[11px]">Uploaded today 10:24 AM</span>
            </div>
          </div>

          {/* Selected schedule snapshot */}
          <div className="border border-[#c0c9c2]/40 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-[#414943] uppercase tracking-wider font-semibold">
                Active Selection Conflict
              </span>
              <span className="text-xs font-semibold text-[#934a31]">Overlapping slot</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#d9edde]/40 text-[#0e1f16]">
              <div>
                <span className="text-xs sm:text-sm font-semibold block">
                  CS101 – 12 Nov, 9:00 AM (Slot 1)
                </span>
                <span className="text-xs text-[#414943]">Lahore Campus Hall A · Seat #24</span>
              </div>
              <HiArrowPathRoundedSquare className="w-5 h-5 text-[#934a31]" />
            </div>
          </div>
        </div>

        {/* Admin Decision & remarks */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div>
            <label
              htmlFor="admin-remark"
              className="block text-[11px] text-[#414943] uppercase tracking-wider font-semibold mb-1.5"
            >
              Admin Internal Remark
            </label>
            <textarea
              id="admin-remark"
              rows={3}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Enter reason for approval or rejection..."
              className="w-full bg-white border border-[#717973] rounded-xl p-3 text-xs sm:text-sm text-[#0e1f16] placeholder-[#717973] focus:outline-none focus:border-[#285742] focus:ring-2 focus:ring-[#285742]/20 transition-all"
            />
            {/* Caution note banner */}
            <div className="bg-[#ffdf9e]/40 text-[#644a03] p-3 rounded-xl text-xs font-medium border border-[#e7c273]/60 mt-3 flex items-start gap-2.5">
              <HiInformationCircle className="w-5 h-5 text-[#483400] mt-0.5 shrink-0" />
              <span>Approval allows this student to reopen selection and make this change once.</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleReject}
              className="px-4 py-2.5 rounded-xl border border-[#934a31] text-[#934a31] hover:bg-[#ffdbd0]/30 text-xs sm:text-sm font-medium transition-all cursor-pointer disabled:opacity-50"
            >
              Reject request
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleApprove}
              className="px-5 py-2.5 rounded-xl bg-[#285742] hover:bg-[#0d402c] text-white text-xs sm:text-sm font-medium shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <HiCheckCircle className="w-4 h-4" />
              <span>Approve change</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
