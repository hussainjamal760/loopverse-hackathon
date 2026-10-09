'use client';

import React, { useState } from 'react';
import { HiChartBar, HiBuildingOffice2, HiAcademicCap, HiArrowPath } from 'react-icons/hi2';
import { BranchDistributionChart } from './BranchDistributionChart';
import { DepartmentSlotChart } from './DepartmentSlotChart';
import { ChangeRequestsDonutChart } from './ChangeRequestsDonutChart';
import { BranchMetric, DepartmentSlotMetric, RequestBreakdownMetric } from '../../types';

interface AdminAnalyticsSectionProps {
  branchMetrics?: BranchMetric[];
  departmentSlotMetrics?: DepartmentSlotMetric[];
  requestBreakdown?: RequestBreakdownMetric[];
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function AdminAnalyticsSection({
  branchMetrics = [],
  departmentSlotMetrics = [],
  requestBreakdown = [],
  onRefresh,
  isLoading = false,
}: AdminAnalyticsSectionProps) {
  const [activeTab, setActiveTab] = useState<'branch' | 'department'>('branch');

  return (
    <section
      aria-label="Admin Scheduling Analytics"
      className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
    >
      {/* Left/Main Column: Primary Operational Chart (8 cols) */}
      <div className="lg:col-span-8 bg-white rounded-[20px] p-6 border border-[#c0c9c2]/50 shadow-xs flex flex-col justify-between">
        <div>
          {/* Header & View Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#c0c9c2]/30 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#d9edde] flex items-center justify-center text-[#285742]">
                <HiChartBar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-[17px] font-semibold text-[#0e1f16] tracking-tight">
                  Session Analytics & Capacity
                </h2>
                <p className="text-xs text-[#414943] mt-0.5">
                  Live cohort distribution and faculty scheduling readiness
                </p>
              </div>
            </div>

            {/* View Switcher Tabs & Refresh */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="flex p-0.5 bg-[#e4f9e9] rounded-xl border border-[#c0c9c2]/40 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('branch')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                    activeTab === 'branch'
                      ? 'bg-white text-[#0d402c] shadow-xs border border-[#c0c9c2]/40 font-bold'
                      : 'text-[#414943] hover:text-[#0e1f16]'
                  }`}
                >
                  <HiBuildingOffice2 className="w-3.5 h-3.5" />
                  <span>Branches</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('department')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                    activeTab === 'department'
                      ? 'bg-white text-[#0d402c] shadow-xs border border-[#c0c9c2]/40 font-bold'
                      : 'text-[#414943] hover:text-[#0e1f16]'
                  }`}
                >
                  <HiAcademicCap className="w-3.5 h-3.5" />
                  <span>Faculties</span>
                </button>
              </div>

              {onRefresh && (
                <button
                  type="button"
                  onClick={onRefresh}
                  disabled={isLoading}
                  title="Refresh chart data"
                  className="p-1.5 text-[#414943] hover:text-[#0d402c] rounded-lg border border-[#c0c9c2]/40 bg-white hover:bg-[#e4f9e9] transition-all disabled:opacity-50"
                >
                  <HiArrowPath className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>
          </div>

          {/* Active Chart Presentation */}
          <div className="pt-4">
            {activeTab === 'branch' ? (
              <BranchDistributionChart data={branchMetrics} />
            ) : (
              <DepartmentSlotChart data={departmentSlotMetrics} />
            )}
          </div>
        </div>

        {/* Footer Insight Strip */}
        <div className="pt-3 mt-3 border-t border-[#c0c9c2]/20 flex flex-wrap items-center justify-between text-xs text-[#414943] gap-2">
          <span>
            {activeTab === 'branch'
              ? 'Compares total enrolled students vs confirmed date sheets across active campus branches.'
              : 'Breakdown of published vs draft examination time slots per academic faculty.'}
          </span>
          <span className="text-[11px] font-semibold text-[#0d402c] bg-[#e4f9e9] px-2 py-0.5 rounded border border-[#c0c9c2]/40">
            Real-time MongoDB Sync
          </span>
        </div>
      </div>

      {/* Right Column: Request Lifecycle & Audit Donut (4 cols) */}
      <div className="lg:col-span-4 bg-white rounded-[20px] p-6 border border-[#c0c9c2]/50 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-[#c0c9c2]/30">
            <div>
              <h2 className="text-[17px] font-semibold text-[#0e1f16]">Requests breakdown</h2>
              <p className="text-xs text-[#414943] mt-0.5">Status & workflow distribution</p>
            </div>
            <span className="text-xs font-semibold text-[#483400] bg-[#ffdf9e]/60 px-2.5 py-0.5 rounded-full border border-[#e7c273]/50">
              Live State
            </span>
          </div>

          <div className="pt-4">
            <ChangeRequestsDonutChart data={requestBreakdown} />
          </div>
        </div>

        <div className="pt-3 mt-4 border-t border-[#c0c9c2]/20 text-[11px] text-[#414943] flex items-center justify-between">
          <span>Pending approval actions require staff review</span>
          <span className="font-semibold text-[#0d402c]">Exam Board</span>
        </div>
      </div>
    </section>
  );
}
