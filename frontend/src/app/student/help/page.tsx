'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  HiArrowLeft,
  HiPaperAirplane,
  HiCheckCircle,
  HiClock,
  HiXCircle,
  HiInformationCircle,
  HiOutlineChatBubbleBottomCenterText,
  HiBuildingOffice2,
  HiCalendarDays,
  HiArrowRight,
} from 'react-icons/hi2';
import { toast } from 'sonner';
import { StudentHeader, StudentSidebar } from '@/features/student';

interface ExistingRequest {
  _id: string;
  type: 'BRANCH' | 'DATE_SHEET';
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  currentBranchId?: { _id: string; name: string; code: string; city: string } | null;
  requestedBranchId?: { _id: string; name: string; code: string; city: string } | null;
  targetCourseId?: { _id: string; code: string; title: string } | null;
  currentSlotId?: { _id: string; startsAt: string; endsAt: string } | null;
  requestedSlotId?: { _id: string; startsAt: string; endsAt: string } | null;
  remark?: string | null;
  createdAt: string;
}

interface BranchItem {
  _id: string;
  name: string;
  code: string;
  city: string;
  address: string;
}

interface CourseItem {
  _id: string;
  code: string;
  title: string;
  creditHours: number;
}

interface SlotItem {
  _id: string;
  courseId: string;
  startsAt: string;
  endsAt: string;
  status: 'PUBLISHED' | 'DRAFT';
}

