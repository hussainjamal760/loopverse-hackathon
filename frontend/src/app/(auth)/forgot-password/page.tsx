'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { HiEnvelope, HiCheckCircle, HiArrowLeft } from 'react-icons/hi2';
import { ExamSlotLogo } from '@/features/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    // Generic response per security requirements - does not reveal if email exists
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <main className="min-h-screen bg-[#F7F5EF] flex flex-col justify-between items-center px-4 py-8 sm:py-12 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(to right, #DEDCD1 1px, transparent 1px), linear-gradient(to bottom, #DEDCD1 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
        aria-hidden="true"
      />

      <div className="w-full max-w-md z-10 flex justify-start">
        <Link
          href="/login"
          className="text-xs font-medium text-[#59645B] hover:text-[#285742] transition-colors flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-[#285742]"
        >
          <HiArrowLeft className="w-3.5 h-3.5" />
          <span>Return to login</span>
        </Link>
      </div>

      <div className="w-full max-w-md z-10 my-auto py-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-[#E7EEE3] border border-[#DEDCD1] mb-4 shadow-xs">
            <ExamSlotLogo size={40} />
          </div>
          <h1
            className="text-2xl sm:text-3xl font-normal text-[#24352B] tracking-tight"
            style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}
          >
            Reset your password
          </h1>
          <p className="text-sm text-[#59645B] mt-2 max-w-xs mx-auto">
            Enter your university email address to receive password reset instructions.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }}
          className="bg-[#FFFFFF] border border-[#DEDCD1] rounded-[20px] p-7 sm:p-9 shadow-[0_4px_20px_rgba(36,53,43,0.045)]"
        >
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="submitted"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                className="text-center py-2 space-y-4"
              >
                <div className="w-12 h-12 rounded-full bg-[#E7EEE3] text-[#285742] mx-auto flex items-center justify-center">
                  <HiCheckCircle className="w-7 h-7" />
                </div>
                <h2 className="text-lg font-semibold text-[#24352B]">
                  Check your inbox
                </h2>
                <p className="text-xs sm:text-sm text-[#59645B] leading-relaxed">
                  If an account exists for <strong className="text-[#24352B]">{email}</strong>, a secure password setup link has been sent. The link expires in 60 minutes.
                </p>
                <div className="pt-2">
                  <Link
                    href="/login"
                    className="inline-block w-full py-3 bg-[#F0EEE6] hover:bg-[#E7EEE3] text-[#285742] text-xs font-semibold rounded-[12px] border border-[#DEDCD1] transition-colors"
                  >
                    Back to Sign In
                  </Link>
                </div>
              </motion.div>
            ) : (
              <form key="form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="reset-email"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#24352B] mb-1.5"
                  >
                    University Email
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#59645B]">
                      <HiEnvelope className="w-5 h-5" />
                    </span>
                    <input
                      id="reset-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@examslot.edu.pk"
                      className="w-full h-12 pl-11 pr-4 bg-[#FFFFFF] border border-[#7B8578] rounded-[12px] text-sm text-[#24352B] placeholder-[#59645B]/70 focus:outline-none focus:ring-2 focus:ring-[#285742] focus:border-[#285742] transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={!loading ? { y: -1 } : {}}
                    whileTap={!loading ? { scale: 0.99 } : {}}
                    className="w-full h-12 bg-[#285742] hover:bg-[#204735] text-white text-sm font-medium rounded-[12px] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-60"
                  >
                    {loading ? 'Sending link...' : 'Send reset instructions'}
                  </motion.button>
                </div>
              </form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <footer className="w-full max-w-md text-center z-10 pt-4">
        <p className="text-xs text-[#59645B]">
          ExamSlot · Modern Campus Exam Planner
        </p>
      </footer>
    </main>
  );
}
