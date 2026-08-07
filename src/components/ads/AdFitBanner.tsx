'use client';

import React, { useEffect, useRef, useState } from 'react';
import { IS_PRODUCTION, ADFIT_HOME_UNIT_ID } from '@/lib/ads';

interface AdFitBannerProps {
  unitId?: string;
  width?: number;
  height?: number;
  className?: string;
}

export const AdFitBanner: React.FC<AdFitBannerProps> = ({
  unitId = ADFIT_HOME_UNIT_ID,
  width = 320,
  height = 100,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded || !containerRef.current) return;

    // Clear previous ad nodes if re-mounting in Strict Mode or SPA navigation
    const container = containerRef.current;
    container.innerHTML = '';

    // Create Kakao AdFit ins element
    const insTag = document.createElement('ins');
    insTag.className = 'kakao_ad_area';
    insTag.style.display = 'none';
    insTag.setAttribute('data-ad-unit', unitId);
    insTag.setAttribute('data-ad-width', width.toString());
    insTag.setAttribute('data-ad-height', height.toString());

    container.appendChild(insTag);

    // Create and attach Kakao AdFit script
    const scriptTag = document.createElement('script');
    scriptTag.type = 'text/javascript';
    scriptTag.src = '//t1.kakaocdn.net/kas/static/ba.min.js';
    scriptTag.async = true;

    container.appendChild(scriptTag);

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [isLoaded, unitId, width, height]);

  if (!isLoaded) {
    return (
      <div
        className={`w-full my-5 flex justify-center items-center min-h-[100px] ${className}`}
        aria-hidden="true"
      >
        <div style={{ width: `${width}px`, height: `${height}px` }} className="bg-slate-50/50 rounded-2xl" />
      </div>
    );
  }

  return (
    <div
      className={`w-full my-5 flex flex-col items-center justify-center overflow-hidden min-h-[100px] ${className}`}
      aria-label="광고 영역"
    >
      <div
        ref={containerRef}
        className="w-full flex justify-center items-center"
        style={{ minWidth: `${width}px`, minHeight: `${height}px` }}
      />
      {!IS_PRODUCTION && (
        <span className="text-[10px] text-slate-400 font-mono mt-1">
          [카카오 애드핏 개발자 미리보기 · {width}x{height}]
        </span>
      )}
    </div>
  );
};
