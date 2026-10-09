'use client';

import React, { useState, useEffect } from 'react';
import {
  HiCalendarDays,
  HiXMark,
  HiCheck,
  HiExclamationCircle,
  HiClock,
  HiBookOpen,
} from 'react-icons/hi2';

export interface ExamSlotData {
  _id?: string;
  courseId: any;
  startsAt: string;
  endsAt: string;
  status: 'DRAFT' | 'PUBLISHED';
  bookedCount?: number;
  isBooked?: boolean;
}

interface CourseOption {
  _id: string;
  code: string;
  title: string;
  department: string;
}

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  slotToEdit?: ExamSlotData | null;
  courses: CourseOption[];
}

export function ScheduleModal({
  isOpen,
  onClose,
  onSaved,
  slotToEdit,
  courses,
}: ScheduleModalProps) {
  const [courseId, setCourseId] = useState('');
  const [date, setDate] = useState('2026-11-12');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('PUBLISHED');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slotToEdit) {
      const cId = typeof slotToEdit.courseId === 'object' ? slotToEdit.courseId._id : slotToEdit.courseId;
      setCourseId(cId || '');
      const s = new Date(slotToEdit.startsAt);
      const e = new Date(slotToEdit.endsAt);
      setDate(s.toISOString().split('T')[0]);
      setStartTime(s.toTimeString().slice(0, 5));
      setEndTime(e.toTimeString().slice(0, 5));
      setStatus(slotToEdit.status || 'PUBLISHED');
    } else {
      if (courses.length > 0) setCourseId(courses[0]._id);
      setDate('2026-11-12');
      setStartTime('09:00');
      setEndTime('11:00');
      setStatus('PUBLISHED');
    }
    setError(null);
  }, [slotToEdit, isOpen, courses]);

  if (!isOpen) return null;

  const isEdit = Boolean(slotToEdit?._id);
  const isBooked = Boolean(slotToEdit?.isBooked);

  // Time preset helper: 2 hours duration
  const applyPreset = (presetStart: string, presetEnd: string) => {
    setStartTime(presetStart);
    setEndTime(presetEnd);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const startsAt = new Date(`${date}T${startTime}:00+05:00`).toISOString();
      const endsAt = new Date(`${date}T${endTime}:00+05:00`).toISOString();

      if (new Date(startsAt) <= new Date()) {
        throw new Error('Exam slot cannot be scheduled in the past.');
      }
      if (new Date(endsAt) <= new Date(startsAt)) {
        throw new Error('End time must be strictly after start time.');
      }

      const url = isEdit ? `/api/schedules/${slotToEdit!._id}` : '/api/schedules';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          startsAt,
          endsAt,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save exam schedule slot.');
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-[#FFFFFF] border border-[#DEDCD1] rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EAE7DD] flex items-center justify-between bg-[#F7F5EF]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#285742] text-white flex items-center justify-center">
              <HiCalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-[#24352B]">
                {isEdit ? 'Edit Exam Slot' : 'Create Exam Slot'}
              </h3>
              <p className="text-xs text-[#59645B]">
                {isEdit ? 'Update scheduled timing and publishing state' : 'Offer an official exam sitting for student selection'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#717973] hover:text-[#0d402c] p-1.5 rounded-lg hover:bg-[#EAE7DD] transition-colors"
          >
            <HiXMark className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-[#FAEAE7] border border-[#A3342F]/30 text-[#A3342F] text-xs rounded-xl flex items-center gap-2">
              <HiExclamationCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isBooked && (
            <div className="p-3 bg-[#F5EDCE] border border-[#795D18]/30 text-[#795D18] text-xs rounded-xl flex items-center gap-2">
              <HiExclamationCircle className="w-4 h-4 shrink-0" />
              <span>This slot is booked by {slotToEdit?.bookedCount} students. Modifying date/time is protected.</span>
            </div>
          )}

          {/* Academic Course Selection */}
          <div>
            <label className="block text-xs font-semibold text-[#24352B] mb-1">
              Academic Course <span className="text-[#A3342F]">*</span>
            </label>
            <select
              required
              disabled={isEdit}
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-[#DEDCD1] rounded-xl focus:outline-none focus:border-[#285742] bg-[#FFFFFF] disabled:bg-[#F7F5EF] disabled:cursor-not-allowed"
            >
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.code} — {c.title} ({c.department})
                </option>
              ))}
            </select>
          </div>

          {/* Exam Date */}
          <div>
            <label className="block text-xs font-semibold text-[#24352B] mb-1">
              Exam Date <span className="text-[#A3342F]">*</span>
            </label>
            <input
              type="date"
              required
              disabled={isBooked}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-[#DEDCD1] rounded-xl focus:outline-none focus:border-[#285742] bg-[#FFFFFF] disabled:bg-[#F7F5EF] disabled:cursor-not-allowed"
            />
          </div>

          {/* Time Interval & Presets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#24352B]">
                Time Range (Asia/Karachi) <span className="text-[#A3342F]">*</span>
              </label>
              {!isBooked && (
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="text-[#59645B]">Presets:</span>
                  <button
                    type="button"
                    onClick={() => applyPreset('09:00', '11:00')}
                    className="px-2 py-0.5 bg-[#F7F5EF] border border-[#DEDCD1] rounded text-[#285742] font-semibold hover:bg-[#E7EEE3]"
                  >
                    Morning (09-11)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('14:00', '16:00')}
                    className="px-2 py-0.5 bg-[#F7F5EF] border border-[#DEDCD1] rounded text-[#285742] font-semibold hover:bg-[#E7EEE3]"
                  >
                    Afternoon (14-16)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('17:00', '19:00')}
                    className="px-2 py-0.5 bg-[#F7F5EF] border border-[#DEDCD1] rounded text-[#285742] font-semibold hover:bg-[#E7EEE3]"
                  >
                    Evening (17-19)
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-[11px] text-[#59645B] mb-1">Start Time</span>
                <input
                  type="time"
                  required
                  disabled={isBooked}
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#DEDCD1] rounded-xl focus:outline-none focus:border-[#285742] bg-[#FFFFFF] disabled:bg-[#F7F5EF] disabled:cursor-not-allowed font-mono"
                />
              </div>

              <div>
                <span className="block text-[11px] text-[#59645B] mb-1">End Time</span>
                <input
                  type="time"
                  required
                  disabled={isBooked}
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#DEDCD1] rounded-xl focus:outline-none focus:border-[#285742] bg-[#FFFFFF] disabled:bg-[#F7F5EF] disabled:cursor-not-allowed font-mono"
                />
              </div>
            </div>
          </div>

          {/* Publication State */}
          <div className="pt-2 border-t border-[#EAE7DD]">
            <label className="block text-xs font-semibold text-[#24352B] mb-2">
              Publication Status
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                onClick={() => setStatus('PUBLISHED')}
                className={`cursor-pointer p-3 rounded-xl border flex items-center gap-2.5 transition-colors ${
                  status === 'PUBLISHED'
                    ? 'bg-[#E7EEE3] border-[#285742] text-[#0d402c] font-semibold shadow-xs'
                    : 'bg-white border-[#DEDCD1] text-[#59645B] hover:bg-[#F7F5EF]'
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value="PUBLISHED"
                  checked={status === 'PUBLISHED'}
                  onChange={() => setStatus('PUBLISHED')}
                  className="accent-[#285742]"
                />
                <div>
                  <div className="text-xs">Published</div>
                  <div className="text-[10px] text-[#59645B] font-normal">Visible to students</div>
                </div>
              </label>

              <label
                onClick={() => !isBooked && setStatus('DRAFT')}
                className={`cursor-pointer p-3 rounded-xl border flex items-center gap-2.5 transition-colors ${
                  isBooked ? 'opacity-50 cursor-not-allowed' : ''
                } ${
                  status === 'DRAFT'
                    ? 'bg-[#F5EDCE] border-[#795D18] text-[#795D18] font-semibold shadow-xs'
                    : 'bg-white border-[#DEDCD1] text-[#59645B] hover:bg-[#F7F5EF]'
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value="DRAFT"
                  disabled={isBooked}
                  checked={status === 'DRAFT'}
                  onChange={() => setStatus('DRAFT')}
                  className="accent-[#795D18]"
                />
                <div>
                  <div className="text-xs">Draft</div>
                  <div className="text-[10px] text-[#59645B] font-normal">Hidden from students</div>
                </div>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#59645B] hover:text-[#24352B] border border-[#DEDCD1] rounded-xl hover:bg-[#F7F5EF] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[#285742] hover:bg-[#1f4534] rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              <HiCheck className="w-4 h-4" />
              <span>{loading ? 'Saving...' : isEdit ? 'Update Slot' : 'Create Slot'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
