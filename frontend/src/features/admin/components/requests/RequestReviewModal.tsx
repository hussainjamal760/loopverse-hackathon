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
  HiArrowPath,
} from 'react-icons/hi2';

export interface ChangeRequestData {
  _id: string;
  studentId: any;
  type: 'BRANCH' | 'DATE_SHEET';
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
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
        <div className="p-6 space-y-5 text-xs">
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
                  {student.selectedBranchId?.code || 'Not selected'}
                </strong>
              </div>
              <div>
                Email:{' '}
                <strong className="text-[#24352B]">{student.userId?.email || 'N/A'}</strong>
              </div>
            </div>
          </div>

          {/* Request Reason */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[#24352B] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <HiDocumentText className="w-4 h-4 text-[#285742]" />
              Student Justification / Submitted Reason:
            </label>
            <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#DEDCD1] text-xs leading-relaxed text-[#24352B]">
              {request.reason}
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
                placeholder="e.g. Approved. You may select your replacement branch once in your portal."
                className="w-full px-3 py-2 text-xs border border-[#DEDCD1] rounded-xl focus:outline-none focus:border-[#285742] bg-[#FFFFFF]"
              />
              <p className="text-[10px] text-[#59645B]">
                This remark will be dispatched directly to the student via official email notification.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-[#EAE7DD] bg-[#F7F5EF] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#59645B] hover:text-[#24352B] border border-[#DEDCD1] rounded-xl hover:bg-[#FFFFFF] transition-colors"
          >
            Close
          </button>

          {isPending && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleDecision('REJECTED')}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#A3342F] hover:bg-[#852a26] rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                <HiXCircle className="w-4 h-4" />
                <span>Reject</span>
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleDecision('APPROVED')}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-[#285742] hover:bg-[#1f4534] rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <HiArrowPath className="w-4 h-4 animate-spin" />
                ) : (
                  <HiCheck className="w-4 h-4 stroke-[2]" />
                )}
                <span>Approve & Grant Unlock</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
