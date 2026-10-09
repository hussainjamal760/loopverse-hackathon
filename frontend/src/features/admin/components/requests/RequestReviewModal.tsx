'use client';

import React, { useState } from 'react';
import {
  HiArrowPathRoundedSquare,
  HiXMark,
  HiCheck,
  HiXCircle,
  HiExclamationCircle,
  HiShieldCheck,
  HiIdentification,
  HiCalendarDays,
  HiBuildingOffice2,
  HiEnvelope,
  HiDocumentText,
  HiArrowRight,
  HiSparkles,
} from 'react-icons/hi2';

export interface ChangeRequestData {
  _id: string;
  studentId: any;
  type: 'BRANCH' | 'DATE_SHEET';
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  currentBranchId?: any;
  requestedBranchId?: any;
  targetCourseId?: any;
  currentSlotId?: any;
  requestedSlotId?: any;
  remark?: string | null;
  reviewedBy?: any;
  reviewedAt?: string | null;
  createdAt: string;
}

interface RequestReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDecided: () => void;
  request: ChangeRequestData | null;
}

function formatSlotDateTime(slot?: { startsAt: string; endsAt: string } | null): string {
  if (!slot?.startsAt) return 'Not assigned';
  try {
    const s = new Date(slot.startsAt);
    const e = new Date(slot.endsAt);
    if (isNaN(s.getTime())) return 'TBA';
    const dateStr = s.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const startStr = s.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const endStr = e.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${dateStr} (${startStr} – ${endStr})`;
  } catch {
    return 'TBA';
  }
}

export function RequestReviewModal({
  isOpen,
  onClose,
  onDecided,
  request,
}: RequestReviewModalProps) {
  const [remark, setRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !request) return null;

  const student = request.studentId || {};
  const isPending = request.status === 'PENDING';
  const typeLabel = request.type === 'BRANCH' ? 'Campus Branch Transfer' : 'Exam Date Sheet Reschedule';

  const handleDecision = async (decision: 'APPROVED' | 'REJECTED') => {
    if (decision === 'REJECTED' && !remark.trim()) {
      setError('Please provide a remark explaining the reason for rejection.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/requests/${request._id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: decision,
          remark: remark.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit decision.');
      }

      onDecided();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-[#FFFFFF] border border-[#DEDCD1] rounded-2xl w-full max-w-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EAE7DD] flex items-center justify-between bg-[#F7F5EF]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#285742] text-white flex items-center justify-center">
              <HiArrowPathRoundedSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-[#24352B]">Review Change Request</h3>
              <p className="text-xs text-[#59645B]">{typeLabel}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#717973] hover:text-[#0d402c] p-1.5 rounded-lg hover:bg-[#EAE7DD] transition-colors"
          >
            <HiXMark className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-[#FAEAE7] border border-[#A3342F]/30 text-[#A3342F] text-xs rounded-xl flex items-center gap-2">
              <HiExclamationCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Student Dossier Summary */}
          <div className="p-4 bg-[#F7F5EF] rounded-xl border border-[#EAE7DD] space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-sm text-[#24352B] block">{student.fullName}</span>
                <span className="font-mono font-bold text-xs text-[#0d402c]">
                  {student.registrationNumber}
                </span>
              </div>
              <span className="text-[11px] font-semibold text-[#59645B] bg-white px-2.5 py-1 rounded-md border border-[#DEDCD1]">
                {student.program}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 text-[#59645B] border-t border-[#EAE7DD]">
              <div>
                Current Branch:{' '}
                <strong className="text-[#24352B]">
                  {student.selectedBranchId?.code || request.currentBranchId?.code || 'Not selected'}
                </strong>
              </div>
              <div>
                Email:{' '}
                <strong className="text-[#24352B]">{student.userId?.email || 'N/A'}</strong>
              </div>
            </div>
          </div>

          {/* STRUCTURED CHANGE PROPOSAL DISPLAY */}
          <div className="p-4 rounded-xl border-2 border-[#285742]/20 bg-[#E7EEE3]/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider text-[#285742] flex items-center gap-1.5">
                <HiSparkles className="w-4 h-4" />
                <span>Requested Change Details</span>
              </span>
              <span className="text-[10px] bg-[#285742] text-white px-2 py-0.5 rounded font-semibold">
                Auto-Apply on Approval
              </span>
            </div>

            {/* Branch Transfer Specific Display */}
            {request.type === 'BRANCH' && (
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-white rounded-lg border border-[#DEDCD1]">
                    <div className="text-[10px] text-[#59645B] uppercase font-bold">Current Center</div>
                    <div className="font-semibold text-[#24352B] mt-0.5">
                      {request.currentBranchId?.name || student.selectedBranchId?.name || 'Not assigned'}
                    </div>
                    <div className="text-[11px] text-[#59645B]">
                      {request.currentBranchId?.city || student.selectedBranchId?.city || ''}
                    </div>
                  </div>

                  <div className="p-2.5 bg-[#E7EEE3] rounded-lg border border-[#285742]/40">
                    <div className="text-[10px] text-[#285742] uppercase font-bold flex items-center gap-1">
                      <span>Requested Center</span>
                      <HiArrowRight className="w-3 h-3" />
                    </div>
                    <div className="font-bold text-[#0d402c] mt-0.5">
                      {request.requestedBranchId?.name || 'Open Selection'}
                    </div>
                    <div className="text-[11px] text-[#285742]">
                      {request.requestedBranchId?.city} — {request.requestedBranchId?.address || ''}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Date Sheet Exam Reschedule Display */}
            {request.type === 'DATE_SHEET' && (
              <div className="space-y-2">
                {request.targetCourseId && (
                  <div className="text-xs font-semibold text-[#24352B]">
                    Course:{' '}
                    <span className="text-[#0d402c]">
                      {request.targetCourseId.code} · {request.targetCourseId.title}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-white rounded-lg border border-[#DEDCD1]">
                    <div className="text-[10px] text-[#59645B] uppercase font-bold">Current Booked Slot</div>
                    <div className="font-semibold text-[#24352B] mt-0.5">
                      {formatSlotDateTime(request.currentSlotId)}
                    </div>
                  </div>

                  <div className="p-2.5 bg-[#E7EEE3] rounded-lg border border-[#285742]/40">
                    <div className="text-[10px] text-[#285742] uppercase font-bold flex items-center gap-1">
                      <span>Requested New Slot</span>
                      <HiArrowRight className="w-3 h-3" />
                    </div>
                    <div className="font-bold text-[#0d402c] mt-0.5">
                      {formatSlotDateTime(request.requestedSlotId)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <p className="text-[11px] text-[#59645B] pt-1 border-t border-[#DEDCD1]/60">
              {isPending
                ? 'Approving will immediately reassign the student to the requested campus or exam slot. Rejecting will leave the current schedule untouched.'
                : 'This request has already been finalized.'}
            </p>
          </div>

          {/* Request Reason */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[#24352B] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <HiDocumentText className="w-4 h-4 text-[#285742]" />
              Student Justification / Submitted Reason:
            </label>
            <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#DEDCD1] text-xs leading-relaxed text-[#24352B] italic">
              “{request.reason}”
            </div>
            <div className="text-[11px] text-[#717973]">
              Date Raised: {new Date(request.createdAt).toLocaleString()}
            </div>
          </div>

          {/* Previous Decision Details if already decided */}
          {!isPending && (
            <div
              className={`p-4 rounded-xl border space-y-1.5 ${
                request.status === 'APPROVED'
                  ? 'bg-[#E7EEE3] border-[#285742]/30 text-[#0d402c]'
                  : 'bg-[#FAEAE7] border-[#A3342F]/30 text-[#A3342F]'
              }`}
            >
              <div className="font-semibold text-xs">
                Status: {request.status}
              </div>
              {request.remark && (
                <div className="text-[11px]">
                  <strong>Admin Remark:</strong> {request.remark}
                </div>
              )}
              {request.reviewedAt && (
                <div className="text-[10px] opacity-80">
                  Reviewed on: {new Date(request.reviewedAt).toLocaleString()}
                </div>
              )}
            </div>
          )}

          {/* Remark Input if Pending */}
          {isPending && (
            <div className="space-y-1.5 pt-2 border-t border-[#EAE7DD]">
              <label className="block font-semibold text-[#24352B]">
                Registrar Remark / Feedback to Candidate:
              </label>
              <textarea
                rows={2}
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="e.g. Approved. Campus branch transferred per your relocation request."
                className="w-full px-3 py-2 text-xs border border-[#DEDCD1] rounded-xl focus:outline-none focus:border-[#285742] bg-[#FFFFFF]"
              />
              <p className="text-[10px] text-[#59645B]">
                This remark will be dispatched directly to the student via official email notification.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-[#F7F5EF] border-t border-[#EAE7DD] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-[#DEDCD1] rounded-xl text-xs font-semibold text-[#59645B] hover:bg-[#EAE7DD] transition-colors"
          >
            Close
          </button>

          {isPending && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleDecision('REJECTED')}
                className="px-4 py-2 bg-[#FAEAE7] border border-[#A3342F]/30 text-[#A3342F] hover:bg-[#A3342F] hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <HiXCircle className="w-4 h-4" />
                <span>Reject</span>
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleDecision('APPROVED')}
                className="px-5 py-2 bg-[#285742] hover:bg-[#204735] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <HiCheck className="w-4 h-4" />
                <span>{submitting ? 'Processing...' : 'Approve & Apply Change'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
