'use client';

import React, { useEffect } from 'react';

interface AdBannerProps {
  slotType?: 'top_heatmap' | 'bottom_vote' | 'sidebar';
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ className = '' }) => {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
      }
    } catch {
      // Ignore AdSense script initialization errors gracefully
    }
  }, []);

  return (
    <div className={`w-full my-5 text-center overflow-hidden min-h-[90px] ${className}`}>
      {/* Production Google AdSense Unit Container */}
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-3199026813976563"
        data-ad-slot="1234567890"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};
