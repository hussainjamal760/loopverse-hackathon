'use client';

import React, { useState, useEffect } from 'react';
import {
  HiLockClosed,
  HiPrinter,
  HiArrowPath,
  HiQuestionMarkCircle,
  HiSparkles,
  HiXMark,
  HiPaperAirplane,
  HiClock,
  HiCheckCircle,
  HiXCircle,
  HiBuildingOffice2,
  HiCalendarDays,
  HiInformationCircle,
} from 'react-icons/hi2';
import { toast } from 'sonner';

export interface DateSheetRow {
  date: string;
  day?: string;
  timeSlot: string;
  code: string;
  title: string;
  hallDesk: string;
  rawDate?: number;
}

interface ExistingRequest {
  _id: string;
  type: 'BRANCH' | 'DATE_SHEET';
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  remark?: string | null;
  createdAt: string;
}

interface LockedDateSheetViewProps {
  studentName?: string;
  registrationNumber?: string;
  program?: string;
  branchName?: string;
  branchAddress?: string;
  rows?: DateSheetRow[];
  hasUnusedGrant?: boolean;
  onUnlock?: () => void;
  onBranchUpdated?: () => void;
}

export function LockedDateSheetView({
  studentName = 'Student',
  registrationNumber = '',
  program = '',
  branchName = 'Examination Center',
  branchAddress = '',
  rows = [],
  hasUnusedGrant = false,
  onUnlock,
  onBranchUpdated,
}: LockedDateSheetViewProps) {
  // Modal & help state
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [requestType, setRequestType] = useState<'BRANCH' | 'DATE_SHEET'>('DATE_SHEET');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Branch transfer modal state
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [branches, setBranches] = useState<Array<{ _id: string; name: string; city: string; address: string }>>([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [updatingBranch, setUpdatingBranch] = useState(false);

  // Student requests history
  const [requests, setRequests] = useState<ExistingRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Load request history
  const fetchRequests = async () => {
    try {
      setLoadingRequests(true);
      const res = await fetch('/api/requests');
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Sort rows chronologically by rawDate
  const sortedRows = [...rows].sort((a, b) => {
    if (a.rawDate && b.rawDate) return a.rawDate - b.rawDate;
    return a.date.localeCompare(b.date);
  });

  // Handle change request submit
  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('Please provide a specific reason for your change request.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: requestType,
          reason: reason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to submit request.');
        return;
      }

      toast.success('Change request ticket submitted to Registrar Office.');
      setReason('');
      setHelpModalOpen(false);
      fetchRequests();
    } catch {
      toast.error('Network error submitting change request.');
    } finally {
      setSubmitting(false);
    }
  };

  // Open branch change selector
  const handleOpenBranchModal = async () => {
    try {
      const res = await fetch('/api/branches');
      if (res.ok) {
        const data = await res.json();
        setBranches(data.branches || []);
        setBranchModalOpen(true);
      }
    } catch {
      toast.error('Failed to load branches.');
    }
  };

  // Submit branch change
  const handleConfirmBranchChange = async () => {
    if (!selectedBranchId) {
      toast.error('Please choose a new examination campus.');
      return;
    }

    setUpdatingBranch(true);
    try {
      const res = await fetch('/api/student/branch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branchId: selectedBranchId }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to reassign campus branch.');
        return;
      }

      toast.success('Campus branch updated successfully!');
      setBranchModalOpen(false);
      if (onBranchUpdated) onBranchUpdated();
      fetchRequests();
    } catch {
      toast.error('Network error updating branch.');
    } finally {
      setUpdatingBranch(false);
    }
  };

  // Check if there is an approved branch grant
  const hasApprovedBranchGrant = requests.some(
    (r) => r.type === 'BRANCH' && r.status === 'APPROVED'
  );

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
      {/* 1. Approved Change Grant Notification Banner */}
      {hasUnusedGrant && onUnlock && (
        <div className="p-4 rounded-2xl bg-[#E7EEE3] border-2 border-[#285742] text-[#285742] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#285742] text-white flex items-center justify-center shrink-0">
              <HiSparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs uppercase tracking-wider text-[#285742]">
                Admin Approved Date Sheet Change Window Open (One-Time Unlock)
              </div>
              <div className="text-xs text-[#24352B] mt-0.5">
                The Examination Directorate has authorized your timetable revision request. You may unlock and adjust your slots now.
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onUnlock}
            className="px-4 py-2.5 rounded-xl bg-[#285742] hover:bg-[#204735] text-white text-xs font-semibold transition-colors cursor-pointer shrink-0 inline-flex items-center gap-1.5 shadow-xs"
          >
            <HiArrowPath className="w-4 h-4" />
            <span>Unlock & Modify Date Sheet</span>
          </button>
        </div>
      )}

      {/* 2. Approved Branch Transfer Banner */}
      {hasApprovedBranchGrant && (
        <div className="p-4 rounded-2xl bg-[#E7EEE3] border-2 border-[#285742] text-[#285742] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#285742] text-white flex items-center justify-center shrink-0">
              <HiBuildingOffice2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs uppercase tracking-wider text-[#285742]">
                Admin Approved Branch Transfer Window Open (One-Time Unlock)
              </div>
              <div className="text-xs text-[#24352B] mt-0.5">
                Your branch change request was approved. You may select your new examination center now.
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenBranchModal}
            className="px-4 py-2.5 rounded-xl bg-[#285742] hover:bg-[#204735] text-white text-xs font-semibold transition-colors cursor-pointer shrink-0 inline-flex items-center gap-1.5 shadow-xs"
          >
            <HiBuildingOffice2 className="w-4 h-4" />
            <span>Select New Campus Branch</span>
          </button>
        </div>
      )}

      {/* 3. Official Status Banner */}
      <div className="p-4 rounded-2xl bg-[#E7EEE3] border border-[#285742]/20 text-[#285742] flex items-center justify-between shadow-xs print:hidden">
        <div className="flex items-center gap-2.5">
          <HiLockClosed className="w-5 h-5 text-[#285742]" />
          <span className="font-semibold text-sm">
            Official Examination Date Sheet (Finalized & Locked)
          </span>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-[#FFFFFF] text-[#285742] font-semibold shadow-xs">
          Registrar Approved · Fall 2026 Session
        </span>
      </div>

      {/* 4. Official Printable Date Sheet Card */}
      <div className="bg-[#FFFFFF] border border-[#DEDCD1] p-6 sm:p-8 rounded-2xl shadow-xs flex flex-col gap-6 print:border-none print:shadow-none print:p-0 print:m-0">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[#DEDCD1]">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-[#285742]">
              Virtual University of Pakistan
            </span>
            <h2
              className="text-2xl font-bold text-[#24352B] mt-1"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Official Student Date Sheet
            </h2>
            <div className="text-xs text-[#59645B] mt-1">
              Examination Center: <strong className="text-[#24352B]">{branchName}</strong>{' '}
              {branchAddress ? `· ${branchAddress}` : ''}
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-[#59645B] space-y-1">
            <div>
              <strong className="text-[#24352B]">Roll No / Reg:</strong>{' '}
              <span className="font-mono font-bold text-[#0d402c]">{registrationNumber || 'Pending'}</span>
            </div>
            <div>
              <strong className="text-[#24352B]">Candidate Name:</strong>{' '}
              <span className="font-semibold text-[#24352B]">{studentName}</span>
            </div>
            {program && (
              <div>
                <strong className="text-[#24352B]">Degree Program:</strong> {program}
              </div>
            )}
            <div>
              <strong className="text-[#24352B]">Academic Session:</strong> Fall 2026 Examination
            </div>
          </div>
        </div>

        {/* Date Sheet Table: Date, Day, Time, Code, Title, Hall - Sorted Chronologically */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-[#F0EEE6] text-[#59645B] text-xs uppercase font-semibold">
                <th className="py-3 px-4 rounded-l-xl">Exam Date</th>
                <th className="py-3 px-4">Day</th>
                <th className="py-3 px-4">Time Slot</th>
                <th className="py-3 px-4">Course Code</th>
                <th className="py-3 px-4">Course Title</th>
                <th className="py-3 px-4 rounded-r-xl">Hall / Desk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DEDCD1] text-[#24352B]">
              {sortedRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-[#59645B]">
                    No exam slots currently booked.
                  </td>
                </tr>
              ) : (
                sortedRows.map((row) => (
                  <tr key={row.code} className="hover:bg-[#F7F5EF] transition-colors">
                    <td className="py-3.5 px-4 font-semibold font-mono text-xs text-[#285742]">
                      {row.date}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-xs text-[#59645B]">
                      {row.day || 'Scheduled'}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-xs">{row.timeSlot}</td>
                    <td className="py-3.5 px-4 font-bold font-mono text-xs text-[#285742]">{row.code}</td>
                    <td className="py-3.5 px-4 text-xs font-medium">{row.title}</td>
                    <td className="py-3.5 px-4 text-[#59645B] font-mono text-xs">
                      {row.hallDesk}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Document Footer with Print Action & Need Help Action */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#DEDCD1]">
          <span className="text-xs text-[#59645B] font-mono">
            Digital Authentication Key:{' '}
            <code>VU-DS-{registrationNumber.replace(/[^0-9]/g, '').slice(-4) || '8841'}-F26</code>
          </span>

          <div className="flex items-center gap-3 print:hidden">
            {/* Need Help: Change Requests Button */}
            <button
              type="button"
              onClick={() => setHelpModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#F0EEE6] hover:bg-[#E7EEE3] text-[#24352B] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer border border-[#DEDCD1]"
            >
              <HiQuestionMarkCircle className="w-4 h-4 text-[#285742]" />
              <span>Need Help? Request Change</span>
            </button>

            {/* Print Date Sheet Button */}
            <button
              type="button"
              onClick={() => window.print()}
              className="px-5 py-2.5 rounded-xl bg-[#285742] hover:bg-[#204735] text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
            >
              <HiPrinter className="w-4 h-4" />
              <span>Print Date Sheet</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. Student Change Request Status Log Strip (Section 5.5) */}
      <div className="bg-[#FFFFFF] border border-[#DEDCD1] p-5 sm:p-6 rounded-2xl shadow-xs print:hidden">
        <div className="flex items-center justify-between pb-3 border-b border-[#DEDCD1]">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm text-[#24352B]">
              My Change Request Tickets & Registrar Decisions
            </h3>
            <span className="text-[11px] font-mono text-[#59645B] bg-[#F7F5EF] px-2 py-0.5 rounded-md border border-[#DEDCD1]">
              {requests.length} submitted
            </span>
          </div>

          <button
            type="button"
            onClick={() => setHelpModalOpen(true)}
            className="text-xs font-semibold text-[#285742] hover:underline"
          >
            + Submit New Ticket
          </button>
        </div>

        {loadingRequests ? (
          <div className="py-6 text-center text-xs text-[#59645B]">
            Checking ticket status...
          </div>
        ) : requests.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#59645B]">
            No change tickets raised. To request a center transfer or date sheet revision, use the "Need Help" button above.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
            {requests.map((req) => (
              <div
                key={req._id}
                className="p-3.5 rounded-xl border border-[#DEDCD1] bg-[#F7F5EF] text-xs flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#24352B] flex items-center gap-1.5">
                    {req.type === 'BRANCH' ? (
                      <HiBuildingOffice2 className="w-4 h-4 text-[#285742]" />
                    ) : (
                      <HiCalendarDays className="w-4 h-4 text-[#285742]" />
                    )}
                    <span>{req.type === 'BRANCH' ? 'Change Branch' : 'Change Date Sheet'}</span>
                  </span>

                  {req.status === 'PENDING' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#795D18] bg-[#F5EDCE] px-2 py-0.5 rounded-full border border-[#795D18]/20">
                      <HiClock className="w-3 h-3" />
                      <span>Pending Review</span>
                    </span>
                  ) : req.status === 'APPROVED' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#285742] bg-[#E7EEE3] px-2 py-0.5 rounded-full border border-[#285742]/20">
                      <HiCheckCircle className="w-3 h-3" />
                      <span>Approved</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#A3342F] bg-[#FAEAE7] px-2 py-0.5 rounded-full border border-[#A3342F]/20">
                      <HiXCircle className="w-3 h-3" />
                      <span>Rejected</span>
                    </span>
                  )}
                </div>

                <p className="text-[#59645B] text-[11px] leading-relaxed">
                  <strong>Reason:</strong> {req.reason}
                </p>

                {req.remark && (
                  <div className="p-2 rounded-lg bg-[#FFFFFF] border border-[#DEDCD1] text-[11px] text-[#24352B]">
                    <strong className="text-[#285742]">Admin Remark:</strong> {req.remark}
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-[#717973] pt-1 border-t border-[#DEDCD1]/60">
                  <span>
                    Raised: {new Date(req.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                  </span>
                  {req.status === 'APPROVED' && req.type === 'DATE_SHEET' && onUnlock && (
                    <button
                      type="button"
                      onClick={onUnlock}
                      className="text-[#285742] font-semibold hover:underline"
                    >
                      Use Unlock Grant →
                    </button>
                  )}
                  {req.status === 'APPROVED' && req.type === 'BRANCH' && (
                    <button
                      type="button"
                      onClick={handleOpenBranchModal}
                      className="text-[#285742] font-semibold hover:underline"
                    >
                      Choose Branch →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Need Help: Change Request Modal (Section 5.5) */}
      {helpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#FFFFFF] border border-[#DEDCD1] rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-[#EAE7DD] flex items-center justify-between bg-[#F7F5EF]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#285742] text-white flex items-center justify-center">
                  <HiQuestionMarkCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-[#24352B]">Need Help: Change Request</h3>
                  <p className="text-xs text-[#59645B]">Submit formal request to university registrar</p>
                </div>
              </div>
              <button
                onClick={() => setHelpModalOpen(false)}
                className="text-[#717973] hover:text-[#0d402c] p-1.5 rounded-lg hover:bg-[#EAE7DD] transition-colors"
              >
                <HiXMark className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#24352B] mb-2">
                  Select Request Choice
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRequestType('BRANCH')}
                    className={`p-3.5 rounded-xl border text-left text-xs transition-colors cursor-pointer ${
                      requestType === 'BRANCH'
                        ? 'bg-[#E7EEE3] border-[#285742] text-[#285742] font-semibold'
                        : 'bg-[#F7F5EF] border-[#DEDCD1] text-[#24352B]'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      <HiBuildingOffice2 className="w-4 h-4" />
                      <span>1. Change Branch</span>
                    </div>
                    <div className="text-[11px] text-[#59645B] mt-0.5">Switch exam campus center</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRequestType('DATE_SHEET')}
                    className={`p-3.5 rounded-xl border text-left text-xs transition-colors cursor-pointer ${
                      requestType === 'DATE_SHEET'
                        ? 'bg-[#E7EEE3] border-[#285742] text-[#285742] font-semibold'
                        : 'bg-[#F7F5EF] border-[#DEDCD1] text-[#24352B]'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      <HiCalendarDays className="w-4 h-4" />
                      <span>2. Change Date Sheet</span>
                    </div>
                    <div className="text-[11px] text-[#59645B] mt-0.5">Reopen slot selection</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#24352B] mb-1.5">
                  Detailed Reason / Official Justification
                </label>
                <textarea
                  rows={4}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Specify details, e.g. medical emergency, relocation, family commitment, or timetable clash..."
                  className="w-full p-3 bg-[#FFFFFF] border border-[#7B8578] rounded-xl text-xs text-[#24352B] placeholder-[#59645B]/60 focus:ring-2 focus:ring-[#285742] focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#F0EEE6] border border-[#DEDCD1] text-xs text-[#59645B] flex items-start gap-2">
                <HiInformationCircle className="w-4 h-4 text-[#285742] shrink-0 mt-0.5" />
                <span>
                  Requests appear in the Registrar Panel. When approved, a single-use unlock grant will open the relevant action.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setHelpModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#DEDCD1] text-[#59645B] text-xs font-semibold hover:bg-[#F7F5EF]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#285742] hover:bg-[#204735] text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
                >
                  <HiPaperAirplane className="w-4 h-4" />
                  <span>{submitting ? 'Submitting...' : 'Submit Request Ticket'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Branch Selection Modal when Branch Grant Approved */}
      {branchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#FFFFFF] border border-[#DEDCD1] rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-[#EAE7DD] flex items-center justify-between bg-[#F7F5EF]">
              <div className="flex items-center gap-2">
                <HiBuildingOffice2 className="w-5 h-5 text-[#285742]" />
                <h3 className="font-semibold text-base text-[#24352B]">Select New Campus Branch</h3>
              </div>
              <button
                onClick={() => setBranchModalOpen(false)}
                className="text-[#717973] hover:text-[#0d402c] p-1 rounded-lg"
              >
                <HiXMark className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-[#59645B]">
                Your branch change request was approved. Select your new examination center:
              </p>

              <div className="space-y-2">
                {branches.map((b) => (
                  <button
                    key={b._id}
                    type="button"
                    onClick={() => setSelectedBranchId(b._id)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-colors cursor-pointer ${
                      selectedBranchId === b._id
                        ? 'bg-[#E7EEE3] border-[#285742] text-[#285742]'
                        : 'bg-[#F7F5EF] border-[#DEDCD1] text-[#24352B] hover:bg-[#EAE7DD]'
                    }`}
                  >
                    <div className="font-bold text-sm">{b.name}</div>
                    <div className="text-[11px] text-[#59645B] mt-0.5">{b.address}, {b.city}</div>
                  </button>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setBranchModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#DEDCD1] text-[#59645B] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={updatingBranch || !selectedBranchId}
                  onClick={handleConfirmBranchChange}
                  className="px-5 py-2 rounded-xl bg-[#285742] hover:bg-[#204735] text-white text-xs font-semibold disabled:opacity-50"
                >
                  {updatingBranch ? 'Updating Center...' : 'Confirm Branch Transfer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
