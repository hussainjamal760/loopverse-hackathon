'use client';

import React, { useState, useEffect } from 'react';
import {
  HiXMark,
  HiBookOpen,
  HiPlus,
  HiTrash,
  HiCheckCircle,
  HiExclamationTriangle,
  HiMagnifyingGlass,
  HiAcademicCap,
  HiInformationCircle,
} from 'react-icons/hi2';
import { CourseItem, StudentAssignmentRow } from './types';

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentAssignmentRow | null;
  onSuccess: () => void;
}

export function AssignmentModal({
  isOpen,
  onClose,
  student,
  onSuccess,
}: AssignmentModalProps) {
  // All active courses in system
  const [availableCourses, setAvailableCourses] = useState<CourseItem[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [courseSearch, setCourseSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  // Local state for assignments being edited
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [finalize, setFinalize] = useState(false);
  const [allowWithDateSheet, setAllowWithDateSheet] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load available courses when modal opens
  useEffect(() => {
    if (!isOpen) return;

    async function loadCatalog() {
      setCoursesLoading(true);
      try {
        const res = await fetch('/api/courses?pageSize=100');
        const data = await res.json();
        if (res.ok) {
          const activeOnly = (data.courses || []).filter((c: CourseItem) => c.active !== false);
          setAvailableCourses(activeOnly);
        }
      } catch (err) {
        console.error('Failed to load courses catalog:', err);
      } finally {
        setCoursesLoading(false);
      }
    }

    loadCatalog();
  }, [isOpen]);

  // Sync selected courses with student when student changes
  useEffect(() => {
    if (student) {
      const ids = student.assignments
        .map((a) => (typeof a.courseId === 'object' ? a.courseId?._id : (a.courseId as string)))
        .filter(Boolean);
      setSelectedCourseIds(ids);
      setFinalize(student.assignmentsFinalized);
      setAllowWithDateSheet(false);
      setError(null);
    } else {
      setSelectedCourseIds([]);
      setFinalize(false);
      setAllowWithDateSheet(false);
      setError(null);
    }
  }, [student, isOpen]);

  if (!isOpen || !student) return null;

  // Selected courses objects
  const selectedCourseObjects = selectedCourseIds
    .map((id) => {
      // Find from available catalog first, fallback to student existing
      const fromCatalog = availableCourses.find((c) => c._id === id);
      if (fromCatalog) return fromCatalog;
      const fromStudent = student.assignments.find((a) => a.courseId?._id === id);
      return fromStudent ? fromStudent.courseId : null;
    })
    .filter(Boolean) as CourseItem[];

  const totalCreditHours = selectedCourseObjects.reduce((acc, c) => acc + (c.creditHours || 0), 0);
  const courseCount = selectedCourseIds.length;
  const isCountValid = courseCount >= 4 && courseCount <= 6;

  // Department list for filter
  const departments = Array.from(new Set(availableCourses.map((c) => c.department).filter(Boolean)));

  // Filtered available courses catalog
  const filteredCatalog = availableCourses.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(courseSearch.toLowerCase()) ||
      c.title.toLowerCase().includes(courseSearch.toLowerCase());
    const matchesDept = !selectedDept || c.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const handleAddCourse = (courseId: string) => {
    if (selectedCourseIds.includes(courseId)) return;
    if (selectedCourseIds.length >= 6) {
      setError('A student cannot be assigned more than 6 courses per university regulations.');
      return;
    }
    setError(null);
    const updated = [...selectedCourseIds, courseId];
    setSelectedCourseIds(updated);
    if (updated.length >= 4 && updated.length <= 6) {
      setFinalize(true);
    }
  };

  const handleRemoveCourse = (courseId: string) => {
    setError(null);
    const updated = selectedCourseIds.filter((id) => id !== courseId);
    setSelectedCourseIds(updated);
    if (updated.length < 4) {
      setFinalize(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    if (finalize && (selectedCourseIds.length < 4 || selectedCourseIds.length > 6)) {
      setError(`Finalizing assignments requires between 4 and 6 courses. Current count: ${selectedCourseIds.length}`);
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`/api/students/${student._id}/assignments`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseIds: selectedCourseIds,
          finalize,
          allowWithDateSheet,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.hasDateSheet) {
          setError(
            'This student has already generated a saved Date Sheet. Check the override box below if you intend to reset the schedule and update courses.'
          );
        } else {
          setError(data.error || 'Failed to update course assignments');
        }
        return;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Network error occurred');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/45 backdrop-blur-xs">
      <div className="bg-[#FFFFFF] border border-[#DEDCD1] rounded-2xl w-full max-w-3xl max-h-[92vh] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#EAE7DD] flex items-center justify-between bg-[#F7F5EF] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#285742] text-white flex items-center justify-center font-bold text-sm shrink-0">
              <HiAcademicCap className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base text-[#24352B] truncate">
                  Manage Course Assignments
                </h3>
                <span className="font-mono text-xs font-bold text-[#0d402c] bg-[#E7EEE3] px-2 py-0.5 rounded border border-[#285742]/20 shrink-0">
                  {student.registrationNumber}
                </span>
              </div>
              <p className="text-xs text-[#59645B] truncate">
                {student.fullName} • {student.program} (Sem {student.semester})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#717973] hover:text-[#0d402c] p-1.5 rounded-lg hover:bg-[#EAE7DD] transition-colors shrink-0"
          >
            <HiXMark className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Error Message */}
          {error && (
            <div className="p-3.5 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl text-[#991B1B] flex items-start gap-2.5">
              <HiExclamationTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">{error}</div>
            </div>
          )}

          {/* DateSheet Warning Banner */}
          {student.hasDateSheet && (
            <div className="p-4 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl text-[#92400E] space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <HiInformationCircle className="w-4 h-4 text-[#D97706]" />
                <span>Student has saved a Date Sheet (Revision #{student.dateSheetRevision || 1})</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Modifying this student&apos;s courses will reset their saved exam slot selections so they can replan with the new course roster.
              </p>
              <label className="flex items-center gap-2 pt-1 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowWithDateSheet}
                  onChange={(e) => setAllowWithDateSheet(e.target.checked)}
                  className="rounded text-[#285742] focus:ring-[#285742]"
                />
                <span className="text-xs text-[#78350F]">
                  I understand, reset saved date sheet and apply these course updates
                </span>
              </label>
            </div>
          )}

          {/* SECTION 1: Currently Assigned Courses */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#EAE7DD] pb-2">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-[#0d402c] uppercase tracking-wider text-[11px]">
                  Assigned Courses ({courseCount})
                </h4>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    isCountValid
                      ? 'bg-[#E7EEE3] text-[#285742] border border-[#285742]/20'
                      : courseCount === 0
                      ? 'bg-[#F0EEE6] text-[#717973]'
                      : 'bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]/30'
                  }`}
                >
                  {isCountValid
                    ? 'Target Met (4-6 Courses)'
                    : courseCount < 4
                    ? `${4 - courseCount} more needed for minimum`
                    : 'Exceeds maximum of 6'}
                </span>
              </div>
              <span className="font-mono text-xs font-semibold text-[#59645B]">
                Total: <strong className="text-[#24352B]">{totalCreditHours}</strong> Credit Hours
              </span>
            </div>

            {selectedCourseObjects.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-[#DEDCD1] rounded-xl bg-[#F7F5EF] text-[#717973]">
                <HiBookOpen className="w-8 h-8 mx-auto mb-2 text-[#717973]/60" />
                <p className="font-medium text-xs">No courses currently assigned</p>
                <p className="text-[11px] mt-0.5 text-[#59645B]">
                  Select courses from the catalog below to assign them to this student.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
                {selectedCourseObjects.map((c) => (
                  <div
                    key={c._id}
                    className="p-2.5 bg-[#F7F5EF] border border-[#DEDCD1] rounded-xl flex items-center justify-between gap-2 group hover:border-[#285742]/40 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#0d402c] text-xs">
                          {c.code}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-white text-[#59645B] border border-[#DEDCD1]">
                          {c.creditHours} CH
                        </span>
                      </div>
                      <p className="text-xs text-[#24352B] font-medium truncate mt-0.5">
                        {c.title}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveCourse(c._id)}
                      title="Remove course from student"
                      className="text-[#717973] hover:text-[#DC2626] p-1.5 rounded-lg hover:bg-[#FEE2E2] transition-colors shrink-0"
                    >
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 2: Available Courses Catalog */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAE7DD] pb-2">
              <h4 className="font-semibold text-[#0d402c] uppercase tracking-wider text-[11px]">
                Add Courses from Academic Catalog
              </h4>
              <div className="flex items-center gap-2">
                {/* Department filter */}
                {departments.length > 0 && (
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="px-2 py-1 bg-[#F7F5EF] border border-[#DEDCD1] rounded-lg text-[11px] text-[#24352B] focus:outline-none"
                  >
                    <option value="">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                )}
                {/* Search in catalog */}
                <div className="relative">
                  <HiMagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#717973]" />
                  <input
                    type="text"
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    placeholder="Search courses..."
                    className="pl-7 pr-2 py-1 bg-[#F7F5EF] border border-[#DEDCD1] rounded-lg text-[11px] text-[#24352B] focus:outline-none focus:bg-white w-36 sm:w-44"
                  />
                </div>
              </div>
            </div>

            {coursesLoading ? (
              <div className="p-6 text-center text-xs text-[#717973]">Loading course catalog...</div>
            ) : filteredCatalog.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#717973]">
                No matching courses found in catalog.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                {filteredCatalog.map((course) => {
                  const isAssigned = selectedCourseIds.includes(course._id);
                  const isMaxReached = selectedCourseIds.length >= 6;

                  return (
                    <div
                      key={course._id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                        isAssigned
                          ? 'bg-[#E7EEE3]/50 border-[#285742]/30 opacity-75'
                          : 'bg-[#FFFFFF] border-[#DEDCD1] hover:border-[#285742]/50 hover:shadow-xs'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-[#0d402c] text-xs">
                            {course.code}
                          </span>
                          <span className="text-[10px] text-[#59645B]">
                            • {course.creditHours} CH
                          </span>
                        </div>
                        <p className="text-xs text-[#24352B] truncate mt-0.5">{course.title}</p>
                        <span className="text-[10px] text-[#717973]">{course.department}</span>
                      </div>

                      {isAssigned ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#285742] px-2 py-1 bg-[#E7EEE3] rounded-lg shrink-0">
                          <HiCheckCircle className="w-3.5 h-3.5" />
                          <span>Added</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddCourse(course._id)}
                          disabled={isMaxReached}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#285742] bg-[#E7EEE3] hover:bg-[#285742] hover:text-white rounded-lg transition-colors disabled:opacity-40 disabled:hover:bg-[#E7EEE3] disabled:hover:text-[#285742] shrink-0"
                        >
                          <HiPlus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION 3: Finalization Controls */}
          <div className="p-3.5 bg-[#F7F5EF] border border-[#DEDCD1] rounded-xl flex items-center justify-between gap-4">
            <div>
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-xs text-[#24352B]">
                <input
                  type="checkbox"
                  checked={finalize}
                  onChange={(e) => setFinalize(e.target.checked)}
                  disabled={!isCountValid}
                  className="rounded text-[#285742] focus:ring-[#285742] disabled:opacity-50"
                />
                <span>Finalize Course Assignments for Fall 2026</span>
              </label>
              <p className="text-[11px] text-[#59645B] mt-0.5 ml-5">
                {isCountValid
                  ? 'Locks course enrollment and enables student to enter the Exam Slot Planner.'
                  : 'Requires between 4 and 6 assigned courses before finalization can be enabled.'}
              </p>
            </div>

            <div className="text-right shrink-0">
              <span
                className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                  finalize ? 'bg-[#285742] text-white' : 'bg-[#EAE7DD] text-[#717973]'
                }`}
              >
                {finalize ? 'FINALIZED' : 'DRAFT'}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#EAE7DD] bg-[#F7F5EF] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#59645B] hover:text-[#24352B] border border-[#DEDCD1] rounded-xl hover:bg-white transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[#285742] hover:bg-[#1e4232] rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Course Assignments</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
