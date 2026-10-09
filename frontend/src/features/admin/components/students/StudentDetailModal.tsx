'use client';

import React, { useState } from 'react';
import {
  HiUsers,
  HiXMark,
  HiEnvelope,
  HiPhone,
  HiIdentification,
  HiCalendarDays,
  HiMapPin,
  HiShieldCheck,
  HiAcademicCap,
  HiBuildingOffice2,
  HiClipboardDocumentCheck,
  HiArrowPath,
  HiCheckCircle,
  HiXCircle,
  HiArrowTopRightOnSquare,
} from 'react-icons/hi2';

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
  onRefresh: () => void;
}

export function StudentDetailModal({
  isOpen,
  onClose,
  student,
  onRefresh,
}: StudentDetailModalProps) {
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  if (!isOpen || !student) return null;

  const handleResendInvite = async () => {
    setResending(true);
    setResendStatus(null);
    try {
      const res = await fetch(`/api/students/${student._id}/resend-invite`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        setResendStatus(`Invitation sent successfully: ${data.setupUrl}`);
      } else {
        setResendStatus(data.error || 'Failed to resend invite');
      }
    } catch (err: any) {
      setResendStatus('Network error');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-[#FFFFFF] border border-[#DEDCD1] rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EAE7DD] flex items-center justify-between bg-[#F7F5EF] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#285742] text-white flex items-center justify-center font-bold font-mono text-sm">
              {student.fullName
                ?.split(' ')
                .map((n: string) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase() || 'ST'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base text-[#24352B]">{student.fullName}</h3>
                <span className="font-mono text-xs font-bold text-[#0d402c] bg-[#E7EEE3] px-2 py-0.5 rounded">
                  {student.registrationNumber}
                </span>
              </div>
              <p className="text-xs text-[#59645B] mt-0.5">{student.program} • Semester {student.semester}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#717973] hover:text-[#0d402c] p-1.5 rounded-lg hover:bg-[#EAE7DD] transition-colors"
          >
            <HiXMark className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {resendStatus && (
            <div className="p-3 bg-[#E7EEE3] border border-[#285742]/30 rounded-xl text-[#0d402c] break-all">
              {resendStatus}
            </div>
          )}

          {/* 1. Personal Information */}
          <div className="space-y-3">
            <h4 className="font-semibold text-[#0d402c] uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-[#EAE7DD] pb-1.5">
              <HiIdentification className="w-4 h-4 text-[#285742]" />
              Personal Records
            </h4>
            <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
              <div>
                <span className="text-[#59645B]">Email:</span>{' '}
                <span className="font-medium text-[#24352B]">{student.userId?.email || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[#59645B]">Phone:</span>{' '}
                <span className="font-medium text-[#24352B]">{student.phone}</span>
              </div>
              <div>
                <span className="text-[#59645B]">CNIC / B-Form:</span>{' '}
                <span className="font-mono font-medium text-[#24352B]">{student.cnic}</span>
              </div>
              <div>
                <span className="text-[#59645B]">Date of Birth:</span>{' '}
                <span className="font-medium text-[#24352B]">
                  {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-[#59645B]">Gender:</span>{' '}
                <span className="font-medium text-[#24352B]">{student.gender}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[#59645B]">Address:</span>{' '}
                <span className="font-medium text-[#24352B]">{student.address}</span>
              </div>
            </div>
          </div>

          {/* 2. Guardian Details */}
          <div className="space-y-3">
            <h4 className="font-semibold text-[#0d402c] uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-[#EAE7DD] pb-1.5">
              <HiShieldCheck className="w-4 h-4 text-[#285742]" />
              Parent & Guardian Information
            </h4>
            <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
              <div>
                <span className="text-[#59645B]">Father / Guardian:</span>{' '}
                <span className="font-medium text-[#24352B]">{student.fatherName}</span>
              </div>
              <div>
                <span className="text-[#59645B]">Parent CNIC:</span>{' '}
                <span className="font-mono font-medium text-[#24352B]">{student.parentCnic}</span>
              </div>
              <div>
                <span className="text-[#59645B]">Occupation:</span>{' '}
                <span className="font-medium text-[#24352B]">{student.occupation}</span>
              </div>
              <div>
                <span className="text-[#59645B]">Contact Number:</span>{' '}
                <span className="font-medium text-[#24352B]">{student.contactNumber}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[#59645B]">Emergency Contact:</span>{' '}
                <span className="font-medium text-[#24352B]">{student.emergencyContact}</span>
              </div>
            </div>
          </div>

          {/* 3. Academic Dossier */}
          <div className="space-y-3">
            <h4 className="font-semibold text-[#0d402c] uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-[#EAE7DD] pb-1.5">
              <HiAcademicCap className="w-4 h-4 text-[#285742]" />
              Academic Dossier & Prior Education
            </h4>
            <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
              <div>
                <span className="text-[#59645B]">Session Batch:</span>{' '}
                <span className="font-medium text-[#24352B]">{student.sessionBatch}</span>
              </div>
              <div>
                <span className="text-[#59645B]">Previous Qualification:</span>{' '}
                <span className="font-medium text-[#24352B]">{student.prevQualification}</span>
              </div>
              <div>
                <span className="text-[#59645B]">Previous Institute:</span>{' '}
                <span className="font-medium text-[#24352B]">{student.prevInstitute}</span>
              </div>
              <div>
                <span className="text-[#59645B]">Marks / CGPA:</span>{' '}
                <span className="font-medium text-[#24352B]">{student.marksOrCgpa}</span>
              </div>
              <div>
                <span className="text-[#59645B]">Allocated Branch:</span>{' '}
                <span className="font-medium text-[#285742]">
                  {student.selectedBranchId
                    ? `${student.selectedBranchId.code} - ${student.selectedBranchId.name}`
                    : 'Not Selected Yet'}
                </span>
              </div>
              <div>
                <span className="text-[#59645B]">Account Active:</span>{' '}
                <span className="font-medium text-[#24352B]">
                  {student.userId?.active ? 'Active' : 'Inactive / Suspended'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-[#EAE7DD] bg-[#F7F5EF] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleResendInvite}
            disabled={resending}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-[#285742] hover:bg-[#E7EEE3] border border-[#285742]/30 rounded-xl transition-colors disabled:opacity-50"
          >
            <HiArrowPath className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
            <span>Resend Account Setup Email</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-[#59645B] hover:text-[#24352B] border border-[#DEDCD1] rounded-xl hover:bg-[#FFFFFF] transition-colors"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
