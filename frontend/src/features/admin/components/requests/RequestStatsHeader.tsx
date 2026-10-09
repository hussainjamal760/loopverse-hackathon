'use client';

import React from 'react';
import {
  HiDocumentText,
  HiClock,
  HiCheckCircle,
  HiXCircle,
} from 'react-icons/hi2';

interface RequestStatsHeaderProps {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export function RequestStatsHeader({
  total = 0,
  pending = 0,
  approved = 0,
  rejected = 0,
}: RequestStatsHeaderProps) {
  const cards = [
    {
      title: 'Total Requests',
      value: total,
      icon: HiDocumentText,
      bgColor: 'bg-[#e4f9e9]',
      borderColor: 'border-[#c0c9c2]/50',
      iconColor: 'text-[#285742]',
    },
    {
      title: 'Pending Review',
      value: pending,
      icon: HiClock,
      bgColor: 'bg-[#fff8e7]',
      borderColor: 'border-[#e7c273]/50',
      iconColor: 'text-[#795d18]',
    },
    {
      title: 'Approved',
      value: approved,
      icon: HiCheckCircle,
      bgColor: 'bg-[#e7eee3]',
      borderColor: 'border-[#285742]/30',
      iconColor: 'text-[#285742]',
    },
    {
      title: 'Rejected',
      value: rejected,
      icon: HiXCircle,
      bgColor: 'bg-[#fdf2f2]',
      borderColor: 'border-[#f8b4b4]/50',
      iconColor: 'text-[#934a31]',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className={`p-4 sm:p-5 rounded-[20px] bg-white border ${card.borderColor} shadow-xs flex items-center justify-between transition-all hover:shadow-md`}
          >
            <div>
              <p className="text-xs font-semibold text-[#414943] uppercase tracking-wider">
                {card.title}
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#0e1f16] mt-1">
                {card.value}
              </h3>
            </div>
            <div
              className={`w-12 h-12 rounded-2xl ${card.bgColor} flex items-center justify-center ${card.iconColor} shrink-0`}
            >
              <Icon className="w-6 h-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
