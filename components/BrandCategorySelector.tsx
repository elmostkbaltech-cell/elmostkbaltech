'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { BRANDS, CATEGORIES, WARRANTY_BRANDS } from '@/lib/mock-data';
import { Brand, ProductCategory } from '@/types';
import { Monitor, Sliders, Zap, Speaker, Check, AlertTriangle, Info } from 'lucide-react';

export default function BrandCategorySelector() {
  const {
    selectedBrand,
    setSelectedBrand,
    selectedCategory,
    setSelectedCategory,
    selectedSubModel,
    setSelectedSubModel,
    t,
    language,
  } = useApp();

  const brand = BRANDS[selectedBrand];
  const availableCategories = brand.categories;

  const handleBrandChange = (b: Brand) => {
    setSelectedBrand(b);
    const brandCats = BRANDS[b].categories;
    if (!brandCats.includes(selectedCategory)) {
      setSelectedCategory(brandCats[0]);
    }
    // Set default sub-model
    if (b === 'AIWA') {
      setSelectedSubModel('9 بوصه');
    } else if (b === 'TIGER') {
      setSelectedSubModel('9 بوصه');
    } else {
      setSelectedSubModel('');
    }
  };

  const getCategoryIcon = (cat: ProductCategory) => {
    switch (cat) {
      case 'CAR_SCREENS':
        return Monitor;
      case 'LED_LIGHTS':
        return Zap;
      case 'DSP_PROCESSORS':
        return Sliders;
      case 'SOUND_SYSTEMS':
        return Speaker;
      default:
        return Monitor;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Warranty Eligible Brands (TIGER, AIWA, A90 PRO only) */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            {language === 'ar' ? 'العلامة التجارية المعتمدة للضمان:' : 'Authorized Warranty Brand:'}
          </label>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {WARRANTY_BRANDS.map((brandKey) => {
            const b = BRANDS[brandKey];
            const isSelected = selectedBrand === brandKey;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => handleBrandChange(brandKey)}
                className={`relative flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-xl font-bold text-xs transition-all border ${
                  isSelected
                    ? 'bg-brand-600 text-white border-brand-400 shadow-glow-blue scale-[1.03]'
                    : 'bg-slate-50 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-orange" />
                )}
                <span className="text-sm sm:text-base font-black tracking-wide">
                  {language === 'ar'
                    ? (b.id === 'AIWA' ? 'أيوا' : b.id === 'TIGER' ? 'تايجر' : 'A90 برو')
                    : b.name}
                </span>
                <span className={`text-[10px] mt-1 font-semibold ${isSelected ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                  {b.id === 'AIWA'
                    ? (language === 'ar' ? 'شاشات دايموند و 9 بوصة' : 'Diamond & 9 Inch Screens')
                    : b.id === 'TIGER'
                    ? (language === 'ar' ? 'شاشات 9 بوصة و 7 بوصة' : '9 Inch & 7 Inch Screens')
                    : (language === 'ar' ? 'ليدات إضاءة السيارات' : 'Automotive LED Lights')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Sub-Model Options for AIWA and TIGER Screens */}
      {selectedBrand === 'AIWA' && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3">
          <label className="block text-xs font-black text-slate-800 dark:text-slate-200">
            {language === 'ar' ? 'اختيارات موديل شاشات أيوا:' : 'AIWA Screen Model Selection:'}
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'دايموند', labelAr: 'سلسلة دايموند', labelEn: 'Diamond Series', subAr: 'سيريال + فاتورة + كرت ضمان', subEn: 'Serial + Invoice + Warranty Card' },
              { id: '9 بوصه', labelAr: 'سلسلة 9 بوصة', labelEn: '9 Inch Series', subAr: 'سيريال + فاتورة + كرت ضمان', subEn: 'Serial + Invoice + Warranty Card' },
            ].map((opt) => {
              const isSelected = selectedSubModel === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedSubModel(opt.id)}
                  className={`p-3 rounded-xl text-center font-bold text-xs sm:text-sm border transition-all ${
                    isSelected
                      ? 'bg-accent-orange text-white border-accent-orange shadow-glow-orange'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                  }`}
                >
                  <div>{language === 'ar' ? opt.labelAr : opt.labelEn}</div>
                  <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-orange-100' : 'text-slate-500'}`}>
                    {language === 'ar' ? opt.subAr : opt.subEn}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Warning Note for AIWA */}
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-600/60 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <span>{t.warnWarrantyCardDate}</span>
          </div>
        </div>
      )}

      {selectedBrand === 'TIGER' && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3">
          <label className="block text-xs font-black text-slate-800 dark:text-slate-200">
            {language === 'ar' ? 'اختيارات موديل شاشات تايجر:' : 'TIGER Screen Model Selection:'}
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: '9 بوصه', labelAr: 'شاشات 9 بوصة', labelEn: '9 Inch Screens', subAr: 'سيريال + فاتورة + كرت ضمان', subEn: 'Serial + Invoice + Warranty Card' },
              { id: '7 بوصه', labelAr: 'شاشات 7 بوصة', labelEn: '7 Inch Screens', subAr: 'فاتورة فقط (سوفت وير)', subEn: 'Invoice only (Software Warranty)' },
            ].map((opt) => {
              const isSelected = selectedSubModel === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedSubModel(opt.id)}
                  className={`p-3 rounded-xl text-center font-bold text-xs sm:text-sm border transition-all ${
                    isSelected
                      ? 'bg-accent-orange text-white border-accent-orange shadow-glow-orange'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                  }`}
                >
                  <div>{language === 'ar' ? opt.labelAr : opt.labelEn}</div>
                  <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-orange-100' : 'text-slate-500'}`}>
                    {language === 'ar' ? opt.subAr : opt.subEn}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Conditional Warning Notes for TIGER */}
          {selectedSubModel === '9 بوصه' ? (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-600/60 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>{t.warnWarrantyCardDate}</span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-300 dark:border-blue-600/60 flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-200 font-bold">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <span>{t.warnTiger7SoftwareOnly}</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-600/60 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span>{t.warnInvoiceDate}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedBrand === 'A90_PRO' && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-600/60 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200 font-bold">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <span>{t.warnInvoiceDate}</span>
        </div>
      )}

      {/* 3. Category Selector */}
      {availableCategories.length > 1 && (
        <div>
          <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2.5">
            {t.selectedCategoryLabel}:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableCategories.map((catKey) => {
              const cat = CATEGORIES[catKey];
              const isSelected = selectedCategory === catKey;
              const Icon = getCategoryIcon(catKey);

              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => setSelectedCategory(catKey)}
                  className={`p-3.5 rounded-xl text-start transition-all border flex items-center gap-3 ${
                    isSelected
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-accent-orange shadow-sm'
                      : 'bg-white dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-accent-orange text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {language === 'ar' ? cat.nameAr : cat.nameEn}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="mr-auto ml-1 p-1 rounded-full bg-accent-orange text-white">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
