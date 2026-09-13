'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import CountdownTimer from './CountdownTimer';
import MaintenanceTracker from './MaintenanceTracker';
import WarrantyCertificate from './WarrantyCertificate';
import RevokedWarrantyBanner from './RevokedWarrantyBanner';
import { ShieldCheck, PlusCircle, FileText, Image as ImageIcon, Search, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WarrantyDashboard() {
  const { currentWarranty, setCurrentWarranty, registeredWarranties, setActiveTab, t, language } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'maintenance' | 'certificate' | 'documents'>('overview');

  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

  if (!currentWarranty) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-900/40 text-brand-400 border border-brand-700/50 flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          {language === 'ar' ? 'لا يوجد ضمان محدد حالياً' : 'No Warranty Selected'}
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-6">
          {language === 'ar'
            ? 'يمكنك البحث عن رقم سيريال أو رقم هاتف، أو تسجيل ضمان جهاز جديد الآن.'
            : 'Search by serial number or phone, or activate a new warranty now.'}
        </p>
        <button
          onClick={() => setActiveTab('activate')}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-accent-red to-accent-orange text-white text-xs sm:text-sm font-bold shadow-glow-orange"
        >
          {t.heroBtnActivate}
        </button>
      </div>
    );
  }

  const isRevoked = currentWarranty.isRevoked || currentWarranty.status === 'REVOKED';

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      
      {/* Top Warranty Header & Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-600 to-blue-700 text-white flex items-center justify-center font-black text-lg shadow-glow-blue">
            {currentWarranty.brand === 'AIWA' ? 'AI' : currentWarranty.brand === 'TIGER' ? 'TG' : 'A90'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white">
                {currentWarranty.modelName}
              </h2>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isRevoked
                    ? 'bg-red-950 text-red-300 border border-red-700'
                    : currentWarranty.status === 'EXPIRING_SOON'
                    ? 'bg-amber-950 text-amber-300 border border-amber-600'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                }`}
              >
                {isRevoked
                  ? t.warrantyStatusRevoked
                  : currentWarranty.status === 'EXPIRING_SOON'
                  ? t.warrantyStatusExpiringSoon
                  : t.warrantyStatusActive}
              </span>
            </div>

            <div className="text-xs text-slate-400 font-mono mt-0.5">
              {currentWarranty.serialNumber ? (
                <span>{language === 'ar' ? 'سيريال:' : 'Serial:'} <strong className="text-amber-400">{currentWarranty.serialNumber}</strong></span>
              ) : (
                <span>{language === 'ar' ? 'تفعيل فوري بفاتورة شراء' : 'Instant invoice activation'}</span>
              )}{' '}
              • {currentWarranty.customerName}
            </div>
          </div>
        </div>

        {/* Switch to other registered warranties if available */}
        <div className="flex items-center gap-2">
          {registeredWarranties.length > 1 && (
            <select
              value={currentWarranty.id}
              onChange={(e) => {
                const found = registeredWarranties.find((w) => w.id === e.target.value);
                if (found) setCurrentWarranty(found);
              }}
              className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2 outline-none font-medium max-w-[180px] sm:max-w-xs truncate"
            >
              {registeredWarranties.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.brand} - {w.serialNumber || w.modelName} ({w.customerName})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setActiveTab('activate')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-colors shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">{t.navActivate}</span>
          </button>
        </div>
      </div>

      {/* Revoked Model Banner (If status is Revoked) */}
      {isRevoked && (
        <RevokedWarrantyBanner
          reason={currentWarranty.revocationReason}
          serialNumber={currentWarranty.serialNumber}
          modelName={currentWarranty.modelName}
        />
      )}

      {/* Countdown Timer (If not Revoked) */}
      {!isRevoked && (
        <CountdownTimer
          expiryDate={currentWarranty.expiryDate}
          isRevoked={isRevoked}
        />
      )}

      {/* Maintenance Progress & Tracker */}
      <MaintenanceTracker
        ticket={currentWarranty.maintenanceTicket}
        deviceModel={currentWarranty.modelName}
      />

      {/* Official Certificate Presentation */}
      <WarrantyCertificate warranty={currentWarranty} />

      {/* Attached Proofs (Photos of Serial and Invoice) */}
      {(currentWarranty.devicePhotoUrl || currentWarranty.invoicePhotoUrl) && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-brand-400" />
            <span>{language === 'ar' ? 'المستندات والصور المرفقة بالطلب' : 'Attached Verification Documents'}</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentWarranty.devicePhotoUrl && (
              <div className="rounded-xl border border-slate-800 p-3 bg-slate-950/60">
                <div className="text-xs text-slate-400 mb-2 font-medium">
                  {language === 'ar' ? 'صورة ملصق السيريال بالجهاز' : 'Device Serial Label Photo'}
                </div>
                <div className="h-44 rounded-lg bg-black/60 flex items-center justify-center overflow-hidden">
                  <img
                    src={currentWarranty.devicePhotoUrl}
                    alt="Device label"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>
            )}

            {currentWarranty.invoicePhotoUrl && (
              <div className="rounded-xl border border-slate-800 p-3 bg-slate-950/60">
                <div className="text-xs text-slate-400 mb-2 font-medium">
                  {language === 'ar' ? 'فاتورة الشراء وشهادة الضمان الورقية' : 'Purchase Receipt / Paper Certificate'}
                </div>
                <div className="h-44 rounded-lg bg-black/60 flex items-center justify-center overflow-hidden">
                  <img
                    src={currentWarranty.invoicePhotoUrl}
                    alt="Invoice"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
