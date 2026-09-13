'use client';

import React from 'react';
import Image from 'next/image';
import { useApp } from '@/context/AppContext';
import { COMPANY_INFO } from '@/lib/mock-data';
import { Phone, MessageCircle, MapPin, Globe, Moon, Sun, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TopBanner() {
  const { language, toggleLanguage, theme, toggleTheme, setIsMapModalOpen, t } = useApp();

  return (
    <header className="relative bg-gradient-to-r from-navy-950 via-brand-950 to-navy-900 border-b border-brand-800/40 text-slate-100 shadow-xl z-30 transition-colors duration-300">
      {/* Top micro announcement bar */}
      <div className="bg-brand-900/60 border-b border-white/5 py-1 px-4 text-xs font-medium">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-brand-200">
            <span className="inline-block w-2 h-2 rounded-full bg-accent-orange animate-ping" />
            <span className="font-semibold text-white">
              {language === 'ar' ? 'الوكيل المعتمد والموزع الحصري:' : 'Authorized Agent & Sole Distributor:'}
            </span>
            <span className="text-amber-400 font-bold tracking-wider">AIWA • TIGER • A90 PRO</span>
          </div>

          <div className="flex items-center gap-4 text-slate-300 text-xs">
            <div className="hidden md:flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-accent-orange" />
              <span>{t.workHoursTime}</span>
            </div>
            <div className="flex items-center gap-3">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle Theme"
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 hover:bg-white/20 transition-all text-xs text-amber-300 font-medium"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
                    <span>{t.themeLight}</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-blue-300" />
                    <span>{t.themeDark}</span>
                  </>
                )}
              </button>

              {/* Language Switcher */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-600/60 hover:bg-brand-500 transition-all text-xs font-bold text-white border border-brand-400/30"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{t.switchLanguage}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Banner Header */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* Logo & Company Title */}
          <div className="flex items-center gap-3 sm:gap-4 w-full lg:w-auto justify-between lg:justify-start">
            <motion.div 
              whileHover={{ scale: 1.03 }}
              className="relative flex items-center gap-3 cursor-pointer"
            >
              {/* Company Logo Image */}
              <div className="relative h-14 sm:h-16 w-36 sm:w-44 bg-slate-900/60 rounded-xl p-1.5 border border-brand-500/30 shadow-glow-blue flex items-center justify-center backdrop-blur-sm">
                <Image
                  src="/images/logo.png"
                  alt="ELMOSTKBALTECH Logo"
                  width={180}
                  height={60}
                  className="object-contain max-h-full max-w-full drop-shadow-md"
                  priority
                />
              </div>

              <div>
                <h1 className="text-base sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <span>{language === 'ar' ? COMPANY_INFO.shortNameAr : COMPANY_INFO.shortNameEn}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-accent-red/90 text-white tracking-normal">
                    {language === 'ar' ? 'استيراد وتصدير' : 'Import & Export'}
                  </span>
                </h1>
                <p className="text-xs text-brand-300 hidden sm:block">
                  {language === 'ar' ? COMPANY_INFO.nameAr : COMPANY_INFO.nameEn}
                </p>
                <p className="text-[11px] text-amber-400/90 font-medium">
                  {t.portalName}
                </p>
              </div>
            </motion.div>

            {/* Mobile Actions: Call & Map Quick Buttons */}
            <div className="flex lg:hidden items-center gap-2">
              <a
                href={COMPANY_INFO.phones[0].wa}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-emerald-600/80 hover:bg-emerald-500 text-white"
                title="WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <button
                onClick={() => setIsMapModalOpen(true)}
                className="p-2 rounded-lg bg-brand-600/80 hover:bg-brand-500 text-white"
                title="Location"
              >
                <MapPin className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Contact Numbers & Location (Desktop) */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6">
            
            {/* Phone Numbers Group */}
            <div className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-xl border border-brand-700/40 backdrop-blur-sm">
              <div className="p-2 rounded-lg bg-brand-600 text-white shadow-md">
                <Phone className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <div className="text-slate-400 font-semibold mb-0.5">
                  {language === 'ar' ? 'أرقام التواصل المباشر:' : 'Direct Contact Lines:'}
                </div>
                <div className="flex items-center gap-3 font-mono font-bold text-sm text-white">
                  {COMPANY_INFO.phones.map((p, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <a 
                        href={p.tel} 
                        className="hover:text-accent-orange transition-colors underline decoration-dotted"
                      >
                        {p.display}
                      </a>
                      <a
                        href={p.wa}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 p-0.5 transition-transform hover:scale-110"
                        title={t.whatsappChat}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                      {idx === 0 && <span className="text-slate-600">|</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Location & Map Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsMapModalOpen(true)}
              className="flex items-center gap-2.5 bg-gradient-to-r from-accent-red to-accent-orange hover:from-accent-red/90 hover:to-accent-orange/90 text-white px-3.5 py-2.5 rounded-xl shadow-glow-orange font-semibold text-xs transition-all cursor-pointer text-start"
            >
              <div className="p-1.5 rounded-lg bg-white/20">
                <MapPin className="w-4 h-4 text-white animate-bounce" />
              </div>
              <div>
                <div className="font-bold text-white text-xs">{t.viewLocationOnMap}</div>
                <div className="text-[10px] text-white/90 truncate max-w-[200px]">
                  {language === 'ar' ? 'سوق التوفيقية - وسط البلد' : 'Tawfiqiyya Market, Cairo'}
                </div>
              </div>
            </motion.button>

          </div>

        </div>
      </div>
    </header>
  );
}
