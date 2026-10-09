'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { BranchMetric } from '../../types';

interface BranchDistributionChartProps {
  data?: BranchMetric[];
}

function CustomBranchTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  const total = payload.find((p: any) => p.dataKey === 'totalStudents')?.value || 0;
  const saved = payload.find((p: any) => p.dataKey === 'savedSheets')?.value || 0;
  const completionRate = total > 0 ? ((saved / total) * 100).toFixed(0) : '0';

  return (
    <div className="bg-white p-3 rounded-xl shadow-lg border border-[#c0c9c2]/60 text-xs font-sans space-y-1.5">
      <div className="font-semibold text-[#0e1f16] text-sm border-b border-[#c0c9c2]/30 pb-1">
        {label}
      </div>
      <div className="flex items-center justify-between gap-4 text-[#285742]">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#285742]" />
          <span>Total Students:</span>
        </span>
        <span className="font-mono font-semibold">{total}</span>
      </div>
      <div className="flex items-center justify-between gap-4 text-[#0d402c]">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#9fd2b7]" />
          <span>Date Sheets Saved:</span>
        </span>
        <span className="font-mono font-semibold">{saved}</span>
      </div>
      <div className="pt-1 border-t border-[#c0c9c2]/20 flex justify-between text-[#414943] text-[11px]">
        <span>Confirmation Rate:</span>
        <span className="font-semibold text-[#0d402c]">{completionRate}%</span>
      </div>
    </div>
  );
}

export function BranchDistributionChart({ data = [] }: BranchDistributionChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-[#717973] animate-pulse">
        Loading branch analytics...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-[#717973] bg-[#e4f9e9]/30 rounded-xl border border-dashed border-[#c0c9c2]">
        <p className="text-sm font-medium text-[#0e1f16]">No branch distribution data available</p>
        <p className="text-xs text-[#414943] mt-1">Branches will appear once added and students enroll.</p>
      </div>
    );
  }

  const chartData = data.map((b) => ({
    name: b.name.replace(' Campus', '').replace(' Central', '').replace(' Garden', ''),
    fullName: b.name,
    totalStudents: b.totalStudents,
    savedSheets: b.savedSheets,
    city: b.city,
  }));

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
          barGap={6}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#c0c9c2" opacity={0.35} />
          <XAxis
            dataKey="name"
            tick={{ fill: '#414943', fontSize: 12, fontWeight: 500 }}
            tickLine={false}
            axisLine={{ stroke: '#c0c9c2', opacity: 0.5 }}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: '#717973', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomBranchTooltip />} cursor={{ fill: 'rgba(228, 249, 233, 0.4)' }} />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
            formatter={(val) => (
              <span className="text-xs font-medium text-[#0e1f16]">{val}</span>
            )}
          />
          <Bar
            name="Enrolled Students"
            dataKey="totalStudents"
            fill="#285742"
            radius={[6, 6, 0, 0]}
            maxBarSize={36}
          />
          <Bar
            name="Date Sheets Saved"
            dataKey="savedSheets"
            fill="#9fd2b7"
            radius={[6, 6, 0, 0]}
            maxBarSize={36}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
