'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  KeyRound,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function AdminMfaSetupPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [factorId, setFactorId] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState(false);

  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let ignore = false;

    async function init() {
      try {
        // 1. Check current status
        const statusRes = await fetch('/api/admin/mfa/status');
        if (!statusRes.ok) {
          router.replace('/admin/login');
          return;
        }
        const statusData = await statusRes.json();
        if (!ignore) {
          if (statusData.step === 'DASHBOARD') {
            router.replace('/admin/feedback');
            return;
          }
          if (statusData.step === 'VERIFY') {
            router.replace('/admin/mfa/verify');
            return;
          }
        }

        // 2. Enroll TOTP
        setEnrolling(true);
        const enrollRes = await fetch('/api/admin/mfa/enroll', { method: 'POST' });
        const enrollData = await enrollRes.json();
        if (!ignore) {
          if (!enrollRes.ok || !enrollData.success) {
            setErrorMsg(enrollData.error || '2단계 인증 등록 준비에 실패했습니다.');
          } else {
            setFactorId(enrollData.factorId);
            setQrCode(enrollData.qrCode);
            setSecret(enrollData.secret);
          }
        }
      } catch (err) {
        if (!ignore) {
          setErrorMsg(err instanceof Error ? err.message : '오류가 발생했습니다.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
          setEnrolling(false);
        }
      }
    }

    void init();

    return () => {
      ignore = true;
    };
  }, [router]);

  const handleCopySecret = async () => {
    if (!secret) return;
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard write failed
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
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
        body: JSON.stringify({ factorId, code: code.trim() }),
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
          <h1 className="text-xl font-black text-slate-900">2단계 인증(MFA) 설정</h1>
          <p className="text-xs text-slate-500">
            관리자 보안을 위해 2단계 인증을 설정해주세요.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700 font-semibold">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {loading || enrolling ? (
          <div className="py-12 text-center space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
            <p className="text-xs text-slate-400">인증 QR 코드를 생성하는 중입니다...</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Step 1: Scan QR */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center text-[11px]">
                  1
                </span>
                <span>인증 앱(Google OTP 등)으로 QR 코드 스캔</span>
              </div>

              {qrCode && (
                <div className="flex justify-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrCode}
                    alt="TOTP QR Code"
                    className="w-44 h-44 rounded-xl bg-white p-2 shadow-xs"
                  />
                </div>
              )}

              {/* Secret toggle for manual entry */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowSecret((v) => !v)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>수동 입력 키 보기</span>
                  {showSecret ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                {showSecret && secret && (
                  <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-2 text-left">
                    <span className="font-mono text-[11px] text-slate-700 select-all break-all">
                      {secret}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopySecret}
                      className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 cursor-pointer shrink-0"
                      title="키 복사"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Enter 6-digit Code */}
            <form onSubmit={handleVerify} className="space-y-4 pt-2 border-t border-slate-100">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center text-[11px]">
                    2
                  </span>
                  <span>인증 앱에 표시된 6자리 코드 입력</span>
                </div>

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
                  className="w-full sys-input h-12 text-center text-xl font-mono tracking-widest font-black"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || code.length !== 6}
                className="w-full sys-btn-primary h-12 text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>인증 확인 중...</span>
                  </>
                ) : (
                  <span>인증 및 등록 완료</span>
                )}
              </button>
            </form>
          </div>
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
            로그인 화면으로 돌아가기
          </button>
        </div>
      </div>
    </main>
  );
}
