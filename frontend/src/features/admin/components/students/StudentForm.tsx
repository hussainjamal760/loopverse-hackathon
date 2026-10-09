'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  HiUsers,
  HiUser,
  HiEnvelope,
  HiPhone,
  HiIdentification,
  HiCalendarDays,
  HiMapPin,
  HiShieldCheck,
  HiAcademicCap,
  HiBuildingOffice2,
  HiCheck,
  HiArrowPath,
  HiExclamationCircle,
  HiCheckCircle,
  HiArrowLeft,
  HiSparkles,
  HiClipboardDocumentCheck,
} from 'react-icons/hi2';
import Link from 'next/link';

interface BranchOption {
  _id: string;
  code: string;
  name: string;
  city: string;
}

interface CourseOption {
  _id: string;
  code: string;
  title: string;
  creditHours: number;
}

export function StudentForm() {
  const router = useRouter();

  // Branch & Course options loaded dynamically from DB
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    // Personal Group
    fullName: '',
    email: '',
    phone: '',
    cnic: '',
    dateOfBirth: '2004-03-15',
    gender: 'Male',
    address: '',
    // Parent / Guardian Group
    fatherName: '',
    parentCnic: '',
    occupation: '',
    contactNumber: '',
    emergencyContact: '',
    // Academic Group
    registrationNumber: '',
    program: 'BS Computer Science',
    semester: 4,
    sessionBatch: 'Fall 2026',
    prevQualification: 'HSSC Pre-Engineering',
    prevInstitute: 'Punjab Group of Colleges',
    marksOrCgpa: '3.65 CGPA',
    // Allocation
    selectedBranchId: '',
    selectedCourseIds: [] as string[],
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<{
    student: any;
    setupUrl: string;
    emailSent: boolean;
  } | null>(null);

  // Load active branches & courses from MongoDB
  useEffect(() => {
    async function loadOptions() {
      try {
        const [bRes, cRes] = await Promise.all([
          fetch('/api/branches?pageSize=100'),
          fetch('/api/courses?pageSize=100'),
        ]);

        if (bRes.ok) {
          const bData = await bRes.json();
          setBranches(bData.branches?.filter((b: any) => b.active) || []);
        }

        if (cRes.ok) {
          const cData = await cRes.json();
          setCourses(cData.courses?.filter((c: any) => c.active) || []);
        }
      } catch (err) {
        console.error('Error loading options:', err);
      } finally {
        setLoadingOptions(false);
      }
    }
    loadOptions();
  }, []);

  // Quick Registration Number generator helper
  const handleAutoGenerateReg = () => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    setFormData((prev) => ({
      ...prev,
      registrationNumber: `VU-2026-${randomDigits}`,
    }));
  };

  const handleToggleCourse = (courseId: string) => {
    setFormData((prev) => {
      const exists = prev.selectedCourseIds.includes(courseId);
      if (exists) {
        return { ...prev, selectedCourseIds: prev.selectedCourseIds.filter((id) => id !== courseId) };
      } else {
        if (prev.selectedCourseIds.length >= 6) return prev; // max 6
        return { ...prev, selectedCourseIds: [...prev.selectedCourseIds, courseId] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setCreatedResult(null);

    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          courseIds: formData.selectedCourseIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register student record.');
      }

      setCreatedResult({
        student: data.student,
        setupUrl: data.setupUrl,
        emailSent: data.emailSent,
      });
    } catch (err: any) {
      setError(err.message || 'Submission error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Breadcrumb & Navigation */}
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
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#E7EEE3] text-[#285742] mb-2">
            <HiShieldCheck className="w-3.5 h-3.5" />
            <span>Academic Registrar • Student Admission</span>
          </div>
          <h1 className="font-serif text-2xl text-[#24352B] font-normal tracking-tight">
            Register New Student
          </h1>
          <p className="text-xs text-[#59645B] mt-1">
            Complete the student dossier across Personal, Guardian, and Academic records. The system dynamically creates the user profile, generates single-use setup credentials, and dispatches the activation link via email.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAutoGenerateReg}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#285742] bg-[#E7EEE3] hover:bg-[#d9edde] border border-[#285742]/30 rounded-xl transition-colors shrink-0"
        >
          <HiSparkles className="w-4 h-4 text-[#285742]" />
          <span>Generate Registration ID</span>
        </button>
      </div>

      {/* Success Banner */}
      {createdResult && (
        <div className="bg-[#E7EEE3] border border-[#285742]/30 rounded-2xl p-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#285742] text-white flex items-center justify-center shrink-0">
              <HiCheckCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-base text-[#0d402c]">
                Student Successfully Enrolled!
              </h3>
              <p className="text-xs text-[#24352B] mt-0.5">
                Registration Number:{' '}
                <span className="font-mono font-bold text-[#0d402c]">
                  {createdResult.student.registrationNumber}
                </span>{' '}
                • Full Name: <span className="font-semibold">{createdResult.student.fullName}</span>
              </p>
              <div className="mt-3 p-3 bg-white/80 rounded-xl border border-[#285742]/20 text-xs space-y-1.5 font-mono">
                <div className="text-[#59645B] font-sans font-semibold">Activation Setup URL:</div>
                <div className="text-[#285742] break-all select-all">{createdResult.setupUrl}</div>
                <div className="text-[11px] text-[#717973] font-sans pt-1">
                  Email Delivery Status:{' '}
                  {createdResult.emailSent ? (
                    <span className="text-[#285742] font-semibold">Sent to student inbox</span>
                  ) : (
                    <span className="text-[#795D18] font-semibold">Queued in Email Outbox</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={() => {
                setCreatedResult(null);
                setFormData({
                  fullName: '',
                  email: '',
                  phone: '',
                  cnic: '',
                  dateOfBirth: '2004-03-15',
                  gender: 'Male',
                  address: '',
                  fatherName: '',
                  parentCnic: '',
                  occupation: '',
                  contactNumber: '',
                  emergencyContact: '',
                  registrationNumber: '',
                  program: 'BS Computer Science',
                  semester: 4,
                  sessionBatch: 'Fall 2026',
                  prevQualification: 'HSSC Pre-Engineering',
                  prevInstitute: 'Punjab Group of Colleges',
                  marksOrCgpa: '3.65 CGPA',
                  selectedBranchId: '',
                  selectedCourseIds: [],
                });
              }}
              className="px-4 py-2 text-xs font-semibold text-[#285742] bg-white border border-[#285742]/30 rounded-xl hover:bg-[#F7F5EF] transition-colors"
            >
              Enroll Another Student
            </button>
            <Link
              href="/admin/students"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#285742] hover:bg-[#1f4534] rounded-xl transition-colors"
            >
              View in Directory
            </Link>
          </div>
        </div>
      )}

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-[#FAEAE7] border border-[#A3342F]/30 text-[#A3342F] text-xs rounded-2xl flex items-center gap-3">
            <HiExclamationCircle className="w-5 h-5 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Section 1: Personal Information */}
        <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#DEDCD1] shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#EAE7DD]">
            <div className="w-7 h-7 rounded-lg bg-[#285742] text-white flex items-center justify-center">
              <HiUser className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#24352B]">1. Personal Information</h2>
              <p className="text-[11px] text-[#59645B]">Candidate identity, contact coordinates, and demographic records</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#24352B] mb-1">
                Full Name <span className="text-[#A3342F]">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g. Syed Bilal Ahmed"
                className="w-full px-3 py-2 text-xs border border-[#DEDCD1] rounded-xl focus:outline-none focus:border-[#285742] bg-[#FFFFFF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#24352B] mb-1">
                Institutional / Personal Email <span className="text-[#A3342F]">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="student@examslot.edu.pk"
                className="w-full px-3 py-2 text-xs border border-[#DEDCD1] rounded-xl focus:outline-none focus:border-[#285742] bg-[#FFFFFF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#24352B] mb-1">
                Mobile Phone <span className="text-[#A3342F]">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0301-8472910"
                className="w-full px-3 py-2 text-xs border border-[#DEDCD1] rounded-xl focus:outline-none focus:border-[#285742] bg-[#FFFFFF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#24352B] mb-1">
                CNIC / B-Form Number <span className="text-[#A3342F]">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.cnic}
                onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                placeholder="35201-4928172-3"
                className="w-full px-3 py-2 text-xs border border-[#DEDCD1] rounded-xl focus:outline-none focus:border-[#285742] bg-[#FFFFFF] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#24352B] mb-1">
                Date of Birth <span className="text-[#A3342F]">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-[#DEDCD1] rounded-xl focus:outline-none focus:border-[#285742] bg-[#FFFFFF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#24352B] mb-1">
                Gender <span className="text-[#A3342F]">*</span>
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-[#DEDCD1] rounded-xl focus:outline-none focus:border-[#285742] bg-[#FFFFFF]"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#24352B] mb-1">
              Residential Address <span className="text-[#A3342F]">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="House 14-B, Street 3, Gulshan-e-Iqbal, Karachi"
              className="w-full px-3 py-2 text-xs border border-[#DEDCD1] rounded-xl focus:outline-none focus:border-[#285742] bg-[#FFFFFF]"
            />
          </div>
        </div>

        {/* Section 2: Parent / Guardian Details */}
        <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#DEDCD1] shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#EAE7DD]">
            <div className="w-7 h-7 rounded-lg bg-[#285742] text-white flex items-center justify-center">
              <HiShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#24352B]">2. Parent / Guardian Details</h2>
              <p className="text-[11px] text-[#59645B]">Emergency contact point and verification details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#24352B] mb-1">
                Father / Guardian Name <span className="text-[#A3342F]">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.fatherName}
                onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                placeholder="e.g. Tariq Mehmood"
                className="w-full px-3 py-2 text-xs border border-[#DEDCD1] rounded-xl focus:outline-none focus:border-[#285742] bg-[#FFFFFF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#24352B] mb-1">
                Parent CNIC <span className="text-[#A3342F]">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.parentCnic}
                onChange={(e) => setFormData({ ...formData, parentCnic: e.target.value })}
                placeholder="42101-1928374-1"
                className="w-full px-3 py-2 text-xs border border-[#DEDCD1] rounded-xl focus:outline-none focus:border-[#285742] bg-[#FFFFFF] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#24352B] mb-1">
                Occupation <span className="text-[#A3342F]">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.occupation}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                placeholder="e.g. Civil Engineer / Government Service"
                className="w-full px-3 py-2 text-xs border border-[#DEDCD1] rounded-xl focus:outline-none focus:border-[#285742] bg-[#FFFFFF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#24352B] mb-1">
                Guardian Contact Number <span className="text-[#A3342F]">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                placeholder="0300-9876543"
                className="w-full px-3 py-2 text-xs border border-[#DEDCD1] rounded-xl focus:outline-none focus:border-[#285742] bg-[#FFFFFF]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#24352B] mb-1">
                Emergency Contact Number <span className="text-[#A3342F]">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                placeholder="0321-4567890 (Relation: Uncle / Guardian)"
                className="w-full px-3 py-2 text-xs border border-[#DEDCD1] rounded-xl focus:outline-none focus:border-[#285742] bg-[#FFFFFF]"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Academic Record */}
        <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#DEDCD1] shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#EAE7DD]">
            <div className="w-7 h-7 rounded-lg bg-[#285742] text-white flex items-center justify-center">
              <HiAcademicCap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#24352B]">3. Academic Dossier</h2>
              <p className="text-[11px] text-[#59645B]">Registration number, current degree program, and prior qualifications</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#24352B] mb-1">
                Registration Number <span className="text-[#A3342F]">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value.toUpperCase() })}
                  placeholder="e.g. VU-2026-0142"
                  className="w-full px-3 py-2 text-xs border border-[#DEDCD1] rounded-xl focus:outline-none focus:border-[#285742] bg-[#FFFFFF] font-mono font-bold uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#24352B] mb-1">
                Degree Program <span className="text-[#A3342F]">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.program}
                onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                placeholder="e.g. BS Computer Science"
                className="w-full px-3 py-2 text-xs border border-[#DEDCD1] rounded-xl focus:outline-none focus:border-[#285742] bg-[#FFFFFF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#24352B] mb-1">
                Current Semester (1-8) <span className="text-[#A3342F]">*</span>
              </label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value, 10) })}
                className="w-full px-3 py-2 text-xs border border-[#DEDCD1] rounded-xl focus:outline-none focus:border-[#285742] bg-[#FFFFFF]"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#24352B] mb-1">
                Session / Batch <span className="text-[#A3342F]">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.sessionBatch}
                onChange={(e) => setFormData({ ...formData, sessionBatch: e.target.value })}
                placeholder="Fall 2026 (2024-2028)"
                className="w-full px-3 py-2 text-xs border border-[#DEDCD1] rounded-xl focus:outline-none focus:border-[#285742] bg-[#FFFFFF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#24352B] mb-1">
                Previous Qualification <span className="text-[#A3342F]">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.prevQualification}
                onChange={(e) => setFormData({ ...formData, prevQualification: e.target.value })}
                placeholder="e.g. HSSC Pre-Engineering, A-Levels, DAE"
                className="w-full px-3 py-2 text-xs border border-[#DEDCD1] rounded-xl focus:outline-none focus:border-[#285742] bg-[#FFFFFF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#24352B] mb-1">
                Previous Institute <span className="text-[#A3342F]">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.prevInstitute}
                onChange={(e) => setFormData({ ...formData, prevInstitute: e.target.value })}
                placeholder="e.g. Govt Degree College / PGC"
                className="w-full px-3 py-2 text-xs border border-[#DEDCD1] rounded-xl focus:outline-none focus:border-[#285742] bg-[#FFFFFF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#24352B] mb-1">
                Marks or CGPA (with scale) <span className="text-[#A3342F]">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.marksOrCgpa}
                onChange={(e) => setFormData({ ...formData, marksOrCgpa: e.target.value })}
                placeholder="e.g. 3.65 CGPA or 890/1100 Marks"
                className="w-full px-3 py-2 text-xs border border-[#DEDCD1] rounded-xl focus:outline-none focus:border-[#285742] bg-[#FFFFFF]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#24352B] mb-1">
                Initial Campus Branch Preference (Optional)
              </label>
              <select
                value={formData.selectedBranchId}
                onChange={(e) => setFormData({ ...formData, selectedBranchId: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-[#DEDCD1] rounded-xl focus:outline-none focus:border-[#285742] bg-[#FFFFFF]"
              >
                <option value="">-- Let student choose during first portal login --</option>
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.code} - {b.name} ({b.city})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Initial Course Assignments (Optional) */}
        <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#DEDCD1] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE7DD]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#285742] text-white flex items-center justify-center">
                <HiClipboardDocumentCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#24352B]">
                  4. Initial Course Enrollment (Optional, 4–6 courses)
                </h2>
                <p className="text-[11px] text-[#59645B]">
                  Assign academic courses now or configure them later in the Course Assignments management panel
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-[#285742] bg-[#E7EEE3] px-2.5 py-1 rounded-full">
              {formData.selectedCourseIds.length} Selected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {courses.map((course) => {
              const isSelected = formData.selectedCourseIds.includes(course._id);
              return (
                <div
                  key={course._id}
                  onClick={() => handleToggleCourse(course._id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                    isSelected
                      ? 'bg-[#E7EEE3] border-[#285742] shadow-xs'
                      : 'bg-[#FFFFFF] border-[#DEDCD1] hover:bg-[#F7F5EF]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                      isSelected
                        ? 'bg-[#285742] border-[#285742] text-white'
                        : 'border-[#717973] bg-white'
                    }`}
                  >
                    {isSelected && <HiCheck className="w-3 h-3 stroke-[2]" />}
                  </div>
                  <div className="min-w-0">
                    <div className="font-mono font-semibold text-xs text-[#0d402c]">
                      {course.code}
                    </div>
                    <div className="text-xs font-medium text-[#24352B] truncate">
                      {course.title}
                    </div>
                    <div className="text-[10px] text-[#59645B] mt-0.5">
                      {course.creditHours} Credit Hours
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DEDCD1]">
          <Link
            href="/admin/students"
            className="px-5 py-2.5 text-xs font-semibold text-[#59645B] hover:text-[#24352B] border border-[#DEDCD1] rounded-xl hover:bg-[#F7F5EF] transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-[#285742] hover:bg-[#1f4534] rounded-xl shadow-xs transition-colors disabled:opacity-50"
          >
            {submitting ? (
              <>
                <HiArrowPath className="w-4 h-4 animate-spin" />
                <span>Creating Student & Sending Email...</span>
              </>
            ) : (
              <>
                <HiCheck className="w-4 h-4 stroke-[2]" />
                <span>Create Student Account</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
