'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { BRANDS, WARRANTY_BRANDS } from '@/lib/mock-data';
import { Brand } from '@/types';
import { Shield, Sparkles, CheckCircle, ArrowRight, ArrowLeft, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroSection() {
  const { setActiveTab, selectedBrand, setSelectedBrand, setSelectedCategory, t, language } = useApp();

  const handleBrandSelect = (brandKey: Brand) => {
    setSelectedBrand(brandKey);
    setSelectedCategory('CAR_SCREENS');
    setActiveTab('activate');
  };

  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <section className="relative overflow-hidden py-10 sm:py-16 bg-gradient-to-b from-slate-100 via-white to-slate-100 dark:from-navy-950 dark:via-darkSurface dark:to-slate-950 transition-colors duration-300">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-96 bg-brand-500/10 dark:bg-brand-600/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-72 h-72 bg-accent-orange/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-accent-red/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Main Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-900/60 border border-brand-200 dark:border-brand-500/40 text-brand-700 dark:text-brand-300 text-xs sm:text-sm font-semibold mb-5 shadow-sm dark:shadow-glow-blue"
          >
            <Shield className="w-4 h-4 text-accent-orange" />
            <span>{t.heroBadge}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight tracking-tight mb-5"
          >
            {t.heroTitlePart1}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-brand-500 to-amber-500 dark:from-blue-400 dark:via-brand-400 dark:to-amber-400">
              {t.heroTitleHighlight}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto mb-8 font-normal"
          >
            {t.heroDescription}
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
          >
            <button
              onClick={() => {
                setActiveTab('activate');
              }}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-accent-red via-accent-orange to-amber-500 hover:from-accent-red/90 hover:to-amber-500/90 text-white font-bold text-sm sm:text-base shadow-glow-orange flex items-center justify-center gap-2.5 transition-all hover:scale-105"
            >
              <span>{t.heroBtnActivate}</span>
              <ArrowIcon className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveTab('contact')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white font-bold text-sm sm:text-base border border-slate-300 dark:border-slate-700 hover:border-brand-500 shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span>{language === 'ar' ? 'للتواصل والاستفسار' : 'Contact Support'}</span>
              <Sparkles className="w-4 h-4 text-brand-500" />
            </button>
          </motion.div>
        </div>

        {/* Brand Selection Cards */}
        <div>
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {t.selectBrandTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t.selectBrandSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {WARRANTY_BRANDS.map((brandKey, idx) => {
              const brand = BRANDS[brandKey];
              const isSelected = selectedBrand === brandKey;

              return (
                <motion.div
                  key={brand.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * idx }}
                  whileHover={{ y: -6 }}
                  onClick={() => handleBrandSelect(brandKey)}
                  className={`relative rounded-2xl p-6 transition-all duration-300 cursor-pointer overflow-hidden border shadow-sm hover:shadow-xl ${
                    isSelected
                      ? 'bg-white dark:bg-gradient-to-b dark:from-brand-950/90 dark:to-slate-900 border-brand-500 shadow-glow-blue'
                      : 'bg-white dark:bg-slate-900/70 hover:bg-slate-50 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600'
                  }`}
                >
                  {/* Subtle brand color glow at top */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1.5"
                    style={{ backgroundColor: brand.accentColor }}
                  />

                  {/* Brand header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg text-white shadow-md"
                        style={{
                          background: `linear-gradient(135deg, ${brand.accentColor} 0%, #0f172a 100%)`,
                        }}
                      >
                        {brand.id === 'AIWA' 
                          ? 'AI' 
                          : brand.id === 'TIGER' 
                          ? 'TG' 
                          : brand.id === 'A90_PRO' 
                          ? 'A90' 
                          : brand.id === 'DX' 
                          ? 'DX' 
                          : brand.id === 'ROCK_MUSIC' 
                          ? 'RM' 
                          : 'TL'}
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-wide">
                          {brand.name}
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-800 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                          {language === 'ar' ? 'وكيل معتمد' : 'Authorized'}
                        </span>
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300">
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Tagline & description */}
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-2">
                    {language === 'ar' ? brand.taglineAr : brand.taglineEn}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-5 line-clamp-3">
                    {language === 'ar' ? brand.descriptionAr : brand.descriptionEn}
                  </p>

                  {/* Categories Available */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-1.5">
                    {brand.categories.map((cat) => (
                      <span
                        key={cat}
                        className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60"
                      >
                        {cat === 'CAR_SCREENS'
                          ? language === 'ar' ? 'شاشات سيارات' : 'Car Screens'
                          : cat === 'DSP_PROCESSORS'
                          ? language === 'ar' ? 'معالجات DSP' : 'DSP Processors'
                          : language === 'ar' ? 'ليدات إضاءة' : 'LED Lights'}
                      </span>
                    ))}
                  </div>

                  {/* Action prompt */}
                  <div className="mt-5 flex items-center justify-between text-xs font-bold text-brand-600 dark:text-brand-400 group-hover:text-brand-700 dark:group-hover:text-white">
                    <span>{t.exploreCategories} {brand.name}</span>
                    <ArrowIcon className="w-4 h-4" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Feature Highlights / Trust Badges */}
        <div className="mt-14 pt-8 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 shadow-sm">
            <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              {language === 'ar' ? 'سيريال فحص الشحنات' : 'Verified Batch Serials'}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {language === 'ar' ? 'حماية من التقليد' : 'Anti-Counterfeit'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 shadow-sm">
            <CheckCircle className="w-5 h-5 text-accent-orange mx-auto mb-2" />
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              {language === 'ar' ? 'عداد تنازلي لحظي' : 'Live Warranty Counter'}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {language === 'ar' ? '365 يوماً للتغطية' : '365 Days Active'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 shadow-sm">
            <CheckCircle className="w-5 h-5 text-blue-500 mx-auto mb-2" />
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              {language === 'ar' ? 'تتبع الصيانة الفوري' : 'Live Ticket Tracking'}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {language === 'ar' ? '3 خطوات دقيقة' : '3 Precise Stages'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 shadow-sm">
            <CheckCircle className="w-5 h-5 text-amber-500 mx-auto mb-2" />
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              {language === 'ar' ? 'شهادة رقمية و QR' : 'Digital QR Certificate'}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {language === 'ar' ? 'معتمدة وموثقة' : 'Official Verification'}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
