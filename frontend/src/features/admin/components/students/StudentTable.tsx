'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  HiUsers,
  HiPlus,
  HiMagnifyingGlass,
  HiEye,
  HiTrash,
  HiShieldCheck,
  HiExclamationTriangle,
  HiArrowPath,
  HiCheckCircle,
  HiXCircle,
  HiAcademicCap,
  HiEnvelope,
  HiPhone,
  HiBuildingOffice2,
} from 'react-icons/hi2';
import { StudentDetailModal } from './StudentDetailModal';

export function StudentTable() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Selected student for dossier view
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Safe Deletion / Deactivation modal
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/students?search=${encodeURIComponent(search)}&page=${page}&pageSize=10`);
      const data = await res.json();
      if (res.ok) {
        setStudents(data.students || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Fetch students error:', err);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleViewDossier = (student: any) => {
    setSelectedStudent(student);
    setDetailModalOpen(true);
  };

  const handleDeleteClick = (student: any) => {
    setDeleteTarget(student);
    setDeleteError(null);
  };

  const executeDelete = async () => {
    if (!deleteTarget?._id) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/students/${deleteTarget._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        setDeleteError(data.error || 'Failed to delete student');
        return;
      }
      setDeleteTarget(null);
      fetchStudents();
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
      const res = await fetch(`/api/students/${deleteTarget._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: false }),
      });
      if (res.ok) {
        setDeleteTarget(null);
        fetchStudents();
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
            placeholder="Search by name, registration ID, CNIC, or email..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-[#DEDCD1] rounded-xl focus:outline-none focus:border-[#285742] bg-[#F7F5EF]/50"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchStudents()}
            className="p-2 border border-[#DEDCD1] text-[#59645B] hover:text-[#24352B] hover:bg-[#F7F5EF] rounded-xl transition-colors"
            title="Refresh"
          >
            <HiArrowPath className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            href="/admin/students/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#285742] hover:bg-[#1f4534] rounded-xl shadow-xs transition-colors"
          >
            <HiPlus className="w-4 h-4" />
            <span>Enroll Student</span>
          </Link>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#DEDCD1] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F5EF] border-b border-[#EAE7DD] text-[#59645B] font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Registration ID</th>
                <th className="px-5 py-3">Student Name</th>
                <th className="px-5 py-3">Degree & Batch</th>
                <th className="px-5 py-3">Campus Branch</th>
                <th className="px-5 py-3">Account Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE7DD]">
              {loading && students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-[#59645B]">
                    <div className="inline-flex items-center gap-2">
                      <HiArrowPath className="w-4 h-4 animate-spin text-[#285742]" />
                      <span>Loading enrolled students directory...</span>
                    </div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-[#59645B]">
                    <p className="font-semibold text-sm text-[#24352B]">No student records found</p>
                    <p className="text-xs text-[#59645B] mt-1">Try another search term or click "Enroll Student" to register a candidate.</p>
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student._id} className="hover:bg-[#F7F5EF]/60 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-[#0d402c]">
                      {student.registrationNumber}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-[#24352B]">{student.fullName}</div>
                      <div className="text-[11px] text-[#59645B] font-sans">
                        {student.userId?.email || 'No email attached'}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-[#24352B]">{student.program}</div>
                      <div className="text-[11px] text-[#59645B]">
                        Semester {student.semester} • {student.sessionBatch}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {student.selectedBranchId ? (
                        <span className="inline-flex items-center gap-1 font-medium text-[#285742]">
                          <HiBuildingOffice2 className="w-3.5 h-3.5" />
                          {student.selectedBranchId.code} ({student.selectedBranchId.city})
                        </span>
                      ) : (
                        <span className="text-[#717973] italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {student.userId?.active ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E7EEE3] text-[#285742] border border-[#285742]/20">
                          <HiCheckCircle className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F0EEE6] text-[#717973] border border-[#DEDCD1]">
                          <HiXCircle className="w-3 h-3" />
                          Suspended
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          onClick={() => handleViewDossier(student)}
                          className="p-1.5 text-[#59645B] hover:text-[#285742] hover:bg-[#E7EEE3] rounded-lg transition-colors"
                          title="View student dossier"
                        >
                          <HiEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(student)}
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
            Showing <span className="font-semibold text-[#24352B]">{students.length}</span> of{' '}
            <span className="font-semibold text-[#24352B]">{totalCount}</span> registered students
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

      {/* Dossier Detail Modal */}
      <StudentDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        student={selectedStudent}
        onRefresh={fetchStudents}
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
                <h3 className="font-semibold text-base text-[#24352B]">Delete Student Account</h3>
                <p className="text-xs text-[#59645B]">
                  {deleteTarget.registrationNumber} — {deleteTarget.fullName}
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
                  Per university integrity standards, students with finalized date sheets or active course assignments cannot be hard-deleted. You can suspend/deactivate the student account instead.
                </p>
                <button
                  onClick={executeDeactivate}
                  disabled={deleting}
                  className="w-full mt-2 py-2 text-xs font-semibold text-white bg-[#795D18] hover:bg-[#604913] rounded-lg transition-colors"
                >
                  {deleting ? 'Deactivating...' : 'Deactivate Student Account Instead'}
                </button>
              </div>
            ) : (
              <p className="text-xs text-[#59645B] leading-relaxed">
                Are you sure you want to delete this student record? If this student has active exam history or course assignments, safe deletion will prevent hard removal and recommend deactivation.
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
                  {deleting ? 'Checking...' : 'Delete Student'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
