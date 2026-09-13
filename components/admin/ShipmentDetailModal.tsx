'use client';

import React, { useState } from 'react';
import { Shipment, ShipmentSerial } from '@/types/admin';
import { useAdmin } from '@/context/AdminContext';
import { X, Search, ShieldAlert, CheckCircle2, Clock, AlertCircle, User, Phone, Calendar, Hash } from 'lucide-react';
import BatchExpireModal from './BatchExpireModal';

interface ShipmentDetailModalProps {
  shipment: Shipment;
  onClose: () => void;
}

export default function ShipmentDetailModal({ shipment, onClose }: ShipmentDetailModalProps) {
  const { serials } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'CLAIMED' | 'EXPIRED'>('ALL');
  const [showExpireModal, setShowExpireModal] = useState(false);

  const batchSerials = serials.filter((s) => s.shipmentId === shipment.id);

  const filteredSerials = batchSerials.filter((s) => {
    const matchesSearch =
      s.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.customerName && s.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.customerPhone && s.customerPhone.includes(searchTerm));

    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalUnits = batchSerials.length;
  const totalActivated = batchSerials.filter((s) => s.status === 'CLAIMED').length;
  const totalAvailable = batchSerials.filter((s) => s.status === 'AVAILABLE').length;
  const totalExpired = batchSerials.filter((s) => s.status === 'EXPIRED').length;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-black">
                {shipment.brand.substring(0, 2)}
              </div>
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <span>{shipment.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                    {shipment.id}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  العلامة: <span className="text-slate-200 font-bold">{shipment.brand}</span> | تاريخ الوصول: {shipment.arrivalDate}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowExpireModal(true)}
                className="px-3.5 py-2 rounded-xl bg-red-600/20 hover:bg-red-600 border border-red-500/40 text-red-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>إنهاء ضمان هذه الشحنة</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-6 bg-slate-900/50 border-b border-slate-800">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">إجمالي الوحدات</div>
              <div className="text-2xl font-black text-white mt-1">{totalUnits}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
              <div className="text-xs text-emerald-300 font-medium">المفعل لدى العملاء</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">{totalActivated}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/30">
              <div className="text-xs text-blue-300 font-medium">المتاح للتفعيل</div>
              <div className="text-2xl font-black text-blue-400 mt-1">{totalAvailable}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/30">
              <div className="text-xs text-red-300 font-medium">المنتهي أو المتوقف</div>
              <div className="text-2xl font-black text-red-400 mt-1">{totalExpired}</div>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="p-4 bg-slate-950/40 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="بحث بالسيريال، اسم العميل، الهاتف..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 pl-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              {(['ALL', 'AVAILABLE', 'CLAIMED', 'EXPIRED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === st
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st === 'ALL' && 'الكل'}
                  {st === 'AVAILABLE' && 'المتاح'}
                  {st === 'CLAIMED' && 'المفعل'}
                  {st === 'EXPIRED' && 'المنتهي'}
                </button>
              ))}
            </div>
          </div>

          {/* Serials Table */}
          <div className="flex-1 overflow-y-auto p-4">
            {filteredSerials.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                لا توجد سيريالات مطابقة لمعايير البحث في هذه الشحنة.
              </div>
            ) : (
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">الرقم المسلسلي</th>
                      <th className="py-3 px-4">الموديل المعتمد</th>
                      <th className="py-3 px-4">حالة الجهاز</th>
                      <th className="py-3 px-4">ارتباط العميل</th>
                      <th className="py-3 px-4">ملاحظات الانتهاء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                    {filteredSerials.map((ser) => (
                      <tr key={ser.serialNumber} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-white flex items-center gap-1.5">
                          <Hash className="w-3.5 h-3.5 text-blue-400" />
                          <span>{ser.serialNumber}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-300">{ser.modelName}</td>
                        <td className="py-3 px-4">
                          {ser.status === 'AVAILABLE' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 font-bold text-[11px]">
                              <Clock className="w-3 h-3" />
                              <span>متاح للتفعيل</span>
                            </span>
                          )}
                          {ser.status === 'CLAIMED' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[11px]">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>مفعل لعميل</span>
                            </span>
                          )}
                          {ser.status === 'EXPIRED' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 font-bold text-[11px]">
                              <AlertCircle className="w-3 h-3" />
                              <span>منتهي الصلاحية</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {ser.customerName ? (
                            <div className="space-y-0.5">
                              <div className="text-white font-semibold flex items-center gap-1">
                                <User className="w-3 h-3 text-slate-400" />
                                <span>{ser.customerName}</span>
                              </div>
                              <div className="text-slate-400 text-[10px] flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                <span dir="ltr">{ser.customerPhone}</span>
                              </div>
                              {ser.activationDate && (
                                <div className="text-slate-500 text-[10px] flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>تفعيل: {ser.activationDate.split('T')[0]}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-500 text-[11px]">غير مسجل بعد</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-[11px] text-slate-400 max-w-[200px] truncate">
                          {ser.expirationReason || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>

      {showExpireModal && (
        <BatchExpireModal
          shipment={shipment}
          onClose={() => setShowExpireModal(false)}
        />
      )}
    </>
  );
}
