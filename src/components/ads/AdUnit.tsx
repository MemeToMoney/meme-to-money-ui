'use client';

import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdUnitProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
  layout?: string;
  layoutKey?: string;
  style?: React.CSSProperties;
  responsive?: boolean;
}

/**
 * Google AdSense ad unit component.
 * Renders an ad that blends with surrounding content.
 */
export default function AdUnit({
  slot,
  format = 'auto',
  layout,
  layoutKey,
  style,
  responsive = true,
}: AdUnitProps) {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch (e) {
      // AdSense not loaded yet or ad blocker active
    }
  }, []);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: 'block',
          ...(responsive ? { width: '100%' } : {}),
          ...style,
        }}
        data-ad-client="ca-pub-6159594843084013"
        data-ad-slot={slot}
        data-ad-format={format}
        {...(layout ? { 'data-ad-layout': layout } : {})}
        {...(layoutKey ? { 'data-ad-layout-key': layoutKey } : {})}
        {...(responsive ? { 'data-full-width-responsive': 'true' } : {})}
      />
    </Box>
  );
}
