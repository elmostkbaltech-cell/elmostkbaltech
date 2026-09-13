'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AdminProvider, useAdmin } from '@/context/AdminContext';
import AdminLogin from '@/components/admin/AdminLogin';
import ShipmentManager from '@/components/admin/ShipmentManager';
import AdminMaintenanceView from '@/components/admin/AdminMaintenanceView';
import NonSerialRegistry from '@/components/admin/NonSerialRegistry';
import SerialProductsRegistry from '@/components/admin/SerialProductsRegistry';
import ThemeToggle from '@/components/ThemeToggle';
import { 
  Package, 
  Wrench, 
  FileText, 
  LogOut, 
  ExternalLink, 
  ShieldCheck, 
  UserCheck, 
  Layers,
  Hash
} from 'lucide-react';

function AdminPortalContent() {
  const { adminUser, logout, isRealtimeActive } = useAdmin();
  const [currentTab, setCurrentTab] = useState<'SHIPMENTS' | 'MAINTENANCE' | 'NON_SERIAL' | 'SERIAL_PRODUCTS'>('SHIPMENTS');

  if (!adminUser) {
    return <AdminLogin />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Admin Navigation Bar */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand & Logo */}
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-3 group">
              <div className="relative w-28 sm:w-36 h-10 sm:h-12 flex items-center justify-center">
                <Image
                  src="/images/logo.png"
                  alt="المستقبل تك"
                  width={140}
                  height={48}
                  className="object-contain max-h-full max-w-full drop-shadow-md group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-black text-white flex items-center gap-1.5">
                  <span>المستقبل تك</span>
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">
                    بوابة الإدارة
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">فرع سوق التوفيقية المركزي</div>
              </div>
            </Link>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-3">
            {/* Admin Profile Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs">
              <div className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold">
                <UserCheck className="w-3.5 h-3.5" />
              </div>
              <div className="text-right">
                <span className="font-bold text-white block text-xs leading-tight">
                  {adminUser.displayName}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-emerald-400 font-mono block leading-tight">
                    {isRealtimeActive ? 'مزامنة سحابية حية (Realtime)' : 'مزامنة حية نشطة'}
                  </span>
                </div>
              </div>
            </div>

            {/* Back to Client Site */}
            <Link
              href="/"
              target="_blank"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>موقع العملاء</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Logout */}
            <button
              type="button"
              onClick={logout}
              title="تسجيل الخروج"
              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="bg-slate-950/60 border-t border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto py-2">
            <button
              onClick={() => setCurrentTab('SHIPMENTS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                currentTab === 'SHIPMENTS'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>1. شحنات الاستيراد والسيريالات</span>
            </button>

            <button
              onClick={() => setCurrentTab('MAINTENANCE')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                currentTab === 'MAINTENANCE'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>2. تذاكر وعمليات الصيانة</span>
            </button>

            <button
              onClick={() => setCurrentTab('NON_SERIAL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                currentTab === 'NON_SERIAL'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>3. سجل أجهزة الليد و DSP بدون سيريال</span>
            </button>

            <button
              onClick={() => setCurrentTab('SERIAL_PRODUCTS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                currentTab === 'SERIAL_PRODUCTS'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Hash className="w-4 h-4" />
              <span>4. قسم المنتجات بسيريال نمبر</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'SHIPMENTS' && <ShipmentManager />}
        {currentTab === 'MAINTENANCE' && <AdminMaintenanceView />}
        {currentTab === 'NON_SERIAL' && <NonSerialRegistry />}
        {currentTab === 'SERIAL_PRODUCTS' && <SerialProductsRegistry />}
      </main>

      {/* Admin Footer */}
      <footer className="py-4 border-t border-slate-900 bg-slate-950 text-center text-xs text-slate-500">
        نظام إدارة المستقبل تك الداخلي © 2009 - 2026 • فرع التوفيقية الرئيسي
      </footer>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminProvider>
      <AdminPortalContent />
    </AdminProvider>
  );
}
