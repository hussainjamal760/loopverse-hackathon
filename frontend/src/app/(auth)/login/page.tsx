'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AuthHero, LoginForm } from '@/features/auth';

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#F7F5EF] flex flex-col justify-between items-center px-4 py-8 sm:py-12 relative overflow-hidden">
      {/* Decorative campus grid line texture (subtle, non-distracting) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(to right, #DEDCD1 1px, transparent 1px), linear-gradient(to bottom, #DEDCD1 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
        aria-hidden="true"
      />

      {/* Top spacer / header alignment */}
      <div className="w-full max-w-5xl flex justify-between items-center z-10">
        <Link
          href="/"
          className="text-xs font-medium text-[#59645B] hover:text-[#285742] transition-colors flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-[#285742]"
        >
          <span>← Back to portal home</span>
        </Link>
        <span className="text-[11px] font-medium text-[#59645B] bg-[#F0EEE6] px-2.5 py-1 rounded-full border border-[#DEDCD1]">
          Academic Session 2026
        </span>
      </div>

      {/* Center content container */}
      <div className="w-full flex flex-col items-center justify-center my-auto z-10 py-6">
        <AuthHero />
        <LoginForm />
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="w-full max-w-md text-center z-10 pt-4"
      >
        <p className="text-xs text-[#59645B]">
          ExamSlot · Modern Campus Exam Planner
        </p>
        <p className="text-[11px] text-[#59645B]/80 mt-1">
          Authorized academic access only. Sessions expire after 12 hours.
        </p>
      </motion.footer>
    </main>
  );
}
