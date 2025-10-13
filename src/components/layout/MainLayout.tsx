'use client';

import React from 'react';
import MobileLayout from './MobileLayout';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  // For the mobile-first transformation, we're using only the MobileLayout
  // This provides a consistent mobile experience across all screen sizes
  return (
    <MobileLayout>
      {children}
    </MobileLayout>
  );
}