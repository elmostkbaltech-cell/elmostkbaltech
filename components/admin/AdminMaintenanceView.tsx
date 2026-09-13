'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { MaintenanceStep, Brand } from '@/types';
import { 
  Wrench, 
  Search, 
  Truck, 
  Settings2, 
  CheckCircle, 
  MessageSquare, 
  Eye, 
  User, 
  Phone, 
  Calendar, 
  Plus, 
  X,
  FileText,
  AlertCircle
} from 'lucide-react';
import Image from 'next/image';

export default function AdminMaintenanceView() {
  const { 
    maintenanceTickets, 
    updateMaintenanceStep, 
    createMaintenanceTicket, 
    lookupDeviceBySerial 
  } = useAdmin();

  // Search state
  const [globalSearch, setGlobalSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'IN_TRANSIT' | 'UNDER_MAINTENANCE' | 'READY_FOR_PICKUP'>('ALL');

  // Device lookup by serial state
  const [lookupSerial, setLookupSerial] = useState('');
  const [lookupResult, setLookupResult] = useState<ReturnType<typeof lookupDeviceBySerial> | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // New ticket modal state
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [ticketSerial, setTicketSerial] = useState('');
  const [ticketBrand, setTicketBrand] = useState<Brand>('AIWA');
  const [ticketCustomer, setTicketCustomer] = useState('');
  const [ticketPhone, setTicketPhone] = useState('');
  const [ticketModel, setTicketModel] = useState('');
  const [ticketIssue, setTicketIssue] = useState('');

  // Photo viewer modal state
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);

  // Filter tickets
  const filteredTickets = maintenanceTickets.filter((tk) => {
    const q = globalSearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      tk.ticketId.toLowerCase().includes(q) ||
      tk.serialNumber.toLowerCase().includes(q) ||
      tk.customerName.toLowerCase().includes(q) ||
      tk.customerPhone.includes(q);

    const matchesTab = activeTab === 'ALL' || tk.currentStep === activeTab;

    return matchesSearch && matchesTab;
  });

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(null);
    if (!lookupSerial.trim()) {
      setLookupError('يرجى إدخال الرقم المسلسلي للجهاز');
      return;
    }

    const res = lookupDeviceBySerial(lookupSerial);
    if (!res) {
      setLookupError('لم يتم العثور على أي جهاز مسجل بهذا الرقم المسلسلي');
      setLookupResult(null);
    } else {
      setLookupResult(res);
    }
  };

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSerial.trim() || !ticketCustomer.trim() || !ticketPhone.trim()) {
      alert('يرجى ملء الحقول الإلزامية: السيريال، اسم العميل، ورقم الهاتف');
      return;
    }

    createMaintenanceTicket({
      serialNumber: ticketSerial,
      brand: ticketBrand,
      customerName: ticketCustomer,
      customerPhone: ticketPhone,
      deviceModel: ticketModel || `${ticketBrand} شاشة أندرويد`,
      issueDescription: ticketIssue || 'فحص وصيانة شاملة',
    });

    setIsNewTicketOpen(false);
    setTicketSerial('');
    setTicketCustomer('');
    setTicketPhone('');
    setTicketModel('');
    setTicketIssue('');
  };

  const generateWhatsAppUrl = (phone: string, customerName: string, ticketId: string, step: MaintenanceStep, deviceModel: string) => {
    let cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('01')) {
      cleanPhone = '2' + cleanPhone;
    }

    let messageText = '';
    if (step === 'READY_FOR_PICKUP') {
      messageText = `مرحباً أستاذ ${customerName}، يسعدنا إبلاغك بأن جهازك (${deviceModel}) رقم التذكرة [${ticketId}] تم الانتهاء من صيانته بنجاح وهو جاهز الآن للاستلام من فرع شركة المستقبل تك (سوق التوفيقية - مول سنتر التوفيقية التجاري - الدور الثاني). ساعات العمل يومياً من 10 ص حتى 9 م عدا الأحد. نسعد بخدمتك دائماً!`;
    } else if (step === 'UNDER_MAINTENANCE') {
      messageText = `مرحباً أستاذ ${customerName}، نود إحاطتكم علماً بأن جهازكم (${deviceModel}) رقم التذكرة [${ticketId}] قيد الفحص والصيانة حالياً بمركز صيانة المستقبل تك. سيتم إخطاركم فور الانتهاء والجاهزية للاستلام. شكراً لثقتكم.`;
    } else {
      messageText = `مرحباً أستاذ ${customerName}، تم استلام طلب صيانة جهازكم (${deviceModel}) برقم تذكرة [${ticketId}] وهو في وجهته لمركز الضمان. شركة المستقبل تك للتجارة والتوريدات.`;
    }

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Wrench className="w-6 h-6 text-emerald-400" />
              <span>إدارة تذاكر الصيانة والبحث الفوري</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              تحديث مراحل الصيانة بنقرة واحدة، الاستعلام عن الأجهزة، ومراسلة العميل عبر الواتساب فور الجاهزية
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsNewTicketOpen(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>فتح تذكرة صيانة جديدة</span>
          </button>
        </div>

        {/* Global Instant Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="بحث شامل فوري: أدخل الرقم المسلسلي، رقم هاتف العميل، أو اسم العميل..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-3 pl-11 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
        </div>
      </div>

      {/* Device Lookup by Serial Number Widget */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Search className="w-4 h-4 text-blue-400" />
          <span>استعلام سريع عن جهاز بالسيريال لمعاينة الفاتورة وبيانات الضمان:</span>
        </h3>

        <form onSubmit={handleLookup} className="flex gap-2 mb-4">
          <input
            type="text"
            value={lookupSerial}
            onChange={(e) => setLookupSerial(e.target.value)}
            placeholder="أدخل الرقم المسلسلي للجهاز"
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors"
          >
            فحص الجهاز
          </button>
        </form>

        {lookupError && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{lookupError}</span>
          </div>
        )}

        {lookupResult && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">بيانات الجهاز المسجل:</span>
                <span className="font-bold text-white text-sm">
                  {lookupResult.serialRecord?.modelName || lookupResult.warrantyRecord?.modelName || 'شاشة ذكية'}
                </span>
                <span className="text-blue-400 block font-mono text-xs mt-1">
                  السيريال: {lookupSerial.toUpperCase()}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">ارتباط العميل:</span>
                <span className="font-bold text-white text-sm">
                  {lookupResult.warrantyRecord?.customerName || lookupResult.serialRecord?.customerName || 'متاح ولم يُسجل باسم عميل بعد'}
                </span>
                {(lookupResult.warrantyRecord?.customerPhone || lookupResult.serialRecord?.customerPhone) && (
                  <span className="text-emerald-400 block text-xs mt-1" dir="ltr">
                    {lookupResult.warrantyRecord?.customerPhone || lookupResult.serialRecord?.customerPhone}
                  </span>
                )}
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">حالة الضمان:</span>
                <span className="font-bold text-emerald-400 text-sm">
                  {lookupResult.warrantyRecord?.status === 'ACTIVE' ? 'ضمان ساري ومعتمد' : lookupResult.serialRecord?.status || 'متاح للتفعيل'}
                </span>
                {lookupResult.warrantyRecord?.activationDate && (
                  <span className="text-slate-400 block text-xs mt-1">
                    تاريخ التفعيل: {lookupResult.warrantyRecord.activationDate.split('T')[0]}
                  </span>
                )}
              </div>
            </div>

            {/* Photos Preview */}
            <div className="flex items-center gap-3 pt-2 border-t border-slate-800/80">
              <span className="text-xs text-slate-400">معاينة المستندات المرفوعة:</span>
              {lookupResult.warrantyRecord?.invoicePhotoUrl && (
                <button
                  type="button"
                  onClick={() => setPreviewPhotoUrl(lookupResult.warrantyRecord!.invoicePhotoUrl)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  <span>فاتورة الشراء</span>
                </button>
              )}
              {lookupResult.warrantyRecord?.warrantyCardPhotoUrl && (
                <button
                  type="button"
                  onClick={() => setPreviewPhotoUrl(lookupResult.warrantyRecord!.warrantyCardPhotoUrl!)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>كرت الضمان المعتمد</span>
                </button>
              )}
              {!lookupResult.warrantyRecord?.invoicePhotoUrl && !lookupResult.warrantyRecord?.warrantyCardPhotoUrl && (
                <span className="text-xs text-slate-500">لا توجد صور مرفوعة مسجلة</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'ALL', label: 'كافة تذاكر الصيانة', count: maintenanceTickets.length },
          { id: 'IN_TRANSIT', label: 'في وجهتها للمركز', count: maintenanceTickets.filter((t) => t.currentStep === 'IN_TRANSIT').length },
          { id: 'UNDER_MAINTENANCE', label: 'قيد الإصلاح حالياً', count: maintenanceTickets.filter((t) => t.currentStep === 'UNDER_MAINTENANCE').length },
          { id: 'READY_FOR_PICKUP', label: 'جاهزة للتسليم من الفرع', count: maintenanceTickets.filter((t) => t.currentStep === 'READY_FOR_PICKUP').length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span>{tab.label}</span>
            <span className="px-1.5 py-0.5 rounded-md bg-black/30 text-[10px]">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500 text-xs">
            لا توجد تذاكر صيانة مطابقة للبحث أو التصفية الحالية.
          </div>
        ) : (
          filteredTickets.map((ticket) => {
            return (
              <div
                key={ticket.ticketId}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs">
                      {ticket.ticketId}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white flex items-center gap-2">
                        <span>{ticket.deviceModel}</span>
                        <span className="text-xs text-slate-400 font-mono">
                          ({ticket.serialNumber})
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        العميل: <span className="text-slate-200 font-semibold">{ticket.customerName}</span> • هاتف: <span dir="ltr" className="text-slate-300 font-mono">{ticket.customerPhone}</span>
                      </p>
                    </div>
                  </div>

                  {/* One-Click WhatsApp Notice */}
                  <a
                    href={generateWhatsAppUrl(
                      ticket.customerPhone,
                      ticket.customerName,
                      ticket.ticketId,
                      ticket.currentStep,
                      ticket.deviceModel
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>مراسلة العميل واتساب بإشعار الجاهزية</span>
                  </a>
                </div>

                {/* Status One-Click Updater */}
                <div>
                  <label className="text-[11px] text-slate-400 font-semibold block mb-2">
                    تحديث مرحلة الصيانة بنقرة واحدة:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {/* Step 1 */}
                    <button
                      type="button"
                      onClick={() => updateMaintenanceStep(ticket.ticketId, 'IN_TRANSIT')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        ticket.currentStep === 'IN_TRANSIT'
                          ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <Truck className="w-4 h-4" />
                      <span>1. في وجهتها إلى مركز الضمان</span>
                    </button>

                    {/* Step 2 */}
                    <button
                      type="button"
                      onClick={() => updateMaintenanceStep(ticket.ticketId, 'UNDER_MAINTENANCE')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        ticket.currentStep === 'UNDER_MAINTENANCE'
                          ? 'bg-amber-600 text-white border-amber-500 shadow-md'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <Settings2 className="w-4 h-4" />
                      <span>2. في الضمان وجاري معالجة المشكلة</span>
                    </button>

                    {/* Step 3 */}
                    <button
                      type="button"
                      onClick={() => updateMaintenanceStep(ticket.ticketId, 'READY_FOR_PICKUP')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        ticket.currentStep === 'READY_FOR_PICKUP'
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>3. جاهزة للتسليم من الفرع</span>
                    </button>
                  </div>
                </div>

                {/* Details and Technician Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
                  <div>
                    <span className="text-slate-500 block text-[11px]">وصف العطل المبلغ عنه:</span>
                    <span className="text-slate-300 font-medium">{ticket.issueDescription}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">تقرير وملاحظات الفني:</span>
                    <span className="text-emerald-300/90 font-medium">{ticket.technicianNotes || 'لا توجد ملاحظات مسجلة بعد.'}</span>
                  </div>
                </div>

                {/* Photos Row */}
                {(ticket.invoicePhotoUrl || ticket.warrantyCardPhotoUrl) && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] text-slate-400">مرفقات الجهاز:</span>
                    {ticket.invoicePhotoUrl && (
                      <button
                        type="button"
                        onClick={() => setPreviewPhotoUrl(ticket.invoicePhotoUrl!)}
                        className="text-[11px] text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>معاينة الفاتورة</span>
                      </button>
                    )}
                    {ticket.warrantyCardPhotoUrl && (
                      <button
                        type="button"
                        onClick={() => setPreviewPhotoUrl(ticket.warrantyCardPhotoUrl!)}
                        className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 ml-2"
                      >
                        <Eye className="w-3 h-3" />
                        <span>معاينة كرت الضمان</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Audit & Author row */}
                {(ticket.createdBy || ticket.updatedBy) && (
                  <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/60 flex items-center justify-between">
                    <span>تاريخ البلاغ: {ticket.reportedDate}</span>
                    <span>
                      {ticket.updatedBy ? `آخر تحديث بواسطة: ${ticket.updatedBy}` : `أنشئت بواسطة: ${ticket.createdBy}`}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* New Ticket Modal */}
      {isNewTicketOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-emerald-400" />
                <span>فتح تذكرة صيانة جديدة لفرع التوفيقية</span>
              </h3>
              <button
                onClick={() => setIsNewTicketOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicketSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    الرقم المسلسلي <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={ticketSerial}
                    onChange={(e) => setTicketSerial(e.target.value)}
                    placeholder="الرقم المسلسلي للجهاز"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    العلامة التجارية <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={ticketBrand}
                    onChange={(e) => setTicketBrand(e.target.value as Brand)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="AIWA">AIWA</option>
                    <option value="TIGER">TIGER</option>
                    <option value="A90_PRO">A90 PRO</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    اسم العميل <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={ticketCustomer}
                    onChange={(e) => setTicketCustomer(e.target.value)}
                    placeholder="الاسم ثلاثي"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    رقم الهاتف (واتساب) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={ticketPhone}
                    onChange={(e) => setTicketPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  موديل الجهاز
                </label>
                <input
                  type="text"
                  value={ticketModel}
                  onChange={(e) => setTicketModel(e.target.value)}
                  placeholder="موديل الجهاز"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  وصف العطل أو المشكلة
                </label>
                <textarea
                  value={ticketIssue}
                  onChange={(e) => setTicketIssue(e.target.value)}
                  rows={3}
                  placeholder="اكتب تفاصيل العطل المبلغ عنه من العميل..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewTicketOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
                >
                  إنشاء التذكرة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Photo Viewer Modal */}
      {previewPhotoUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-2xl max-h-[85vh] bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden p-2">
            <button
              onClick={() => setPreviewPhotoUrl(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/70 hover:bg-black text-white rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative w-full h-[60vh] max-w-xl mx-auto">
              <Image
                src={previewPhotoUrl}
                alt="Document Preview"
                fill
                className="object-contain"
              />
            </div>
            <div className="p-3 text-center text-xs text-slate-300">
              معاينة الوثيقة المرفقة بمركز ضمان المستقبل تك
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
