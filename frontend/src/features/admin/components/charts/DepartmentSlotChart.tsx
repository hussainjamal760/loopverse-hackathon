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
import { DepartmentSlotMetric } from '../../types';

interface DepartmentSlotChartProps {
  data?: DepartmentSlotMetric[];
}

function CustomDeptTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  const published = payload.find((p: any) => p.dataKey === 'publishedSlots')?.value || 0;
  const draft = payload.find((p: any) => p.dataKey === 'draftSlots')?.value || 0;
  const coursesCount = payload[0]?.payload?.coursesCount || 0;

  return (
    <div className="bg-white p-3 rounded-xl shadow-lg border border-[#c0c9c2]/60 text-xs font-sans space-y-1.5">
      <div className="font-semibold text-[#0e1f16] text-sm border-b border-[#c0c9c2]/30 pb-1">
        {label}
      </div>
      <div className="text-[11px] text-[#414943]">
        Active Courses: <span className="font-semibold text-[#0e1f16]">{coursesCount}</span>
      </div>
      <div className="flex items-center justify-between gap-4 text-[#0d402c]">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0d402c]" />
          <span>Published Slots:</span>
        </span>
        <span className="font-mono font-semibold">{published}</span>
      </div>
      <div className="flex items-center justify-between gap-4 text-[#644a03]">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#e7c273]" />
          <span>Draft Slots:</span>
        </span>
        <span className="font-mono font-semibold">{draft}</span>
      </div>
    </div>
  );
}

export function DepartmentSlotChart({ data = [] }: DepartmentSlotChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-[#717973] animate-pulse">
        Loading department scheduling analytics...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-[#717973] bg-[#e4f9e9]/30 rounded-xl border border-dashed border-[#c0c9c2]">
        <p className="text-sm font-medium text-[#0e1f16]">No department slot data found</p>
        <p className="text-xs text-[#414943] mt-1">Configure courses and exam slots to see faculty breakdown.</p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.department.length > 14 ? `${d.department.slice(0, 12)}...` : d.department,
    department: d.department,
    coursesCount: d.coursesCount,
    publishedSlots: d.publishedSlots,
    draftSlots: d.draftSlots,
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
            tick={{ fill: '#414943', fontSize: 11, fontWeight: 500 }}
            tickLine={false}
            axisLine={{ stroke: '#c0c9c2', opacity: 0.5 }}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: '#717973', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomDeptTooltip />} cursor={{ fill: 'rgba(228, 249, 233, 0.4)' }} />
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
            name="Published Slots"
            dataKey="publishedSlots"
            fill="#0d402c"
            radius={[6, 6, 0, 0]}
            maxBarSize={36}
          />
          <Bar
            name="Draft Slots"
            dataKey="draftSlots"
            fill="#e7c273"
            radius={[6, 6, 0, 0]}
            maxBarSize={36}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
