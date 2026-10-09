'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  HiCalendarDays,
  HiPlus,
  HiMagnifyingGlass,
  HiPencil,
  HiTrash,
  HiShieldCheck,
  HiExclamationTriangle,
  HiArrowPath,
  HiCheckCircle,
  HiClock,
  HiBookOpen,
  HiUsers,
} from 'react-icons/hi2';
import { ScheduleModal, ExamSlotData } from './ScheduleModal';

export function ScheduleTable() {
  const [slots, setSlots] = useState<ExamSlotData[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [slotToEdit, setSlotToEdit] = useState<ExamSlotData | null>(null);

  // Safe delete dialog
  const [deleteTarget, setDeleteTarget] = useState<ExamSlotData | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Load courses for filter & modal
  useEffect(() => {
    async function loadCourses() {
      try {
        const res = await fetch('/api/courses?pageSize=100');
        const data = await res.json();
        if (res.ok) {
          setCourses(data.courses || []);
        }
      } catch (err) {
        console.error('Failed to load courses:', err);
      }
    }
    loadCourses();
  }, []);

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '10',
      });
      if (search) params.set('search', search);
      if (courseFilter) params.set('courseId', courseFilter);
      if (statusFilter !== 'ALL') params.set('status', statusFilter);

      const res = await fetch(`/api/schedules?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setSlots(data.slots || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Fetch slots error:', err);
    } finally {
      setLoading(false);
    }
  }, [search, courseFilter, statusFilter, page]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const handleOpenAdd = () => {
    setSlotToEdit(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (slot: ExamSlotData) => {
    setSlotToEdit(slot);
    setModalOpen(true);
  };

  const handleDeleteClick = (slot: ExamSlotData) => {
    setDeleteTarget(slot);
    setDeleteError(null);
  };

  const executeDelete = async () => {
    if (!deleteTarget?._id) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/schedules/${deleteTarget._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        setDeleteError(data.error || 'Failed to delete slot');
        return;
      }
      setDeleteTarget(null);
      fetchSlots();
    } catch (err: any) {
      setDeleteError(err.message || 'Network error');
    } finally {
      setDeleting(false);
    }
  };

  const toggleStatus = async (slot: ExamSlotData) => {
    if (!slot._id) return;
    const newStatus = slot.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      const res = await fetch(`/api/schedules/${slot._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchSlots();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update status');
      }
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  // Format date helper
  const formatSlotDateTime = (startsAt: string, endsAt: string) => {
    const s = new Date(startsAt);
    const e = new Date(endsAt);
    const dateStr = s.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const timeStr = `${s.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })} – ${e.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })}`;
    return { dateStr, timeStr };
  };

  return (
    <div className="space-y-4">
      {/* Action & Filter Bar */}
      <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#DEDCD1] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717973]" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by course code or title..."
              className="w-full pl-10 pr-4 py-2 text-xs border border-[#DEDCD1] rounded-xl focus:outline-none focus:border-[#285742] bg-[#F7F5EF]/50"
            />
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => fetchSlots()}
              className="p-2 border border-[#DEDCD1] text-[#59645B] hover:text-[#24352B] hover:bg-[#F7F5EF] rounded-xl transition-colors"
              title="Refresh"
            >
              <HiArrowPath className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#285742] hover:bg-[#1f4534] rounded-xl shadow-xs transition-colors"
            >
              <HiPlus className="w-4 h-4" />
              <span>Schedule Slot</span>
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#EAE7DD] text-xs">
          <span className="text-[#59645B] font-medium">Filter by:</span>

          <select
            value={courseFilter}
            onChange={(e) => {
              setCourseFilter(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1 border border-[#DEDCD1] rounded-lg bg-white text-xs text-[#24352B]"
          >
            <option value="">All Academic Courses</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.code} - {c.title}
              </option>
            ))}
          </select>

          <div className="inline-flex rounded-lg border border-[#DEDCD1] p-0.5 bg-[#F7F5EF]">
            {['ALL', 'PUBLISHED', 'DRAFT'].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  statusFilter === st
                    ? 'bg-white text-[#0d402c] shadow-xs font-semibold'
                    : 'text-[#59645B] hover:text-[#24352B]'
                }`}
              >
                {st === 'ALL' ? 'All Status' : st === 'PUBLISHED' ? 'Published' : 'Draft'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Slots Data Table */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#DEDCD1] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F5EF] border-b border-[#EAE7DD] text-[#59645B] font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Course</th>
                <th className="px-5 py-3">Exam Date & Day</th>
                <th className="px-5 py-3">Scheduled Time</th>
                <th className="px-5 py-3">Student Bookings</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE7DD]">
              {loading && slots.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-[#59645B]">
                    <div className="inline-flex items-center gap-2">
                      <HiArrowPath className="w-4 h-4 animate-spin text-[#285742]" />
                      <span>Loading university exam slot schedules...</span>
                    </div>
                  </td>
                </tr>
              ) : slots.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-[#59645B]">
                    <p className="font-semibold text-sm text-[#24352B]">No exam slots scheduled</p>
                    <p className="text-xs text-[#59645B] mt-1">Click "Schedule Slot" to offer exam time choices to students.</p>
                  </td>
                </tr>
              ) : (
                slots.map((slot) => {
                  const { dateStr, timeStr } = formatSlotDateTime(slot.startsAt, slot.endsAt);
                  const course = slot.courseId || {};
                  return (
                    <tr key={slot._id} className="hover:bg-[#F7F5EF]/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-mono font-bold text-[#0d402c] text-xs">
                          {course.code || 'N/A'}
                        </div>
                        <div className="text-[#24352B] font-medium truncate max-w-xs">
                          {course.title || 'Course Details'}
                        </div>
                        <div className="text-[10px] text-[#59645B] mt-0.5">
                          {course.department} • {course.creditHours} CH
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-[#24352B] inline-flex items-center gap-1.5">
                          <HiCalendarDays className="w-4 h-4 text-[#285742]" />
                          {dateStr}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[#24352B]">
                        <span className="inline-flex items-center gap-1.5">
                          <HiClock className="w-3.5 h-3.5 text-[#59645B]" />
                          {timeStr}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {slot.bookedCount && slot.bookedCount > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E7EEE3] text-[#285742] border border-[#285742]/20">
                            <HiUsers className="w-3.5 h-3.5" />
                            {slot.bookedCount} Students
                          </span>
                        ) : (
                          <span className="text-[#717973] italic">0 selections</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          type="button"
                          onClick={() => toggleStatus(slot)}
                          title="Click to toggle status"
                          className="focus:outline-none"
                        >
                          {slot.status === 'PUBLISHED' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E7EEE3] text-[#285742] border border-[#285742]/20 hover:bg-[#d9edde] transition-colors">
                              <HiCheckCircle className="w-3 h-3" />
                              Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F5EDCE] text-[#795D18] border border-[#e7c273] hover:bg-[#ece2bb] transition-colors">
                              <HiClock className="w-3 h-3" />
                              Draft
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => handleOpenEdit(slot)}
                            className="p-1.5 text-[#59645B] hover:text-[#285742] hover:bg-[#E7EEE3] rounded-lg transition-colors"
                            title="Edit slot"
                          >
                            <HiPencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(slot)}
                            className="p-1.5 text-[#59645B] hover:text-[#A3342F] hover:bg-[#FAEAE7] rounded-lg transition-colors"
                            title="Delete slot"
                          >
                            <HiTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Strip */}
        <div className="px-5 py-3 border-t border-[#EAE7DD] bg-[#F7F5EF] flex items-center justify-between text-xs text-[#59645B]">
          <div>
            Showing <span className="font-semibold text-[#24352B]">{slots.length}</span> of{' '}
            <span className="font-semibold text-[#24352B]">{totalCount}</span> scheduled exam slots
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1 border border-[#DEDCD1] rounded-lg bg-white disabled:opacity-40 hover:bg-[#F7F5EF] transition-colors"
            >
              Previous
            </button>
            <span className="px-2 font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1 border border-[#DEDCD1] rounded-lg bg-white disabled:opacity-40 hover:bg-[#F7F5EF] transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Schedule Create / Edit Modal */}
      <ScheduleModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={fetchSlots}
        slotToEdit={slotToEdit}
        courses={courses}
      />

      {/* Safe Delete Protection Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#FFFFFF] border border-[#DEDCD1] rounded-2xl w-full max-w-md shadow-xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3 text-[#A3342F]">
              <div className="w-10 h-10 rounded-full bg-[#FAEAE7] flex items-center justify-center">
                <HiExclamationTriangle className="w-5 h-5 text-[#A3342F]" />
              </div>
              <div>
                <h3 className="font-semibold text-base text-[#24352B]">Delete Exam Slot</h3>
                <p className="text-xs text-[#59645B]">
                  {deleteTarget.courseId?.code} — {deleteTarget.courseId?.title}
                </p>
              </div>
            </div>

            {deleteError ? (
              <div className="p-3 bg-[#FAEAE7] border border-[#A3342F]/30 rounded-xl space-y-2">
                <div className="flex items-start gap-2 text-xs text-[#A3342F]">
                  <HiShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{deleteError}</span>
                </div>
                <p className="text-[11px] text-[#59645B]">
                  Per examination integrity regulations, slots that have already been chosen by students in finalized date sheets cannot be deleted directly. You can unpublish or manage through administrative change requests.
                </p>
              </div>
            ) : (
              <p className="text-xs text-[#59645B] leading-relaxed">
                Are you sure you want to delete this exam slot? If any student has already saved this slot into their finalized date sheet, safe deletion protection will reject the removal.
              </p>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-[#59645B] hover:text-[#24352B] border border-[#DEDCD1] rounded-xl hover:bg-[#F7F5EF] transition-colors"
              >
                Close
              </button>
              {!deleteError && (
                <button
                  onClick={executeDelete}
                  disabled={deleting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#A3342F] hover:bg-[#852a26] rounded-xl transition-colors disabled:opacity-50"
                >
                  {deleting ? 'Checking...' : 'Delete Slot'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
