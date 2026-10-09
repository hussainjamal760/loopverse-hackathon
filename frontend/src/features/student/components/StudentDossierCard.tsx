'use client';

import React, { useState } from 'react';
import {
  HiUser,
  HiUsers,
  HiAcademicCap,
  HiBuildingOffice2,
  HiChevronDown,
  HiChevronUp,
  HiShieldCheck,
} from 'react-icons/hi2';

interface StudentDossierCardProps {
  student: {
    fullName: string;
    registrationNumber: string;
    cnic: string;
    phone: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    fatherName: string;
    parentCnic: string;
    occupation?: string;
    contactNumber?: string;
    emergencyContact: string;
    program: string;
    semester: number;
    sessionBatch: string;
  };
  branch?: {
    code: string;
    name: string;
    city: string;
    address: string;
    contactNumber?: string;
  } | null;
}

export function StudentDossierCard({ student, branch }: StudentDossierCardProps) {
  const [expanded, setExpanded] = useState(false);

  if (!student) return null;

  const formattedDob = student.dateOfBirth
    ? new Date(student.dateOfBirth).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'Recorded';

  return (
    <div className="bg-[#FFFFFF] border border-[#DEDCD1] rounded-2xl p-5 sm:p-6 shadow-xs mb-6 transition-all">
      {/* Top Header: Identity & Quick Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAE7DD]">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#E7EEE3] text-[#285742] flex items-center justify-center font-bold text-base border border-[#285742]/20 shrink-0">
            {student.fullName
              .split(' ')
              .map((n) => n[0])
              .filter(Boolean)
              .join('')
              .substring(0, 2)
              .toUpperCase() || 'ST'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base text-[#24352B]">{student.fullName}</h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#285742] bg-[#E7EEE3] px-2 py-0.5 rounded-full border border-[#285742]/20">
                <HiShieldCheck className="w-3 h-3" />
                <span>Verified Student Record</span>
              </span>
            </div>
            <p className="text-xs text-[#59645B] mt-0.5">
              Roll No: <span className="font-mono font-bold text-[#24352B]">{student.registrationNumber}</span> ·{' '}
              {student.program} · Semester {student.semester}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="text-right hidden md:block">
            <span className="text-[11px] text-[#59645B] block">Selected Exam Campus</span>
            <span className="font-semibold text-xs text-[#24352B]">
              {branch?.name || 'Main Examination Campus'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="px-3 py-1.5 rounded-xl border border-[#DEDCD1] bg-[#F7F5EF] hover:bg-[#EAE7DD] text-xs font-medium text-[#24352B] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>{expanded ? 'Hide Dossier' : 'View Full Details'}</span>
            {expanded ? <HiChevronUp className="w-3.5 h-3.5" /> : <HiChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Primary Highlights Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs">
        <div className="p-3 bg-[#F7F5EF] rounded-xl border border-[#DEDCD1]">
          <span className="text-[11px] text-[#59645B] block">Degree Program</span>
          <span className="font-semibold text-[#24352B] truncate block mt-0.5">
            {student.program}
          </span>
        </div>

        <div className="p-3 bg-[#F7F5EF] rounded-xl border border-[#DEDCD1]">
          <span className="text-[11px] text-[#59645B] block">Current Semester</span>
          <span className="font-semibold text-[#24352B] block mt-0.5">
            Semester {student.semester} ({student.sessionBatch})
          </span>
        </div>

        <div className="p-3 bg-[#F7F5EF] rounded-xl border border-[#DEDCD1]">
          <span className="text-[11px] text-[#59645B] block">Student CNIC</span>
          <span className="font-mono font-semibold text-[#24352B] block mt-0.5">
            {student.cnic}
          </span>
        </div>

        <div className="p-3 bg-[#F7F5EF] rounded-xl border border-[#DEDCD1]">
          <span className="text-[11px] text-[#59645B] block">Exam Center Campus</span>
          <span className="font-semibold text-[#285742] truncate block mt-0.5">
            {branch?.name || 'Assigned Branch'}
          </span>
        </div>
      </div>

      {/* Expandable Comprehensive Dossier (Personal, Parent, Academic, Branch) */}
      {expanded && (
        <div className="mt-5 pt-5 border-t border-[#EAE7DD] grid grid-cols-1 md:grid-cols-3 gap-5 text-xs animate-in fade-in duration-200">
          {/* 1. Personal Information */}
          <div className="space-y-2.5 p-3.5 rounded-xl bg-[#F7F5EF] border border-[#DEDCD1]">
            <div className="flex items-center gap-1.5 font-bold text-[#285742] uppercase tracking-wider text-[11px] pb-1 border-b border-[#DEDCD1]">
              <HiUser className="w-3.5 h-3.5" />
              <span>Personal Details</span>
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div>
                <span className="text-[#59645B] block">Full Candidate Name</span>
                <span className="font-semibold text-[#24352B]">{student.fullName}</span>
              </div>
              <div>
                <span className="text-[#59645B] block">Contact Phone</span>
                <span className="font-mono font-semibold text-[#24352B]">{student.phone}</span>
              </div>
              <div>
                <span className="text-[#59645B] block">Date of Birth & Gender</span>
                <span className="text-[#24352B]">
                  {formattedDob} · {student.gender || 'Not specified'}
                </span>
              </div>
              <div>
                <span className="text-[#59645B] block">Residential Address</span>
                <span className="text-[#24352B] leading-tight block">{student.address || 'On file'}</span>
              </div>
            </div>
          </div>

          {/* 2. Parent / Guardian Information */}
          <div className="space-y-2.5 p-3.5 rounded-xl bg-[#F7F5EF] border border-[#DEDCD1]">
            <div className="flex items-center gap-1.5 font-bold text-[#285742] uppercase tracking-wider text-[11px] pb-1 border-b border-[#DEDCD1]">
              <HiUsers className="w-3.5 h-3.5" />
              <span>Guardian Details</span>
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div>
                <span className="text-[#59645B] block">Father / Guardian Name</span>
                <span className="font-semibold text-[#24352B]">{student.fatherName}</span>
              </div>
              <div>
                <span className="text-[#59645B] block">Guardian CNIC</span>
                <span className="font-mono font-semibold text-[#24352B]">{student.parentCnic}</span>
              </div>
              <div>
                <span className="text-[#59645B] block">Guardian Occupation</span>
                <span className="text-[#24352B]">{student.occupation || 'Self-Employed'}</span>
              </div>
              <div>
                <span className="text-[#59645B] block">Emergency Contact</span>
                <span className="font-mono font-semibold text-[#24352B]">
                  {student.emergencyContact || student.contactNumber}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Academic & Campus Allocation */}
          <div className="space-y-2.5 p-3.5 rounded-xl bg-[#F7F5EF] border border-[#DEDCD1]">
            <div className="flex items-center gap-1.5 font-bold text-[#285742] uppercase tracking-wider text-[11px] pb-1 border-b border-[#DEDCD1]">
              <HiBuildingOffice2 className="w-3.5 h-3.5" />
              <span>Academic & Center</span>
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div>
                <span className="text-[#59645B] block">University Registration</span>
                <span className="font-mono font-bold text-[#0d402c]">{student.registrationNumber}</span>
              </div>
              <div>
                <span className="text-[#59645B] block">Session Batch</span>
                <span className="text-[#24352B]">{student.sessionBatch}</span>
              </div>
              <div>
                <span className="text-[#59645B] block">Allocated Examination Center</span>
                <span className="font-semibold text-[#285742]">
                  {branch?.name || 'Main Campus'} ({branch?.code || 'MAIN'})
                </span>
              </div>
              <div>
                <span className="text-[#59645B] block">Center Address</span>
                <span className="text-[#24352B] leading-tight block">
                  {branch?.address ? `${branch.address}, ${branch.city}` : 'Campus Hall'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
