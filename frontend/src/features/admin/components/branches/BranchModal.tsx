'use client';

import React, { useState, useEffect } from 'react';
import {
  HiBuildingOffice2,
  HiXMark,
  HiCheck,
  HiExclamationCircle,
} from 'react-icons/hi2';

export interface BranchData {
  _id?: string;
  code: string;
  name: string;
  city: string;
  address: string;
  contactNumber: string;
  active: boolean;
}

interface BranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  branchToEdit?: BranchData | null;
}

export function BranchModal({ isOpen, onClose, onSaved, branchToEdit }: BranchModalProps) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    city: 'Karachi',
    address: '',
    contactNumber: '',
    active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (branchToEdit) {
      setFormData({
        code: branchToEdit.code,
        name: branchToEdit.name,
        city: branchToEdit.city,
        address: branchToEdit.address,
        contactNumber: branchToEdit.contactNumber,
        active: branchToEdit.active,
      });
    } else {
      setFormData({
        code: '',
        name: '',
        city: 'Karachi',
        address: '',
        contactNumber: '',
        active: true,
      });
    }
    setError(null);
  }, [branchToEdit, isOpen]);

  if (!isOpen) return null;

  const isEdit = Boolean(branchToEdit?._id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = isEdit ? `/api/branches/${branchToEdit!._id}` : '/api/branches';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save branch.');
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-[#FFFFFF] border border-[#DEDCD1] rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EAE7DD] flex items-center justify-between bg-[#F7F5EF]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#285742] text-white flex items-center justify-center">
              <HiBuildingOffice2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-[#24352B]">
                {isEdit ? 'Edit Campus Branch' : 'Add New Campus Branch'}
              </h3>
              <p className="text-xs text-[#59645B]">
                {isEdit ? 'Update branch location and status' : 'Register an official university test center'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#717973] hover:text-[#0d402c] p-1.5 rounded-lg hover:bg-[#EAE7DD] transition-colors"
          >
            <HiXMark className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-[#FAEAE7] border border-[#A3342F]/30 text-[#A3342F] text-xs rounded-xl flex items-center gap-2">
              <HiExclamationCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#24352B] mb-1">
                Branch Code <span className="text-[#A3342F]">*</span>
              </label>
              <input
                type="text"
                required
                disabled={isEdit}
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. KHI-01"
                className="w-full px-3 py-2 text-sm border border-[#DEDCD1] rounded-xl focus:outline-none focus:border-[#285742] bg-[#FFFFFF] disabled:bg-[#F7F5EF] disabled:cursor-not-allowed font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#24352B] mb-1">
                City <span className="text-[#A3342F]">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Karachi, Lahore"
                className="w-full px-3 py-2 text-sm border border-[#DEDCD1] rounded-xl focus:outline-none focus:border-[#285742] bg-[#FFFFFF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#24352B] mb-1">
              Branch Name <span className="text-[#A3342F]">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Karachi Main Campus (Gulshan)"
              className="w-full px-3 py-2 text-sm border border-[#DEDCD1] rounded-xl focus:outline-none focus:border-[#285742] bg-[#FFFFFF]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#24352B] mb-1">
              Physical Address <span className="text-[#A3342F]">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. University Road, Block 4, Gulshan-e-Iqbal"
              className="w-full px-3 py-2 text-sm border border-[#DEDCD1] rounded-xl focus:outline-none focus:border-[#285742] bg-[#FFFFFF]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#24352B] mb-1">
              Contact Phone <span className="text-[#A3342F]">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.contactNumber}
              onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
              placeholder="e.g. 021-34978211"
              className="w-full px-3 py-2 text-sm border border-[#DEDCD1] rounded-xl focus:outline-none focus:border-[#285742] bg-[#FFFFFF]"
            />
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-[#EAE7DD]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 text-[#285742] rounded accent-[#285742]"
              />
              <span className="text-xs font-medium text-[#24352B]">
                Active status (Eligible for student selection)
              </span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#59645B] hover:text-[#24352B] border border-[#DEDCD1] rounded-xl hover:bg-[#F7F5EF] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[#285742] hover:bg-[#1f4534] rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              <HiCheck className="w-4 h-4" />
              <span>{loading ? 'Saving...' : isEdit ? 'Update Branch' : 'Create Branch'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
