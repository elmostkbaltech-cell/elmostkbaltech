'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { Shipment } from '@/types/admin';
import { Brand, ProductCategory } from '@/types';
import { 
  Plus, 
  Package, 
  UploadCloud, 
  Calendar, 
  Tag, 
  Layers, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  Download
} from 'lucide-react';
import ShipmentDetailModal from './ShipmentDetailModal';

export default function ShipmentManager() {
  const { shipments, createShipment } = useAdmin();
  const [activeModalShipment, setActiveModalShipment] = useState<Shipment | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [brand, setBrand] = useState<Brand>('AIWA');
  const [category, setCategory] = useState<ProductCategory>('CAR_SCREENS');
  const [arrivalDate, setArrivalDate] = useState(new Date().toISOString().split('T')[0]);
  const [modelName, setModelName] = useState('');
  const [notes, setNotes] = useState('');
  const [serialText, setSerialText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Handle Drag & Drop or File Upload for CSV / Excel (.xlsx, .xls) / TXT
  const handleFileUpload = async (file: File) => {
    setFileName(file.name);
    try {
      const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
      if (isExcel) {
        const XLSX = await import('xlsx');
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        const extracted: string[] = [];
        for (const row of rows) {
          if (Array.isArray(row)) {
            for (const cell of row) {
              if (cell !== null && cell !== undefined) {
                const str = String(cell).trim();
                // Filter out common column header names
                if (
                  str.length > 2 &&
                  !['SERIAL', 'SERIALS', 'SERIAL NUMBER', 'SERIAL_NUMBER', 'السيريال', 'رقم السيريال', 'سيريال'].includes(
                    str.toUpperCase()
                  )
                ) {
                  extracted.push(str.toUpperCase());
                }
              }
            }
          }
        }
        setSerialText(Array.from(new Set(extracted)).join('\n'));
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          if (text) {
            // Parse CSV or text lines
            const lines = text
              .split(/[\r\n,;\t]+/)
              .map((s) => s.trim().toUpperCase())
              .filter(
                (s) =>
                  s.length > 2 &&
                  !['SERIAL', 'SERIALS', 'SERIAL NUMBER', 'SERIAL_NUMBER', 'السيريال', 'رقم السيريال', 'سيريال'].includes(s)
              );
            setSerialText(Array.from(new Set(lines)).join('\n'));
          }
        };
        reader.readAsText(file);
      }
    } catch (err) {
      console.error('Error parsing shipment file:', err);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const downloadExcelTemplate = async () => {
    try {
      const XLSX = await import('xlsx');
      const ws = XLSX.utils.aoa_to_sheet([
        ['SERIAL_NUMBER', 'BRAND', 'MODEL_NAME', 'NOTES'],
        ['AIWA-9INCH-2026-001', 'AIWA', 'شاشة أيوة 9 بوصة', 'شحنة الاستيراد'],
        ['AIWA-9INCH-2026-002', 'AIWA', 'شاشة أيوة 9 بوصة', 'شحنة الاستيراد'],
        ['TIGER-7INCH-2026-001', 'TIGER', 'شاشة تايجر 7 بوصة', 'شحنة التوفيقية'],
        ['A90-LED-2026-001', 'A90_PRO', 'ليدات سيارات A90', 'شحنة التوفيقية'],
      ]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'السيريالات');
      XLSX.writeFile(wb, 'نموذج_سيريالات_شحنة_المستقبل_تك.xlsx');
    } catch (e) {
      console.error('Error generating Excel template:', e);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('يرجى كتابة اسم الشحنة');
      return;
    }

    const serialList = serialText
      .split(/[\r\n,;\t]+/)
      .map((s) => s.trim().toUpperCase())
      .filter((s) => s.length > 2);

    if (serialList.length === 0) {
      setFormError('يرجى إدخال أو رفع السيريالات الخاصة بالشحنة (سيريال واحد على الأقل)');
      return;
    }

    const res = createShipment({
      name: name.trim(),
      brand,
      category,
      arrivalDate,
      notes: notes.trim(),
      rawSerials: serialList,
      modelName: modelName.trim() || undefined,
    });

    if (res.success) {
      setSuccessToast(`تمت إضافة الشحنة بنجاح وحفظ ${res.count} سيريالات معتمدة`);
      setTimeout(() => setSuccessToast(null), 4000);
      setIsCreateOpen(false);
      // Reset form
      setName('');
      setSerialText('');
      setFileName(null);
      setNotes('');
      setModelName('');
    }
  };

  const parsedSerialsCount = serialText
    .split(/[\r\n,;\t]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2).length;

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-400" />
            <span>إدارة الشحنات ومجموعات الاستيراد</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            نظام فرز وعزل السيريالات حسب الشحنة لمنع اختلاط ملايين الأجهزة والتحكم الذكي في انتهاء الصلاحية
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء شحنة استيراد جديدة</span>
        </button>
      </div>

      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Shipments List */}
      {shipments.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white mb-1">لا توجد شحنات استيراد مسجلة حتى الآن</h3>
          <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
            يمكنك إضافة شحنة جديدة ورفع السيريالات الخاصة بالفرع عبر زر &quot;إنشاء شحنة استيراد جديدة&quot; أعلاه.
          </p>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all"
          >
            إنشاء أول شحنة الآن
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shipments.map((shipment) => {
            return (
              <div
                key={shipment.id}
                className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-5 transition-all hover:shadow-xl group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">
                        {shipment.id}
                      </span>
                      <h3 className="text-base font-black text-white mt-1.5 group-hover:text-blue-400 transition-colors">
                        {shipment.name}
                      </h3>
                    </div>
                    <div className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-black text-white">
                      {shipment.brand}
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mb-4 line-clamp-2">
                    {shipment.notes || 'لا توجد ملاحظات إضافية على هذه الشحنة.'}
                  </p>

                  {/* Metrics Badges */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-4 text-center">
                    <div>
                      <div className="text-[10px] text-slate-500 font-semibold">الإجمالي</div>
                      <div className="text-sm font-black text-white">{shipment.totalUnits}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-emerald-400/80 font-semibold">مفعل</div>
                      <div className="text-sm font-black text-emerald-400">{shipment.totalActivated}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-blue-400/80 font-semibold">متاح</div>
                      <div className="text-sm font-black text-blue-400">{shipment.totalAvailable}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                  <div className="flex flex-col gap-0.5">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>وصول: {shipment.arrivalDate}</span>
                    </span>
                    {shipment.createdBy && (
                      <span className="text-[10px] text-slate-500">
                        أنشئت بواسطة: <strong className="text-slate-300">{shipment.createdBy}</strong>
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveModalShipment(shipment)}
                    className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 group-hover:underline"
                  >
                    <span>عرض التفاصيل</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Shipment Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-400" />
                <span>إنشاء شحنة جديدة ورفع السيريالات المعتمدة</span>
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  اسم الشحنة / المجموعة المستوردة <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="اكتب اسم الشحنة"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    العلامة التجارية <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value as Brand)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="AIWA">AIWA</option>
                    <option value="TIGER">TIGER</option>
                    <option value="A90_PRO">A90 PRO</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">فئة المنتج</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProductCategory)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="CAR_SCREENS">شاشات السيارات</option>
                    <option value="LED_LIGHTS">ليدات وإضاءات</option>
                    <option value="DSP_PROCESSORS">معالجات صوت DSP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    تاريخ الوصول <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={arrivalDate}
                    onChange={(e) => setArrivalDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  اسم الموديل الافتراضي (اختياري)
                </label>
                <input
                  type="text"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder="اسم الموديل الافتراضي"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Drag and drop / bulk serials */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-300">رفع السيريالات بالجملة (ملف إكسيل أو CSV أو نصي)</span>
                    <span className="text-[11px] text-blue-400 font-normal">
                      (العدد المقروء: {parsedSerialsCount} سيريال)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={downloadExcelTemplate}
                    className="self-start sm:self-auto text-[11px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تحميل نموذج إكسيل جاهز (.xlsx)</span>
                  </button>
                </div>

                {/* Dropzone */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-slate-700 hover:border-blue-500/70 bg-slate-950/60 rounded-xl p-5 text-center cursor-pointer transition-colors mb-3"
                  onClick={() => document.getElementById('fileInput')?.click()}
                >
                  <input
                    type="file"
                    id="fileInput"
                    accept=".csv,.txt,.xlsx,.xls"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />
                  <UploadCloud className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-xs text-white font-bold">
                    اسحب وأفلت ملف السيريالات هنا، أو انقر للاختيار
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    يدعم ملفات CSV أو Excel أو ملفات نصية TXT (كل سيريال في سطر أو مفصول بفواصل)
                  </p>
                  {fileName && (
                    <div className="mt-2 text-xs text-emerald-400 font-bold flex items-center justify-center gap-1">
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>الملف المحدد: {fileName}</span>
                    </div>
                  )}
                </div>

                {/* Direct Textarea fallback */}
                <textarea
                  value={serialText}
                  onChange={(e) => setSerialText(e.target.value)}
                  rows={4}
                  placeholder="أو اكتب/الصق السيريالات هنا مباشرة (كل سيريال في سطر جديد)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  ملاحظات إدارية عن الشحنة
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ملاحظات إضافية عن الشحنة..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30"
                >
                  حفظ الشحنة واعتماد السيريالات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shipment Detail Modal */}
      {activeModalShipment && (
        <ShipmentDetailModal
          shipment={activeModalShipment}
          onClose={() => setActiveModalShipment(null)}
        />
      )}
    </div>
  );
}
