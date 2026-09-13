'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { AlertOctagon, PhoneCall, ShieldAlert, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

interface RevokedWarrantyBannerProps {
  reason?: string;
  serialNumber?: string;
  modelName: string;
}

export default function RevokedWarrantyBanner({ reason, serialNumber, modelName }: RevokedWarrantyBannerProps) {
  const { t, language } = useApp();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-red-950/90 via-slate-900 to-zinc-950 border-2 border-red-600/80 shadow-glow-red text-white space-y-6"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-lg animate-pulse">
          <AlertOctagon className="w-9 h-9" />
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-red-900/60 border border-red-500 text-red-300 text-xs font-bold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'إشعار إداري من الوكيل المعتمد' : 'Authorized Agent Administrative Notice'}</span>
          </div>
          <h3 className="text-lg sm:text-2xl font-black text-red-200">
            {language === 'ar'
              ? 'عفواً، انتهت فترة دعم وضمان هذا الموديل/الشحنة من قبل الوكيل المعتمد'
              : 'Notice: Support & warranty period for this model/shipment has ended by the authorized agent'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300">
            {reason || (language === 'ar' 
              ? 'تم إيقاف الدعم الفني وتغطية الضمان لهذا الإصدار من قبل الإدارة المركزية لشركة المستقبل تك نظراً لانتهاء دورة حياة الشحنة المعتمدة.'
              : 'Technical coverage and warranty service for this specific batch have been concluded in accordance with authorized agency lifecycle policy.')}
          </p>
        </div>
      </div>

      {/* Model & Serial Details */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-red-900/50 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <span className="text-slate-400">{language === 'ar' ? 'الموديل المشمول بالقرار:' : 'Affected Model:'}</span>{' '}
          <strong className="text-white font-mono">{modelName}</strong>
        </div>
        {serialNumber && (
          <div>
            <span className="text-slate-400">{language === 'ar' ? 'الرقم المسلسلي:' : 'Serial Number:'}</span>{' '}
            <strong className="text-red-400 font-mono">{serialNumber}</strong>
          </div>
        )}
      </div>

      {/* Contact Support for Upgrade or Renewal */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="text-xs text-slate-300">
          {language === 'ar'
            ? 'يمكنك استبدال الجهاز أو الاستفادة من خصم الترقية للموديلات الأحدث بزيارة فرع التوفيقية.'
            : 'You may trade-in your device or receive exclusive upgrade discounts at our Tawfiqiyya branch.'}
        </div>

        <a
          href="tel:+201128474862"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition-colors shrink-0"
        >
          <PhoneCall className="w-4 h-4" />
          <span>{language === 'ar' ? 'الاتصال بخدمة العملاء' : 'Contact Support'}</span>
        </a>
      </div>
    </motion.div>
  );
}
