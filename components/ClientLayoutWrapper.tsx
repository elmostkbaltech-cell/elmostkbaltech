'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import MapModal from '@/components/MapModal';
import Footer from '@/components/Footer';

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    // For admin portal: do not show client navbar, map modal, or client footer
    return <div className="w-full flex-1 flex flex-col">{children}</div>;
  }

  // For public client portal: show full client navbar, modal, and footer
  return (
    <>
      <Navbar />
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        {children}
      </main>
      <MapModal />
      <Footer />
    </>
  );
}
