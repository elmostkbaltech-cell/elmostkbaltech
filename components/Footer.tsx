'use client';

import React from 'react';
import Image from 'next/image';
import { useApp } from '@/context/AppContext';
import { COMPANY_INFO } from '@/lib/mock-data';
import { Phone, MessageCircle, MapPin, Clock, ShieldCheck, ExternalLink } from 'lucide-react';

export default function Footer() {
  const { language, t, setActiveTab, setIsMapModalOpen } = useApp();

  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-300 pt-12 pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Col 1: About & Logo (100% Transparent, no box) */}
          <div className="space-y-4">
            <div className="relative h-14 sm:h-16 w-44 flex items-center">
              <Image
                src="/images/logo.png"
                alt="ELMOSTKBALTECH"
                width={200}
                height={65}
                className="object-contain max-h-full max-w-full drop-shadow-sm"
              />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t.footerAbout}
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <ShieldCheck className="w-4 h-4 text-accent-orange" />
              <span>{t.officialAuthorizedAgent}</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
              {t.footerQuickLinks}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setActiveTab('home')}
                  className="hover:text-accent-orange transition-colors"
                >
                  {t.navHome}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('activate')}
                  className="hover:text-accent-orange transition-colors"
                >
                  {t.navActivate}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="hover:text-accent-orange transition-colors"
                >
                  {t.navLookup}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('maintenance')}
                  className="hover:text-accent-orange transition-colors"
                >
                  {t.navMaintenance}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('contact')}
                  className="hover:text-accent-orange transition-colors"
                >
                  {language === 'ar' ? 'للتواصل' : 'Contact Us'}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact & Direct Calls */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
              {language === 'ar' ? 'أرقام التواصل وخدمة العملاء' : 'Contact & Customer Care'}
            </h4>
            <div className="space-y-2 text-xs">
              {COMPANY_INFO.phones.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-brand-400" />
                    <a href={p.tel} className="font-mono font-bold text-slate-200 hover:text-accent-orange">
                      {p.display}
                    </a>
                  </div>
                  <a
                    href={p.wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded bg-emerald-600/30 text-emerald-400 hover:bg-emerald-600/50"
                    title={t.whatsappChat}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}

              <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                <Clock className="w-3.5 h-3.5 text-accent-orange" />
                <span>{language === 'ar' ? COMPANY_INFO.workingHoursAr : COMPANY_INFO.workingHoursEn}</span>
              </div>
            </div>
          </div>

          {/* Col 4: Location & Address */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
              {t.ourLocation}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {language === 'ar' ? COMPANY_INFO.addressAr : COMPANY_INFO.addressEn}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setActiveTab('contact')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-700/80 hover:bg-brand-600 text-white text-xs font-bold transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-accent-orange" />
                <span>{language === 'ar' ? 'صفحة التواصل والخريطة' : 'Contact & Map'}</span>
              </button>

              <a
                href={COMPANY_INFO.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Google Maps"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>{t.footerRights}</div>
          <div className="text-brand-400 font-semibold">{t.madeWithExcellence}</div>
        </div>
      </div>
    </footer>
  );
}
