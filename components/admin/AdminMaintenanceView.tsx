'use client';

import React, { useState, useCallback } from 'react';
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
  AlertCircle,
  Hash,
  CheckCircle2,
  RotateCcw,
  ZoomIn,
  ShieldCheck
} from 'lucide-react';
import Image from 'next/image';

interface CustomerDeviceItem {
  id: string;
  type: 'SERIAL' | 'NON_SERIAL';
  serialNumber?: string;
  brand: Brand;
  modelName: string;
  category?: string;
  customerName: string;
  customerPhone: string;
  purchaseDate?: string;
  activationDate?: string;
  invoicePhotoUrl?: string;
  warrantyCardPhotoUrl?: string;
  devicePhotoUrl?: string;
  status?: string;
}

export default function AdminMaintenanceView() {
  const { 
    maintenanceTickets, 
    updateMaintenanceStep, 
    createMaintenanceTicket, 
    lookupDeviceBySerial,
    serials,
    nonSerialItems
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
  const [ticketSearchQuery, setTicketSearchQuery] = useState('');
  const [matchedDevices, setMatchedDevices] = useState<CustomerDeviceItem[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<CustomerDeviceItem | null>(null);
  const [ticketSerial, setTicketSerial] = useState('');
  const [ticketBrand, setTicketBrand] = useState<Brand>('AIWA');
  const [ticketCustomer, setTicketCustomer] = useState('');
  const [ticketPhone, setTicketPhone] = useState('');
  const [ticketModel, setTicketModel] = useState('');
  const [ticketIssue, setTicketIssue] = useState('');
  const [ticketInvoicePhoto, setTicketInvoicePhoto] = useState<string | null>(null);
  const [ticketWarrantyPhoto, setTicketWarrantyPhoto] = useState<string | null>(null);

  // Photo viewer modal state
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);

  // Build unified customer warranty devices
  const getUnifiedCustomerDevices = useCallback((): CustomerDeviceItem[] => {
    const list: CustomerDeviceItem[] = [];

    // 1. From serials
    serials.forEach((s) => {
      if (s.customerPhone || s.customerName || s.status === 'CLAIMED') {
        list.push({
          id: s.serialNumber,
          type: 'SERIAL',
          serialNumber: s.serialNumber,
          brand: s.brand,
          modelName: s.modelName,
          customerName: s.customerName || 'عميل مسجل',
          customerPhone: s.customerPhone || '',
          activationDate: s.activationDate,
          status: s.status,
        });
      }
    });

    // 2. From nonSerialItems
    nonSerialItems.forEach((nsi) => {
      list.push({
        id: nsi.id,
        type: 'NON_SERIAL',
        brand: nsi.brand,
        modelName: nsi.modelName,
        category: nsi.category,
        customerName: nsi.customerName,
        customerPhone: nsi.customerPhone,
        purchaseDate: nsi.purchaseDate,
        activationDate: nsi.activationDate,
        invoicePhotoUrl: nsi.invoicePhotoUrl,
        warrantyCardPhotoUrl: nsi.warrantyCardPhotoUrl,
      });
    });

    // 3. From customer warranties in localStorage (which contain invoice/warranty photos)
    try {
      if (typeof window !== 'undefined') {
        const rawWarranties = localStorage.getItem('mostaqbal_warranties');
        if (rawWarranties) {
          const parsed = JSON.parse(rawWarranties);
          parsed.forEach((w: any) => {
            if (w.serialNumber) {
              const existing = list.find(
                (item) => item.serialNumber?.toUpperCase() === w.serialNumber?.toUpperCase()
              );
              if (existing) {
                existing.invoicePhotoUrl = existing.invoicePhotoUrl || w.invoicePhotoUrl;
                existing.devicePhotoUrl = existing.devicePhotoUrl || w.devicePhotoUrl;
                existing.warrantyCardPhotoUrl = existing.warrantyCardPhotoUrl || w.packagingPhotoUrl;
                existing.purchaseDate = existing.purchaseDate || w.purchaseDate;
                existing.customerName = existing.customerName || w.customerName;
                existing.customerPhone = existing.customerPhone || w.customerPhone;
              } else {
                list.push({
                  id: w.id || w.serialNumber,
                  type: 'SERIAL',
                  serialNumber: w.serialNumber,
                  brand: w.brand,
                  modelName: w.modelName,
                  category: w.category,
                  customerName: w.customerName,
                  customerPhone: w.customerPhone,
                  purchaseDate: w.purchaseDate,
                  activationDate: w.activationDate,
                  invoicePhotoUrl: w.invoicePhotoUrl,
                  devicePhotoUrl: w.devicePhotoUrl,
                  warrantyCardPhotoUrl: w.packagingPhotoUrl,
                });
              }
            }
          });
        }
      }
    } catch (e) {}

    return list;
  }, [serials, nonSerialItems]);

  const applySelectedDevice = (dev: CustomerDeviceItem) => {
    setSelectedDevice(dev);
    setTicketCustomer(dev.customerName);
    setTicketPhone(dev.customerPhone);
    setTicketBrand(dev.brand);
    setTicketModel(dev.modelName);
    setTicketSerial(dev.serialNumber || '');
    setTicketInvoicePhoto(dev.invoicePhotoUrl || null);
    setTicketWarrantyPhoto(dev.warrantyCardPhotoUrl || dev.devicePhotoUrl || null);
  };

  const clearSelectedDevice = () => {
    setSelectedDevice(null);
    setTicketSerial('');
    setTicketModel('');
    setTicketInvoicePhoto(null);
    setTicketWarrantyPhoto(null);
  };

  const handleTicketSearch = (query: string) => {
    setTicketSearchQuery(query);
    const q = query.trim().toLowerCase();
    const cleanDigits = query.replace(/[^0-9]/g, '');

    if (!q || (q.length < 2 && cleanDigits.length < 2)) {
      setMatchedDevices([]);
      setSelectedDevice(null);
      return;
    }

    const all = getUnifiedCustomerDevices();
    const found = all.filter((dev) => {
      const phoneMatch = cleanDigits.length >= 3 && dev.customerPhone.replace(/[^0-9]/g, '').includes(cleanDigits);
      const serialMatch = dev.serialNumber && dev.serialNumber.toLowerCase().includes(q);
      const nameMatch = dev.customerName && dev.customerName.toLowerCase().includes(q);
      return phoneMatch || serialMatch || nameMatch;
    });

    setMatchedDevices(found);

    if (found.length === 1) {
      applySelectedDevice(found[0]);
    } else if (found.length > 1) {
      setSelectedDevice(null);
      setTicketCustomer(found[0].customerName);
      setTicketPhone(found[0].customerPhone);
    } else {
      setSelectedDevice(null);
    }
  };

  const openNewTicketModal = () => {
    setTicketSearchQuery('');
    setMatchedDevices([]);
    setSelectedDevice(null);
    setTicketSerial('');
    setTicketBrand('AIWA');
    setTicketCustomer('');
    setTicketPhone('');
    setTicketModel('');
    setTicketIssue('');
    setTicketInvoicePhoto(null);
    setTicketWarrantyPhoto(null);
    setIsNewTicketOpen(true);
  };

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
    if (!ticketCustomer.trim() || !ticketPhone.trim()) {
      alert('يرجى إدخال اسم العميل ورقم هاتفه كحقول إلزامية');
      return;
    }

    createMaintenanceTicket({
      serialNumber: ticketSerial.trim() ? ticketSerial.trim() : 'بدون سيريال (مسجل بفاتورة)',
      brand: ticketBrand,
      customerName: ticketCustomer.trim(),
      customerPhone: ticketPhone.trim(),
      deviceModel: ticketModel.trim() || `${ticketBrand} ${selectedDevice?.category ? `(${selectedDevice.category})` : 'جهاز معتمد'}`,
      issueDescription: ticketIssue.trim() || 'فحص وصيانة شاملة',
    });

    setIsNewTicketOpen(false);
    openNewTicketModal();
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
            onClick={openNewTicketModal}
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
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl p-6 my-8 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    فتح تذكرة صيانة جديدة لفرع التوفيقية
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    البحث برقم الهاتف أو السيريال واسترجاع بيانات الضمان والفاتورة تلقائياً
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNewTicketOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto pr-1 space-y-4 pt-4 flex-1">
              {/* Step 1: Smart Customer Phone / Serial Lookup Bar */}
              <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl space-y-2">
                <label className="block text-xs font-bold text-emerald-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5" />
                    <span>البحث برقم هاتف العميل أو السيريال نمر (اختياري للربط السريع):</span>
                  </span>
                  {selectedDevice && (
                    <span className="text-[10px] text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full font-normal">
                      تم اختيار الجهاز بنجاح ✓
                    </span>
                  )}
                </label>

                <div className="relative">
                  <input
                    type="text"
                    value={ticketSearchQuery}
                    onChange={(e) => handleTicketSearch(e.target.value)}
                    placeholder="اكتب رقم هاتف العميل (مثال: 010...) أو السيريال نمبر أو اسم العميل..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 pl-10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    autoFocus
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  {ticketSearchQuery && (
                    <button
                      type="button"
                      onClick={() => handleTicketSearch('')}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded bg-slate-800"
                    >
                      مسح
                    </button>
                  )}
                </div>

                {/* Multiple Devices Picker if customer has > 1 product */}
                {matchedDevices.length > 1 && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
                      <span>عثرنا على ({matchedDevices.length}) أجهزة مسجلة لهذا العميل، يرجى اختيار الجهاز المراد صيانته:</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                      {matchedDevices.map((dev) => {
                        const isChosen = selectedDevice?.id === dev.id;
                        return (
                          <div
                            key={dev.id}
                            onClick={() => applySelectedDevice(dev)}
                            className={`p-2.5 rounded-xl border text-right cursor-pointer transition-all ${
                              isChosen
                                ? 'bg-emerald-950/70 border-emerald-500 shadow-sm'
                                : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                                {dev.brand}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {dev.type === 'NON_SERIAL' ? 'بدون سيريال' : 'بسيريال'}
                              </span>
                            </div>
                            <div className="font-bold text-white text-xs truncate">
                              {dev.modelName}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-1 flex items-center justify-between">
                              <span>سيريال: {dev.serialNumber || 'مسجل بفاتورة'}</span>
                              <span className="text-emerald-400 font-sans font-bold">
                                {isChosen ? '✓ محدد' : 'اختيار'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Single Match Auto-Selected Notice */}
                {matchedDevices.length === 1 && selectedDevice && (
                  <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5 pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>تم التعرف على جهاز العميل واختياره تلقائياً بالكامل!</span>
                  </div>
                )}

                {/* No Matches Found in Warranty Records */}
                {ticketSearchQuery.trim().length >= 3 && matchedDevices.length === 0 && (
                  <div className="text-[11px] text-slate-400 pt-1">
                    لم يُعثر على جهاز مسجل مسبقاً بهذا الرقم أو السيريال. لا مشكلة، يمكنك إدخال البيانات يدوياً أدناه لفتح التذكرة.
                  </div>
                )}
              </div>

              {/* Step 2: Rich Inspection Card (Display all product info, invoice photo, warranty photo) */}
              {selectedDevice && (
                <div className="bg-emerald-950/20 border border-emerald-500/40 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
                    <div className="flex items-center gap-2 text-emerald-400 font-black text-xs">
                      <ShieldCheck className="w-4 h-4" />
                      <span>تفاصيل الضمان والمستندات المسجلة للجهاز المختار:</span>
                    </div>
                    <button
                      type="button"
                      onClick={clearSelectedDevice}
                      className="text-[11px] text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>إلغاء التحديد</span>
                    </button>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block mb-0.5">اسم العميل المسجل:</span>
                      <span className="font-bold text-white block truncate">{selectedDevice.customerName}</span>
                    </div>

                    <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block mb-0.5">رقم الهاتف:</span>
                      <span className="font-mono font-bold text-emerald-400 block" dir="ltr">{selectedDevice.customerPhone}</span>
                    </div>

                    <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block mb-0.5">العلامة والموديل:</span>
                      <span className="font-bold text-white block truncate">{selectedDevice.brand} - {selectedDevice.modelName}</span>
                    </div>

                    <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block mb-0.5">الرقم المسلسلي (Serial):</span>
                      <span className="font-mono font-bold text-slate-200 block truncate">
                        {selectedDevice.serialNumber || 'بدون سيريال (مسجل بفاتورة)'}
                      </span>
                    </div>

                    <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block mb-0.5">تاريخ الشراء / التسجيل:</span>
                      <span className="font-semibold text-slate-300 block">
                        {selectedDevice.purchaseDate || selectedDevice.activationDate || 'مسجل بالسيستم'}
                      </span>
                    </div>

                    <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block mb-0.5">نوع الضمان:</span>
                      <span className="font-bold text-emerald-400 block">
                        {selectedDevice.type === 'SERIAL' ? 'ضمان إلكتروني برقم سيريال' : 'ضمان بفاتورة الشراء'}
                      </span>
                    </div>
                  </div>

                  {/* Document & Invoice Photos Thumbnails */}
                  {(ticketInvoicePhoto || ticketWarrantyPhoto) ? (
                    <div className="pt-2 border-t border-emerald-500/20">
                      <span className="text-[11px] font-bold text-slate-300 block mb-2">
                        المستندات المرفوعة (انقر للتكبير والمعاينة):
                      </span>
                      <div className="flex flex-wrap items-center gap-3">
                        {ticketInvoicePhoto && (
                          <div className="flex items-center gap-2.5 bg-slate-900 p-2 rounded-xl border border-slate-800 hover:border-emerald-500/60 transition-all">
                            <div 
                              onClick={() => setPreviewPhotoUrl(ticketInvoicePhoto)}
                              className="relative w-12 h-12 rounded-lg bg-slate-950 overflow-hidden cursor-pointer border border-slate-700 hover:border-emerald-400 group shrink-0"
                              title="انقر للتكبير"
                            >
                              <Image src={ticketInvoicePhoto} alt="فاتورة الشراء" fill className="object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <ZoomIn className="w-4 h-4 text-white" />
                              </div>
                            </div>
                            <div>
                              <span className="text-xs font-bold text-white block">فاتورة الشراء</span>
                              <button
                                type="button"
                                onClick={() => setPreviewPhotoUrl(ticketInvoicePhoto)}
                                className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 mt-0.5"
                              >
                                <Eye className="w-3 h-3" />
                                <span>معاينة مكبرة</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {ticketWarrantyPhoto && (
                          <div className="flex items-center gap-2.5 bg-slate-900 p-2 rounded-xl border border-slate-800 hover:border-emerald-500/60 transition-all">
                            <div 
                              onClick={() => setPreviewPhotoUrl(ticketWarrantyPhoto)}
                              className="relative w-12 h-12 rounded-lg bg-slate-950 overflow-hidden cursor-pointer border border-slate-700 hover:border-emerald-400 group shrink-0"
                              title="انقر للتكبير"
                            >
                              <Image src={ticketWarrantyPhoto} alt="صورة الضمان / الجهاز" fill className="object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <ZoomIn className="w-4 h-4 text-white" />
                              </div>
                            </div>
                            <div>
                              <span className="text-xs font-bold text-white block">صورة الضمان / الجهاز</span>
                              <button
                                type="button"
                                onClick={() => setPreviewPhotoUrl(ticketWarrantyPhoto)}
                                className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 mt-0.5"
                              >
                                <Eye className="w-3 h-3" />
                                <span>معاينة مكبرة</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-emerald-500/20 text-[10px] text-slate-500">
                      ملاحظة: هذا الجهاز تم تسجيله بدون إرفاق صور فاتورة أو كارت في النظام.
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Ticket Form Fields */}
              <form onSubmit={handleCreateTicketSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      required
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
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      موديل الجهاز / الصنف
                    </label>
                    <input
                      type="text"
                      value={ticketModel}
                      onChange={(e) => setTicketModel(e.target.value)}
                      placeholder="مثال: شاشة 10 بوصة / طقم ليد"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      الرقم المسلسلي <span className="text-slate-500 text-[10px] font-normal">(اختياري للقطع بدون سيريال)</span>
                    </label>
                    <input
                      type="text"
                      value={ticketSerial}
                      onChange={(e) => setTicketSerial(e.target.value)}
                      placeholder="اتركه فارغاً إذا كان بدون سيريال"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    وصف العطل أو المشكلة المبلغ عنها <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={ticketIssue}
                    onChange={(e) => setTicketIssue(e.target.value)}
                    rows={3}
                    placeholder="اكتب تفاصيل العطل المبلغ عنه من العميل أو سبب الصيانة..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-400">
                    {selectedDevice ? (
                      <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle className="w-3.5 h-3.5" /> تم ربط التذكرة ببيانات ضمان معتمدة
                      </span>
                    ) : (
                      <span className="text-slate-500">
                        تذكرة صيانة جديدة (مباشرة أو لمنتج بفاتورة)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setIsNewTicketOpen(false)}
                      className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إنشاء التذكرة الآن</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
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
