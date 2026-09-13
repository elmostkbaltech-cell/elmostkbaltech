'use client';

import React, { useState, useEffect } from 'react';
import { calculateRemainingTime, RemainingTime } from '@/lib/utils';
import { useApp } from '@/context/AppContext';
import { Clock, AlertTriangle, ShieldCheck, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

interface CountdownTimerProps {
  expiryDate: string;
  isRevoked?: boolean;
}

export default function CountdownTimer({ expiryDate, isRevoked }: CountdownTimerProps) {
  const { t, language } = useApp();
  const [remaining, setRemaining] = useState<RemainingTime>(() => calculateRemainingTime(expiryDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(calculateRemainingTime(expiryDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [expiryDate]);

  if (isRevoked) {
    return null;
  }

  // Determine dynamic styling based on near expiry or expired
  const isAlertRed = remaining.isNearExpiry || remaining.isExpired;

  const unitBoxes = [
    { label: t.days, value: remaining.days, highlight: true },
    { label: t.hours, value: remaining.hours, highlight: false },
    { label: t.minutes, value: remaining.minutes, highlight: false },
    { label: t.seconds, value: remaining.seconds, highlight: false },
  ];

  return (
    <div
      className={`rounded-2xl p-6 transition-all duration-500 border ${
        isAlertRed
          ? 'bg-gradient-to-br from-red-950/70 via-slate-900 to-red-950/40 border-red-500/60 shadow-glow-red'
          : 'bg-gradient-to-br from-brand-950/70 via-slate-900 to-amber-950/30 border-brand-500/50 shadow-glow-blue'
      }`}
    >
      {/* Top status bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2.5 rounded-xl ${
              isAlertRed ? 'bg-red-600 text-white animate-pulse' : 'bg-brand-600 text-white shadow-md'
            }`}
          >
            {isAlertRed ? <AlertTriangle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
          </div>
          <div>
            <h4 className="text-base font-black text-white">
              {t.countdownTitle}
            </h4>
            <p className="text-xs text-slate-400">
              {t.countdownSubtitle}
            </p>
          </div>
        </div>

        {/* Dynamic Badge */}
        <div>
          {isAlertRed ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold shadow-glow-red animate-pulse">
              <Flame className="w-3.5 h-3.5" />
              <span>{t.warrantyExpiringAlert}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-600/60 border border-brand-400 text-brand-200 text-xs font-bold shadow-glow-blue">
              <ShieldCheck className="w-3.5 h-3.5 text-accent-orange" />
              <span>{t.warrantyRemainingBadge}</span>
            </span>
          )}
        </div>
      </div>

      {/* Countdown Digits Flip/Card Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {unitBoxes.map((unit, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.03 }}
            className={`relative rounded-xl p-4 text-center overflow-hidden border backdrop-blur-sm ${
              isAlertRed
                ? 'bg-slate-950/90 border-red-500/40'
                : 'bg-slate-950/90 border-slate-700/80 hover:border-brand-500'
            }`}
          >
            {/* Top glass reflection line */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div
              className={`font-mono text-3xl sm:text-4xl md:text-5xl font-black tracking-wider transition-colors ${
                isAlertRed
                  ? 'text-red-400 drop-shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                  : unit.highlight
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-accent-orange drop-shadow-[0_0_12px_rgba(249,115,22,0.4)]'
                  : 'text-white'
              }`}
            >
              {String(unit.value).padStart(2, '0')}
            </div>

            <div className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-wide">
              {unit.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Expiry Date Notice Footer */}
      <div className="mt-5 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
        <span>
          {language === 'ar' ? 'تاريخ انتهاء التغطية الرسمية:' : 'Official Expiry Date:'}{' '}
          <strong className="text-white font-mono">{expiryDate.split('T')[0]}</strong>
        </span>
        <span className="text-[11px] text-amber-400 font-medium">
          {language === 'ar'
            ? 'يشمل قطع الغيار الأصلية والدعم الفني بالفرع'
            : 'Covers genuine parts & branch technical labor'}
        </span>
      </div>
    </div>
  );
}
