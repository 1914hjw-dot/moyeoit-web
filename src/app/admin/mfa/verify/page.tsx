'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Loader2,
  AlertCircle,
  Smartphone,
} from 'lucide-react';

interface FactorOption {
  id: string;
  friendlyName: string;
  createdAt: string;
}

export default function AdminMfaVerifyPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [factors, setFactors] = useState<FactorOption[]>([]);
  const [selectedFactorId, setSelectedFactorId] = useState('');
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let ignore = false;

    async function checkStatus() {
      try {
        const res = await fetch('/api/admin/mfa/status');
        if (!res.ok) {
          router.replace('/admin/login');
          return;
        }

        const data = await res.json();
        if (!ignore) {
          if (data.step === 'DASHBOARD') {
            router.replace('/admin/feedback');
            return;
          }
          if (data.step === 'SETUP') {
            router.replace('/admin/mfa/setup');
            return;
          }

          setFactors(data.factors || []);
          setSelectedFactorId(data.defaultFactorId || data.factors?.[0]?.id || '');
        }
      } catch (err) {
        if (!ignore) {
          setErrorMsg(err instanceof Error ? err.message : 'MFA 상태 확인 실패');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void checkStatus();

    return () => {
      ignore = true;
    };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFactorId) {
      setErrorMsg('인증할 보안 팩터를 선택해 주세요.');
      return;
    }
    if (!/^\d{6}$/.test(code.trim())) {
      setErrorMsg('6자리 숫자 인증 코드를 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          factorId: selectedFactorId,
          code: code.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || '인증 코드가 올바르지 않습니다.');
      }

      router.push('/admin/feedback');
      router.refresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : '인증에 실패했습니다.');
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
          <h1 className="text-xl font-black text-slate-900">2단계 인증(MFA)</h1>
          <p className="text-xs text-slate-500">
            인증 앱에 표시된 6자리 코드를 입력해주세요.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700 font-semibold">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
            <p className="text-xs text-slate-400">인증 상태를 확인하는 중입니다...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* If multiple factors exist, allow selection */}
            {factors.length > 1 && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  인증 기기 선택
                </label>
                <div className="relative">
                  <select
                    value={selectedFactorId}
                    onChange={(e) => setSelectedFactorId(e.target.value)}
                    className="w-full sys-input h-11 pl-10 text-xs font-semibold cursor-pointer"
                  >
                    {factors.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.friendlyName} (등록일: {new Date(f.createdAt).toLocaleDateString('ko-KR')})
                      </option>
                    ))}
                  </select>
                  <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                인증 코드 (6자리 숫자)
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  autoFocus
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full sys-input h-12 text-center text-2xl font-mono tracking-widest font-black"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || code.length !== 6}
              className="w-full sys-btn-primary h-12 text-xs sm:text-sm font-black flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>인증 확인 중...</span>
                </>
              ) : (
                <span>인증하기</span>
              )}
            </button>
          </form>
        )}

        <div className="pt-2 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={async () => {
              await fetch('/api/admin/auth/logout', { method: 'POST' });
              router.push('/admin/login');
            }}
            className="text-[11px] text-slate-400 hover:text-slate-600 underline cursor-pointer"
          >
            로그아웃 및 다른 계정으로 로그인
          </button>
        </div>
      </div>
    </main>
  );
}
