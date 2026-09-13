'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { NonSerialItem } from '@/types/admin';
import { Brand, ProductCategory } from '@/types';
import { 
  FileText, 
  Search, 
  Eye, 
  User, 
  Phone, 
  Calendar, 
  Sliders, 
  Zap, 
  Plus, 
  X, 
  CheckCircle2, 
  ArrowUpDown,
  UploadCloud,
  Loader2
} from 'lucide-react';
import Image from 'next/image';
import { compressImageToWebP } from '@/lib/image-compression';

export default function NonSerialRegistry() {
  const { nonSerialItems, addNonSerialItem } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'LED_LIGHTS' | 'DSP_PROCESSORS' | 'CAR_SCREENS'>('ALL');
  const [sortBy, setSortBy] = useState<'customerName' | 'brand' | 'purchaseDate'>('purchaseDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [brand, setBrand] = useState<Brand>('A90_PRO');
  const [category, setCategory] = useState<ProductCategory>('LED_LIGHTS');
  const [modelName, setModelName] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [invoicePhotoUrl, setInvoicePhotoUrl] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<{ sizeKb: number; reduction: number } | null>(null);

  const handleSort = (field: 'customerName' | 'brand' | 'purchaseDate') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const filteredItems = nonSerialItems
    .filter((item) => {
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.customerName.toLowerCase().includes(q) ||
        item.customerPhone.includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        item.modelName.toLowerCase().includes(q);

      const matchesCat = categoryFilter === 'ALL' || item.category === categoryFilter;

      return matchesSearch && matchesCat;
    })
    .sort((a, b) => {
      let comp = 0;
      if (sortBy === 'customerName') {
        comp = a.customerName.localeCompare(b.customerName, 'ar');
      } else if (sortBy === 'brand') {
        comp = a.brand.localeCompare(b.brand);
      } else if (sortBy === 'purchaseDate') {
        comp = new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime();
      }
      return sortOrder === 'asc' ? comp : -comp;
    });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !modelName.trim()) {
      alert('يرجى ملء الحقول المطلوبة');
      return;
    }

    addNonSerialItem({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      brand,
      category,
      modelName: modelName.trim(),
      purchaseDate,
      invoicePhotoUrl,
      notes: notes.trim(),
    });

    setIsAddOpen(false);
    setCustomerName('');
    setCustomerPhone('');
    setModelName('');
    setNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-amber-400" />
              <span>سجل الأجهزة المعتمدة بدون سيريال</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              سجل خاص بأنظمة الليدات (A90 PRO و Tal2a) ومعالجات الصوت DSP وشاشات تايجر 7 بوصة التي يتم تفعيل ضمانها بفاتورة الشراء المعتمدة
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-amber-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل جهاز جديد بدون سيريال</span>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث باسم العميل، الهاتف، الموديل..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 pl-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setCategoryFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                categoryFilter === 'ALL'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              الكل ({nonSerialItems.length})
            </button>
            <button
              onClick={() => setCategoryFilter('LED_LIGHTS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                categoryFilter === 'LED_LIGHTS'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>الليدات</span>
            </button>
            <button
              onClick={() => setCategoryFilter('DSP_PROCESSORS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                categoryFilter === 'DSP_PROCESSORS'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Sliders className="w-3 h-3 text-purple-400" />
              <span>معالجات الصوت DSP</span>
            </button>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">
                  <button
                    onClick={() => handleSort('customerName')}
                    className="flex items-center gap-1 hover:text-white font-bold"
                  >
                    <span>اسم العميل وبيانات الاتصال</span>
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
                <th className="py-3.5 px-4">الفئة المعتمدة</th>
                <th className="py-3.5 px-4">
                  <button
                    onClick={() => handleSort('purchaseDate')}
                    className="flex items-center gap-1 hover:text-white font-bold"
                  >
                    <span>تاريخ الشراء</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3.5 px-4">معاينة الفاتورة</th>
                <th className="py-3.5 px-4">ملاحظات الفرع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    لا توجد أجهزة مسجلة مطابقة لمعايير البحث.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.customerName}</span>
                        </div>
                        <div className="text-slate-400 text-[11px] flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span dir="ltr" className="font-mono">{item.customerPhone}</span>
                        </div>
                      </div>
                    </td>

                    {/* Brand & Model */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-200 block">{item.modelName}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-bold inline-block">
                          {item.brand}
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      {item.category === 'LED_LIGHTS' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[11px]">
                          <Zap className="w-3 h-3" />
                          <span>ليدات سيارات</span>
                        </span>
                      )}
                      {item.category === 'DSP_PROCESSORS' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold text-[11px]">
                          <Sliders className="w-3 h-3" />
                          <span>معالج صوت DSP</span>
                        </span>
                      )}
                      {item.category === 'CAR_SCREENS' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold text-[11px]">
                          <span>شاشة سيارة (سوفت وير)</span>
                        </span>
                      )}
                    </td>

                    {/* Purchase Date */}
                    <td className="py-3.5 px-4 text-slate-300 font-mono flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{item.purchaseDate}</span>
                    </td>

                    {/* Invoice Thumbnail Preview */}
                    <td className="py-3.5 px-4">
                      <div
                        onClick={() => setPreviewPhoto(item.invoicePhotoUrl)}
                        className="flex items-center gap-2 cursor-pointer group"
                      >
                        <div className="relative w-12 h-10 rounded-lg overflow-hidden border border-slate-700 bg-black group-hover:border-amber-500 transition-colors">
                          <Image
                            src={item.invoicePhotoUrl}
                            alt="Invoice"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="text-[11px] text-amber-400 group-hover:underline flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>معاينة الفاتورة</span>
                        </span>
                      </div>
                    </td>

                    {/* Notes */}
                    <td className="py-3.5 px-4 text-[11px] text-slate-400 max-w-[200px]">
                      <div className="space-y-0.5">
                        <span className="block truncate">{item.notes || 'سجل معتمد بالفاتورة'}</span>
                        {item.createdBy && (
                          <span className="text-[10px] text-slate-500 block">
                            بواسطة: <strong className="text-slate-400">{item.createdBy}</strong>
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <span>تسجيل جهاز جديد بدون سيريال</span>
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    اسم العميل <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="الاسم"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    رقم الهاتف <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    العلامة التجارية <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value as Brand)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="A90_PRO">A90 PRO</option>
                    <option value="TIGER">تايجر - شاشات 7 بوصة</option>
                    <option value="ROCK_MUSIC">معالجات DSP</option>
                    <option value="TAL2A">طلقة</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    فئة المنتج
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProductCategory)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="LED_LIGHTS">ليدات وإضاءات</option>
                    <option value="DSP_PROCESSORS">معالجات صوت DSP</option>
                    <option value="CAR_SCREENS">شاشات (سوفت وير)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  موديل الجهاز <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder="اكتب موديل الجهاز"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    تاريخ الشراء بالفاتورة <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    ملاحظات
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="ملاحظات إضافية..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Invoice Upload Field */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  صورة فاتورة الشراء المعتمدة <span className="text-red-400">*</span>
                </label>
                {invoicePhotoUrl ? (
                  <div className="relative rounded-xl border border-emerald-500/50 p-2 bg-slate-950 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src={invoicePhotoUrl} alt="Invoice" className="w-12 h-12 object-contain rounded-lg border border-slate-800" />
                      <div>
                        <span className="text-xs font-bold text-white block">تم إرفاق الفاتورة</span>
                        {compressionInfo && (
                          <span className="text-[10px] text-emerald-400 block font-mono">
                            WebP {compressionInfo.sizeKb} KB (توفير {compressionInfo.reduction}%)
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setInvoicePhotoUrl(''); setCompressionInfo(null); }}
                      className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded bg-red-500/10"
                    >
                      تغيير
                    </button>
                  </div>
                ) : isCompressing ? (
                  <div className="p-3 rounded-xl border border-dashed border-amber-500/60 bg-amber-500/10 flex items-center justify-center gap-2 text-xs text-amber-300 font-bold">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جارٍ ضغط الفاتورة بصيغة WebP...</span>
                  </div>
                ) : (
                  <label className="border border-dashed border-slate-700 hover:border-amber-500 rounded-xl p-3 bg-slate-950 flex items-center justify-center gap-2 cursor-pointer transition-colors text-xs text-slate-400 hover:text-slate-200">
                    <UploadCloud className="w-4 h-4 text-amber-400" />
                    <span>رفع صورة الفاتورة (ضغط تلقائي WebP &lt; 150KB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setIsCompressing(true);
                        try {
                          const res = await compressImageToWebP(file, 150 * 1024);
                          setInvoicePhotoUrl(res.dataUrl);
                          setCompressionInfo({
                            sizeKb: Math.round(res.sizeBytes / 1024),
                            reduction: res.reductionPercentage,
                          });
                        } catch (err) {
                          console.error(err);
                        } finally {
                          setIsCompressing(false);
                        }
                      }}
                    />
                  </label>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold"
                >
                  حفظ الجهاز في السجل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
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
                alt="Invoice Preview"
                fill
                className="object-contain"
              />
            </div>
            <div className="p-3 text-center text-xs text-slate-300">
              معاينة فاتورة الشراء الأصلية المسجلة
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
