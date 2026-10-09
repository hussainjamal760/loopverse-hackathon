'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  HiBookOpen,
  HiPlus,
  HiMagnifyingGlass,
  HiPencil,
  HiTrash,
  HiShieldCheck,
  HiExclamationTriangle,
  HiArrowPath,
  HiCheckCircle,
  HiXCircle,
  HiAcademicCap,
} from 'react-icons/hi2';
import { CourseModal, CourseData } from './CourseModal';

export function CourseTable() {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<CourseData | null>(null);

  // Deletion modal
  const [deleteTarget, setDeleteTarget] = useState<CourseData | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/courses?search=${encodeURIComponent(search)}&page=${page}&pageSize=10`);
      const data = await res.json();
      if (res.ok) {
        setCourses(data.courses || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Fetch courses error:', err);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleOpenAdd = () => {
    setCourseToEdit(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (course: CourseData) => {
    setCourseToEdit(course);
    setModalOpen(true);
  };

  const handleDeleteClick = (course: CourseData) => {
    setDeleteTarget(course);
    setDeleteError(null);
  };

  const executeDelete = async () => {
    if (!deleteTarget?._id) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/courses/${deleteTarget._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        setDeleteError(data.error || 'Failed to delete course');
        return;
      }
      setDeleteTarget(null);
      fetchCourses();
    } catch (err: any) {
      setDeleteError(err.message || 'Network error');
    } finally {
      setDeleting(false);
    }
  };

  const executeDeactivate = async () => {
    if (!deleteTarget?._id) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/courses/${deleteTarget._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: false }),
      });
      if (res.ok) {
        setDeleteTarget(null);
        fetchCourses();
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFFFF] p-4 rounded-2xl border border-[#DEDCD1] shadow-xs">
        <div className="relative flex-1 max-w-md">
          <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717973]" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search courses by code, title, or department..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-[#DEDCD1] rounded-xl focus:outline-none focus:border-[#285742] bg-[#F7F5EF]/50"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchCourses()}
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
            <span>Add Course</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#DEDCD1] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F5EF] border-b border-[#EAE7DD] text-[#59645B] font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Course Title</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Credits</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE7DD]">
              {loading && courses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-[#59645B]">
                    <div className="inline-flex items-center gap-2">
                      <HiArrowPath className="w-4 h-4 animate-spin text-[#285742]" />
                      <span>Loading university academic courses...</span>
                    </div>
                  </td>
                </tr>
              ) : courses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-[#59645B]">
                    <p className="font-semibold text-sm text-[#24352B]">No courses found</p>
                    <p className="text-xs text-[#59645B] mt-1">Try adjusting your search query or register a new course.</p>
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr key={course._id} className="hover:bg-[#F7F5EF]/60 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-semibold text-[#0d402c]">
                      {course.code}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-[#24352B]">{course.title}</div>
                    </td>
                    <td className="px-5 py-3.5 text-[#59645B]">
                      {course.department}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-mono text-[11px] font-semibold bg-[#F0EEE6] text-[#24352B] border border-[#DEDCD1]">
                        <HiAcademicCap className="w-3 h-3 text-[#285742]" />
                        {course.creditHours} CH
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {course.active ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E7EEE3] text-[#285742] border border-[#285742]/20">
                          <HiCheckCircle className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F0EEE6] text-[#717973] border border-[#DEDCD1]">
                          <HiXCircle className="w-3 h-3" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          onClick={() => handleOpenEdit(course)}
                          className="p-1.5 text-[#59645B] hover:text-[#285742] hover:bg-[#E7EEE3] rounded-lg transition-colors"
                          title="Edit course"
                        >
                          <HiPencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(course)}
                          className="p-1.5 text-[#59645B] hover:text-[#A3342F] hover:bg-[#FAEAE7] rounded-lg transition-colors"
                          title="Delete / Deactivate"
                        >
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Strip */}
        <div className="px-5 py-3 border-t border-[#EAE7DD] bg-[#F7F5EF] flex items-center justify-between text-xs text-[#59645B]">
          <div>
            Showing <span className="font-semibold text-[#24352B]">{courses.length}</span> of{' '}
            <span className="font-semibold text-[#24352B]">{totalCount}</span> courses
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

      {/* Create / Edit Modal */}
      <CourseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={fetchCourses}
        courseToEdit={courseToEdit}
      />

      {/* Safe Delete / Deactivation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#FFFFFF] border border-[#DEDCD1] rounded-2xl w-full max-w-md shadow-xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3 text-[#A3342F]">
              <div className="w-10 h-10 rounded-full bg-[#FAEAE7] flex items-center justify-center">
                <HiExclamationTriangle className="w-5 h-5 text-[#A3342F]" />
              </div>
              <div>
                <h3 className="font-semibold text-base text-[#24352B]">Delete Course</h3>
                <p className="text-xs text-[#59645B]">{deleteTarget.code} — {deleteTarget.title}</p>
              </div>
            </div>

            {deleteError ? (
              <div className="p-3 bg-[#FAEAE7] border border-[#A3342F]/30 rounded-xl space-y-2">
                <div className="flex items-start gap-2 text-xs text-[#A3342F]">
                  <HiShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{deleteError}</span>
                </div>
                <p className="text-[11px] text-[#59645B]">
                  Academic integrity prohibits deleting courses that students are assigned to or have scheduled exam slots for. You can deactivate this course instead to prevent new assignments.
                </p>
                <button
                  onClick={executeDeactivate}
                  disabled={deleting}
                  className="w-full mt-2 py-2 text-xs font-semibold text-white bg-[#795D18] hover:bg-[#604913] rounded-lg transition-colors"
                >
                  {deleting ? 'Deactivating...' : 'Deactivate Course Instead'}
                </button>
              </div>
            ) : (
              <p className="text-xs text-[#59645B] leading-relaxed">
                Are you sure you want to remove this course? If it is already assigned to students or has scheduled slots, safe deletion will prevent removal and offer deactivation.
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
                  {deleting ? 'Checking...' : 'Delete Course'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
