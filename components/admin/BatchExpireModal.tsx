'use client';

import React, { useState } from 'react';
import { Shipment } from '@/types/admin';
import { useAdmin } from '@/context/AdminContext';
import { AlertTriangle, CheckSquare, Square, X, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

interface BatchExpireModalProps {
  shipment: Shipment;
  onClose: () => void;
}

const AGE_OPTIONS = [
  { id: 1, labelAr: 'مفعل منذ شهر واحد أو أقل' },
  { id: 2, labelAr: 'مفعل منذ شهرين' },
  { id: 3, labelAr: 'مفعل منذ 3 أشهر' },
  { id: 4, labelAr: 'مفعل منذ 4 أشهر' },
  { id: 5, labelAr: 'مفعل منذ 5 أشهر' },
  { id: 6, labelAr: 'مفعل منذ 6 أشهر' },
  { id: 7, labelAr: 'مفعل منذ 7 أشهر' },
  { id: 8, labelAr: 'مفعل منذ 8 أشهر' },
  { id: 9, labelAr: 'مفعل منذ 9 أشهر' },
  { id: 10, labelAr: 'مفعل منذ 10 أشهر' },
  { id: 11, labelAr: 'مفعل منذ 11 شهراً' },
  { id: 12, labelAr: 'مفعل منذ 12 شهراً أو أكثر' },
];

export default function BatchExpireModal({ shipment, onClose }: BatchExpireModalProps) {
  const { expireBatchWarranty } = useAdmin();

  // Mode: Option A (unactivated only) vs Option B (include activated)
  const [mode, setMode] = useState<'UNACTIVATED_ONLY' | 'INCLUDE_ACTIVATED'>('UNACTIVATED_ONLY');
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [resultMessage, setResultMessage] = useState<{
    success: boolean;
    unactivated: number;
    activated: number;
  } | null>(null);

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedMonths([]);
      setIsAllSelected(false);
    } else {
      setSelectedMonths([13, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
      setIsAllSelected(true);
    }
  };

  const toggleMonth = (id: number) => {
    if (selectedMonths.includes(id)) {
      const filtered = selectedMonths.filter((m) => m !== id && m !== 13);
      setSelectedMonths(filtered);
      setIsAllSelected(false);
    } else {
      const updated = [...selectedMonths, id];
      setSelectedMonths(updated);
      if (updated.filter((m) => m !== 13).length === 12) {
        setIsAllSelected(true);
      }
    }
  };

  const handleConfirm = () => {
    const res = expireBatchWarranty({
      shipmentId: shipment.id,
      mode,
      selectedAgeMonths: selectedMonths,
      reason: `إنهاء صلاحية شحنة ${shipment.name} بقرار إداري من الوكيل`,
    });

    setResultMessage({
      success: true,
      unactivated: res.unactivatedExpiredCount,
      activated: res.activatedExpiredCount,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-950/60 to-slate-900 px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                محرك إنهاء الضمان الذكي للشحنة
              </h3>
              <p className="text-xs text-red-300/80">
                الشحنة: {shipment.name} ({shipment.id})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {resultMessage ? (
            <div className="p-6 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-emerald-200">
                تم تنفيذ إجراء إنهاء الضمان بنجاح!
              </h4>
              <div className="text-xs text-slate-300 space-y-1">
                <p>
                  عدد السيريالات غير المفعلة التي تم إنهاؤها:{' '}
                  <span className="font-bold text-white text-sm">{resultMessage.unactivated}</span>
                </p>
                <p>
                  عدد الأجهزة المفعلة التي تم إنهاء ضمانها وإيقاف عدادها:{' '}
                  <span className="font-bold text-amber-300 text-sm">{resultMessage.activated}</span>
                </p>
                <p className="text-slate-400 pt-2">
                  تم تحديث قاعدة البيانات وسيتوقف أي عداد تنازلي للعملاء المشمولين فوراً.
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                إغلاق النافذة
              </button>
            </div>
          ) : (
            <>
              {/* Alert notice */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">تحذير إداري هام:</p>
                  <p className="text-amber-300/80">
                    هذا الإجراء سيقوم بإنهاء صلاحية السيريالات المحددة لهذه الشحنة. إذا شملت الأجهزة المفعلة، سيتوقف العداد التنازلي التفاعلي للعميل على الفور وتصبح شهادة الضمان منتهية الصلاحية.
                  </p>
                </div>
              </div>

              {/* Mode Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-300 block">
                  حدد قاعدة إنهاء الضمان المطلوبة:
                </label>

                {/* Option A */}
                <div
                  onClick={() => setMode('UNACTIVATED_ONLY')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    mode === 'UNACTIVATED_ONLY'
                      ? 'bg-blue-600/10 border-blue-500 text-white shadow-lg'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="mt-0.5">
                    <input
                      type="radio"
                      name="expireMode"
                      checked={mode === 'UNACTIVATED_ONLY'}
                      onChange={() => setMode('UNACTIVATED_ONLY')}
                      className="w-4 h-4 text-blue-600 focus:ring-0"
                    />
                  </div>
                  <div>
                    <div className="font-bold text-sm flex items-center gap-2">
                      <span>الخيار (أ) [الافتراضي]: إنهاء جميع السيريالات غير المفعلة فقط</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      يقوم بإنهاء صلاحية كل الأجهزة التي لم يسجلها العملاء حتى الآن في هذه الشحنة، مع الحفاظ الكامل على ضمان الأجهزة المفعلة مسبقاً.
                    </p>
                  </div>
                </div>

                {/* Option B */}
                <div
                  onClick={() => setMode('INCLUDE_ACTIVATED')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    mode === 'INCLUDE_ACTIVATED'
                      ? 'bg-red-600/10 border-red-500 text-white shadow-lg'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="mt-0.5">
                    <input
                      type="radio"
                      name="expireMode"
                      checked={mode === 'INCLUDE_ACTIVATED'}
                      onChange={() => setMode('INCLUDE_ACTIVATED')}
                      className="w-4 h-4 text-red-600 focus:ring-0"
                    />
                  </div>
                  <div>
                    <div className="font-bold text-sm flex items-center gap-2">
                      <span>الخيار (ب): شمل الأجهزة المفعلة بالفعل في هذه الشحنة وفق مدة التفعيل</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      إنهاء ضمان الأجهزة المفعلة التي انقضى على تفعيلها فترة زمنية محددة بالشهور، وإيقاف عدادات العملاء التنازلية.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sub-Checkboxes for Option B */}
              {mode === 'INCLUDE_ACTIVATED' && (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-slate-300">
                      اختر فئات عمر التفعيل المستهدفة بالإنهاء:
                    </span>
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1.5"
                    >
                      {isAllSelected ? (
                        <CheckSquare className="w-4 h-4 text-blue-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500" />
                      )}
                      <span>تحديد كافة الأجهزة المفعلة</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {AGE_OPTIONS.map((opt) => {
                      const isChecked = selectedMonths.includes(opt.id) || isAllSelected;
                      return (
                        <label
                          key={opt.id}
                          className={`flex items-center gap-2.5 p-2 rounded-lg border transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-red-500/10 border-red-500/40 text-red-200'
                              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-900'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleMonth(opt.id)}
                            className="rounded border-slate-700 bg-slate-950 text-red-600 focus:ring-0"
                          />
                          <span>{opt.labelAr}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer actions */}
        {!resultMessage && (
          <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              إلغاء الأمر
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-600/30 transition-all flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>تأكيد إنهاء الضمان للشحنة فوراً</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
