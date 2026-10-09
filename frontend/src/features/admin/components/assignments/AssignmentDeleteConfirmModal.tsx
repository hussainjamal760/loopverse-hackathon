'use client';

import React, { useState } from 'react';
import {
  HiExclamationTriangle,
  HiXMark,
  HiTrash,
} from 'react-icons/hi2';
import { CourseItem, StudentAssignmentRow } from './types';

interface AssignmentDeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentAssignmentRow | null;
  courseToRemove?: CourseItem | null;
  isClearAll?: boolean;
  onSuccess: () => void;
}

export function AssignmentDeleteConfirmModal({
  isOpen,
  onClose,
  student,
  courseToRemove,
  isClearAll = false,
  onSuccess,
}: AssignmentDeleteConfirmModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !student) return null;

  const handleConfirm = async () => {
    setDeleting(true);
    setError(null);

    try {
      let url = `/api/assignments?studentId=${student._id}`;
      if (isClearAll) {
        url += '&all=true';
      } else if (courseToRemove?._id) {
        url += `&courseId=${courseToRemove._id}`;
      } else {
        setError('No course specified for removal.');
        setDeleting(false);
        return;
      }

      const res = await fetch(url, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to remove course assignment');
        return;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Network error occurred');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
      <div className="bg-[#FFFFFF] border border-[#DEDCD1] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#EAE7DD] flex items-center justify-between bg-[#F7F5EF]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center shrink-0">
              <HiTrash className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-sm text-[#24352B]">
              {isClearAll ? 'Clear All Course Assignments' : 'Remove Course Assignment'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#717973] hover:text-[#24352B] p-1 rounded-lg hover:bg-[#EAE7DD]"
          >
            <HiXMark className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl text-[#991B1B] flex items-start gap-2">
              <HiExclamationTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <p className="text-[#59645B] leading-relaxed">
            {isClearAll ? (
              <>
                Are you sure you want to remove <strong className="text-[#24352B]">all {student.coursesCount} course assignments</strong> for{' '}
                <strong className="text-[#24352B]">{student.fullName}</strong> ({student.registrationNumber})?
              </>
            ) : (
              <>
                Are you sure you want to remove{' '}
                <strong className="text-[#24352B]">
                  {courseToRemove?.code} - {courseToRemove?.title}
                </strong>{' '}
                from <strong className="text-[#24352B]">{student.fullName}</strong> ({student.registrationNumber})?
              </>
            )}
          </p>

          {student.hasDateSheet && (
            <div className="p-3 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl text-[#92400E] flex items-start gap-2">
              <HiExclamationTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
              <div className="text-[11px] leading-tight">
                <strong>Attention:</strong> This student has an active saved Date Sheet. Removal cannot proceed directly unless the student&apos;s schedule is reset via the Manage Courses dialog.
              </div>
            </div>
          )}

          {!student.hasDateSheet && student.coursesCount <= 4 && !isClearAll && (
            <div className="p-3 bg-[#FEF3C7] border border-[#F59E0B]/30 rounded-xl text-[#92400E] text-[11px]">
              Note: Removing this course will drop the student below the 4-course minimum. Their assignment status will be marked as Incomplete.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-[#EAE7DD] bg-[#F7F5EF] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-[#59645B] hover:text-[#24352B] border border-[#DEDCD1] rounded-xl hover:bg-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#DC2626] hover:bg-[#B91C1C] rounded-xl transition-colors disabled:opacity-50"
          >
            {deleting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Removing...</span>
              </>
            ) : (
              <>
                <HiTrash className="w-3.5 h-3.5" />
                <span>Confirm Removal</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
