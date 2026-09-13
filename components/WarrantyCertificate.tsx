'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { RegisteredWarranty } from '@/types';
import { useApp } from '@/context/AppContext';
import { COMPANY_INFO, BRANDS } from '@/lib/mock-data';
import { Printer, Shield, QrCode, CheckCircle2 } from 'lucide-react';

interface WarrantyCertificateProps {
  warranty: RegisteredWarranty;
}

export default function WarrantyCertificate({ warranty }: WarrantyCertificateProps) {
  const { t, language } = useApp();
  const certRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Certificate Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            {t.warrantyCardTitle}
          </h4>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold transition-all border border-slate-300 dark:border-slate-700 shadow-sm print:hidden"
        >
          <Printer className="w-4 h-4 text-accent-orange" />
          <span>{t.printCertificate}</span>
        </button>
      </div>

      {/* Official Certificate Paper Container */}
      <div
        ref={certRef}
        className="relative rounded-2xl p-6 sm:p-8 bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950 border-2 border-slate-300 dark:border-brand-500/40 text-slate-900 dark:text-slate-100 shadow-lg dark:shadow-2xl overflow-hidden print:bg-white print:text-black print:border-black"
      >
        {/* Decorative corner borders */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-accent-orange rounded-tl-xl" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent-orange rounded-tr-xl" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-accent-orange rounded-bl-xl" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-accent-orange rounded-br-xl" />

        {/* Certificate Header - 100% Transparent Logo */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-200 dark:border-slate-800 print:border-gray-300 pb-5 gap-4">
          <div className="flex items-center gap-3">
            <div className="relative h-14 sm:h-16 w-36 sm:w-48 flex items-center justify-center">
              <Image
                src="/images/logo.png"
                alt="ELMOSTKBALTECH Logo"
                width={200}
                height={65}
                className="object-contain max-h-full max-w-full drop-shadow-sm"
              />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white print:text-black">
                {language === 'ar' ? COMPANY_INFO.nameAr : COMPANY_INFO.nameEn}
              </h3>
              <p className="text-xs text-brand-700 dark:text-brand-300 print:text-gray-600 font-semibold">
                {t.officialAuthorizedAgent}
              </p>
            </div>
          </div>

          <div className="text-center sm:text-end">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider print:border-black print:text-black">
              {warranty.isRevoked ? t.warrantyStatusRevoked : t.warrantyStatusActive}
            </span>
            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 print:text-gray-600 mt-1">
              ID: {warranty.id}
            </div>
          </div>
        </div>

        {/* Certificate Details Table / Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 py-6 text-xs">
          
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 print:bg-gray-50 print:border-gray-200">
            <span className="text-slate-500 dark:text-slate-400 print:text-gray-500 block mb-1">{t.warrantyOwner}:</span>
            <strong className="text-slate-900 dark:text-white print:text-black text-sm">{warranty.customerName}</strong>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 print:bg-gray-50 print:border-gray-200">
            <span className="text-slate-500 dark:text-slate-400 print:text-gray-500 block mb-1">{t.warrantyPhone}:</span>
            <strong className="text-slate-900 dark:text-white print:text-black text-sm font-mono">{warranty.customerPhone}</strong>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 print:bg-gray-50 print:border-gray-200">
            <span className="text-slate-500 dark:text-slate-400 print:text-gray-500 block mb-1">{t.warrantyBrand}:</span>
            <strong className="text-accent-orange text-sm font-black">{warranty.brand}</strong>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 print:bg-gray-50 print:border-gray-200 sm:col-span-2">
            <span className="text-slate-500 dark:text-slate-400 print:text-gray-500 block mb-1">{t.warrantyModel}:</span>
            <strong className="text-slate-900 dark:text-white print:text-black text-sm">{warranty.modelName}</strong>
          </div>

          {warranty.serialNumber && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-brand-200 dark:border-brand-700/60 print:bg-gray-50 print:border-gray-200">
              <span className="text-brand-700 dark:text-brand-300 print:text-gray-500 block mb-1">{t.warrantySerial}:</span>
              <strong className="text-amber-600 dark:text-amber-400 print:text-black text-sm font-mono tracking-wider">
                {warranty.serialNumber}
              </strong>
            </div>
          )}

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 print:bg-gray-50 print:border-gray-200">
            <span className="text-slate-500 dark:text-slate-400 print:text-gray-500 block mb-1">{t.warrantyActivationDate}:</span>
            <strong className="text-slate-900 dark:text-white print:text-black text-sm font-mono">{warranty.activationDate.split('T')[0]}</strong>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 print:bg-gray-50 print:border-gray-200">
            <span className="text-slate-500 dark:text-slate-400 print:text-gray-500 block mb-1">{t.warrantyExpiryDate}:</span>
            <strong className="text-emerald-600 dark:text-emerald-400 print:text-black text-sm font-mono">{warranty.expiryDate.split('T')[0]}</strong>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 print:bg-gray-50 print:border-gray-200">
            <span className="text-slate-500 dark:text-slate-400 print:text-gray-500 block mb-1">{t.warrantyPurchaseDate}:</span>
            <strong className="text-slate-900 dark:text-white print:text-black text-sm font-mono">{warranty.purchaseDate}</strong>
          </div>

        </div>

        {/* Footer with QR Code & Official Stamp */}
        <div className="border-t border-slate-200 dark:border-slate-800 print:border-gray-300 pt-5 flex flex-col sm:flex-row items-center justify-between gap-6">
          
          {/* QR Code */}
          <div className="flex items-center gap-3">
            {warranty.qrCodeDataUrl ? (
              <img
                src={warranty.qrCodeDataUrl}
                alt="Verification QR"
                className="w-20 h-20 rounded-xl bg-white p-1 border border-slate-300 dark:border-slate-700 shadow-sm"
              />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400">
                <QrCode className="w-10 h-10" />
              </div>
            )}
            <div className="max-w-[200px]">
              <div className="text-xs font-bold text-slate-900 dark:text-white print:text-black">
                {language === 'ar' ? 'التحقق الإلكتروني السريع' : 'Instant Verification'}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 print:text-gray-600 mt-0.5">
                {t.qrCodeNotice}
              </div>
            </div>
          </div>

          {/* Official Agency Stamp */}
          <div className="relative border-2 border-brand-500/60 print:border-black rounded-2xl p-4 text-center bg-brand-50 dark:bg-brand-950/40 print:bg-transparent min-w-[220px]">
            <div className="text-xs font-black text-brand-800 dark:text-amber-400 print:text-black uppercase tracking-wider">
              {COMPANY_INFO.shortNameAr}
            </div>
            <div className="text-[10px] text-slate-700 dark:text-slate-300 print:text-gray-700 mt-1 font-bold">
              {t.officialStamp}
            </div>
            <div className="text-[9px] text-slate-500 dark:text-slate-400 print:text-gray-500 mt-1 font-mono">
              APPROVED & VERIFIED
            </div>
            <div className="w-8 h-8 rounded-full border border-dashed border-accent-orange/60 absolute -bottom-2 -left-2 flex items-center justify-center opacity-70">
              <CheckCircle2 className="w-4 h-4 text-accent-orange" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
