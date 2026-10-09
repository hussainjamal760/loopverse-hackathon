'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  HiBuildingOffice2,
  HiPlus,
  HiMagnifyingGlass,
  HiPencil,
  HiTrash,
  HiShieldCheck,
  HiExclamationTriangle,
  HiArrowPath,
  HiPhone,
  HiMapPin,
  HiCheckCircle,
  HiXCircle,
} from 'react-icons/hi2';
import { BranchModal, BranchData } from './BranchModal';

export function BranchTable() {
  const [branches, setBranches] = useState<BranchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [branchToEdit, setBranchToEdit] = useState<BranchData | null>(null);

  // Deletion / Deactivation modal
  const [deleteTarget, setDeleteTarget] = useState<BranchData | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBranches = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/branches?search=${encodeURIComponent(search)}&page=${page}&pageSize=10`);
      const data = await res.json();
      if (res.ok) {
        setBranches(data.branches || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Fetch branches error:', err);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const handleOpenAdd = () => {
    setBranchToEdit(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (branch: BranchData) => {
    setBranchToEdit(branch);
    setModalOpen(true);
  };

  const handleDeleteClick = (branch: BranchData) => {
    setDeleteTarget(branch);
    setDeleteError(null);
  };

  const executeDelete = async () => {
    if (!deleteTarget?._id) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/branches/${deleteTarget._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        setDeleteError(data.error || 'Failed to delete branch');
        return;
      }
      setDeleteTarget(null);
      fetchBranches();
    } catch (err: any) {
      setDeleteError(err.message || 'Network error');
    } finally {
      setDeleting(false);
    }
  };

  const executeDeactivate = async () => {
    if (!deleteTarget?._id) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/branches/${deleteTarget._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: false }),
      });
      if (res.ok) {
        setDeleteTarget(null);
        fetchBranches();
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFFFF] p-4 rounded-2xl border border-[#DEDCD1] shadow-xs">
        <div className="relative flex-1 max-w-md">
          <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717973]" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search branches by code, name, or city..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-[#DEDCD1] rounded-xl focus:outline-none focus:border-[#285742] bg-[#F7F5EF]/50"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchBranches()}
            className="p-2 border border-[#DEDCD1] text-[#59645B] hover:text-[#24352B] hover:bg-[#F7F5EF] rounded-xl transition-colors"
            title="Refresh"
          >
            <HiArrowPath className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#285742] hover:bg-[#1f4534] rounded-xl shadow-xs transition-colors"
          >
            <HiPlus className="w-4 h-4" />
            <span>Add Branch</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#DEDCD1] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F5EF] border-b border-[#EAE7DD] text-[#59645B] font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Campus Name</th>
                <th className="px-5 py-3">City</th>
                <th className="px-5 py-3">Address & Contact</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE7DD]">
              {loading && branches.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-[#59645B]">
                    <div className="inline-flex items-center gap-2">
                      <HiArrowPath className="w-4 h-4 animate-spin text-[#285742]" />
                      <span>Loading university campus branches...</span>
                    </div>
                  </td>
                </tr>
              ) : branches.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-[#59645B]">
                    <p className="font-semibold text-sm text-[#24352B]">No campus branches found</p>
                    <p className="text-xs text-[#59645B] mt-1">Try adjusting your search criteria or register a new branch.</p>
                  </td>
                </tr>
              ) : (
                branches.map((branch) => (
                  <tr key={branch._id} className="hover:bg-[#F7F5EF]/60 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-semibold text-[#0d402c]">
                      {branch.code}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-[#24352B]">{branch.name}</div>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-[#24352B]">
                      <span className="inline-flex items-center gap-1">
                        <HiMapPin className="w-3.5 h-3.5 text-[#59645B]" />
                        {branch.city}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[#59645B] max-w-xs truncate">
                      <div>{branch.address}</div>
                      <div className="inline-flex items-center gap-1 text-[11px] text-[#717973] mt-0.5">
                        <HiPhone className="w-3 h-3" />
                        {branch.contactNumber}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {branch.active ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E7EEE3] text-[#285742] border border-[#285742]/20">
                          <HiCheckCircle className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F0EEE6] text-[#717973] border border-[#DEDCD1]">
                          <HiXCircle className="w-3 h-3" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          onClick={() => handleOpenEdit(branch)}
                          className="p-1.5 text-[#59645B] hover:text-[#285742] hover:bg-[#E7EEE3] rounded-lg transition-colors"
                          title="Edit branch"
                        >
                          <HiPencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(branch)}
                          className="p-1.5 text-[#59645B] hover:text-[#A3342F] hover:bg-[#FAEAE7] rounded-lg transition-colors"
                          title="Delete / Deactivate"
                        >
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Strip */}
        <div className="px-5 py-3 border-t border-[#EAE7DD] bg-[#F7F5EF] flex items-center justify-between text-xs text-[#59645B]">
          <div>
            Showing <span className="font-semibold text-[#24352B]">{branches.length}</span> of{' '}
            <span className="font-semibold text-[#24352B]">{totalCount}</span> campus branches
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

      {/* Create / Edit Modal */}
      <BranchModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={fetchBranches}
        branchToEdit={branchToEdit}
      />

      {/* Safe Delete / Deactivation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#FFFFFF] border border-[#DEDCD1] rounded-2xl w-full max-w-md shadow-xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3 text-[#A3342F]">
              <div className="w-10 h-10 rounded-full bg-[#FAEAE7] flex items-center justify-center">
                <HiExclamationTriangle className="w-5 h-5 text-[#A3342F]" />
              </div>
              <div>
                <h3 className="font-semibold text-base text-[#24352B]">Delete Campus Branch</h3>
                <p className="text-xs text-[#59645B]">{deleteTarget.code} — {deleteTarget.name}</p>
              </div>
            </div>

            {deleteError ? (
              <div className="p-3 bg-[#FAEAE7] border border-[#A3342F]/30 rounded-xl space-y-2">
                <div className="flex items-start gap-2 text-xs text-[#A3342F]">
                  <HiShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{deleteError}</span>
                </div>
                <p className="text-[11px] text-[#59645B]">
                  Academic integrity protects historical records. You can deactivate this branch so no future students can select it, preserving existing student commitments.
                </p>
                <button
                  onClick={executeDeactivate}
                  disabled={deleting}
                  className="w-full mt-2 py-2 text-xs font-semibold text-white bg-[#795D18] hover:bg-[#604913] rounded-lg transition-colors"
                >
                  {deleting ? 'Deactivating...' : 'Deactivate Branch Instead'}
                </button>
              </div>
            ) : (
              <p className="text-xs text-[#59645B] leading-relaxed">
                Are you sure you want to remove this branch? If it has students enrolled or historical exam sheets, safe deletion integrity will prevent removal and offer deactivation.
              </p>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-[#59645B] hover:text-[#24352B] border border-[#DEDCD1] rounded-xl hover:bg-[#F7F5EF] transition-colors"
              >
                Close
              </button>
              {!deleteError && (
                <button
                  onClick={executeDelete}
                  disabled={deleting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#A3342F] hover:bg-[#852a26] rounded-xl transition-colors disabled:opacity-50"
                >
                  {deleting ? 'Checking...' : 'Delete Branch'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
