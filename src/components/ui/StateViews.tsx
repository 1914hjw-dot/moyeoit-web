'use client';

import React from 'react';
import Link from 'next/link';
import { RefreshCw, WifiOff, AlertCircle, CalendarX, FileX, ShieldAlert, ArrowLeft, Plus } from 'lucide-react';

interface BaseStateProps {
  onRetry?: () => void;
  onGoHome?: () => void;
}

/** 1. Loading State (로딩 상태) */
export const LoadingState: React.FC<{ message?: string }> = ({
  message = '모임 정보를 불러오는 중입니다...',
}) => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
    <div className="sys-card p-8 border-slate-200/80 max-w-sm w-full space-y-4 bg-white shadow-lg shadow-slate-200/50 rounded-3xl">
      <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
        <RefreshCw className="w-5 h-5 animate-spin" />
      </div>
      <p className="text-xs font-bold text-slate-700">{message}</p>
    </div>
  </div>
);

/** 2. Offline State (인터넷 연결 끊김 상태) */
export const OfflineState: React.FC<BaseStateProps> = ({ onRetry }) => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
    <div className="sys-card p-8 border-rose-200 max-w-md w-full space-y-4 bg-white shadow-xl rounded-3xl">
      <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200 shadow-sm">
        <WifiOff className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-black text-slate-900">인터넷 연결이 끊어졌어요</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          네트워크 연결 상태를 확인하신 후 다시 시도해 주세요.
        </p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="w-full sys-btn-primary text-xs font-black"
        >
          <span>다시 연결 시도하기</span>
        </button>
      )}
    </div>
  </div>
);

/** 3. Invalid Link State (잘못된 모임방 링크 상태) */
export const InvalidLinkState: React.FC = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
    <div className="sys-card p-8 border-slate-200/80 max-w-md w-full space-y-5 bg-white shadow-xl rounded-3xl">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto shadow-sm">
        <CalendarX className="w-6 h-6" />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-base font-black text-slate-900">이 모임방을 찾을 수 없어요</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          초대 링크가 잘못되었거나 삭제된 모임방일 수 있습니다. <br />
          방장에게 새로운 초대 링크를 요청해 보세요.
        </p>
      </div>
      <Link href="/" className="w-full sys-btn-primary text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20">
        <Plus className="w-4 h-4 text-white" />
        <span>새 모임방 직접 만들기</span>
      </Link>
    </div>
  </div>
);

/** 4. Expired Room State (기간 만료된 모임방) */
export const ExpiredRoomState: React.FC = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
    <div className="sys-card p-8 border-amber-200 max-w-md w-full space-y-5 bg-white shadow-xl rounded-3xl">
      <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 shadow-sm">
        <AlertCircle className="w-6 h-6" />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-base font-black text-slate-900">조율 기간이 지난 모임방이에요</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          이 모임은 약속 날짜가 이미 확정되었거나 조율 기간이 만료되었습니다.
        </p>
      </div>
      <Link href="/" className="w-full sys-btn-primary text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20">
        <ArrowLeft className="w-4 h-4 text-white" />
        <span>홈으로 돌아가기</span>
      </Link>
    </div>
  </div>
);

/** 5. Empty Vote State (투표 참여자 없음 상태) */
export const EmptyVoteState: React.FC<{ onStartVote: () => void }> = ({ onStartVote }) => (
  <div className="w-full sys-card p-6 text-center border-dashed border-slate-200 space-y-3 my-4 bg-white rounded-3xl">
    <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
      <FileX className="w-5 h-5" />
    </div>
    <div className="space-y-1">
      <p className="text-xs font-bold text-slate-800">아직 제출된 투표가 없어요</p>
      <p className="text-xs text-slate-500">첫 번째로 참석 가능한 날짜를 투표해 보세요!</p>
    </div>
    <button
      type="button"
      onClick={onStartVote}
      className="sys-btn-primary text-xs font-black px-4 py-2 shadow-md shadow-indigo-500/20"
    >
      ⚡ 가능 날짜 투표 시작하기
    </button>
  </div>
);

/** 6. Access Error State (비밀번호 일치하지 않음/권한 오류) */
export const AccessErrorState: React.FC<{ message: string; onRetry: () => void }> = ({
  message,
  onRetry,
}) => (
  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between gap-3 shadow-sm">
    <div className="flex items-center gap-2">
      <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
      <span className="font-bold">{message}</span>
    </div>
    <button
      type="button"
      onClick={onRetry}
      className="px-3 py-1.5 rounded-xl bg-rose-100 text-rose-800 font-extrabold hover:bg-rose-200 transition-all text-[11px]"
    >
      재시도
    </button>
  </div>
);
