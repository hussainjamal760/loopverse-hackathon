'use client';

import React, { useState, useEffect } from 'react';
import {
  HiCheckCircle,
  HiXMark,
  HiInformationCircle,
  HiXCircle,
  HiArrowPathRoundedSquare,
  HiClock,
} from 'react-icons/hi2';
import { toast } from 'sonner';
import { PendingRequestItem } from '../types';

interface RequestReviewDrawerProps {
  selectedRequest?: PendingRequestItem | null;
  onClear?: () => void;
  onDecided?: () => void;
}

export function RequestReviewDrawer({
  selectedRequest,
  onClear,
  onDecided,
}: RequestReviewDrawerProps) {
  const [remark, setRemark] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedRequest) {
      setRemark(selectedRequest.remark || '');
    }
  }, [selectedRequest?.id, selectedRequest?.remark]);

  if (!selectedRequest) {
    return (
      <section className="bg-white rounded-[20px] p-8 border border-[#c0c9c2]/50 shadow-xs text-center flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-[#e4f9e9] text-[#285742] flex items-center justify-center">
          <HiCheckCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-[#0e1f16]">All Change Requests Up to Date</h3>
        <p className="text-xs text-[#59645B] max-w-md">
          There are currently no student requests awaiting review. When a candidate submits a branch transfer or date sheet change request, it will appear here for review.
        </p>
      </section>
    );
  }

  const studentName = selectedRequest.studentName || 'Student';
  const regNo = selectedRequest.registrationNumber || 'N/A';
  const initials = selectedRequest.initials || 'ST';
  const requestType = selectedRequest.requestType || 'Date sheet change';
  const reason = selectedRequest.reason || 'No statement provided by candidate.';
  const isPending = selectedRequest.status === 'PENDING' || !selectedRequest.status;
  const program = selectedRequest.program || 'Degree Program';
  const branchText = selectedRequest.branchName
    ? `${selectedRequest.branchName}${selectedRequest.branchCity ? ` (${selectedRequest.branchCity})` : ''}`
    : 'Campus Center';
  const bookedCount = selectedRequest.bookedCoursesCount ?? 0;
  const totalCount = selectedRequest.totalCoursesCount ?? 0;

  const handleDecision = async (decision: 'APPROVED' | 'REJECTED') => {
    if (decision === 'REJECTED' && !remark.trim()) {
      toast.error('Please enter a remark explaining the rejection reason.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/requests/${selectedRequest.id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: decision,
          remark: remark.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to process decision.');
      }

      if (decision === 'APPROVED') {
        toast.success(`Approved change request for ${studentName}. Permissions granted.`);
      } else {
        toast.info(`Rejected request for ${studentName}.`);
      }

      onDecided?.();
      onClear?.();
    } catch (err: any) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-white rounded-[20px] p-6 lg:p-8 border border-[#c0c9c2]/50 shadow-xs relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
      {onClear && (
        <button
          onClick={onClear}
          className="absolute top-4 right-4 text-[#717973] hover:text-[#0e1f16] p-1.5 rounded-lg hover:bg-[#e4f9e9] transition-colors cursor-pointer"
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
              {program} · {branchText} · {bookedCount} of {totalCount || bookedCount} courses booked
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="bg-[#ffdf9e] text-[#261a00] px-3 py-1 rounded-full text-xs font-semibold border border-[#e7c273]/50">
            Request: {requestType}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${
              isPending
                ? 'bg-[#F7F5EF] text-[#795D18] border-[#795D18]/30'
                : selectedRequest.status === 'APPROVED'
                ? 'bg-[#E7EEE3] text-[#285742] border-[#285742]/30'
                : 'bg-[#FAEAE7] text-[#A3342F] border-[#A3342F]/30'
            }`}
          >
            {selectedRequest.status || 'PENDING'}
          </span>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Student statement & request context */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#e4f9e9] rounded-xl p-4 border border-[#c0c9c2]/50">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-[#414943] uppercase tracking-wider font-semibold">
                Student's Stated Reason
              </span>
              <span className="text-[11px] text-[#59645B] flex items-center gap-1">
                <HiClock className="w-3.5 h-3.5" />
                <span>Raised {selectedRequest.raisedTime}</span>
              </span>
            </div>
            <p className="text-sm text-[#0e1f16] italic leading-relaxed">
              “{reason}”
            </p>
          </div>

          {/* Contextual Box based on request type */}
          <div className="border border-[#c0c9c2]/40 rounded-xl p-4 bg-[#F7F5EF]/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-[#414943] uppercase tracking-wider font-semibold">
                {selectedRequest.type === 'BRANCH' ? 'Branch Reallocation Target' : 'Date Sheet Context'}
              </span>
              <span className="text-xs font-semibold text-[#285742]">
                {selectedRequest.type === 'BRANCH' ? 'Transfer Window' : 'Schedule Adjustment'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-[#c0c9c2]/30 text-[#0e1f16]">
              <div>
                {selectedRequest.type === 'BRANCH' ? (
                  <>
                    <span className="text-xs sm:text-sm font-semibold block">
                      {selectedRequest.branchName || 'Current Center'} ➔ {selectedRequest.requestedBranchName || 'Requested Center'}
                    </span>
                    <span className="text-xs text-[#414943]">
                      Approval automatically switches student's assigned campus center
                    </span>
                  </>
                ) : selectedRequest.targetCourseCode ? (
                  <>
                    <span className="text-xs sm:text-sm font-semibold block">
                      {selectedRequest.targetCourseCode} – {selectedRequest.targetCourseTitle || 'Course Slot'}
                    </span>
                    <span className="text-xs text-[#414943]">
                      {selectedRequest.currentSlotTime ? `Current slot: ${selectedRequest.currentSlotTime}` : 'Date sheet slot modification'}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-xs sm:text-sm font-semibold block">
                      {bookedCount} courses selected on active timetable
                    </span>
                    <span className="text-xs text-[#414943]">
                      Approval unlocks date sheet for one-time reschedule
                    </span>
                  </>
                )}
              </div>
              <HiArrowPathRoundedSquare className="w-5 h-5 text-[#285742] shrink-0" />
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
              disabled={!isPending || isSubmitting}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Enter reason for approval or rejection..."
              className="w-full bg-white border border-[#717973] rounded-xl p-3 text-xs sm:text-sm text-[#0e1f16] placeholder-[#717973] focus:outline-none focus:border-[#285742] focus:ring-2 focus:ring-[#285742]/20 transition-all disabled:opacity-60 disabled:bg-[#F7F5EF]"
            />
            {/* Caution note banner */}
            <div className="bg-[#ffdf9e]/40 text-[#644a03] p-3 rounded-xl text-xs font-medium border border-[#e7c273]/60 mt-3 flex items-start gap-2.5">
              <HiInformationCircle className="w-5 h-5 text-[#483400] mt-0.5 shrink-0" />
              <span>
                {isPending
                  ? 'Approval allows this student to reopen selection and make this change once.'
                  : `This request has already been reviewed (${selectedRequest.status}).`}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          {isPending ? (
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleDecision('REJECTED')}
                className="px-4 py-2.5 rounded-xl border border-[#934a31] text-[#934a31] hover:bg-[#ffdbd0]/30 text-xs sm:text-sm font-medium transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <HiXCircle className="w-4 h-4" />
                <span>Reject request</span>
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleDecision('APPROVED')}
                className="px-5 py-2.5 rounded-xl bg-[#285742] hover:bg-[#0d402c] text-white text-xs sm:text-sm font-medium shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <HiCheckCircle className="w-4 h-4" />
                <span>{isSubmitting ? 'Processing...' : 'Approve change'}</span>
              </button>
            </div>
          ) : (
            <div className="pt-2 text-right">
              <span className="text-xs text-[#59645B] italic">
                Decision finalized on record.
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
