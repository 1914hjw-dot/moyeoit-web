'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MessageSquare,
  Bell,
  LogOut,
  RefreshCw,
  Filter,
  CheckCircle2,
  Clock,
  Mail,
  ChevronDown,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { Feedback, FeedbackStatus, FEEDBACK_CATEGORIES } from '@/types/feedback';

const STATUS_BADGE_STYLE: Record<FeedbackStatus, string> = {
  NEW: 'bg-rose-50 text-rose-700 border-rose-200',
  READ: 'bg-slate-100 text-slate-700 border-slate-200',
  IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-200',
  RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const STATUS_LABEL: Record<FeedbackStatus, string> = {
  NEW: '신규',
  READ: '확인',
  IN_PROGRESS: '처리중',
  RESOLVED: '완료',
};

export default function AdminFeedbackPage() {
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const params = new URLSearchParams();
        if (statusFilter !== 'ALL') params.set('status', statusFilter);
        if (categoryFilter !== 'ALL') params.set('category', categoryFilter);

        const res = await fetch(`/api/admin/feedback?${params.toString()}`);
        if (res.status === 401 || res.status === 403) {
          router.push('/admin/login');
          return;
        }
        const data = await res.json();
        if (!ignore) {
          if (!res.ok || !data.success) {
            setErrorMsg(data.error || '문의 목록을 불러올 수 없습니다.');
          } else {
            setFeedbacks(data.feedbacks || []);
            setTotalCount(data.totalCount || 0);
            setErrorMsg('');
          }
        }
      } catch (err) {
        if (!ignore) {
          setErrorMsg(err instanceof Error ? err.message : '목록 조회 실패');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      ignore = true;
    };
  }, [statusFilter, categoryFilter, refreshKey, router]);

  const handleStatusChange = async (id: string, newStatus: FeedbackStatus) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/feedback/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || '상태 변경 실패');
      }
      setFeedbacks((prev) =>
        prev.map((fb) => (fb.id === id ? { ...fb, status: newStatus } : fb))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : '상태 변경 중 오류가 발생했습니다.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch {
      router.push('/admin/login');
    }
  };

  return (
    <main className="min-h-screen bg-[#FAFAFC] pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs">
              M
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <span>모여잇 관리자 콘솔</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
                  Admin
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-1 text-xs font-bold">
              <Link
                href="/admin/feedback"
                className="px-3 py-1.5 rounded-xl bg-slate-900 text-white flex items-center gap-1.5 shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>문의 관리</span>
              </Link>
              <Link
                href="/admin/notices"
                className="px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100 flex items-center gap-1.5 transition-colors"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>공지사항 관리</span>
              </Link>
            </nav>

            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-2 cursor-pointer"
              title="로그아웃"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pt-6 space-y-6">
        {/* Page Title & Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900">사용자 문의 및 피드백 내역</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              총 <span className="font-bold text-slate-900">{totalCount}</span>건의 문의가 접수되었습니다.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white border border-slate-200/80 rounded-xl px-2.5 py-1 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="ALL">전체 상태</option>
                <option value="NEW">신규 (NEW)</option>
                <option value="READ">확인 (READ)</option>
                <option value="IN_PROGRESS">처리중 (IN_PROGRESS)</option>
                <option value="RESOLVED">완료 (RESOLVED)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-white border border-slate-200/80 rounded-xl px-2.5 py-1 text-xs">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="ALL">전체 카테고리</option>
                {FEEDBACK_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setRefreshKey((k) => k + 1);
              }}
              disabled={loading}
              className="p-1.5 rounded-xl bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 cursor-pointer"
              title="새로고침"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700 font-semibold">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Feedback List Table/Cards */}
        {loading && feedbacks.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-400">
            문의 내역을 불러오는 중입니다...
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="sys-card p-12 text-center space-y-2 bg-white">
            <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">접수된 문의가 없습니다.</p>
            <p className="text-xs text-slate-400">필터 조건에 맞는 문의 사항이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {feedbacks.map((item) => {
              const isExpanded = expandedId === item.id;
              const isUpdating = updatingId === item.id;

              return (
                <div
                  key={item.id}
                  className="sys-card bg-white border border-slate-200/80 rounded-2xl p-4 transition-all hover:border-slate-300"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${STATUS_BADGE_STYLE[item.status]}`}>
                        {STATUS_LABEL[item.status]}
                      </span>
                      <span className="text-xs font-black text-slate-900 px-2 py-0.5 rounded-lg bg-slate-100">
                        {item.category}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(item.created_at).toLocaleString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {item.reply_email && (
                        <span className="text-xs text-indigo-600 font-bold flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          {item.reply_email}
                        </span>
                      )}
                    </div>

                    {/* Status Changer */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <select
                        disabled={isUpdating}
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.id, e.target.value as FeedbackStatus)}
                        className="sys-input h-8 px-2 text-xs font-bold bg-slate-50 border-slate-200 cursor-pointer"
                      >
                        <option value="NEW">신규</option>
                        <option value="READ">확인</option>
                        <option value="IN_PROGRESS">처리중</option>
                        <option value="RESOLVED">완료</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                        className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 cursor-pointer"
                        title={isExpanded ? '접기' : '상세보기'}
                      >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Summary Preview / Full Content */}
                  <div className="mt-2.5">
                    <p className={`text-xs text-slate-800 leading-relaxed ${isExpanded ? 'whitespace-pre-wrap' : 'line-clamp-2'}`}>
                      {item.content}
                    </p>
                  </div>

                  {/* Expanded Metadata */}
                  {isExpanded && (
                    <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1 bg-slate-50/50 p-3 rounded-xl">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700">접수 경로:</span>
                        <span>{item.page_path || '홈페이지'}</span>
                      </div>
                      {item.user_agent && (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-700">User Agent:</span>
                          <span className="truncate max-w-xl">{item.user_agent}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700">문의 ID:</span>
                        <span className="font-mono text-[10px]">{item.id}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
