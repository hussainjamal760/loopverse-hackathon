'use client';

import React, { useState, useEffect } from 'react';
import {
  HiBookOpen,
  HiXMark,
  HiCheck,
  HiExclamationCircle,
} from 'react-icons/hi2';

export interface CourseData {
  _id?: string;
  code: string;
  title: string;
  creditHours: number;
  department: string;
  active: boolean;
}

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  courseToEdit?: CourseData | null;
}

export function CourseModal({ isOpen, onClose, onSaved, courseToEdit }: CourseModalProps) {
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    creditHours: 3,
    department: 'Computer Science',
    active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (courseToEdit) {
      setFormData({
        code: courseToEdit.code,
        title: courseToEdit.title,
        creditHours: courseToEdit.creditHours,
        department: courseToEdit.department,
        active: courseToEdit.active,
      });
    } else {
      setFormData({
        code: '',
        title: '',
        creditHours: 3,
        department: 'Computer Science',
        active: true,
      });
    }
    setError(null);
  }, [courseToEdit, isOpen]);

  if (!isOpen) return null;

  const isEdit = Boolean(courseToEdit?._id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = isEdit ? `/api/courses/${courseToEdit!._id}` : '/api/courses';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save course.');
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
              <HiBookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-[#24352B]">
                {isEdit ? 'Edit Academic Course' : 'Add New Course'}
              </h3>
              <p className="text-xs text-[#59645B]">
                {isEdit ? 'Update course title, department, or credit hours' : 'Register a new examination course'}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#24352B] mb-1">
                Course Code <span className="text-[#A3342F]">*</span>
              </label>
              <input
                type="text"
                required
                disabled={isEdit}
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. CS101, MTH301"
                className="w-full px-3 py-2 text-sm border border-[#DEDCD1] rounded-xl focus:outline-none focus:border-[#285742] bg-[#FFFFFF] disabled:bg-[#F7F5EF] disabled:cursor-not-allowed font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#24352B] mb-1">
                Credit Hours <span className="text-[#A3342F]">*</span>
              </label>
              <select
                value={formData.creditHours}
                onChange={(e) => setFormData({ ...formData, creditHours: parseInt(e.target.value, 10) })}
                className="w-full px-3 py-2 text-sm border border-[#DEDCD1] rounded-xl focus:outline-none focus:border-[#285742] bg-[#FFFFFF]"
              >
                <option value={1}>1 Credit Hour</option>
                <option value={2}>2 Credit Hours</option>
                <option value={3}>3 Credit Hours</option>
                <option value={4}>4 Credit Hours</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#24352B] mb-1">
              Course Title <span className="text-[#A3342F]">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Introduction to Programming"
              className="w-full px-3 py-2 text-sm border border-[#DEDCD1] rounded-xl focus:outline-none focus:border-[#285742] bg-[#FFFFFF]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#24352B] mb-1">
              Academic Department <span className="text-[#A3342F]">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              placeholder="e.g. Computer Science, Mathematics, Management Sciences"
              className="w-full px-3 py-2 text-sm border border-[#DEDCD1] rounded-xl focus:outline-none focus:border-[#285742] bg-[#FFFFFF]"
            />
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-[#EAE7DD]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 text-[#285742] rounded accent-[#285742]"
              />
              <span className="text-xs font-medium text-[#24352B]">
                Active status (Eligible for student course assignments)
              </span>
            </label>
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
              <span>{loading ? 'Saving...' : isEdit ? 'Update Course' : 'Create Course'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
