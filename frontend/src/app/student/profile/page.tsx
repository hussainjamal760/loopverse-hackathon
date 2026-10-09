'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  HiIdentification,
  HiUser,
  HiPhone,
  HiEnvelope,
  HiMapPin,
  HiAcademicCap,
  HiArrowLeft,
  HiShieldCheck,
  HiOutlineBuildingLibrary,
  HiOutlineDocumentText,
  HiOutlineCalendar,
} from 'react-icons/hi2';
import { StudentHeader, StudentSidebar } from '@/features/student';

interface StudentProfile {
  id: string;
  fullName: string;
  registrationNumber: string;
  phone: string;
  cnic: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  photoUrl?: string | null;
  fatherName: string;
  parentCnic: string;
  occupation?: string;
  contactNumber: string;
  emergencyContact: string;
  program: string;
  semester: number;
  sessionBatch: string;
  prevQualification?: string;
  prevInstitute?: string;
  marksOrCgpa?: string;
  branch?: {
    _id: string;
    code: string;
    name: string;
    city: string;
    address: string;
    contactNumber?: string;
  } | null;
  assignmentsFinalized: boolean;
  version: number;
}

export default function StudentProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        if (!data.authenticated || !data.student) {
          router.push('/login');
          return;
        }
        setStudent(data.student);
        setUserEmail(data.user?.email || '');
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5EF] flex flex-col font-sans">
        <StudentHeader studentName="Student" />
        <main className="w-full pt-[88px] pb-16 flex-1">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="p-12 text-center text-[#59645B] text-sm flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#285742] border-t-transparent animate-spin" />
              <span>Loading verified student profile...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-[#F7F5EF] flex flex-col font-sans">
        <StudentHeader studentName="Student" />
        <main className="w-full pt-[88px] pb-16 flex-1">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="p-8 text-center bg-white rounded-2xl border border-[#DEDCD1]">
              <p className="text-sm text-[#59645B]">Student record not found.</p>
              <Link
                href="/login"
                className="mt-4 inline-block px-4 py-2 bg-[#285742] text-white text-xs rounded-xl"
              >
                Sign In
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const initials = student.fullName
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'ST';

  const formattedDob = student.dateOfBirth
    ? new Date(student.dateOfBirth).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'Not specified';

  return (
    <div className="min-h-screen bg-[#F7F5EF] flex flex-col font-sans">
      {/* Sleek Auto-Collapsible Student Sidebar */}
      <StudentSidebar
        studentName={student.fullName}
        registrationNumber={student.registrationNumber}
        program={student.program}
      />

      <StudentHeader studentName={student.fullName} />

      <main className="w-full pt-[88px] pb-16 flex-1 pl-0 lg:pl-[68px]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
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
              Student Academic Profile
            </h1>
            <p className="text-xs sm:text-sm text-[#59645B] mt-1">
              Verified university registry credentials and permanent exam records.
            </p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#DEDCD1] rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col gap-6">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#DEDCD1]">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#E7EEE3] text-[#285742] flex items-center justify-center font-bold text-xl border border-[#285742]/20 shrink-0">
                  {initials}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#24352B]">{student.fullName}</h2>
                  <p className="text-xs text-[#59645B] mt-0.5">
                    Registration Number:{' '}
                    <strong className="text-[#24352B] font-mono">{student.registrationNumber}</strong>
                  </p>
                  <p className="text-xs text-[#59645B] mt-0.5">
                    Account Email: <span className="text-[#24352B] font-medium">{userEmail}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-1">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#285742] bg-[#E7EEE3] px-3 py-1 rounded-full border border-[#285742]/20 self-start sm:self-auto">
                  <HiShieldCheck className="w-3.5 h-3.5" />
                  <span>Status: Active Student</span>
                </span>
                <span className="text-[11px] text-[#59645B]">
                  Session Batch: <strong className="text-[#24352B]">{student.sessionBatch}</strong>
                </span>
              </div>
            </div>

            {/* 1. Personal Details */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <HiUser className="w-4 h-4 text-[#285742]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#59645B]">
                  1. Personal Information
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-[#F7F5EF] rounded-xl border border-[#DEDCD1]">
                  <span className="text-[#59645B] block">Father / Guardian Name</span>
                  <span className="font-semibold text-[#24352B] text-sm">
                    {student.fatherName || 'Not recorded'}
                  </span>
                </div>
                <div className="p-3 bg-[#F7F5EF] rounded-xl border border-[#DEDCD1]">
                  <span className="text-[#59645B] block">CNIC / B-Form</span>
                  <span className="font-semibold font-mono text-[#24352B] text-sm">
                    {student.cnic}
                  </span>
                </div>
                <div className="p-3 bg-[#F7F5EF] rounded-xl border border-[#DEDCD1]">
                  <span className="text-[#59645B] block">Registered Contact Phone</span>
                  <span className="font-semibold font-mono text-[#24352B] text-sm">
                    {student.phone}
                  </span>
                </div>
                <div className="p-3 bg-[#F7F5EF] rounded-xl border border-[#DEDCD1]">
                  <span className="text-[#59645B] block">Emergency Contact</span>
                  <span className="font-semibold font-mono text-[#24352B] text-sm">
                    {student.emergencyContact || student.contactNumber || 'Not recorded'}
                  </span>
                </div>
                <div className="p-3 bg-[#F7F5EF] rounded-xl border border-[#DEDCD1]">
                  <span className="text-[#59645B] block">Date of Birth</span>
                  <span className="font-semibold text-[#24352B] text-sm">{formattedDob}</span>
                </div>
                <div className="p-3 bg-[#F7F5EF] rounded-xl border border-[#DEDCD1]">
                  <span className="text-[#59645B] block">Gender</span>
                  <span className="font-semibold text-[#24352B] text-sm">
                    {student.gender || 'Not specified'}
                  </span>
                </div>
                <div className="p-3 bg-[#F7F5EF] rounded-xl border border-[#DEDCD1] sm:col-span-2">
                  <span className="text-[#59645B] block">Residential Address</span>
                  <span className="font-semibold text-[#24352B] text-sm">
                    {student.address || 'Address on file'}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Academic Enrollment */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <HiAcademicCap className="w-4 h-4 text-[#285742]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#59645B]">
                  2. Academic Enrollment
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-[#F7F5EF] rounded-xl border border-[#DEDCD1]">
                  <span className="text-[#59645B] block">Degree Program</span>
                  <span className="font-semibold text-[#24352B] text-sm">{student.program}</span>
                </div>
                <div className="p-3 bg-[#F7F5EF] rounded-xl border border-[#DEDCD1]">
                  <span className="text-[#59645B] block">Current Semester</span>
                  <span className="font-semibold text-[#24352B] text-sm">
                    Semester {student.semester}
                  </span>
                </div>
                <div className="p-3 bg-[#F7F5EF] rounded-xl border border-[#DEDCD1]">
                  <span className="text-[#59645B] block">Session Batch</span>
                  <span className="font-semibold text-[#24352B] text-sm">
                    {student.sessionBatch}
                  </span>
                </div>
                <div className="p-3 bg-[#F7F5EF] rounded-xl border border-[#DEDCD1]">
                  <span className="text-[#59645B] block">Previous Qualification</span>
                  <span className="font-semibold text-[#24352B] text-sm">
                    {student.prevQualification || 'Higher Secondary'}
                  </span>
                </div>
                <div className="p-3 bg-[#F7F5EF] rounded-xl border border-[#DEDCD1]">
                  <span className="text-[#59645B] block">Previous Institute</span>
                  <span className="font-semibold text-[#24352B] text-sm">
                    {student.prevInstitute || 'Recognized Board / University'}
                  </span>
                </div>
                <div className="p-3 bg-[#F7F5EF] rounded-xl border border-[#DEDCD1]">
                  <span className="text-[#59645B] block">Previous Marks / CGPA</span>
                  <span className="font-semibold text-[#24352B] text-sm">
                    {student.marksOrCgpa || 'Verified'}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Assigned Examination Campus */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <HiOutlineBuildingLibrary className="w-4 h-4 text-[#285742]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#59645B]">
                  3. Assigned Examination Campus
                </h3>
              </div>
              <div className="p-4 bg-[#F7F5EF] rounded-xl border border-[#DEDCD1] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-sm text-[#24352B]">
                    {student.branch?.name || 'Main Campus Center'}
                  </div>
                  <div className="text-[#59645B] mt-0.5">
                    {student.branch?.address
                      ? `${student.branch.address}, ${student.branch.city}`
                      : 'Campus Center Allocation'}
                  </div>
                  {student.branch?.contactNumber && (
                    <div className="text-[11px] text-[#59645B] mt-1 font-mono">
                      Center Desk: {student.branch.contactNumber}
                    </div>
                  )}
                </div>

                <Link
                  href="/student/help"
                  className="px-3.5 py-1.5 rounded-lg bg-[#FFFFFF] border border-[#DEDCD1] text-[#285742] text-xs font-semibold hover:bg-[#E7EEE3] transition-colors self-start sm:self-auto"
                >
                  Request Branch Transfer
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
