'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bell,
  MessageSquare,
  LogOut,
  Plus,
  Pin,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react';
import { Notice } from '@/types/feedback';

export default function AdminNoticesPage() {
  const router = useRouter();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const res = await fetch('/api/admin/notices');
        if (res.status === 401 || res.status === 403) {
          router.push('/admin/login');
          return;
        }
        const data = await res.json();
        if (!ignore) {
          if (!res.ok || !data.success) {
            setErrorMsg(data.error || '공지사항 목록 조회 실패');
          } else {
            setNotices(data.notices || []);
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
  }, [refreshKey, router]);

  const openCreateModal = () => {
    setEditingNotice(null);
    setTitle('');
    setContent('');
    setIsPinned(false);
    setIsPublished(true); // Default to published
    setModalError('');
    setIsModalOpen(true);
  };

  const openEditModal = (notice: Notice) => {
    setEditingNotice(notice);
    setTitle(notice.title);
    setContent(notice.content);
    setIsPinned(notice.is_pinned);
    setIsPublished(notice.is_published);
    setModalError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setEditingNotice(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setModalError('제목과 내용을 모두 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);
    setModalError('');

    try {
      if (editingNotice) {
        // Edit existing notice
        const res = await fetch(`/api/admin/notices/${editingNotice.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            content: content.trim(),
            is_pinned: isPinned,
            is_published: isPublished,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || '공지사항 수정에 실패했습니다.');
        }
      } else {
        // Create new notice
        const res = await fetch('/api/admin/notices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            content: content.trim(),
            is_pinned: isPinned,
            is_published: isPublished,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || '공지사항 작성에 실패했습니다.');
        }
      }

      setIsModalOpen(false);
      setLoading(true);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setModalError(err instanceof Error ? err.message : '저장 실패');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, noticeTitle: string) => {
    if (!confirm(`'${noticeTitle}' 공지사항을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/notices/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || '삭제 실패');
      }
      setNotices((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다.');
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
                className="px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100 flex items-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>문의 관리</span>
              </Link>
              <Link
                href="/admin/notices"
                className="px-3 py-1.5 rounded-xl bg-slate-900 text-white flex items-center gap-1.5 shadow-xs"
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
        {/* Page Title & Add Button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900">공지사항 관리</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              공개 및 비공개 공지사항을 작성, 수정, 고정하거나 삭제할 수 있습니다.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="sys-btn-primary px-4 h-10 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>새 공지 작성</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700 font-semibold">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Notices Table */}
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">
            공지사항을 불러오는 중입니다...
          </div>
        ) : notices.length === 0 ? (
          <div className="sys-card p-12 text-center space-y-3 bg-white">
            <Bell className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">작성된 공지사항이 없습니다.</p>
            <button
              type="button"
              onClick={openCreateModal}
              className="sys-btn-primary px-4 h-9 text-xs font-bold"
            >
              첫 공지 작성하기
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {notices.map((notice) => (
              <div
                key={notice.id}
                className="sys-card bg-white border border-slate-200/80 rounded-2xl p-4 transition-all hover:border-slate-300"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {notice.is_pinned && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-black">
                          <Pin className="w-3 h-3 text-indigo-600" />
                          <span>고정</span>
                        </span>
                      )}
                      {notice.is_published ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-extrabold">
                          <Eye className="w-3 h-3 text-emerald-600" />
                          <span>게시 중</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-bold">
                          <EyeOff className="w-3 h-3 text-slate-400" />
                          <span>비공개</span>
                        </span>
                      )}
                      <h3 className="text-sm font-black text-slate-900 truncate">
                        {notice.title}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-1">
                      {notice.content}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        작성: {new Date(notice.created_at).toLocaleDateString('ko-KR')}
                      </span>
                      {notice.published_at && (
                        <span>
                          게시: {new Date(notice.published_at).toLocaleDateString('ko-KR')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => openEditModal(notice)}
                      className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                      title="수정"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(notice.id, notice.title)}
                      className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notice Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={closeModal}
          />
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-6 space-y-4 z-10">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">
                {editingNotice ? '공지사항 수정' : '새 공지사항 작성'}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  공지 제목 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={150}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: [안내] 모여잇 9월 기능 업데이트 안내"
                  className="w-full sys-input h-11 text-xs sm:text-sm font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  공지 내용 <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="공지 내용을 입력해 주세요. (줄바꿈이 그대로 반영됩니다)"
                  className="w-full sys-input p-3 text-xs leading-relaxed resize-none h-44"
                />
              </div>

              {/* Options */}
              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="w-4 h-4 rounded-md accent-indigo-600 cursor-pointer"
                  />
                  <span>상단 중요 공지 고정</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-4 h-4 rounded-md accent-emerald-600 cursor-pointer"
                  />
                  <span>즉시 공개 (게시)</span>
                </label>
              </div>

              {/* Actions */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="sys-btn-secondary px-4 h-10 text-xs font-bold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="sys-btn-primary px-5 h-10 text-xs font-black flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                      <span>저장 중...</span>
                    </>
                  ) : (
                    <span>{editingNotice ? '수정 완료' : '등록하기'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
