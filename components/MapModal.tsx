'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { COMPANY_INFO } from '@/lib/mock-data';
import { MapPin, X, ExternalLink, Phone, MessageCircle, Clock, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MapModal() {
  const { isMapModalOpen, setIsMapModalOpen, language, t } = useApp();

  if (!isMapModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsMapModalOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-3xl bg-slate-900 border border-brand-500/40 rounded-2xl shadow-2xl overflow-hidden z-10 text-slate-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-accent-orange/20 text-accent-orange">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {t.ourLocation}
                </h3>
                <p className="text-xs text-brand-300">
                  {language === 'ar' ? COMPANY_INFO.nameAr : COMPANY_INFO.nameEn}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsMapModalOpen(false)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Address Banner */}
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-accent-orange text-xs font-semibold">
                  <Navigation className="w-4 h-4" />
                  <span>{language === 'ar' ? 'العنوان التفصيلي:' : 'Detailed Address:'}</span>
                </div>
                <p className="text-sm font-medium text-slate-200 leading-relaxed">
                  {language === 'ar' ? COMPANY_INFO.addressAr : COMPANY_INFO.addressEn}
                </p>
              </div>

              <a
                href={COMPANY_INFO.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-gradient-to-r from-accent-red to-accent-orange hover:opacity-95 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-glow-orange shrink-0"
              >
                <span>{t.directionsOnGoogleMaps}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Google Map Interactive Container */}
            <div className="relative w-full h-72 sm:h-80 rounded-xl overflow-hidden border border-slate-700 shadow-inner bg-slate-950">
              <iframe
                title="El Mostaqbal Tech Location"
                src="https://maps.google.com/maps?q=30.054483,31.242488&z=17&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full opacity-90 hover:opacity-100 transition-opacity"
              />
              <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-brand-500/40 text-xs font-bold text-white shadow-lg flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span>AIWA & TIGER Store - سوق التوفيقية</span>
              </div>
            </div>

            {/* Quick Contact & Hours */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <div className="p-2.5 rounded-lg bg-brand-600/30 text-brand-400">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">
                    {language === 'ar' ? 'الاتصال المباشر / واتساب:' : 'Direct Call / WhatsApp:'}
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold text-white mt-0.5">
                    {COMPANY_INFO.phones.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <a href={p.tel} className="hover:text-accent-orange">{p.display}</a>
                        <a href={p.wa} target="_blank" rel="noopener noreferrer" className="text-emerald-400">
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">{t.workingHours}:</div>
                  <div className="text-xs font-semibold text-slate-200 mt-0.5">
                    {language === 'ar' ? COMPANY_INFO.workingHoursAr : COMPANY_INFO.workingHoursEn}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex justify-end">
            <button
              onClick={() => setIsMapModalOpen(false)}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
            >
              {t.close}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