function formatSlotTime(startsAt: string, endsAt: string): string {
  try {
    const s = new Date(startsAt);
    const e = new Date(endsAt);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return 'TBA';
    const dateStr = s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const startStr = s.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const endStr = e.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${dateStr} · ${startStr} – ${endStr}`;
  } catch {
    return 'TBA';
  }
}

export default function StudentHelpPage() {
  const [studentName, setStudentName] = useState<string>('Student');
  const [requestType, setRequestType] = useState<'BRANCH' | 'DATE_SHEET'>('BRANCH');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [existingRequests, setExistingRequests] = useState<ExistingRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  // Branch data
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [currentBranch, setCurrentBranch] = useState<BranchItem | null>(null);
  const [selectedTargetBranchId, setSelectedTargetBranchId] = useState<string>('');

  // Course & Exam Slot data
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [allSlots, setAllSlots] = useState<SlotItem[]>([]);
  const [currentSelections, setCurrentSelections] = useState<Record<string, any>>({});
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoadingRequests(true);
        // 1. Fetch user & planner state
        const [meRes, plannerRes, branchesRes, requestsRes] = await Promise.all([
          fetch('/api/me'),
          fetch('/api/student/planner'),
          fetch('/api/branches'),
          fetch('/api/requests'),
        ]);

        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.student?.fullName) {
            setStudentName(meData.student.fullName);
          }
        }

        if (branchesRes.ok) {
          const bData = await branchesRes.json();
          setBranches(bData.branches || []);
        }

        if (plannerRes.ok) {
          const pData = await plannerRes.json();
          if (pData.branch) {
            setCurrentBranch(pData.branch);
          }
          if (Array.isArray(pData.courses)) {
            setCourses(pData.courses);
          }
          if (Array.isArray(pData.slots)) {
            setAllSlots(pData.slots);
          }
          if (pData.dateSheet?.selections && Array.isArray(pData.dateSheet.selections)) {
            const selMap: Record<string, any> = {};
            for (const s of pData.dateSheet.selections) {
              const cId = s.courseId?._id || s.courseId;
              selMap[cId] = s.slotId;
            }
            setCurrentSelections(selMap);
          }
        }

        if (requestsRes.ok) {
          const reqData = await requestsRes.json();
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

  // Filter available target branches (exclude current)
  const availableBranches = branches.filter(
    (b) => !currentBranch || b._id !== currentBranch._id
  );

  // Available slots for selected course (excluding current slot)
  const currentSlotForSelectedCourse = selectedCourseId ? currentSelections[selectedCourseId] : null;
  const currentSlotIdStr = currentSlotForSelectedCourse?._id || currentSlotForSelectedCourse;

  const availableSlotsForCourse = allSlots.filter((slot) => {
    const slotCourseId = typeof slot.courseId === 'object' ? (slot.courseId as any)._id : slot.courseId;
    return slotCourseId === selectedCourseId && slot.status === 'PUBLISHED';
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (requestType === 'BRANCH' && !selectedTargetBranchId) {
      toast.error('Please choose which campus branch you wish to transfer to.');
      return;
    }

    if (requestType === 'DATE_SHEET') {
      if (!selectedCourseId) {
        toast.error('Please select which course exam you wish to reschedule.');
        return;
      }
      if (!selectedSlotId) {
        toast.error('Please select your preferred replacement exam slot.');
        return;
      }
    }

    if (!reason.trim()) {
      toast.error('Please provide a specific reason for your change request.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        type: requestType,
        reason: reason.trim(),
      };

      if (requestType === 'BRANCH') {
        payload.requestedBranchId = selectedTargetBranchId;
      } else {
        payload.targetCourseId = selectedCourseId;
        payload.requestedSlotId = selectedSlotId;
      }

      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to submit request ticket.');
        return;
      }

      toast.success('Change request ticket submitted to Registrar Office.');
      setSubmitted(true);
      setReason('');
      setSelectedTargetBranchId('');
      setSelectedCourseId('');
      setSelectedSlotId('');

      // Refresh requests list
      const reqRes = await fetch('/api/requests');
      if (reqRes.ok) {
        const reqData = await reqRes.json();
        setExistingRequests(reqData.requests || []);
      }
    } catch {
      toast.error('Network error submitting request ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5EF] flex flex-col font-sans">
      <StudentSidebar
        studentName={studentName}
        pendingRequestsCount={existingRequests.filter((r) => r.status === 'PENDING').length}
      />

      <StudentHeader studentName={studentName} />

      <main className="w-full pt-[88px] pb-16 flex-1 pl-0 lg:pl-[68px]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
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
              Submit formal change tickets for examination campus re-allocation or exam slot modification.
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
                    Your formal request has been forwarded to the Examination Directorate. Once approved by the administrator, your record will be updated automatically.
                  </p>
                  <div className="pt-2 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="px-4 py-2 rounded-xl bg-[#F0EEE6] hover:bg-[#E7EEE3] text-[#24352B] text-xs font-semibold cursor-pointer"
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
                  {/* Category Switcher */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#24352B] mb-2">
                      Request Category
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setRequestType('BRANCH');
                          setSelectedCourseId('');
                          setSelectedSlotId('');
                        }}
                        className={`p-3.5 rounded-xl border text-left text-xs transition-colors cursor-pointer ${
                          requestType === 'BRANCH'
                            ? 'bg-[#E7EEE3] border-[#285742] text-[#285742] font-semibold'
                            : 'bg-[#F7F5EF] border-[#DEDCD1] text-[#24352B]'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold">
                          <HiBuildingOffice2 className="w-4 h-4 text-[#285742]" />
                          <span>Branch Transfer</span>
                        </div>
                        <div className="text-[11px] text-[#59645B] mt-0.5">Switch exam campus</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setRequestType('DATE_SHEET');
                          setSelectedTargetBranchId('');
                        }}
                        className={`p-3.5 rounded-xl border text-left text-xs transition-colors cursor-pointer ${
                          requestType === 'DATE_SHEET'
                            ? 'bg-[#E7EEE3] border-[#285742] text-[#285742] font-semibold'
                            : 'bg-[#F7F5EF] border-[#DEDCD1] text-[#24352B]'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold">
                          <HiCalendarDays className="w-4 h-4 text-[#285742]" />
                          <span>Exam Slot Change</span>
                        </div>
                        <div className="text-[11px] text-[#59645B] mt-0.5">Reschedule timetable slot</div>
                      </button>
                    </div>
                  </div>

                  {/* BRANCH SELECTION FLOW */}
                  {requestType === 'BRANCH' && (
                    <div className="space-y-3.5 p-4 rounded-xl bg-[#F7F5EF] border border-[#DEDCD1]">
                      {currentBranch && (
                        <div className="flex items-center justify-between text-xs pb-2 border-b border-[#DEDCD1]/60">
                          <span className="text-[#59645B]">Current Assigned Campus:</span>
                          <span className="font-semibold text-[#24352B] bg-white px-2 py-0.5 rounded border border-[#DEDCD1]">
                            {currentBranch.code} · {currentBranch.name} ({currentBranch.city})
                          </span>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-bold text-[#24352B] mb-2">
                          Select Requested Campus Branch <span className="text-[#A3342F]">*</span>
                        </label>
                        {availableBranches.length > 0 ? (
                          <div className="space-y-2">
                            {availableBranches.map((b) => {
                              const isSelected = selectedTargetBranchId === b._id;
                              return (
                                <div
                                  key={b._id}
                                  onClick={() => setSelectedTargetBranchId(b._id)}
                                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                                    isSelected
                                      ? 'bg-white border-[#285742] ring-2 ring-[#285742]/20 shadow-xs'
                                      : 'bg-white/70 border-[#DEDCD1] hover:border-[#717973]'
                                  }`}
                                >
                                  <div>
                                    <div className="font-semibold text-xs text-[#24352B]">
                                      {b.code} · {b.name}
                                    </div>
                                    <div className="text-[11px] text-[#59645B] mt-0.5">
                                      {b.city} — {b.address}
                                    </div>
                                  </div>
                                  <div
                                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                      isSelected
                                        ? 'border-[#285742] bg-[#285742]'
                                        : 'border-[#717973] bg-white'
                                    }`}
                                  >
                                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-xs text-[#59645B]">No alternate branches available.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* DATE SHEET / EXAM SLOT SELECTION FLOW */}
                  {requestType === 'DATE_SHEET' && (
                    <div className="space-y-3.5 p-4 rounded-xl bg-[#F7F5EF] border border-[#DEDCD1]">
                      {/* Step 1: Select which course */}
                      <div>
                        <label className="block text-xs font-bold text-[#24352B] mb-1.5">
                          1. Select Enrolled Course Exam <span className="text-[#A3342F]">*</span>
                        </label>
                        <select
                          value={selectedCourseId}
                          onChange={(e) => {
                            setSelectedCourseId(e.target.value);
                            setSelectedSlotId('');
                          }}
                          className="w-full p-2.5 bg-white border border-[#7B8578] rounded-xl text-xs text-[#24352B] focus:ring-2 focus:ring-[#285742] focus:outline-none"
                        >
                          <option value="">-- Choose Course to Reschedule --</option>
                          {courses.map((c) => {
                            const curSlot = currentSelections[c._id];
                            const curInfo = curSlot
                              ? ` (Current: ${formatSlotTime(curSlot.startsAt, curSlot.endsAt)})`
                              : '';
                            return (
                              <option key={c._id} value={c._id}>
                                {c.code} · {c.title}{curInfo}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      {/* Step 2: Select preferred new slot */}
                      {selectedCourseId && (
                        <div>
                          <label className="block text-xs font-bold text-[#24352B] mb-2">
                            2. Choose Desired New Exam Slot <span className="text-[#A3342F]">*</span>
                          </label>

                          {availableSlotsForCourse.length > 0 ? (
                            <div className="space-y-2">
                              {availableSlotsForCourse.map((slot) => {
                                const isCurrent = currentSlotIdStr === slot._id;
                                const isSelected = selectedSlotId === slot._id;
                                const timeLabel = formatSlotTime(slot.startsAt, slot.endsAt);

                                return (
                                  <div
                                    key={slot._id}
                                    onClick={() => {
                                      if (!isCurrent) setSelectedSlotId(slot._id);
                                    }}
                                    className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                                      isCurrent
                                        ? 'bg-[#E7EEE3]/50 border-[#9fd2b7] opacity-70 cursor-not-allowed'
                                        : isSelected
                                        ? 'bg-white border-[#285742] ring-2 ring-[#285742]/20 shadow-xs cursor-pointer'
                                        : 'bg-white border-[#DEDCD1] hover:border-[#717973] cursor-pointer'
                                    }`}
                                  >
                                    <div>
                                      <div className="font-semibold text-xs text-[#24352B] flex items-center gap-2">
                                        <span>{timeLabel}</span>
                                        {isCurrent && (
                                          <span className="text-[10px] bg-[#285742] text-white px-1.5 py-0.2 rounded font-bold">
                                            Currently Booked
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    {!isCurrent && (
                                      <div
                                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                          isSelected
                                            ? 'border-[#285742] bg-[#285742]'
                                            : 'border-[#717973] bg-white'
                                        }`}
                                      >
                                        {isSelected && (
                                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-xs text-[#59645B] p-2 bg-white rounded-lg border border-[#DEDCD1]">
                              No alternate exam slots are currently published for this course.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Justification Textarea */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#24352B] mb-1.5">
                      Official Justification / Reason <span className="text-[#A3342F]">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Explain the reason for this request (e.g. city relocation, timetable overlap, medical appointment)..."
                      className="w-full p-3 bg-[#FFFFFF] border border-[#7B8578] rounded-xl text-xs text-[#24352B] placeholder-[#59645B]/60 focus:ring-2 focus:ring-[#285742] focus:outline-none"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-[#F0EEE6] border border-[#DEDCD1] text-xs text-[#59645B] flex items-start gap-2">
                    <HiInformationCircle className="w-4 h-4 text-[#285742] shrink-0 mt-0.5" />
                    <span>
                      Upon administrator approval, your requested campus branch or examination time slot will be automatically updated across your entire timetable.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-[#285742] hover:bg-[#204735] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-60"
                  >
                    <HiPaperAirplane className="w-4 h-4" />
                    <span>{submitting ? 'Submitting...' : 'Send Request to Examination Directorate'}</span>
                  </button>
                </form>
              )}
            </div>

            {/* History Column */}
            <div className="md:col-span-5 bg-[#FFFFFF] border border-[#DEDCD1] rounded-2xl p-6 sm:p-7 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#DEDCD1]">
                <h2 className="text-base font-semibold text-[#24352B]">Request History</h2>
                <span className="text-xs font-bold text-[#59645B] bg-[#F0EEE6] px-2 py-0.5 rounded-full">
                  {existingRequests.length} Total
                </span>
              </div>

              {loadingRequests ? (
                <div className="py-8 text-center text-xs text-[#59645B] animate-pulse">
                  Loading requests...
                </div>
              ) : existingRequests.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#59645B]">
                  No prior change requests filed.
                </div>
              ) : (
                <div className="space-y-3">
                  {existingRequests.map((req) => {
                    const isApproved = req.status === 'APPROVED';
                    const isRejected = req.status === 'REJECTED';
                    const isPending = req.status === 'PENDING';

                    return (
                      <div
                        key={req._id}
                        className="p-3.5 rounded-xl border border-[#DEDCD1] bg-[#F7F5EF] space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-[#24352B]">
                            {req.type === 'BRANCH' ? 'Branch Transfer' : 'Exam Slot Reschedule'}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isApproved
                                ? 'bg-[#E7EEE3] text-[#285742] border border-[#9fd2b7]'
                                : isRejected
                                ? 'bg-[#FAEAE7] text-[#A3342F] border border-[#ffa182]'
                                : 'bg-[#FFF8E7] text-[#795D18] border border-[#e7c273]'
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>

                        {/* Structured Request Target Details */}
                        {req.type === 'BRANCH' && req.requestedBranchId && (
                          <div className="p-2 rounded-lg bg-white border border-[#DEDCD1] text-[11px] text-[#24352B]">
                            <span className="text-[#59645B]">Requested Branch:</span>{' '}
                            <strong>{req.requestedBranchId.name} ({req.requestedBranchId.city})</strong>
                          </div>
                        )}

                        {req.type === 'DATE_SHEET' && req.targetCourseId && req.requestedSlotId && (
                          <div className="p-2 rounded-lg bg-white border border-[#DEDCD1] text-[11px] text-[#24352B] space-y-0.5">
                            <div>
                              <span className="text-[#59645B]">Course:</span>{' '}
                              <strong>{req.targetCourseId.code}</strong>
                            </div>
                            <div>
                              <span className="text-[#59645B]">New Slot:</span>{' '}
                              <strong>{formatSlotTime(req.requestedSlotId.startsAt, req.requestedSlotId.endsAt)}</strong>
                            </div>
                          </div>
                        )}

                        <p className="text-[#59645B] line-clamp-2 italic">“{req.reason}”</p>

                        {req.remark && (
                          <div className="p-2 rounded-lg bg-white border border-[#DEDCD1] text-[11px]">
                            <span className="font-bold text-[#24352B]">Admin Remark:</span>{' '}
                            <span className="text-[#59645B]">{req.remark}</span>
                          </div>
                        )}

                        <div className="text-[10px] text-[#717973] pt-1">
                          Raised: {new Date(req.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
