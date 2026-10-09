'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface DemoCredentialsPillsProps {
  onSelect: (email: string, pass: string) => void;
  activeRole: 'student' | 'admin' | null;
}

export function DemoCredentialsPills({ onSelect, activeRole }: DemoCredentialsPillsProps) {
  return (
    <div className="pt-6 mt-6 border-t border-[#DEDCD1]">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#59645B]">
          Quick Demo Fill
        </span>
        <span className="text-[11px] text-[#59645B]">Click to test role</span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <motion.button
          type="button"
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() =>
            onSelect('student@examslot.edu.pk', 'StudentPassword123!')
          }
          className={`px-3 py-2.5 rounded-[12px] text-left border text-xs font-medium transition-colors ${
            activeRole === 'student'
              ? 'bg-[#E7EEE3] border-[#285742] text-[#285742]'
              : 'bg-[#F0EEE6] hover:bg-[#E7EEE3] border-[#DEDCD1] text-[#24352B]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold">Student</span>
            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[#FFFFFF] border border-[#DEDCD1] text-[#59645B]">
              Planner
            </span>
          </div>
          <div className="text-[11px] text-[#59645B] truncate mt-0.5">
            student@examslot.edu.pk
          </div>
        </motion.button>

        <motion.button
          type="button"
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() =>
            onSelect('admin@examslot.edu.pk', 'AdminPassword123!')
          }
          className={`px-3 py-2.5 rounded-[12px] text-left border text-xs font-medium transition-colors ${
            activeRole === 'admin'
              ? 'bg-[#E7EEE3] border-[#285742] text-[#285742]'
              : 'bg-[#F0EEE6] hover:bg-[#E7EEE3] border-[#DEDCD1] text-[#24352B]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold">Admin</span>
            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[#FFFFFF] border border-[#DEDCD1] text-[#59645B]">
              Manager
            </span>
          </div>
          <div className="text-[11px] text-[#59645B] truncate mt-0.5">
            admin@examslot.edu.pk
          </div>
        </motion.button>
      </div>
    </div>
  );
}
