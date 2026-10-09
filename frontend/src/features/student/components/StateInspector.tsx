'use client';

import React from 'react';
import {
  HiAdjustmentsHorizontal,
  HiExclamationTriangle,
  HiCheckCircle,
} from 'react-icons/hi2';

export type DemoState = 'default' | 'ready' | 'conflict' | 'locked';

interface StateInspectorProps {
  currentState: DemoState;
  onStateChange: (state: DemoState) => void;
}

export function StateInspector({ currentState, onStateChange }: StateInspectorProps) {
  const tabs: Array<{ id: DemoState; label: string }> = [
    { id: 'default', label: '1. Selection In Progress (3/4)' },
    { id: 'ready', label: '2. Ready to Review (4/4)' },
    { id: 'conflict', label: '3. Conflict Warning' },
    { id: 'locked', label: '4. Saved & Locked Sheet' },
  ];

  return (
    <section className="bg-[#FFFFFF] border border-[#DEDCD1] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col gap-5 mb-8">
      {/* Header & Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#DEDCD1]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#E7EEE3] text-[#285742] flex items-center justify-center">
            <HiAdjustmentsHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#24352B]">
              State inspector & workflow scenarios
            </h3>
            <p className="text-xs text-[#59645B]">
              Switch states to evaluate all dashboard conditions.
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#F0EEE6] border border-[#DEDCD1]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onStateChange(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentState === tab.id
                  ? 'bg-[#FFFFFF] text-[#285742] shadow-xs'
                  : 'text-[#59645B] hover:text-[#24352B]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Explanation Box */}
      <div className="p-4 rounded-xl bg-[#F7F5EF] border border-[#DEDCD1]">
        {currentState === 'default' && (
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex items-center gap-1.5 text-[#285742] font-semibold">
              <HiCheckCircle className="w-4 h-4" />
              <span>Current Active Mode: 3 of 4 Courses Scheduled</span>
            </div>
            <p className="text-[#59645B] mt-0.5 leading-relaxed">
              You are currently viewing the live planner state. Click any slot under <strong>CS201</strong> in the planner above to interactively reach 100% completion, or switch tabs to preview simulated states.
            </p>
          </div>
        )}

        {currentState === 'ready' && (
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex items-center gap-1.5 text-[#285742] font-semibold">
              <HiCheckCircle className="w-4 h-4" />
              <span>Ready to Review Mode: 4 of 4 Courses Scheduled</span>
            </div>
            <p className="text-[#59645B] mt-0.5 leading-relaxed">
              All 4 exam slots are confirmed without conflicts. The "Review date sheet" CTA is active and enabled for review and final reservation locking.
            </p>
          </div>
        )}

        {currentState === 'conflict' && (
          <div className="flex flex-col gap-3">
            <div className="p-3.5 rounded-xl bg-[#FAEAE7] border border-[#A3342F]/30 text-[#A3342F] flex items-start gap-3">
              <HiExclamationTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold">Schedule Conflict Detected:</span> Two examinations have been assigned to overlapping time windows on <strong>12 November 2026 at 9:00 AM</strong> in Hall A.
              </div>
            </div>
            <button
              type="button"
              onClick={() => onStateChange('default')}
              className="self-start px-3.5 py-1.5 rounded-lg bg-[#E7EEE3] text-[#285742] text-xs font-semibold hover:bg-[#d8e3d3] transition-colors cursor-pointer"
            >
              Resolve Conflict in Planner
            </button>
          </div>
        )}

        {currentState === 'locked' && (
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex items-center gap-1.5 text-[#285742] font-semibold">
              <HiCheckCircle className="w-4 h-4" />
              <span>Finalized Mode: Date Sheet Committed & Locked</span>
            </div>
            <p className="text-[#59645B] mt-0.5 leading-relaxed">
              The date sheet is sealed. Further modifications require a formal administrator change request grant. Printable official examination document is active below.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
