'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`w-9 h-9 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-center ${className}`}
      />
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      title={isDark ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي'}
      aria-label={isDark ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي'}
      className={`p-2 rounded-xl transition-all flex items-center justify-center ${
        isDark
          ? 'bg-slate-800/80 hover:bg-slate-700 text-amber-300 border border-slate-700/80 hover:border-amber-400/40 shadow-sm'
          : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 hover:border-slate-400 shadow-sm'
      } ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 transition-transform hover:rotate-45 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 transition-transform hover:-rotate-12 text-slate-700" />
      )}
    </button>
  );
}
