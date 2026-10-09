import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connectToDatabase } from '@/lib/db';
import { Student, Assignment, DateSheet, ChangeRequest } from '@/server/models';
import {
  HiUsers,
  HiArrowLeft,
  HiIdentification,
  HiShieldCheck,
  HiAcademicCap,
  HiBuildingOffice2,
  HiCheckCircle,
  HiXCircle,
  HiCalendarDays,
  HiBookOpen,
} from 'react-icons/hi2';

interface StudentDetailPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export default async function StudentDetailPage({ params }: StudentDetailPageProps) {
  const { id } = await params;
  await connectToDatabase();

  const student = await Student.findById(id)
    .populate('userId', 'email role active createdAt')
    .populate('selectedBranchId', 'code name city address contactNumber');

  if (!student) {
    notFound();
  }

  const assignments = await Assignment.find({ studentId: id }).populate('courseId');
  const dateSheet = await DateSheet.findOne({ studentId: id });
  const changeRequests = await ChangeRequest.find({ studentId: id }).sort({ createdAt: -1 });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/students"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#59645B] hover:text-[#0d402c] transition-colors"
        >
          <HiArrowLeft className="w-4 h-4" />
          <span>Back to Students Directory</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-[#FFFFFF] border border-[#DEDCD1] rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#285742] text-white flex items-center justify-center font-serif text-xl font-bold shadow-xs">
            {student.fullName
              ?.split(' ')
              .map((n: string) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl text-[#24352B] font-normal tracking-tight">
                {student.fullName}
              </h1>
              <span className="font-mono text-xs font-bold text-[#0d402c] bg-[#E7EEE3] px-2.5 py-0.5 rounded-md border border-[#285742]/20">
                {student.registrationNumber}
              </span>
            </div>
            <p className="text-xs text-[#59645B] mt-1">
              {student.program} • Semester {student.semester} • {student.sessionBatch}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(student.userId as any)?.active ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E7EEE3] text-[#285742] border border-[#285742]/20">
              <HiCheckCircle className="w-4 h-4" />
              Active Portal Account
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F0EEE6] text-[#717973] border border-[#DEDCD1]">
              <HiXCircle className="w-4 h-4" />
              Account Suspended
            </span>
          )}
        </div>
      </div>

      {/* Grid: 3 Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details */}
        <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#DEDCD1] shadow-xs space-y-4">
          <h2 className="text-sm font-semibold text-[#0d402c] flex items-center gap-2 border-b border-[#EAE7DD] pb-2">
            <HiIdentification className="w-4 h-4 text-[#285742]" />
            Personal Dossier
          </h2>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-[#59645B]">Email Address:</span>
              <span className="font-medium text-[#24352B]">{(student.userId as any)?.email || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#59645B]">Mobile Phone:</span>
              <span className="font-medium text-[#24352B]">{student.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#59645B]">CNIC / B-Form:</span>
              <span className="font-mono font-medium text-[#24352B]">{student.cnic}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#59645B]">Date of Birth:</span>
              <span className="font-medium text-[#24352B]">
                {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#59645B]">Gender:</span>
              <span className="font-medium text-[#24352B]">{student.gender}</span>
            </div>
            <div className="flex justify-between border-t border-[#EAE7DD] pt-2">
              <span className="text-[#59645B]">Address:</span>
              <span className="font-medium text-[#24352B] text-right max-w-xs">{student.address}</span>
            </div>
          </div>
        </div>

        {/* Parent / Guardian Details */}
        <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#DEDCD1] shadow-xs space-y-4">
          <h2 className="text-sm font-semibold text-[#0d402c] flex items-center gap-2 border-b border-[#EAE7DD] pb-2">
            <HiShieldCheck className="w-4 h-4 text-[#285742]" />
            Guardian Verification
          </h2>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-[#59645B]">Father / Guardian:</span>
              <span className="font-medium text-[#24352B]">{student.fatherName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#59645B]">Parent CNIC:</span>
              <span className="font-mono font-medium text-[#24352B]">{student.parentCnic}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#59645B]">Occupation:</span>
              <span className="font-medium text-[#24352B]">{student.occupation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#59645B]">Guardian Contact:</span>
              <span className="font-medium text-[#24352B]">{student.contactNumber}</span>
            </div>
            <div className="flex justify-between border-t border-[#EAE7DD] pt-2">
              <span className="text-[#59645B]">Emergency Contact:</span>
              <span className="font-medium text-[#24352B]">{student.emergencyContact}</span>
            </div>
          </div>
        </div>

        {/* Academic Records */}
        <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#DEDCD1] shadow-xs space-y-4">
          <h2 className="text-sm font-semibold text-[#0d402c] flex items-center gap-2 border-b border-[#EAE7DD] pb-2">
            <HiAcademicCap className="w-4 h-4 text-[#285742]" />
            Academic Background
          </h2>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-[#59645B]">Previous Qualification:</span>
              <span className="font-medium text-[#24352B]">{student.prevQualification}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#59645B]">Previous Institute:</span>
              <span className="font-medium text-[#24352B]">{student.prevInstitute}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#59645B]">Prior Marks / CGPA:</span>
              <span className="font-medium text-[#24352B]">{student.marksOrCgpa}</span>
            </div>
            <div className="flex justify-between border-t border-[#EAE7DD] pt-2">
              <span className="text-[#59645B]">Selected Exam Campus:</span>
              <span className="font-semibold text-[#285742]">
                {student.selectedBranchId
                  ? `${(student.selectedBranchId as any).code} - ${(student.selectedBranchId as any).name}`
                  : 'Pending Student First Login Selection'}
              </span>
            </div>
          </div>
        </div>

        {/* Enrolled Courses & Schedule */}
        <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#DEDCD1] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#EAE7DD] pb-2">
            <h2 className="text-sm font-semibold text-[#0d402c] flex items-center gap-2">
              <HiBookOpen className="w-4 h-4 text-[#285742]" />
              Assigned Courses ({assignments.length})
            </h2>
            <Link
              href={`/admin/assignments?search=${encodeURIComponent(student.registrationNumber)}`}
              className="text-xs font-semibold text-[#285742] hover:underline"
            >
              Manage Courses →
            </Link>
          </div>
          {assignments.length === 0 ? (
            <p className="text-xs text-[#59645B] italic">No courses currently assigned to this student.</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {assignments.map((a: any) => (
                <div
                  key={a._id}
                  className="p-2.5 bg-[#F7F5EF] rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-[#0d402c] mr-2">
                      {a.courseId?.code}
                    </span>
                    <span className="text-[#24352B] font-medium">{a.courseId?.title}</span>
                  </div>
                  <span className="text-[11px] text-[#59645B]">
                    {a.courseId?.creditHours} CH
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-[#EAE7DD] flex items-center justify-between text-xs">
            <span className="text-[#59645B]">Date Sheet Status:</span>
            {dateSheet ? (
              <span className="font-semibold text-[#285742] bg-[#E7EEE3] px-2.5 py-0.5 rounded-full">
                Saved & Finalized (Rev #{dateSheet.currentRevision})
              </span>
            ) : (
              <span className="font-semibold text-[#795D18] bg-[#F5EDCE] px-2.5 py-0.5 rounded-full">
                Planning In Progress
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
