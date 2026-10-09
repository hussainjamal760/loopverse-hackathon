'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  HiArrowPathRoundedSquare,
  HiMagnifyingGlass,
  HiArrowPath,
  HiCheckCircle,
  HiXCircle,
  HiClock,
  HiBuildingOffice2,
  HiCalendarDays,
  HiEye,
  HiShieldCheck,
} from 'react-icons/hi2';
import { RequestReviewModal, ChangeRequestData } from './RequestReviewModal';

export function RequestsTable() {
  const [requests, setRequests] = useState<ChangeRequestData[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal review state
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequestData | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '10',
      });
      if (search) params.set('search', search);
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (typeFilter !== 'ALL') params.set('type', typeFilter);

      const res = await fetch(`/api/requests?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setRequests(data.requests || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Fetch requests error:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, typeFilter, page]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleOpenReview = (request: ChangeRequestData) => {
    setSelectedRequest(request);
    setReviewModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Action & Filter Bar */}
      <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#DEDCD1] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717973]" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by student name, registration ID, or reason..."
              className="w-full pl-10 pr-4 py-2 text-xs border border-[#DEDCD1] rounded-xl focus:outline-none focus:border-[#285742] bg-[#F7F5EF]/50"
            />
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => fetchRequests()}
              className="p-2 border border-[#DEDCD1] text-[#59645B] hover:text-[#24352B] hover:bg-[#F7F5EF] rounded-xl transition-colors"
              title="Refresh"
            >
              <HiArrowPath className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#EAE7DD] text-xs">
          {/* Status Tabs */}
          <div className="flex items-center gap-1">
            <span className="text-[#59645B] font-medium mr-1.5">Status:</span>
            <div className="inline-flex rounded-lg border border-[#DEDCD1] p-0.5 bg-[#F7F5EF]">
              {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setStatusFilter(st);
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    statusFilter === st
                      ? 'bg-white text-[#0d402c] shadow-xs font-semibold'
                      : 'text-[#59645B] hover:text-[#24352B]'
                  }`}
                >
                  {st === 'ALL'
                    ? 'All'
                    : st === 'PENDING'
                    ? 'Pending Review'
                    : st === 'APPROVED'
                    ? 'Approved'
                    : 'Rejected'}
                </button>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[#59645B] font-medium">Request Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1 border border-[#DEDCD1] rounded-lg bg-white text-xs text-[#24352B]"
            >
              <option value="ALL">All Request Types</option>
              <option value="BRANCH">Campus Branch Transfer</option>
              <option value="DATE_SHEET">Date Sheet Reschedule</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests Data Table */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#DEDCD1] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F5EF] border-b border-[#EAE7DD] text-[#59645B] font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Student Candidate</th>
                <th className="px-5 py-3">Request Type</th>
                <th className="px-5 py-3">Student Justification</th>
                <th className="px-5 py-3">Date Raised</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE7DD]">
              {loading && requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-[#59645B]">
                    <div className="inline-flex items-center gap-2">
                      <HiArrowPath className="w-4 h-4 animate-spin text-[#285742]" />
                      <span>Loading student change requests...</span>
                    </div>
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-[#59645B]">
                    <p className="font-semibold text-sm text-[#24352B]">No change requests found</p>
                    <p className="text-xs text-[#59645B] mt-1">There are no student tickets matching your selected criteria.</p>
                  </td>
                </tr>
              ) : (
                requests.map((req) => {
                  const student = req.studentId || {};
                  return (
                    <tr key={req._id} className="hover:bg-[#F7F5EF]/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-[#24352B]">{student.fullName || 'Candidate'}</div>
                        <div className="font-mono font-bold text-[#0d402c] text-[11px] mt-0.5">
                          {student.registrationNumber || 'N/A'}
                        </div>
                        <div className="text-[10px] text-[#59645B]">{student.program}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        {req.type === 'BRANCH' ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-[#285742] bg-[#E7EEE3] px-2.5 py-0.5 rounded-full border border-[#285742]/20">
                            <HiBuildingOffice2 className="w-3.5 h-3.5" />
                            Branch Transfer
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-semibold text-[#795D18] bg-[#F5EDCE] px-2.5 py-0.5 rounded-full border border-[#e7c273]">
                            <HiCalendarDays className="w-3.5 h-3.5" />
                            Date Sheet Reschedule
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 max-w-sm truncate text-[#24352B]">
                        {req.reason}
                      </td>
                      <td className="px-5 py-3.5 text-[#59645B] whitespace-nowrap">
                        {new Date(req.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-3.5">
                        {req.status === 'PENDING' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#ffdf9e] text-[#261a00] border border-[#e7c273]">
                            <HiClock className="w-3 h-3" />
                            Pending Review
                          </span>
                        ) : req.status === 'APPROVED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E7EEE3] text-[#285742] border border-[#285742]/20">
                            <HiCheckCircle className="w-3 h-3" />
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FAEAE7] text-[#A3342F] border border-[#A3342F]/30">
                            <HiXCircle className="w-3 h-3" />
                            Rejected
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleOpenReview(req)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0d402c] bg-[#E7EEE3] hover:bg-[#d9edde] border border-[#285742]/20 rounded-lg transition-colors"
                        >
                          <HiEye className="w-3.5 h-3.5" />
                          <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Strip */}
        <div className="px-5 py-3 border-t border-[#EAE7DD] bg-[#F7F5EF] flex items-center justify-between text-xs text-[#59645B]">
          <div>
            Showing <span className="font-semibold text-[#24352B]">{requests.length}</span> of{' '}
            <span className="font-semibold text-[#24352B]">{totalCount}</span> change requests
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1 border border-[#DEDCD1] rounded-lg bg-white disabled:opacity-40 hover:bg-[#F7F5EF] transition-colors"
            >
              Previous
            </button>
            <span className="px-2 font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1 border border-[#DEDCD1] rounded-lg bg-white disabled:opacity-40 hover:bg-[#F7F5EF] transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <RequestReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onDecided={fetchRequests}
        request={selectedRequest}
      />
    </div>
  );
}
