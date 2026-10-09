'use client';

import React from 'react';
import Link from 'next/link';
import { HiClock, HiArrowRight } from 'react-icons/hi2';

export function RecentActivityCard() {
  const activities = [
    {
      id: '1',
      text: 'You published 3 CS101 exam slots.',
      subtext: 'Main Lahore Campus · Hall A',
      time: '24m ago',
      primary: true,
    },
    {
      id: '2',
      text: 'Zain approved a branch-change request.',
      subtext: 'VU-2026-0044 → Rawalpindi',
      time: '1h ago',
      primary: false,
    },
    {
      id: '3',
      text: 'You added a new student account.',
      subtext: 'Fahad Noor (VU-2026-0241)',
      time: '3h ago',
      primary: false,
    },
    {
      id: '4',
      text: 'System synchronized exam capacity.',
      subtext: 'Lahore Campus sync · 450 seats',
      time: '5h ago',
      primary: false,
    },
  ];

  return (
    <div className="bg-white rounded-[20px] p-6 border border-[#c0c9c2]/50 shadow-xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-[#c0c9c2]/30">
          <div className="flex items-center gap-2.5">
            <HiClock className="w-5 h-5 text-[#285742]" />
            <h2 className="text-[17px] font-semibold text-[#0e1f16]">Recent admin activity</h2>
          </div>
          <span className="text-xs text-[#414943] font-medium">Live audit</span>
        </div>

        {/* Quiet Timeline List */}
        <div className="mt-4 relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-[#c0c9c2]/40">
          {activities.map((item) => (
            <div key={item.id} className="relative flex items-start justify-between gap-3">
              <span
                className={`absolute -left-5 top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-white ${
                  item.primary ? 'bg-[#285742]' : 'bg-[#717973]'
                }`}
              />
              <div>
                <p className="text-xs sm:text-sm text-[#0e1f16] leading-snug font-normal">
                  {item.text}
                </p>
                <p className="text-xs text-[#414943] mt-0.5">{item.subtext}</p>
              </div>
              <span className="text-xs text-[#414943] whitespace-nowrap">{item.time}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-[#c0c9c2]/20">
        <Link
          href="/admin/audit"
          className="text-sm font-semibold text-[#0d402c] hover:underline inline-flex items-center gap-1"
        >
          <span>Open audit log</span>
          <HiArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
