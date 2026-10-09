'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AssignmentStatsHeader } from './AssignmentStatsHeader';
import { AssignmentFilterBar } from './AssignmentFilterBar';
import { AssignmentTable } from './AssignmentTable';
import { AssignmentModal } from './AssignmentModal';
import { AssignmentDeleteConfirmModal } from './AssignmentDeleteConfirmModal';
import {
  StudentAssignmentRow,
  AssignmentStats,
  StatusFilterType,
  CourseItem,
} from './types';

export function AssignmentManagementView() {
  const [students, setStudents] = useState<StudentAssignmentRow[]>([]);
  const [stats, setStats] = useState<AssignmentStats>({
    totalStudents: 0,
    finalizedCount: 0,
    incompleteCount: 0,
    unassignedCount: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [program, setProgram] = useState('');
  const [status, setStatus] = useState<StatusFilterType>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [studentForModal, setStudentForModal] = useState<StudentAssignmentRow | null>(null);

  // Deletion Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetStudent, setDeleteTargetStudent] = useState<StudentAssignmentRow | null>(null);
  const [deleteTargetCourse, setDeleteTargetCourse] = useState<CourseItem | null>(null);
  const [isClearAllMode, setIsClearAllMode] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch Assignments Data
  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (program) params.set('program', program);
      if (status !== 'ALL') params.set('status', status);
      params.set('page', page.toString());
      params.set('pageSize', '10');

      const res = await fetch(`/api/assignments?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setStudents(data.students || []);
        if (data.stats) {
          setStats(data.stats);
        }
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setTotalStudents(data.pagination.total || 0);
        }
      }
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, program, status, page]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // Action handlers
  const handleManageAssignments = (student: StudentAssignmentRow) => {
    setStudentForModal(student);
    setModalOpen(true);
  };

  const handleRemoveSingleCourse = (student: StudentAssignmentRow, course: CourseItem) => {
    setDeleteTargetStudent(student);
    setDeleteTargetCourse(course);
    setIsClearAllMode(false);
    setDeleteModalOpen(true);
  };

  const handleClearAllCourses = (student: StudentAssignmentRow) => {
    setDeleteTargetStudent(student);
    setDeleteTargetCourse(null);
    setIsClearAllMode(true);
    setDeleteModalOpen(true);
  };

  const handleModalSuccess = () => {
    fetchAssignments();
  };

  return (
    <div className="space-y-6">
      {/* 1. Global KPI Metrics */}
      <AssignmentStatsHeader stats={stats} loading={loading && students.length === 0} />

      {/* 2. Search & Filtering Bar */}
      <AssignmentFilterBar
        search={search}
        onSearchChange={setSearch}
        program={program}
        onProgramChange={(val) => {
          setProgram(val);
          setPage(1);
        }}
        status={status}
        onStatusChange={(newStatus) => {
          setStatus(newStatus);
          setPage(1);
        }}
        onRefresh={fetchAssignments}
        loading={loading}
      />

      {/* 3. Main Student Assignments Table */}
      <AssignmentTable
        students={students}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalStudents={totalStudents}
        onPageChange={setPage}
        onManageAssignments={handleManageAssignments}
        onRemoveSingleCourse={handleRemoveSingleCourse}
        onClearAllCourses={handleClearAllCourses}
      />

      {/* 4. Assign / Edit Courses Modal */}
      <AssignmentModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setStudentForModal(null);
        }}
        student={studentForModal}
        onSuccess={handleModalSuccess}
      />

      {/* 5. Safe Deletion Confirmation Modal */}
      <AssignmentDeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteTargetStudent(null);
          setDeleteTargetCourse(null);
        }}
        student={deleteTargetStudent}
        courseToRemove={deleteTargetCourse}
        isClearAll={isClearAllMode}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
