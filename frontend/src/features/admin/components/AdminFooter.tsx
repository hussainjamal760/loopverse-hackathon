'use client';

import React from 'react';

export function AdminFooter() {
  return (
    <footer className="pt-6 pb-2 text-center border-t border-[#c0c9c2]/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#414943]">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#0d402c]" />
        <span className="font-semibold text-[#0e1f16]">System status: Normal</span>
        <span className="text-[#717973]">•</span>
        <span>All 3 exam branches responding</span>
      </div>
      <div className="font-mono text-[11px]">
        ExamSlot · University Exam Administration · Fall 2026 Session
      </div>
    </footer>
  );
}
