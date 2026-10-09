'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ExamSlotLogo } from './ExamSlotLogo';

export function AuthHero() {
  return (
    <div className="text-center max-w-md mx-auto mb-8 sm:mb-10">
      {/* Brand Icon Mark */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }}
        className="inline-flex items-center justify-center p-3 rounded-2xl bg-[#E7EEE3] border border-[#DEDCD1] mb-5 shadow-xs"
      >
        <ExamSlotLogo size={44} />
      </motion.div>

      {/* Editorial Headline in Georgia */}
      <motion.h1
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.2, 0, 0, 1] }}
        className="text-[30px] sm:text-[40px] font-normal text-[#24352B] tracking-tight leading-[1.15]"
        style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}
      >
        ExamSlot
      </motion.h1>

      {/* Tagline & Subtext */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.18, ease: [0.2, 0, 0, 1] }}
        className="mt-2 space-y-1"
      >
        <p className="text-base font-medium text-[#285742]">
          Your exams. Your plan.
        </p>
        <p className="text-sm text-[#59645B] max-w-xs mx-auto">
          Sign in to organize your exam schedule and manage your date sheet.
        </p>
      </motion.div>
    </div>
  );
}
