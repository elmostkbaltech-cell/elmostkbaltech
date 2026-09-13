'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { 
  ShieldCheck, 
  PlusCircle, 
  LayoutDashboard, 
  Wrench, 
  PhoneCall, 
  Search, 
  Globe, 
  Sun, 
  Moon,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { 
    activeTab, 
    setActiveTab, 
    searchWarranty, 
    setCurrentWarranty, 
    language, 
    toggleLanguage, 
    theme, 
    toggleTheme, 
    t 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchMessage, setSearchMessage] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const result = searchWarranty(searchQuery);
    if (result) {
      setCurrentWarranty(result);
      setActiveTab('dashboard');
      setSearchMessage(null);
      setSearchQuery('');
      setIsSearchOpen(false);
      setMobileMenuOpen(false);
    } else {
      setSearchMessage(
        language === 'ar'
          ? 'لم يتم العثور على جهاز مسجل بهذا الرقم. يمكنك تفعيل جهازك الآن.'
          : 'No registered device found with this query. You can activate your warranty now.'
      );
      setTimeout(() => setSearchMessage(null), 3500);
    }
  };

  interface NavItem {
    id: 'home' | 'activate' | 'dashboard' | 'maintenance' | 'contact';
    label: string;
    icon: React.ElementType;
    highlight?: boolean;
  }

  const navItems: NavItem[] = [
    { id: 'activate', label: language === 'ar' ? 'تفعيل الضمان' : 'Activate Warranty', icon: PlusCircle, highlight: true },
    { id: 'dashboard', label: language === 'ar' ? 'استعلام عن ضمان / صيانة' : 'Lookup Warranty / Ticket', icon: LayoutDashboard },
    { id: 'maintenance', label: language === 'ar' ? 'متابعة الصيانة' : 'Track Maintenance', icon: Wrench },
    { id: 'contact', label: language === 'ar' ? 'للتواصل' : 'Contact Us', icon: PhoneCall },
  ];

  const handleTabClick = (id: 'home' | 'activate' | 'dashboard' | 'maintenance' | 'contact') => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full max-w-full overflow-hidden bg-white/95 dark:bg-[#070B13]/95 backdrop-blur-md border-b border-slate-200 dark:border-brand-800/40 shadow-sm dark:shadow-xl transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          
          {/* Brand Logo - 100% Transparent, compact & prominent, no overflow */}
          <div
            onClick={() => handleTabClick('home')}
            className="flex items-center gap-2 cursor-pointer select-none group shrink-0"
          >
            <div className="relative h-10 sm:h-12 w-28 sm:w-36 flex items-center justify-center transition-transform group-hover:scale-105">
              <Image
                src="/images/logo.png"
                alt="ELMOSTKBALTECH Logo"
                width={160}
                height={55}
                className="object-contain max-h-full max-w-full drop-shadow-sm"
                priority
              />
            </div>
            <div className="hidden xl:block text-start">
              <div className="text-xs font-black text-slate-900 dark:text-white tracking-tight leading-none flex items-center gap-1.5">
                <span>{language === 'ar' ? 'المستقبل تك' : 'El Mostaqbal Tech'}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-accent-red text-white font-bold">
                  {language === 'ar' ? 'وكيل معتمد' : 'Authorized'}
                </span>
              </div>
              <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-0.5 truncate max-w-[220px]">
                AIWA • TIGER • A90 PRO
              </div>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 xl:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-glow-blue scale-[1.02]'
                      : item.highlight
                      ? 'bg-accent-orange/10 dark:bg-gradient-to-r dark:from-accent-red/20 dark:to-accent-orange/20 text-accent-orange hover:bg-accent-orange/20 border border-accent-orange/40'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : item.highlight ? 'text-accent-orange' : 'text-brand-600 dark:text-brand-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Search & Controls (Theme, Language) */}
          <div className="flex items-center gap-1.5 shrink-0">
            
            {/* Desktop Quick Search Input - only on wide screens */}
            <form onSubmit={handleSearch} className="relative hidden 2xl:flex items-center w-48">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'ar' ? 'استعلام بالسيريال...' : 'Search serial...'}
                className="w-full bg-slate-100 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 focus:border-brand-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-xs rounded-xl py-1.5 px-2.5 pr-8 outline-none transition-colors"
              />
              <button
                type="submit"
                aria-label="Search"
                className={`absolute ${language === 'ar' ? 'left-1' : 'right-1'} p-1 rounded-lg bg-brand-600 hover:bg-brand-500 text-white transition-colors`}
              >
                <Search className="w-3 h-3" />
              </button>
            </form>

            {/* Quick search popup icon */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="2xl:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              aria-label="Toggle Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Theme Toggle Component */}
            <ThemeToggle />

            {/* Language Switcher Button */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-sm"
              title="Switch Language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{t.switchLanguage}</span>
            </button>

            {/* Admin Portal Link */}
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-bold transition-all shadow-sm shrink-0"
              title="لوحة الإدارة الداخلية"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden md:inline">{language === 'ar' ? 'لوحة الإدارة' : 'Admin'}</span>
            </Link>

            {/* Mobile / Tablet Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors"
              aria-label="Open Mobile Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

          </div>

        </div>

        {/* Search Popup Dropdown */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="py-2.5 pb-3 border-t border-slate-200 dark:border-slate-800 2xl:hidden overflow-hidden"
            >
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'ar' ? 'أدخل السيريال أو الهاتف...' : 'Enter serial or phone...'}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl py-2 px-3 outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold shrink-0"
                >
                  {t.searchButton}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Result Feedback */}
        {searchMessage && (
          <div className="py-2 px-3 mb-2 bg-amber-50 dark:bg-amber-950/90 border border-amber-300 dark:border-amber-600/60 rounded-xl text-xs text-amber-800 dark:text-amber-200 text-center font-medium">
            {searchMessage}
          </div>
        )}

        {/* Mobile / Tablet Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden py-3 border-t border-slate-200 dark:border-slate-800 space-y-1.5 overflow-hidden"
            >
              <button
                onClick={() => handleTabClick('home')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold ${
                  activeTab === 'home' 
                    ? 'bg-brand-600 text-white' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <span>{t.navHome}</span>
              </button>

              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-glow-blue'
                        : item.highlight
                        ? 'bg-accent-orange/10 text-accent-orange border border-accent-orange/30'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </header>
  );
}
