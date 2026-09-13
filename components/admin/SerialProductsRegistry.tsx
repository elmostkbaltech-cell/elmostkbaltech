'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { ShipmentSerial } from '@/types/admin';
import { Brand } from '@/types';
import { 
  Hash, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  User, 
  Phone, 
  Calendar, 
  Eye, 
  X, 
  Wrench,
  ShieldCheck,
  ArrowUpDown
} from 'lucide-react';
import Image from 'next/image';

export default function SerialProductsRegistry() {
  const { serials, shipments, createMaintenanceTicket } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'CLAIMED' | 'EXPIRED'>('ALL');
  const [brandFilter, setBrandFilter] = useState<'ALL' | 'AIWA' | 'TIGER' | 'A90_PRO'>('ALL');
  const [sortBy, setSortBy] = useState<'serialNumber' | 'brand' | 'status'>('serialNumber');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  // Quick ticket creation modal state
  const [ticketModalSerial, setTicketModalSerial] = useState<ShipmentSerial | null>(null);
  const [ticketIssue, setTicketIssue] = useState('');

  const handleSort = (field: 'serialNumber' | 'brand' | 'status') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const filteredSerials = serials
    .filter((item) => {
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.serialNumber.toLowerCase().includes(q) ||
        (item.customerName && item.customerName.toLowerCase().includes(q)) ||
        (item.customerPhone && item.customerPhone.includes(q)) ||
        item.modelName.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const matchesBrand = brandFilter === 'ALL' || item.brand === brandFilter;

      return matchesSearch && matchesStatus && matchesBrand;
    })
    .sort((a, b) => {
      let comp = 0;
      if (sortBy === 'serialNumber') {
        comp = a.serialNumber.localeCompare(b.serialNumber);
      } else if (sortBy === 'brand') {
        comp = a.brand.localeCompare(b.brand);
      } else if (sortBy === 'status') {
        comp = a.status.localeCompare(b.status);
      }
      return sortOrder === 'asc' ? comp : -comp;
    });

  const totalSerials = serials.length;
  const availableCount = serials.filter((s) => s.status === 'AVAILABLE').length;
  const claimedCount = serials.filter((s) => s.status === 'CLAIMED').length;
  const expiredCount = serials.filter((s) => s.status === 'EXPIRED').length;

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketModalSerial) return;

    createMaintenanceTicket({
      serialNumber: ticketModalSerial.serialNumber,
      brand: ticketModalSerial.brand,
      customerName: ticketModalSerial.customerName || 'عميل مسجل بالسيريال',
      customerPhone: ticketModalSerial.customerPhone || '01128474862',
      deviceModel: ticketModalSerial.modelName,
      issueDescription: ticketIssue || 'فحص وصيانة للجهاز',
    });

    setTicketModalSerial(null);
    setTicketIssue('');
    alert('تم فتح تذكرة الصيانة بنجاح وتحويل الجهاز لقسم الصيانة');
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Hash className="w-6 h-6 text-blue-400" />
              <span>قسم المنتجات بسيريال نمبر</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              سجل مركزي شامل لكافة الأجهزة والشاشات المستوردة برقم مسلسلي معتمد، وتتبع حالة تفعيل الضمان وارتباط كل عميل
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">
              إجمالي المنتجات: <span className="font-bold text-white text-sm">{totalSerials}</span>
            </span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block font-medium">إجمالي السيريالات</span>
            <span className="text-xl font-black text-white mt-1 block">{totalSerials}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/30 text-center">
            <span className="text-[11px] text-blue-300 block font-medium">متاح للتفعيل</span>
            <span className="text-xl font-black text-blue-400 mt-1 block">{availableCount}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-center">
            <span className="text-[11px] text-emerald-300 block font-medium">مفعل لعميل</span>
            <span className="text-xl font-black text-emerald-400 mt-1 block">{claimedCount}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/30 text-center">
            <span className="text-[11px] text-red-300 block font-medium">منتهي الصلاحية</span>
            <span className="text-xl font-black text-red-400 mt-1 block">{expiredCount}</span>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث بالسيريال، اسم العميل، الهاتف..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 pl-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Status filters */}
            {(['ALL', 'AVAILABLE', 'CLAIMED', 'EXPIRED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {st === 'ALL' && 'كافة الحالات'}
                {st === 'AVAILABLE' && 'المتاح'}
                {st === 'CLAIMED' && 'المفعل'}
                {st === 'EXPIRED' && 'المنتهي'}
              </button>
            ))}

            {/* Brand filter */}
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">كافة الماركات</option>
              <option value="AIWA">AIWA</option>
              <option value="TIGER">TIGER</option>
              <option value="A90_PRO">A90 PRO</option>
            </select>
          </div>
        </div>
      </div>

      {/* Serials Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">
                  <button
                    onClick={() => handleSort('serialNumber')}
                    className="flex items-center gap-1 hover:text-white font-bold"
                  >
                    <span>الرقم المسلسلي</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3.5 px-4">
                  <button
                    onClick={() => handleSort('brand')}
                    className="flex items-center gap-1 hover:text-white font-bold"
                  >
                    <span>العلامة والموديل</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3.5 px-4">الشحنة التابع لها</th>
                <th className="py-3.5 px-4">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center gap-1 hover:text-white font-bold"
                  >
                    <span>حالة الجهاز</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3.5 px-4">ارتباط العميل والتفعيل</th>
                <th className="py-3.5 px-4 text-center">إجراءات الصيانة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
              {filteredSerials.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    لا توجد منتجات مسجلة بسيريال نمبر مطابقة للبحث الحالي.
                  </td>
                </tr>
              ) : (
                filteredSerials.map((ser) => {
                  const linkedShipment = shipments.find((shp) => shp.id === ser.shipmentId);
                  return (
                    <tr key={ser.serialNumber} className="hover:bg-slate-800/40 transition-colors">
                      {/* Serial Number */}
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        <div className="flex items-center gap-1.5">
                          <Hash className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span>{ser.serialNumber}</span>
                        </div>
                      </td>

                      {/* Brand & Model */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-200 block">{ser.modelName}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-bold inline-block">
                            {ser.brand}
                          </span>
                        </div>
                      </td>

                      {/* Linked Shipment */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="text-slate-300 font-medium block">
                            {linkedShipment ? linkedShipment.name : 'شحنة معتمدة'}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 block">
                            {ser.shipmentId}
                          </span>
                          {(ser.updatedBy || ser.createdBy) && (
                            <span className="text-[10px] text-slate-500 block">
                              بواسطة: <strong className="text-slate-400">{ser.updatedBy || ser.createdBy}</strong>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
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

                      {/* Customer binding */}
                      <td className="py-3.5 px-4">
                        {ser.customerName ? (
                          <div className="space-y-0.5">
                            <div className="font-bold text-white flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400" />
                              <span>{ser.customerName}</span>
                            </div>
                            <div className="text-slate-400 text-[10px] flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-500" />
                              <span dir="ltr" className="font-mono">{ser.customerPhone}</span>
                            </div>
                            {ser.activationDate && (
                              <div className="text-slate-500 text-[10px] flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>تاريخ التفعيل: {ser.activationDate.split('T')[0]}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px]">جاهز ولم يُفعّل بعد</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setTicketModalSerial(ser)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-bold transition-colors inline-flex items-center gap-1"
                        >
                          <Wrench className="w-3 h-3 text-emerald-400" />
                          <span>فتح تذكرة صيانة</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Maintenance Ticket Modal */}
      {ticketModalSerial && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-emerald-400" />
                <span>فتح تذكرة صيانة للجهاز بالسيريال</span>
              </h3>
              <button
                onClick={() => setTicketModalSerial(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <div>السيريال: <span className="font-mono font-bold text-blue-400">{ticketModalSerial.serialNumber}</span></div>
              <div>الموديل: <span className="text-white font-bold">{ticketModalSerial.modelName}</span></div>
              <div>العميل: <span className="text-slate-300">{ticketModalSerial.customerName || 'عميل الفرع'}</span></div>
            </div>

            <form onSubmit={handleCreateTicketSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  وصف المشكلة أو العطل
                </label>
                <textarea
                  value={ticketIssue}
                  onChange={(e) => setTicketIssue(e.target.value)}
                  rows={3}
                  placeholder="اكتب وصف العطل المبلغ عنه من العميل..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTicketModalSerial(null)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
                >
                  تأكيد فتح التذكرة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Photo Preview Modal */}
      {previewPhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-2xl max-h-[85vh] bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden p-2">
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/70 hover:bg-black text-white rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative w-full h-[60vh] max-w-xl mx-auto">
              <Image
                src={previewPhoto}
                alt="Document Preview"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
