'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  HiCheck,
  HiCheckCircle,
  HiLockClosed,
  HiBuildingOffice2,
  HiShieldCheck,
  HiInformationCircle,
  HiEye,
  HiEyeSlash,
  HiArrowRight,
  HiPhone,
  HiEnvelope,
  HiAcademicCap,
  HiIdentification,
  HiCalendarDays,
  HiMapPin,
  HiExclamationCircle,
  HiArrowPath,
  HiXCircle,
} from 'react-icons/hi2';
import { toast } from 'sonner';

interface BranchOption {
  id: string;
  code: string;
  name: string;
  city: string;
  address: string;
  contactNumber: string;
}

interface StudentVerifiedData {
  id?: string;
  fullName: string;
  registrationNumber: string;
  email: string;
  phone: string;
  cnic: string;
  program: string;
  semester?: number;
  sessionBatch?: string;
  selectedBranchId?: string | null;
}

function EnrollmentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawToken = searchParams.get('token') || '';

  // Verification state
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Student & Branches state from API
  const [studentData, setStudentData] = useState<StudentVerifiedData | null>(null);
  const [branches, setBranches] = useState<BranchOption[]>([]);

  // Form interactive state
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [agreed, setAgreed] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successComplete, setSuccessComplete] = useState(false);

  // Verify token on mount
  useEffect(() => {
    async function verify() {
      if (!rawToken) {
        setVerifying(false);
        setTokenValid(false);
        setErrorMessage('No activation token provided. Please use the activation link sent to your institutional email.');
        return;
      }

      try {
        const res = await fetch(`/api/auth/verify-token?token=${encodeURIComponent(rawToken)}`);
        const data = await res.json();

        if (res.ok && data.valid) {
          setTokenValid(true);
          setStudentData(data.student);
          setBranches(data.branches || []);
          if (data.student?.phone) {
            setPhone(data.student.phone);
          }
          if (data.student?.selectedBranchId) {
            setSelectedBranchId(data.student.selectedBranchId);
          } else if (data.branches && data.branches.length > 0) {
            setSelectedBranchId(data.branches[0].id);
          }
        } else {
          setTokenValid(false);
          setErrorMessage(data.error || 'The activation link is invalid, expired, or has already been used.');
        }
      } catch (err: any) {
        setTokenValid(false);
        setErrorMessage('Failed to connect to verification server. Please check your internet connection.');
      } finally {
        setVerifying(false);
      }
    }

    verify();
  }, [rawToken]);

  // Password strength calculation
  const getStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (pass.length >= 12) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getStrength(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreed) {
      toast.error('Please agree to university examination protocols.');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }
    if (!passwordsMatch) {
      toast.error('Passcodes do not match.');
      return;
    }
    if (!selectedBranchId && branches.length > 0) {
      toast.error('Please select your designated exam branch.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: rawToken,
          password,
          selectedBranchId,
          phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to establish password.');
      }

      setSuccessComplete(true);
      toast.success('Account successfully activated! Proceeding to Exam Planner...');

      setTimeout(() => {
        router.push(data.redirectUrl || '/student/planner');
      }, 1500);
    } catch (err: any) {
      toast.error(err.message || 'Error completing account setup.');
      setSubmitting(false);
    }
  };

  // State: Loading skeleton
  if (verifying) {
    return (
      <div className="min-h-screen bg-[#F7F5EF] flex items-center justify-center p-6">
        <div className="bg-[#FFFFFF] border border-[#DEDCD1] rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#E7EEE3] text-[#285742] mx-auto flex items-center justify-center">
            <HiArrowPath className="w-6 h-6 animate-spin" />
          </div>
          <h2 className="font-serif text-xl text-[#24352B]">Verifying Security Credentials...</h2>
          <p className="text-xs text-[#59645B]">
            Authenticating single-use token and fetching your student academic dossier from the central registry.
          </p>
        </div>
      </div>
    );
  }

  // State: Error or Expired Token
  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-[#F7F5EF] flex items-center justify-center p-6">
        <div className="bg-[#FFFFFF] border border-[#DEDCD1] rounded-2xl p-8 max-w-lg w-full text-center space-y-5 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#FAEAE7] text-[#A3342F] mx-auto flex items-center justify-center">
            <HiXCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="font-serif text-2xl text-[#24352B]">Activation Link Expired or Invalid</h2>
            <p className="text-xs text-[#59645B] mt-2 leading-relaxed">
              {errorMessage || 'This single-use link has expired or has already been used to establish credentials.'}
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-2.5 text-xs font-semibold text-white bg-[#285742] hover:bg-[#1f4534] rounded-xl shadow-xs transition-colors"
            >
              Go to Portal Login
            </Link>
            <Link
              href="/student/help"
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-[#59645B] hover:text-[#24352B] border border-[#DEDCD1] rounded-xl hover:bg-[#F7F5EF] transition-colors"
            >
              Contact Registrar Desk
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // State: Success Complete
  if (successComplete) {
    return (
      <div className="min-h-screen bg-[#F7F5EF] flex items-center justify-center p-6">
        <div className="bg-[#FFFFFF] border border-[#285742]/30 rounded-2xl p-8 max-w-lg w-full text-center space-y-5 shadow-md animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-[#E7EEE3] text-[#285742] mx-auto flex items-center justify-center">
            <HiCheckCircle className="w-10 h-10" />
          </div>
          <div>
            <h2 className="font-serif text-2xl text-[#0d402c]">Account Successfully Activated!</h2>
            <p className="text-xs text-[#59645B] mt-2 leading-relaxed">
              Your password has been securely encrypted and your preferred campus branch has been locked into your academic profile. Redirecting to your official Exam Planner...
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/student/planner"
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-[#285742] hover:bg-[#1f4534] rounded-xl shadow-xs transition-colors"
            >
              <span>Open Exam Planner</span>
              <HiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Initials for avatar
  const initials = studentData?.fullName
    ? studentData.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'ST';

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#24352B] flex flex-col font-sans">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FFFFFF]/90 backdrop-blur-xl border-b border-[#DEDCD1] shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#E7EEE3] text-[#285742] flex items-center justify-center font-bold">
                <HiCalendarDays className="w-5 h-5" />
              </div>
              <span className="font-semibold text-lg text-[#285742] tracking-tight font-serif">
                ExamSlot
              </span>
            </Link>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#E7EEE3] rounded-full border border-[#DEDCD1]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#285742]" />
              <span className="text-xs font-medium text-[#285742]">
                {studentData?.sessionBatch || 'Fall 2026'} Academic Registration
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-[#59645B]">
              <span className="hidden md:inline">Already have credentials?</span>
              <Link href="/login" className="font-semibold text-[#285742] hover:underline">
                Sign in
              </Link>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#285742] text-white flex items-center justify-center font-bold text-xs">
              {initials}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full pt-24 pb-16 px-4 sm:px-8">
        {/* Top Hero Heading */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E7EEE3] text-[#285742] mb-2">
            <HiShieldCheck className="w-3.5 h-3.5" />
            <span>Official Identity & Security Activation</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#24352B] tracking-tight font-normal">
            Welcome, {studentData?.fullName}
          </h1>
          <p className="text-sm text-[#59645B] mt-1.5 max-w-2xl leading-relaxed">
            Verify your enrolled academic records, select your preferred university exam center, and establish your portal password to access examination scheduling.
          </p>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form & Selection (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section 1: Verified Record Confirmation */}
              <div className="bg-[#FFFFFF] rounded-2xl p-6 shadow-xs border border-[#DEDCD1] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#DEDCD1]">
                  <div className="flex items-center gap-2">
                    <HiIdentification className="w-5 h-5 text-[#285742]" />
                    <h2 className="text-base font-semibold text-[#24352B]">
                      Academic Identity Verification
                    </h2>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#285742] bg-[#E7EEE3] px-2.5 py-0.5 rounded-full border border-[#285742]/20">
                    <HiCheckCircle className="w-3.5 h-3.5" />
                    Verified by Registrar
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-[#F7F5EF] rounded-xl border border-[#EAE7DD]">
                    <span className="text-[#59645B] block text-[11px]">Full Legal Name</span>
                    <span className="font-semibold text-sm text-[#24352B] mt-0.5 block">
                      {studentData?.fullName}
                    </span>
                  </div>

                  <div className="p-3 bg-[#F7F5EF] rounded-xl border border-[#EAE7DD]">
                    <span className="text-[#59645B] block text-[11px]">Registration Number</span>
                    <span className="font-mono font-bold text-sm text-[#0d402c] mt-0.5 block">
                      {studentData?.registrationNumber}
                    </span>
                  </div>

                  <div className="p-3 bg-[#F7F5EF] rounded-xl border border-[#EAE7DD]">
                    <span className="text-[#59645B] block text-[11px]">Degree Program</span>
                    <span className="font-semibold text-xs text-[#24352B] mt-0.5 block">
                      {studentData?.program} (Sem {studentData?.semester || 1})
                    </span>
                  </div>

                  <div className="p-3 bg-[#F7F5EF] rounded-xl border border-[#EAE7DD]">
                    <span className="text-[#59645B] block text-[11px]">CNIC / B-Form ID</span>
                    <span className="font-mono font-semibold text-xs text-[#24352B] mt-0.5 block">
                      {studentData?.cnic}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 2: Designated Campus Exam Branch Selection */}
              <div className="bg-[#FFFFFF] rounded-2xl p-6 shadow-xs border border-[#DEDCD1] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#DEDCD1]">
                  <div className="flex items-center gap-2">
                    <HiBuildingOffice2 className="w-5 h-5 text-[#285742]" />
                    <h2 className="text-base font-semibold text-[#24352B]">
                      Designated Exam Campus Branch
                    </h2>
                  </div>
                  <span className="text-xs text-[#59645B]">
                    {branches.length} Active Centers Available
                  </span>
                </div>

                <p className="text-xs text-[#59645B]">
                  Per university regulations, your campus exam branch selection is write-once and determines the venue where you will sit for computer-based testing (CBT).
                </p>

                {/* Dynamic Branch Cards */}
                <div className="space-y-3">
                  {branches.length === 0 ? (
                    <div className="p-4 bg-[#F7F5EF] rounded-xl text-center text-xs text-[#59645B]">
                      Loading official examination branches...
                    </div>
                  ) : (
                    branches.map((b) => {
                      const isSelected = selectedBranchId === b.id;
                      return (
                        <label
                          key={b.id}
                          onClick={() => setSelectedBranchId(b.id)}
                          className={`cursor-pointer relative flex items-start gap-3.5 p-4 rounded-xl transition-all border ${
                            isSelected
                              ? 'bg-[#E7EEE3] border-2 border-[#285742] shadow-xs'
                              : 'bg-[#FFFFFF] border-[#DEDCD1] hover:bg-[#F0EEE6]/50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="campus-branch"
                            value={b.id}
                            checked={isSelected}
                            onChange={() => setSelectedBranchId(b.id)}
                            className="mt-1 h-4 w-4 text-[#285742] accent-[#285742] cursor-pointer"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-semibold text-sm sm:text-base text-[#24352B]">
                                {b.name}
                              </span>
                              <span
                                className={`text-xs px-2.5 py-0.5 rounded font-semibold font-mono ${
                                  isSelected
                                    ? 'bg-[#285742] text-white'
                                    : 'bg-[#F0EEE6] text-[#59645B]'
                                }`}
                              >
                                {b.code}
                              </span>
                            </div>
                            <p className="text-xs text-[#59645B] mt-0.5">
                              {b.address} • {b.city}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-[#59645B]">
                              <span className="inline-flex items-center gap-1">
                                <HiMapPin className="w-3.5 h-3.5 text-[#59645B]" />
                                {b.city}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <HiPhone className="w-3.5 h-3.5 text-[#59645B]" />
                                {b.contactNumber}
                              </span>
                              <span className="inline-flex items-center gap-1 text-[#285742] font-semibold">
                                <HiShieldCheck className="w-3.5 h-3.5 text-[#285742]" />
                                CBT Ready
                              </span>
                            </div>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Section 3: Credentials Setup */}
              <div className="bg-[#FFFFFF] rounded-2xl p-6 shadow-xs border border-[#DEDCD1] space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-[#DEDCD1]">
                  <HiLockClosed className="w-5 h-5 text-[#285742]" />
                  <h2 className="text-base font-semibold text-[#24352B]">
                    Portal Passcode & Recovery Coordinates
                  </h2>
                </div>

                <div className="space-y-4">
                  {/* Password Input */}
                  <div>
                    <label className="block text-xs font-semibold text-[#24352B] mb-1">
                      New Portal Passcode <span className="text-[#A3342F]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Choose a strong password (min 8 chars)"
                        className="w-full px-3.5 py-2.5 text-sm border border-[#DEDCD1] rounded-xl focus:outline-none focus:border-[#285742] bg-[#FFFFFF] pr-10 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717973] hover:text-[#24352B]"
                      >
                        {showPassword ? (
                          <HiEyeSlash className="w-4 h-4" />
                        ) : (
                          <HiEye className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    <div className="mt-2.5 space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                              strength >= step
                                ? strength >= 3
                                  ? 'bg-[#285742]'
                                  : 'bg-[#795D18]'
                                : 'bg-[#EAE7DD]'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#59645B]">
                        <span>
                          Strength:{' '}
                          <strong
                            className={
                              strength >= 3
                                ? 'text-[#285742]'
                                : strength >= 2
                                ? 'text-[#795D18]'
                                : 'text-[#A3342F]'
                            }
                          >
                            {strength >= 4
                              ? 'Very Strong'
                              : strength === 3
                              ? 'Strong'
                              : strength === 2
                              ? 'Fair'
                              : 'Weak'}
                          </strong>
                        </span>
                        <span>Min 8 characters with numbers & symbols</span>
                      </div>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-semibold text-[#24352B] mb-1">
                      Confirm Passcode <span className="text-[#A3342F]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your passcode"
                        className={`w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none bg-[#FFFFFF] font-mono ${
                          confirmPassword.length > 0 && !passwordsMatch
                            ? 'border-[#A3342F] focus:border-[#A3342F]'
                            : 'border-[#DEDCD1] focus:border-[#285742]'
                        }`}
                      />
                      {passwordsMatch && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#285742]">
                          <HiCheck className="w-5 h-5 stroke-[2]" />
                        </div>
                      )}
                    </div>
                    {confirmPassword.length > 0 && !passwordsMatch && (
                      <p className="text-[11px] text-[#A3342F] mt-1 flex items-center gap-1">
                        <HiExclamationCircle className="w-3.5 h-3.5" />
                        Passcodes do not match.
                      </p>
                    )}
                  </div>

                  {/* Phone Verification Coordinate */}
                  <div>
                    <label className="block text-xs font-semibold text-[#24352B] mb-1">
                      Primary SMS / Alert Mobile Number <span className="text-[#A3342F]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0301-8472910"
                        className="w-full px-3.5 py-2.5 text-sm border border-[#DEDCD1] rounded-xl focus:outline-none focus:border-[#285742] bg-[#FFFFFF] font-mono"
                      />
                    </div>
                    <p className="text-[11px] text-[#59645B] mt-1">
                      Used for emergency notifications regarding test center reallocations or session alerts.
                    </p>
                  </div>
                </div>
              </div>

              {/* Protocol Agreement Checkbox */}
              <div className="p-4 bg-[#FFFFFF] rounded-2xl border border-[#DEDCD1] shadow-xs">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 text-[#285742] rounded border-[#DEDCD1] accent-[#285742]"
                  />
                  <span className="text-xs text-[#59645B] leading-relaxed">
                    I confirm that I am the candidate listed above ({studentData?.fullName}) and agree to abide by the official Computer-Based Examination Regulations. I understand my chosen exam branch cannot be altered without formal administrative change request approval.
                  </span>
                </label>
              </div>

              {/* Submit CTA */}
              <div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm text-white bg-[#285742] hover:bg-[#1f4534] shadow-sm transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <HiArrowPath className="w-4 h-4 animate-spin" />
                      <span>Activating Student Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Establish Passcode & Open Exam Planner</span>
                      <HiArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Dossier Card & Protocol Rules (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Student Dossier Summary Card */}
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#DEDCD1] p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-[#DEDCD1]">
                <div className="w-12 h-12 rounded-2xl bg-[#285742] text-white flex items-center justify-center font-serif text-lg font-bold">
                  {initials}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-base text-[#24352B] truncate">
                    {studentData?.fullName}
                  </h3>
                  <div className="text-xs font-mono font-semibold text-[#0d402c] mt-0.5">
                    {studentData?.registrationNumber}
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-[#F0EEE6]">
                  <span className="text-[#59645B]">Institutional Email</span>
                  <span className="font-medium text-[#24352B] truncate max-w-[200px]">
                    {studentData?.email}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-[#F0EEE6]">
                  <span className="text-[#59645B]">Academic Program</span>
                  <span className="font-medium text-[#24352B]">{studentData?.program}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-[#F0EEE6]">
                  <span className="text-[#59645B]">Current Semester</span>
                  <span className="font-medium text-[#24352B]">
                    Semester {studentData?.semester || 4}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-[#F0EEE6]">
                  <span className="text-[#59645B]">Batch Session</span>
                  <span className="font-medium text-[#24352B]">
                    {studentData?.sessionBatch || 'Fall 2026'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-[#59645B]">Account Status</span>
                  <span className="font-semibold text-[#285742] bg-[#E7EEE3] px-2 py-0.5 rounded text-[11px]">
                    Awaiting Passcode Setup
                  </span>
                </div>
              </div>
            </div>

            {/* University Examination Protocol Box */}
            <div className="bg-[#E7EEE3]/50 rounded-2xl border border-[#285742]/20 p-6 space-y-3">
              <div className="flex items-center gap-2 text-[#0d402c] font-semibold text-xs">
                <HiShieldCheck className="w-4 h-4 text-[#285742]" />
                <span>Examination Protocol Guidelines</span>
              </div>
              <ul className="text-xs text-[#59645B] space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#285742] mt-1.5 shrink-0" />
                  <span>
                    Each student must register a distinct exam slot for each assigned course (4 to 6 courses total).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#285742] mt-1.5 shrink-0" />
                  <span>
                    Exam slots scheduled concurrently or overlapping in time are strictly rejected by the planner validation engine.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#285742] mt-1.5 shrink-0" />
                  <span>
                    Once your date sheet is finalized and saved, changes require an administrative Change Request ticket.
                  </span>
                </li>
              </ul>
            </div>

            {/* Support Helpdesk strip */}
            <div className="p-4 bg-white rounded-2xl border border-[#DEDCD1] text-xs text-[#59645B] flex items-center justify-between">
              <div>
                <span className="font-semibold text-[#24352B] block">Need Assistance?</span>
                <span className="text-[11px]">Virtual University Examination Support</span>
              </div>
              <Link
                href="/student/help"
                className="font-semibold text-[#285742] hover:underline"
              >
                Helpdesk
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export function StudentEnrollmentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F7F5EF] flex items-center justify-center p-6">
          <div className="inline-flex items-center gap-2 text-xs text-[#59645B]">
            <HiArrowPath className="w-4 h-4 animate-spin text-[#285742]" />
            <span>Loading ExamSlot Registration Portal...</span>
          </div>
        </div>
      }
    >
      <EnrollmentContent />
    </Suspense>
  );
}
