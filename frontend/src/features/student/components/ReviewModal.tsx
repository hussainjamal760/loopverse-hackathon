'use client';

import React from 'react';
import {
  HiClipboardDocumentCheck,
  HiXMark,
  HiInformationCircle,
  HiCheckBadge,
} from 'react-icons/hi2';

export interface ReviewItem {
  code: string;
  title: string;
  date: string;
  time: string;
}

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  items: ReviewItem[];
  branchName?: string;
  saving?: boolean;
}

export function ReviewModal({
  isOpen,
  onClose,
  onConfirm,
  items,
  branchName = 'Karachi Central',
  saving = false,
}: ReviewModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#24352B]/40 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-[#FFFFFF] border border-[#DEDCD1] rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-[0_16px_48px_rgba(36,53,43,0.12)] flex flex-col gap-5 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E7EEE3] text-[#285742] flex items-center justify-center">
              <HiClipboardDocumentCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#24352B] tracking-tight">
                Ready to save your date sheet?
              </h3>
              <p className="text-xs text-[#59645B]">
                Please confirm your selected examination schedule for {branchName}.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#F0EEE6] hover:bg-[#E7EEE3] text-[#59645B] hover:text-[#24352B] flex items-center justify-center transition-colors cursor-pointer"
          >
            <HiXMark className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Schedule Summary List */}
        <div className="flex flex-col gap-2 bg-[#F7F5EF] p-4 rounded-xl border border-[#DEDCD1]">
          {items.map((item) => (
            <div
              key={item.code}
              className="flex justify-between items-center text-xs py-1 border-b border-[#DEDCD1]/60 last:border-none"
            >
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-bold text-[#285742]">{item.code}</span>
                <span className="text-[#59645B]">·</span>
                <span className="text-[#24352B] truncate">{item.title}</span>
              </div>
              <span className="font-semibold text-[#24352B] font-mono shrink-0 ml-2">
                {item.date} · {item.time}
              </span>
            </div>
          ))}
        </div>

        {/* Warning Note */}
        <div className="p-3.5 rounded-xl bg-[#F0EEE6] border border-[#DEDCD1] flex items-start gap-2.5">
          <HiInformationCircle className="w-5 h-5 text-[#285742] shrink-0 mt-0.5" />
          <p className="text-xs text-[#24352B] leading-relaxed">
            By confirming, your exam seats are reserved. Any further adjustments will require a formal change request to the Registrar's Office.
          </p>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2.5 rounded-xl bg-[#F0EEE6] hover:bg-[#E7EEE3] text-[#24352B] text-xs font-semibold transition-colors cursor-pointer"
          >
            Go Back & Edit
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-[#285742] hover:bg-[#204735] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-60"
          >
            <HiCheckBadge className="w-4 h-4" />
            <span>{saving ? 'Locking Schedule...' : 'Confirm & Save'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
