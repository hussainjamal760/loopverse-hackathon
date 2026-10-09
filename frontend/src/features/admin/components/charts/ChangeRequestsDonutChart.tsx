'use client';

import React, { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { RequestBreakdownMetric } from '../../types';

interface ChangeRequestsDonutChartProps {
  data?: RequestBreakdownMetric[];
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#e7c273', // amber/tertiary
  APPROVED: '#285742', // dark forest green
  REJECTED: '#934a31', // terracotta/secondary
};

function CustomPieTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0];

  return (
    <div className="bg-white p-2.5 rounded-xl shadow-lg border border-[#c0c9c2]/60 text-xs font-sans">
      <div className="font-semibold text-[#0e1f16]">{item.name}</div>
      <div className="flex items-center justify-between gap-3 mt-1 text-[#414943]">
        <span>Requests:</span>
        <span className="font-mono font-bold text-[#0e1f16]">{item.value}</span>
      </div>
    </div>
  );
}

export function ChangeRequestsDonutChart({ data = [] }: ChangeRequestsDonutChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-[#717973] animate-pulse">
        Loading requests breakdown...
      </div>
    );
  }

  // Aggregate by Status
  const statusSummary = data.reduce(
    (acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + curr.count;
      return acc;
    },
    { PENDING: 0, APPROVED: 0, REJECTED: 0 } as Record<string, number>
  );

  const totalRequests = statusSummary.PENDING + statusSummary.APPROVED + statusSummary.REJECTED;

  const chartData = [
    { name: 'Pending Review', value: statusSummary.PENDING, key: 'PENDING' },
    { name: 'Approved', value: statusSummary.APPROVED, key: 'APPROVED' },
    { name: 'Rejected', value: statusSummary.REJECTED, key: 'REJECTED' },
  ].filter((d) => d.value > 0);

  // By type summary
  const branchCount = data
    .filter((d) => d.type === 'BRANCH')
    .reduce((sum, d) => sum + d.count, 0);
  const dateSheetCount = data
    .filter((d) => d.type === 'DATE_SHEET')
    .reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 h-full">
      {/* Donut graphic */}
      <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
        {totalRequests > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={50}
                outerRadius={72}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry) => (
                  <Cell
                    key={`cell-${entry.key}`}
                    fill={STATUS_COLORS[entry.key] || '#717973'}
                    stroke="none"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-36 h-36 rounded-full border-4 border-dashed border-[#c0c9c2]/60 flex items-center justify-center text-center p-2 text-xs text-[#717973]">
            No requests yet
          </div>
        )}

        {/* Center Total Count */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-[#0e1f16] tracking-tight tabular-nums">
            {totalRequests}
          </span>
          <span className="text-[10px] uppercase font-semibold text-[#414943] tracking-wider">
            Total
          </span>
        </div>
      </div>

      {/* Legend & Breakdown stats */}
      <div className="flex-1 w-full space-y-2.5">
        <div className="flex items-center justify-between p-2 rounded-lg bg-[#ffdf9e]/30 border border-[#e7c273]/40 text-xs">
          <span className="flex items-center gap-2 font-medium text-[#483400]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e7c273]" />
            <span>Pending Review</span>
          </span>
          <span className="font-mono font-bold text-[#483400]">{statusSummary.PENDING}</span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-[#dff3e4]/50 border border-[#9fd2b7]/40 text-xs">
          <span className="flex items-center gap-2 font-medium text-[#0d402c]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#285742]" />
            <span>Approved Grants</span>
          </span>
          <span className="font-mono font-bold text-[#0d402c]">{statusSummary.APPROVED}</span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-[#ffdbd0]/40 border border-[#ffa182]/40 text-xs">
          <span className="flex items-center gap-2 font-medium text-[#934a31]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#934a31]" />
            <span>Rejected</span>
          </span>
          <span className="font-mono font-bold text-[#934a31]">{statusSummary.REJECTED}</span>
        </div>

        {/* Request Types Mini Strip */}
        <div className="pt-2 border-t border-[#c0c9c2]/30 flex items-center justify-between text-[11px] text-[#414943]">
          <span>Branch Change: <strong className="text-[#0e1f16]">{branchCount}</strong></span>
          <span>Date Sheet: <strong className="text-[#0e1f16]">{dateSheetCount}</strong></span>
        </div>
      </div>
    </div>
  );
}
