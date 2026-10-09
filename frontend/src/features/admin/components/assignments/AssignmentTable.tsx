'use client';

import React from 'react';
import {
  HiPencilSquare,
  HiTrash,
  HiCheckCircle,
  HiExclamationTriangle,
  HiChevronLeft,
  HiChevronRight,
  HiXMark,
  HiCalendarDays,
  HiBookOpen,
} from 'react-icons/hi2';
import { CourseItem, StudentAssignmentRow } from './types';

interface AssignmentTableProps {
  students: StudentAssignmentRow[];
  loading: boolean;
  page: number;
  totalPages: number;
  totalStudents: number;
  onPageChange: (newPage: number) => void;
  onManageAssignments: (student: StudentAssignmentRow) => void;
  onRemoveSingleCourse: (student: StudentAssignmentRow, course: CourseItem) => void;
  onClearAllCourses: (student: StudentAssignmentRow) => void;
}

export function AssignmentTable({
  students,
  loading,
  page,
  totalPages,
  totalStudents,
  onPageChange,
  onManageAssignments,
  onRemoveSingleCourse,
  onClearAllCourses,
}: AssignmentTableProps) {
  if (loading) {
    return (
      <div className="bg-[#FFFFFF] border border-[#DEDCD1] rounded-2xl p-12 text-center shadow-xs">
        <div className="w-8 h-8 border-3 border-[#285742]/30 border-t-[#285742] rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold text-[#24352B]">Loading Course Assignments Roster...</p>
        <p className="text-[11px] text-[#59645B] mt-1">Retrieving student records and enrollment status</p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="bg-[#FFFFFF] border border-[#DEDCD1] rounded-2xl p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-[#F7F5EF] border border-[#DEDCD1] text-[#717973] flex items-center justify-center mx-auto mb-3">
          <HiBookOpen className="w-6 h-6" />
        </div>
        <h3 className="font-serif text-base font-semibold text-[#24352B]">No Student Records Found</h3>
        <p className="text-xs text-[#59645B] max-w-sm mx-auto mt-1">
          No students match your current search terms or filter criteria. Try adjusting the filter or search query.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#FFFFFF] border border-[#DEDCD1] rounded-2xl shadow-xs overflow-hidden flex flex-col">
      {/* Responsive Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#F7F5EF] border-b border-[#EAE7DD] text-[#59645B] font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4">Student</th>
              <th className="py-3.5 px-4 min-w-[280px]">Assigned Courses</th>
              <th className="py-3.5 px-4 text-center">Courses & CH</th>
              <th className="py-3.5 px-4 text-center">Eligibility</th>
              <th className="py-3.5 px-4 text-center">Date Sheet</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAE7DD]">
            {students.map((student) => {
              const courseCount = student.coursesCount;
              const isEligible = student.assignmentsFinalized && courseCount >= 4 && courseCount <= 6;
              const isIncomplete = courseCount > 0 && !isEligible;

              return (
                <tr
                  key={student._id}
                  className="hover:bg-[#FDFBF7] transition-colors group"
                >
                  {/* Student Column */}
                  <td className="py-4 px-4 align-top">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#285742] text-white flex items-center justify-center font-bold font-mono text-xs shrink-0 shadow-2xs mt-0.5">
                        {student.fullName
                          ?.split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase() || 'ST'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-sm text-[#24352B]">
                            {student.fullName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[11px] font-bold text-[#0d402c] bg-[#E7EEE3] px-1.5 py-0.2 rounded border border-[#285742]/15">
                            {student.registrationNumber}
                          </span>
                          <span className="text-[11px] text-[#59645B] truncate">
                            {student.program} • Sem {student.semester}
                          </span>
                        </div>
                        {student.userId?.email && (
                          <div className="text-[11px] text-[#717973] truncate mt-0.5">
                            {student.userId.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Assigned Courses Badges */}
                  <td className="py-4 px-4 align-top">
                    {courseCount === 0 ? (
                      <span className="inline-block text-xs text-[#717973] italic bg-[#F7F5EF] px-2.5 py-1 rounded-lg border border-[#DEDCD1]">
                        No courses assigned yet
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {student.assignments.map((assignment) => {
                          const course = assignment.courseId;
                          if (!course) return null;
                          return (
                            <div
                              key={assignment._id || course._id}
                              className="inline-flex items-center gap-1.5 px-2 py-1 bg-[#F7F5EF] border border-[#DEDCD1] hover:border-[#285742]/40 rounded-lg text-[11px] text-[#24352B] transition-colors group/course"
                              title={`${course.code}: ${course.title} (${course.creditHours} CH, ${course.department})`}
                            >
                              <span className="font-mono font-bold text-[#0d402c]">
                                {course.code}
                              </span>
                              <span className="text-[#59645B] text-[10px]">
                                {course.creditHours}CH
                              </span>
                              <button
                                type="button"
                                onClick={() => onRemoveSingleCourse(student, course)}
                                title={`Remove ${course.code}`}
                                className="text-[#717973] hover:text-[#DC2626] p-0.5 rounded transition-colors opacity-60 hover:opacity-100"
                              >
                                <HiXMark className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </td>

                  {/* Courses & CH */}
                  <td className="py-4 px-4 align-top text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className="font-bold text-xs text-[#24352B]">
                        {courseCount} {courseCount === 1 ? 'Course' : 'Courses'}
                      </span>
                      <span className="text-[11px] font-mono font-medium text-[#59645B] mt-0.5">
                        {student.totalCreditHours} Credit Hours
                      </span>
                    </div>
                  </td>

                  {/* Eligibility Status */}
                  <td className="py-4 px-4 align-top text-center">
                    {isEligible ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#E7EEE3] text-[#285742] border border-[#285742]/20">
                        <HiCheckCircle className="w-3.5 h-3.5" />
                        <span>Finalized</span>
                      </span>
                    ) : isIncomplete ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]/30">
                        <HiExclamationTriangle className="w-3.5 h-3.5" />
                        <span>Incomplete ({courseCount}/4)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F0EEE6] text-[#717973] border border-[#DEDCD1]">
                        Unassigned
                      </span>
                    )}
                  </td>

                  {/* Date Sheet Status */}
                  <td className="py-4 px-4 align-top text-center">
                    {student.hasDateSheet ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#EFF6FF] text-[#1D4ED8] border border-[#93C5FD]">
                        <HiCalendarDays className="w-3.5 h-3.5" />
                        <span>Saved (Rev #{student.dateSheetRevision || 1})</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#717973]">
                        Pending Date Sheet
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 align-top text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onManageAssignments(student)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#0d402c] bg-[#E7EEE3] hover:bg-[#285742] hover:text-white rounded-lg border border-[#285742]/20 transition-all shadow-2xs"
                        title="Assign or Edit Courses"
                      >
                        <HiPencilSquare className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </button>

                      {courseCount > 0 && (
                        <button
                          type="button"
                          onClick={() => onClearAllCourses(student)}
                          className="p-1.5 text-[#717973] hover:text-[#DC2626] hover:bg-[#FEE2E2] rounded-lg transition-colors border border-transparent hover:border-[#FCA5A5]"
                          title="Clear all assignments for this student"
                        >
                          <HiTrash className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-[#EAE7DD] bg-[#F7F5EF] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#59645B]">
        <div>
          Showing page <strong className="text-[#24352B]">{page}</strong> of{' '}
          <strong className="text-[#24352B]">{totalPages}</strong> ({totalStudents} total student records)
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="inline-flex items-center gap-1 px-3 py-1.5 border border-[#DEDCD1] bg-[#FFFFFF] hover:bg-[#F7F5EF] text-[#24352B] rounded-xl transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            <HiChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>
          <span className="px-2 font-mono font-semibold text-[#24352B]">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="inline-flex items-center gap-1 px-3 py-1.5 border border-[#DEDCD1] bg-[#FFFFFF] hover:bg-[#F7F5EF] text-[#24352B] rounded-xl transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            <span>Next</span>
            <HiChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
