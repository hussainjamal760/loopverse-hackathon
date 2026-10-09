'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  HiArrowLeft,
  HiPaperAirplane,
  HiCheckCircle,
  HiClock,
  HiXCircle,
  HiInformationCircle,
  HiOutlineChatBubbleBottomCenterText,
  HiOutlineDocumentCheck,
} from 'react-icons/hi2';
import { toast } from 'sonner';
import { StudentHeader } from '@/features/student';

interface ExistingRequest {
  _id: string;
  type: 'BRANCH' | 'DATE_SHEET';
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  remark?: string | null;
  createdAt: string;
}

export default function StudentHelpPage() {
  const router = useRouter();
  const [studentName, setStudentName] = useState<string>('Student');
  const [requestType, setRequestType] = useState<'BRANCH' | 'DATE_SHEET'>('BRANCH');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [existingRequests, setExistingRequests] = useState<ExistingRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const meRes = await fetch('/api/me');
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.student?.fullName) {
            setStudentName(meData.student.fullName);
          }
        }

        const reqRes = await fetch('/api/requests');
        if (reqRes.ok) {
          const reqData = await reqRes.json();
          setExistingRequests(reqData.requests || []);
        }
      } catch (err) {
        console.error('Failed to load help page data:', err);
      } finally {
        setLoadingRequests(false);
      }
    }

    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('Please describe the reason for your change request.');
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
        toast.error(data.error || 'Failed to submit request ticket.');
        return;
      }

      toast.success('Change request ticket submitted to Registrar Office.');
      setSubmitted(true);
      setReason('');

      // Refresh list
      const reqRes = await fetch('/api/requests');
      if (reqRes.ok) {
        const reqData = await reqRes.json();
        setExistingRequests(reqData.requests || []);
      }
    } catch (err: any) {
      toast.error('Network error submitting request ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5EF] flex flex-col font-sans">
      <StudentHeader studentName={studentName} />

      <main className="w-full pt-[88px] pb-16 flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="mb-6">
            <Link
              href="/student/planner"
              className="text-xs font-semibold text-[#285742] hover:underline flex items-center gap-1 mb-2"
            >
              <HiArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Exam Planner</span>
            </Link>
            <h1
              className="text-2xl sm:text-3xl font-normal text-[#24352B] tracking-tight"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Change Requests & Registrar Help
            </h1>
            <p className="text-xs sm:text-sm text-[#59645B] mt-1">
              Submit formal change tickets for examination campus re-allocation or date sheet modification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Form Column */}
            <div className="md:col-span-7 bg-[#FFFFFF] border border-[#DEDCD1] rounded-2xl p-6 sm:p-7 shadow-xs">
              <h2 className="text-base font-semibold text-[#24352B] mb-4">
                Submit Formal Request Ticket
              </h2>

              {submitted ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-[#E7EEE3] text-[#285742] mx-auto flex items-center justify-center">
                    <HiCheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#24352B]">
                    Request Ticket Dispatched
                  </h3>
                  <p className="text-xs text-[#59645B] max-w-sm mx-auto leading-relaxed">
                    Your request has been submitted to the Examination Directorate. Once reviewed, you will receive an official decision.
                  </p>
                  <div className="pt-2 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="px-4 py-2 rounded-xl bg-[#F0EEE6] hover:bg-[#E7EEE3] text-[#24352B] text-xs font-semibold"
                    >
                      Submit Another Ticket
                    </button>
                    <Link
                      href="/student/planner"
                      className="inline-block px-5 py-2 rounded-xl bg-[#285742] hover:bg-[#204735] text-white text-xs font-semibold"
                    >
                      Return to Planner
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#24352B] mb-2">
                      Request Category
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
                        <div className="font-bold">Branch Reassignment</div>
                        <div className="text-[11px] text-[#59645B] mt-0.5">Change examination campus</div>
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
                        <div className="font-bold">Date Sheet Adjustment</div>
                        <div className="text-[11px] text-[#59645B] mt-0.5">Revise locked timetable slot</div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#24352B] mb-1.5">
                      Official Justification / Reason
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Provide specific details, e.g. medical emergency, relocation, or timetable clash..."
                      className="w-full p-3 bg-[#FFFFFF] border border-[#7B8578] rounded-xl text-xs text-[#24352B] placeholder-[#59645B]/60 focus:ring-2 focus:ring-[#285742] focus:outline-none"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-[#F0EEE6] border border-[#DEDCD1] text-xs text-[#59645B] flex items-start gap-2">
                    <HiInformationCircle className="w-4 h-4 text-[#285742] shrink-0 mt-0.5" />
                    <span>
                      Approved requests grant a single revision window in your exam portal.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-[#285742] hover:bg-[#204735] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-60"
                  >
                    <HiPaperAirplane className="w-4 h-4" />
                    <span>{submitting ? 'Submitting...' : 'Send Request to Registrar'}</span>
                  </button>
                </form>
              )}
            </div>

            {/* History Column */}
            <div className="md:col-span-5 bg-[#FFFFFF] border border-[#DEDCD1] rounded-2xl p-6 sm:p-7 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#DEDCD1]">
                <h3 className="text-sm font-semibold text-[#24352B] flex items-center gap-2">
                  <HiOutlineDocumentCheck className="w-4 h-4 text-[#285742]" />
                  <span>My Submitted Tickets</span>
                </h3>
                <span className="text-xs text-[#59645B] font-mono">
                  {existingRequests.length} total
                </span>
              </div>

              {loadingRequests ? (
                <div className="p-6 text-center text-xs text-[#59645B]">
                  Loading your ticket history...
                </div>
              ) : existingRequests.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#59645B] bg-[#F7F5EF] rounded-xl border border-dashed border-[#DEDCD1]">
                  No formal change requests submitted yet.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {existingRequests.map((req) => (
                    <div
                      key={req._id}
                      className="p-3.5 rounded-xl border border-[#DEDCD1] bg-[#F7F5EF] text-xs flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#24352B]">
                          {req.type === 'BRANCH' ? 'Branch Reassignment' : 'Date Sheet Adjustment'}
                        </span>
                        {req.status === 'PENDING' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#795D18] bg-[#F5EDCE] px-2 py-0.5 rounded-full border border-[#795D18]/20">
                            <HiClock className="w-3 h-3" />
                            <span>Pending</span>
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

                      <p className="text-[#59645B] leading-relaxed text-[11px]">
                        {req.reason}
                      </p>

                      {req.remark && (
                        <div className="p-2 rounded-lg bg-[#FFFFFF] border border-[#DEDCD1] text-[11px] text-[#24352B]">
                          <strong className="text-[#285742]">Admin Note:</strong> {req.remark}
                        </div>
                      )}

                      <span className="text-[10px] text-[#59645B] font-mono">
                        Submitted: {new Date(req.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
