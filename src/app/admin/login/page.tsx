'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // If already logged in, redirect based on MFA status
  useEffect(() => {
    let ignore = false;
    async function checkSession() {
      try {
        const res = await fetch('/api/admin/auth/session');
        if (res.ok) {
          const data = await res.json();
          if (!ignore && data.authenticated) {
            if (data.step === 'DASHBOARD') {
              router.replace('/admin/feedback');
            } else if (data.step === 'VERIFY') {
              router.replace('/admin/mfa/verify');
            } else if (data.step === 'SETUP') {
              router.replace('/admin/mfa/setup');
            }
          }
        }
      } catch {
        // Not authenticated or network error; stay on login page
      }
    }
    void checkSession();
    return () => {
      ignore = true;
    };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg('이메일과 비밀번호를 모두 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || '이메일 또는 비밀번호가 올바르지 않습니다.');
      }

      if (data.nextStep === 'SETUP') {
        router.push('/admin/mfa/setup');
      } else if (data.nextStep === 'VERIFY') {
        router.push('/admin/mfa/verify');
      } else {
        router.push('/admin/feedback');
      }
      router.refresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#FAFAFC]">
      <div className="w-full max-w-md sys-card p-6 sm:p-8 bg-white border-slate-200/80 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black text-slate-900">모여잇 관리자 로그인</h1>
          <p className="text-xs text-slate-500">
            서비스 운영 및 관리를 위한 관리자 전용 인증 화면입니다.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700 font-semibold">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              관리자 이메일
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@moyeoit.com"
                className="w-full sys-input h-11 pl-10 text-xs sm:text-sm font-medium"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              비밀번호
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full sys-input h-11 pl-10 text-xs sm:text-sm font-medium"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sys-btn-primary h-12 text-xs sm:text-sm font-black flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-md disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>인증 확인 중...</span>
              </>
            ) : (
              <span>로그인</span>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-slate-100 text-center text-[11px] text-slate-400">
          일반 사용자는 로그인이 필요하지 않은 링크 기반 약속 조율을 이용합니다.
        </div>
      </div>
    </main>
  );
}
