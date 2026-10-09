'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiEnvelope,
  HiLockClosed,
  HiEye,
  HiEyeSlash,
  HiExclamationCircle,
} from 'react-icons/hi2';
import { toast } from 'sonner';
import { DemoCredentialsPills } from './DemoCredentialsPills';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<'student' | 'admin' | null>(null);

  const handleDemoSelect = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setActiveRole(demoEmail.includes('admin') ? 'admin' : 'student');
    toast.info(`Populated ${demoEmail.includes('admin') ? 'Admin' : 'Student'} credentials`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please provide both your email address and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please verify your credentials.');
      }

      toast.success('Signed in successfully');

      if (data.user?.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/student/planner');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to connect to the authentication service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1, ease: [0.2, 0, 0, 1] }}
      className="w-full max-w-md bg-[#FFFFFF] border border-[#DEDCD1] rounded-[20px] p-7 sm:p-9 shadow-[0_4px_20px_rgba(36,53,43,0.045)]"
    >
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[#24352B] tracking-tight">
          Sign In
        </h2>
        <p className="text-sm text-[#59645B] mt-1">
          Access your exam slots and course schedule.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-5 p-3.5 rounded-[12px] bg-[#FAEAE7] border border-[#A3342F]/20 text-[#A3342F] text-xs sm:text-sm flex items-start gap-2.5"
            role="alert"
          >
            <HiExclamationCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="leading-snug">{error}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label
            htmlFor="login-email"
            className="block text-xs font-semibold uppercase tracking-wider text-[#24352B] mb-1.5"
          >
            Email Address
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#59645B]">
              <HiEnvelope className="w-5 h-5" />
            </span>
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (activeRole) setActiveRole(null);
              }}
              placeholder="e.g. student@examslot.edu.pk"
              className="w-full h-12 pl-11 pr-4 bg-[#FFFFFF] border border-[#7B8578] rounded-[12px] text-sm text-[#24352B] placeholder-[#59645B]/70 focus:outline-none focus:ring-2 focus:ring-[#285742] focus:border-[#285742] transition-colors"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="login-password"
              className="block text-xs font-semibold uppercase tracking-wider text-[#24352B]"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-[#285742] hover:text-[#204735] underline decoration-[#285742]/40 hover:decoration-[#285742] transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#59645B]">
              <HiLockClosed className="w-5 h-5" />
            </span>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (activeRole) setActiveRole(null);
              }}
              placeholder="••••••••••••"
              className="w-full h-12 pl-11 pr-11 bg-[#FFFFFF] border border-[#7B8578] rounded-[12px] text-sm text-[#24352B] placeholder-[#59645B]/70 focus:outline-none focus:ring-2 focus:ring-[#285742] focus:border-[#285742] transition-colors"
            />
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#59645B] hover:text-[#24352B] transition-colors cursor-pointer"
            >
              {showPassword ? (
                <HiEyeSlash className="w-5 h-5" />
              ) : (
                <HiEye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={!loading ? { y: -1 } : {}}
            whileTap={!loading ? { scale: 0.99 } : {}}
            className="w-full h-12 bg-[#285742] hover:bg-[#204735] active:bg-[#1b3a2c] text-white text-sm font-medium rounded-[12px] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-3 focus-visible:outline-[#285742] focus-visible:outline-offset-2"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                <span>Verifying credentials...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </motion.button>
        </div>
      </form>

      {/* Demo Credentials Picker */}
      <DemoCredentialsPills
        activeRole={activeRole}
        onSelect={handleDemoSelect}
      />
    </motion.div>
  );
}
