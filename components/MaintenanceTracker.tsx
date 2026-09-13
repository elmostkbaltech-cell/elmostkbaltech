'use client';

import React, { useState } from 'react';
import { MaintenanceStep, MaintenanceTicket } from '@/types';
import { useApp } from '@/context/AppContext';
import { Truck, Wrench, CheckCircle, Clock, AlertCircle, MapPin, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface MaintenanceTrackerProps {
  ticket?: MaintenanceTicket;
  deviceModel: string;
}

export default function MaintenanceTracker({ ticket: initialTicket, deviceModel }: MaintenanceTrackerProps) {
  const { t, language, setIsMapModalOpen } = useApp();
  const [ticket, setTicket] = useState<MaintenanceTicket | undefined>(initialTicket);

  // If no ticket, allow user to create a simulated maintenance ticket
  const handleCreateTicket = () => {
    const newTicket: MaintenanceTicket = {
      ticketId: `TCK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      currentStep: 'IN_TRANSIT',
      deviceDescription: deviceModel,
      issueDescription: language === 'ar' ? 'فحص دوري للشاشة والصوت وتحديث النظام' : 'Routine system inspection and firmware update',
      reportedDate: new Date().toISOString().split('T')[0],
      lastUpdate: language === 'ar' ? 'اليوم - تم استلام الجهاز بالفرع' : 'Today - Received at Branch',
      branchName: language === 'ar' ? 'مول سنتر التوفيقية التجاري - الدور الثاني - محل AIWA & TIGER' : 'Tawfiqiyya Mall - 2nd Floor - AIWA & TIGER Store',
      technicianNotes: language === 'ar' ? 'تم الفحص المبدئي وجاري تجهيز الشحن للمركز الفني' : 'Initial check passed, preparing transit to tech hub',
    };
    setTicket(newTicket);
  };

  const stepsConfig: { step: MaintenanceStep; title: string; desc: string; icon: React.ElementType }[] = [
    {
      step: 'IN_TRANSIT',
      title: t.step1Title,
      desc: t.step1Desc,
      icon: Truck,
    },
    {
      step: 'UNDER_MAINTENANCE',
      title: t.step2Title,
      desc: t.step2Desc,
      icon: Wrench,
    },
    {
      step: 'READY_FOR_PICKUP',
      title: t.step3Title,
      desc: t.step3Desc,
      icon: CheckCircle,
    },
  ];

  const getStepIndex = (step: MaintenanceStep) => {
    switch (step) {
      case 'IN_TRANSIT':
        return 0;
      case 'UNDER_MAINTENANCE':
        return 1;
      case 'READY_FOR_PICKUP':
        return 2;
      default:
        return 0;
    }
  };

  const currentStepIndex = ticket ? getStepIndex(ticket.currentStep) : -1;

  // Simulator helper to test all 3 steps live
  const changeSimulatedStep = (newStep: MaintenanceStep) => {
    if (!ticket) return;
    setTicket({
      ...ticket,
      currentStep: newStep,
      lastUpdate: new Date().toLocaleTimeString(),
      technicianNotes:
        newStep === 'READY_FOR_PICKUP'
          ? language === 'ar'
            ? 'تمت صيانة الجهاز واختباره بنجاح. جاهز للتسليم الآن بالفرع.'
            : 'Device repaired and QA tested successfully. Ready for pickup.'
          : newStep === 'UNDER_MAINTENANCE'
          ? language === 'ar'
            ? 'جاري تغيير القطعة المطلوبة وإعادة برمجة السوفت وير.'
            : 'Replacing internal components and flashing original ROM.'
          : language === 'ar'
          ? 'تم شحن الجهاز وفي طريقه لمركز الضمان.'
          : 'Device routed to warranty technical center.',
    });
  };

  if (!ticket) {
    return (
      <div className="rounded-2xl p-6 sm:p-8 bg-slate-900/80 border border-slate-800 text-center">
        <div className="w-14 h-14 rounded-2xl bg-brand-900/40 border border-brand-700/50 text-brand-400 flex items-center justify-center mx-auto mb-4">
          <Wrench className="w-7 h-7" />
        </div>
        <h4 className="text-lg font-bold text-white mb-2">
          {t.maintenanceTrackerTitle}
        </h4>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-6">
          {t.noActiveTicket}
        </p>
        <button
          onClick={handleCreateTicket}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-blue-500 hover:from-brand-500 hover:to-blue-400 text-white font-bold text-xs sm:text-sm shadow-glow-blue transition-all"
        >
          {t.requestMaintenanceBtn}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6 sm:p-8 bg-slate-900/90 border border-slate-800 shadow-xl space-y-8">
      {/* Header with ticket # */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-orange animate-ping" />
            <span className="text-xs font-bold text-accent-orange uppercase tracking-wider">
              {t.ticketNumber}: {ticket.ticketId}
            </span>
          </div>
          <h4 className="text-lg sm:text-xl font-black text-white mt-1">
            {t.maintenanceTrackerTitle}
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            {t.maintenanceTrackerSubtitle}
          </p>
        </div>

        {/* Step simulator controls for testing */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 font-bold px-1.5">
            {language === 'ar' ? 'محاكاة المرحلة:' : 'Simulate:'}
          </span>
          <button
            onClick={() => changeSimulatedStep('IN_TRANSIT')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
              ticket.currentStep === 'IN_TRANSIT' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            1
          </button>
          <button
            onClick={() => changeSimulatedStep('UNDER_MAINTENANCE')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
              ticket.currentStep === 'UNDER_MAINTENANCE' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            2
          </button>
          <button
            onClick={() => changeSimulatedStep('READY_FOR_PICKUP')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
              ticket.currentStep === 'READY_FOR_PICKUP' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            3
          </button>
        </div>
      </div>

      {/* 3-Step Progress Bar */}
      <div className="relative">
        {/* Connecting Progress Line */}
        <div className="hidden md:block absolute top-1/2 left-16 right-16 -translate-y-1/2 h-1 bg-slate-800 z-0">
          <div
            className="h-full bg-gradient-to-r from-brand-500 via-amber-500 to-emerald-500 transition-all duration-700"
            style={{
              width: currentStepIndex === 0 ? '0%' : currentStepIndex === 1 ? '50%' : '100%',
            }}
          />
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {stepsConfig.map((item, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const isPending = idx > currentStepIndex;
            const StepIcon = item.icon;

            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className={`relative rounded-2xl p-5 border transition-all ${
                  isCurrent
                    ? 'bg-slate-950 border-accent-orange shadow-glow-orange ring-1 ring-accent-orange/40'
                    : isCompleted
                    ? 'bg-slate-950/80 border-emerald-500/50'
                    : 'bg-slate-950/40 border-slate-800/80 opacity-60'
                }`}
              >
                {/* Step indicator circle */}
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base transition-all ${
                      isCurrent
                        ? 'bg-gradient-to-br from-accent-red to-accent-orange text-white shadow-glow-orange animate-pulse'
                        : isCompleted
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    <StepIcon className="w-6 h-6" />
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                      isCurrent
                        ? 'bg-accent-orange/20 text-accent-orange border border-accent-orange/40 animate-pulse'
                        : isCompleted
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isCurrent
                      ? language === 'ar' ? 'قيد التنفيذ الآن' : 'In Progress'
                      : isCompleted
                      ? language === 'ar' ? 'مكتمل بنجاح' : 'Completed'
                      : language === 'ar' ? 'المرحلة التالية' : 'Upcoming'}
                  </span>
                </div>

                <h5 className="text-sm sm:text-base font-black text-white mb-1.5">
                  {item.title}
                </h5>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Ticket Info & Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-brand-400">
            <AlertCircle className="w-4 h-4" />
            <span>{t.reportedIssue}:</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200">
            {ticket.issueDescription}
          </p>
          <div className="text-[11px] text-slate-500 font-mono pt-1">
            {language === 'ar' ? 'تاريخ البلاغ:' : 'Reported on:'} {ticket.reportedDate}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <Clock className="w-4 h-4" />
            <span>{t.technicianNotes}:</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200">
            {ticket.technicianNotes || (language === 'ar' ? 'جاري الفحص من قبل الفريق الفني' : 'Under technical inspection')}
          </p>
          <div className="text-[11px] text-slate-500 pt-1">
            {t.lastUpdated}: <strong className="text-slate-300">{ticket.lastUpdate}</strong>
          </div>
        </div>
      </div>

      {/* Pickup Branch Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-brand-950/80 to-slate-900 border border-brand-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-600/30 text-brand-400">
            <MapPin className="w-5 h-5 text-accent-orange" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-bold">{t.pickupBranch}:</div>
            <div className="text-xs sm:text-sm font-semibold text-white mt-0.5">
              {ticket.branchName}
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsMapModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-bold text-white transition-colors shrink-0"
        >
          {t.viewLocationOnMap}
        </button>
      </div>
    </div>
  );
}
