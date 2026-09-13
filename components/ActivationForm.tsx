'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import BrandCategorySelector from './BrandCategorySelector';
import { 
  ShieldCheck, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  ArrowLeft, 
  ArrowRight, 
  Loader2, 
  Sparkles, 
  AlertTriangle,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { compressImageToWebP } from '@/lib/image-compression';

export default function ActivationForm() {
  const {
    selectedBrand,
    selectedCategory,
    selectedSubModel,
    verifySerial,
    registerNewWarranty,
    setActiveTab,
    setCurrentWarranty,
    batchSerials,
    t,
    language,
  } = useApp();

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [storeName, setStoreName] = useState('');

  // Uploaded files
  const [warrantyCardPhoto, setWarrantyCardPhoto] = useState<string | null>(null);
  const [invoicePhoto, setInvoicePhoto] = useState<string | null>(null);
  const [compressingField, setCompressingField] = useState<'card' | 'invoice' | null>(null);
  const [compressionInfo, setCompressionInfo] = useState<{ [key: string]: { sizeKb: number; reduction: number } }>({});

  // Live Serial Verification State
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    status: 'IDLE' | 'AVAILABLE' | 'CLAIMED' | 'REVOKED' | 'NOT_FOUND';
    message?: string;
    modelName?: string;
  }>({ status: 'IDLE' });

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Determine if serial number is mandatory based on brand & sub-model
  // AIWA screens (Diamond & 9 Inch): Serial is MANDATORY
  // TIGER 9 Inch screens: Serial is MANDATORY
  // TIGER 7 Inch screens: Serial is NOT mandatory (Software only)
  // A90 PRO LEDs: Serial is NOT mandatory (Invoice with date only)
  const isSerialMandatory = 
    (selectedBrand === 'AIWA') ||
    (selectedBrand === 'TIGER' && selectedSubModel === '9 بوصه');

  // Determine if warranty card photo is mandatory
  const isWarrantyCardMandatory = 
    (selectedBrand === 'AIWA') ||
    (selectedBrand === 'TIGER' && selectedSubModel === '9 بوصه');

  // Live serial checking
  useEffect(() => {
    if (!isSerialMandatory) {
      setVerificationResult({ status: 'IDLE' });
      return;
    }

    const trimmed = serialNumber.trim().toUpperCase();
    if (!trimmed || trimmed.length < 4) {
      setVerificationResult({ status: 'IDLE' });
      return;
    }

    setIsVerifying(true);
    const timer = setTimeout(() => {
      const result = verifySerial(trimmed);

      if (result.status === 'AVAILABLE') {
        setVerificationResult({
          status: 'AVAILABLE',
          modelName: result.batch?.modelName,
          message: t.serialAvailable,
        });
      } else if (result.status === 'CLAIMED') {
        setVerificationResult({
          status: 'CLAIMED',
          modelName: result.batch?.modelName,
          message: t.serialClaimed,
        });
      } else if (result.status === 'REVOKED') {
        setVerificationResult({
          status: 'REVOKED',
          modelName: result.batch?.modelName,
          message: t.serialRevoked,
        });
      } else {
        setVerificationResult({
          status: 'NOT_FOUND',
          message: t.serialNotFound,
        });
      }
      setIsVerifying(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [serialNumber, isSerialMandatory, batchSerials, language]);

  // Handle File Uploads with Automatic WebP Compression (< 150KB)
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'card' | 'invoice',
    setter: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressingField(field);
    try {
      // Automatic client-side compression to WebP (< 150KB)
      const res = await compressImageToWebP(file, 150 * 1024);
      setter(res.dataUrl);
      setCompressionInfo((prev) => ({
        ...prev,
        [field]: {
          sizeKb: Math.round(res.sizeBytes / 1024),
          reduction: res.reductionPercentage,
        },
      }));
    } catch (err) {
      console.error('Image compression error:', err);
      // Fallback
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setCompressingField(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim()) {
      setErrorMessage(language === 'ar' ? 'يرجى إدخال اسم العميل بالكامل.' : 'Please enter customer full name.');
      return;
    }

    if (!customerPhone.trim() || customerPhone.length < 10) {
      setErrorMessage(language === 'ar' ? 'يرجى إدخال رقم هاتف محمول صحيح.' : 'Please enter a valid mobile phone number.');
      return;
    }

    // Serial validation
    if (isSerialMandatory) {
      if (!serialNumber.trim()) {
        setErrorMessage(language === 'ar' ? 'الرقم المسلسلي إجباري لهذا الموديل.' : 'Serial number is mandatory for this model.');
        return;
      }
      if (verificationResult.status === 'NOT_FOUND') {
        setErrorMessage(t.serialNotFound);
        return;
      }
      if (verificationResult.status === 'CLAIMED') {
        setErrorMessage(t.serialClaimed);
        return;
      }
      if (verificationResult.status === 'REVOKED') {
        setErrorMessage(t.serialRevoked);
        return;
      }
    }

    // Document validation
    if (isWarrantyCardMandatory && !warrantyCardPhoto) {
      setErrorMessage(language === 'ar' ? 'يرجى رفع صورة كرت الضمان (إجباري لهذا الموديل).' : 'Warranty card photo is mandatory.');
      return;
    }

    if (!invoicePhoto) {
      setErrorMessage(language === 'ar' ? 'يرجى رفع صورة فاتورة الشراء بالتاريخ (إجباري).' : 'Purchase invoice photo with date is mandatory.');
      return;
    }

    setIsSubmitting(true);

    try {
      const modelDisplayName = selectedSubModel 
        ? `${selectedBrand} - ${selectedSubModel}`
        : `${selectedBrand} ${selectedCategory}`;

      const created = await registerNewWarranty({
        brand: selectedBrand,
        category: selectedCategory,
        modelName: modelDisplayName,
        serialNumber: isSerialMandatory || serialNumber.trim() ? serialNumber : undefined,
        customerName,
        customerPhone,
        purchaseDate,
        devicePhotoUrl: warrantyCardPhoto || undefined,
        invoicePhotoUrl: invoicePhoto,
        packagingPhotoUrl: warrantyCardPhoto || undefined,
      });

      setTimeout(() => {
        setIsSubmitting(false);
        setCurrentWarranty(created);
        setActiveTab('dashboard');
      }, 1000);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      setErrorMessage(language === 'ar' ? 'حدث خطأ أثناء التسجيل. يرجى المحاولة ثانية.' : 'Error during activation.');
    }
  };

  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-900/60 border border-brand-200 dark:border-brand-500/30 text-brand-700 dark:text-brand-300 text-xs font-bold mb-3 shadow-sm dark:shadow-glow-blue">
          <Sparkles className="w-3.5 h-3.5 text-accent-orange" />
          <span>{t.officialAuthorizedAgent}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          {t.activationTitle}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-xl mx-auto">
          {t.activationSubtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Step 1: Brand & Category Selection */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-md">
          <BrandCategorySelector />
        </div>

        {/* Step 2: Personal Info */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-black">1</span>
            <span>{t.personalInfoSection}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t.fullNameLabel} <span className="text-accent-red">*</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={t.fullNamePlaceholder}
                className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700 focus:border-brand-500 text-slate-900 dark:text-slate-100 text-sm rounded-xl py-2.5 px-3.5 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t.phoneLabel} <span className="text-accent-red">*</span>
              </label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder={t.phonePlaceholder}
                className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700 focus:border-brand-500 text-slate-900 dark:text-slate-100 text-sm rounded-xl py-2.5 px-3.5 outline-none transition-colors font-mono"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Device & Serial Verification */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-black">2</span>
            <span>{t.deviceInfoSection}</span>
          </h3>

          {/* Conditional Serial Input */}
          {isSerialMandatory ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t.serialNumberLabel} <span className="text-accent-red font-bold">({language === 'ar' ? 'إجباري' : 'Mandatory'}) *</span>
                </label>

                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
                    placeholder={selectedBrand === 'AIWA' ? 'AIWA-SCR-8821' : 'TGR-9IN-5501'}
                    className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700 focus:border-brand-500 text-slate-900 dark:text-slate-100 text-sm font-mono tracking-wider rounded-xl py-3 px-3.5 pr-10 outline-none uppercase transition-colors"
                  />
                  <div className={`absolute ${language === 'ar' ? 'left-3' : 'right-3'}`}>
                    {isVerifying ? (
                      <Loader2 className="w-5 h-5 text-brand-600 dark:text-brand-400 animate-spin" />
                    ) : verificationResult.status === 'AVAILABLE' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : verificationResult.status === 'CLAIMED' ? (
                      <AlertCircle className="w-5 h-5 text-amber-500" />
                    ) : verificationResult.status === 'REVOKED' || verificationResult.status === 'NOT_FOUND' ? (
                      <XCircle className="w-5 h-5 text-red-500" />
                    ) : null}
                  </div>
                </div>

                {/* Verification result feedback */}
                <AnimatePresence>
                  {verificationResult.status !== 'IDLE' && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className={`mt-2.5 p-3 rounded-xl border text-xs font-semibold flex items-start gap-2.5 ${
                        verificationResult.status === 'AVAILABLE'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-600/50 text-emerald-800 dark:text-emerald-200'
                          : verificationResult.status === 'CLAIMED'
                          ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-600/50 text-amber-800 dark:text-amber-200'
                          : 'bg-red-50 dark:bg-red-950/70 border-red-300 dark:border-red-600/60 text-red-800 dark:text-red-200'
                      }`}
                    >
                      {verificationResult.status === 'AVAILABLE' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div>{verificationResult.message}</div>
                        {verificationResult.modelName && (
                          <div className="mt-1 text-[11px] font-mono text-slate-700 dark:text-white/90">
                            {verificationResult.modelName}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {selectedBrand === 'TIGER' && selectedSubModel === '7 بوصه'
                  ? language === 'ar' ? 'شاشات تايجر 7 بوصة: التفعيل يتم بفاتورة الشراء فقط (الضمان على السوفت وير فقط)' : 'TIGER 7" Screen: Activated by invoice only (Software warranty)'
                  : selectedBrand === 'A90_PRO'
                  ? language === 'ar' ? 'ليدات A90 PRO: التفعيل يتم بفاتورة الشراء بالتاريخ' : 'A90 PRO LEDs: Activated by stamped invoice with date'
                  : language === 'ar' ? 'التفعيل يتم بفاتورة الشراء المعتمدة' : 'Activated via stamped purchase invoice'}
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t.purchaseDateLabel} <span className="text-accent-red">*</span>
              </label>
              <input
                type="date"
                required
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700 focus:border-brand-500 text-slate-900 dark:text-slate-100 text-sm rounded-xl py-2.5 px-3.5 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t.storeNameLabel}
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder={t.storeNamePlaceholder}
                className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700 focus:border-brand-500 text-slate-900 dark:text-slate-100 text-sm rounded-xl py-2.5 px-3.5 outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Step 4: Mandatory Document Uploads */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-md space-y-5">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-black">3</span>
            <span>{t.uploadSectionTitle}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Upload: Warranty Card Photo (If Mandatory) */}
            {isWarrantyCardMandatory && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t.warrantyCardPhotoLabel} <span className="text-accent-red font-bold">({language === 'ar' ? 'إجباري' : 'Mandatory'}) *</span>
                </label>

                {warrantyCardPhoto ? (
                  <div className="relative rounded-xl border border-emerald-500/50 overflow-hidden bg-slate-100 dark:bg-slate-950 p-2">
                    <img
                      src={warrantyCardPhoto}
                      alt="Warranty Card"
                      className="w-full h-40 object-contain rounded-lg"
                    />
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold">
                        {language === 'ar' ? 'تم الرفع' : 'Uploaded'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setWarrantyCardPhoto(null)}
                        className="p-1 rounded bg-red-600 text-white text-xs hover:bg-red-500"
                      >
                        {t.removeImage}
                      </button>
                    </div>
                    {compressionInfo.card && (
                      <div className="mt-2 text-center text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                        {language === 'ar'
                          ? `✓ تم ضغط كرت الضمان تلقائياً (حجم ${compressionInfo.card.sizeKb} ك.ب - توفير ${compressionInfo.card.reduction}%)`
                          : `✓ Warranty card compressed (${compressionInfo.card.sizeKb} KB - saved ${compressionInfo.card.reduction}%)`}
                      </div>
                    )}
                  </div>
                ) : compressingField === 'card' ? (
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-brand-500 rounded-xl p-8 bg-brand-50/50 dark:bg-brand-950/40">
                    <Loader2 className="w-8 h-8 text-brand-600 animate-spin mb-2" />
                    <span className="text-xs font-bold text-brand-700 dark:text-brand-300">
                      {language === 'ar' ? 'جارٍ معالجة وضغط الصورة بصيغة WebP...' : 'Processing and compressing image to WebP...'}
                    </span>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 rounded-xl p-5 bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-950 cursor-pointer transition-all">
                    <UploadCloud className="w-8 h-8 text-brand-600 dark:text-brand-400 mb-2" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 text-center">
                      {language === 'ar' ? 'رفع صورة كرت الضمان المكتوب عليه التاريخ' : 'Upload Warranty Card Photo (with date)'}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1">
                      {t.supportedFormats} {language === 'ar' ? '(ضغط تلقائي أقل من 150 ك.ب)' : '(Auto compression < 150KB)'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'card', setWarrantyCardPhoto)}
                    />
                  </label>
                )}
              </div>
            )}

            {/* Upload: Purchase Invoice Photo (Always Mandatory) */}
            <div className={`space-y-2 ${!isWarrantyCardMandatory ? 'md:col-span-2' : ''}`}>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {t.invoicePhotoLabel} <span className="text-accent-red font-bold">({language === 'ar' ? 'إجباري' : 'Mandatory'}) *</span>
              </label>

              {invoicePhoto ? (
                <div className="relative rounded-xl border border-emerald-500/50 overflow-hidden bg-slate-100 dark:bg-slate-950 p-2">
                  <img
                    src={invoicePhoto}
                    alt="Purchase Receipt"
                    className="w-full h-40 object-contain rounded-lg"
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold">
                      {language === 'ar' ? 'تم الرفع' : 'Uploaded'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setInvoicePhoto(null)}
                      className="p-1 rounded bg-red-600 text-white text-xs hover:bg-red-500"
                    >
                      {t.removeImage}
                    </button>
                  </div>
                  {compressionInfo.invoice && (
                    <div className="mt-2 text-center text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                      {language === 'ar'
                        ? `✓ تم ضغط صورة الفاتورة تلقائياً (حجم ${compressionInfo.invoice.sizeKb} ك.ب - توفير ${compressionInfo.invoice.reduction}%)`
                        : `✓ Purchase invoice compressed (${compressionInfo.invoice.sizeKb} KB - saved ${compressionInfo.invoice.reduction}%)`}
                    </div>
                  )}
                </div>
              ) : compressingField === 'invoice' ? (
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-accent-orange rounded-xl p-8 bg-amber-50/50 dark:bg-amber-950/40">
                  <Loader2 className="w-8 h-8 text-accent-orange animate-spin mb-2" />
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                    {language === 'ar' ? 'جارٍ معالجة وضغط صورة الفاتورة بصيغة WebP...' : 'Processing and compressing invoice image...'}
                  </span>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 rounded-xl p-5 bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-950 cursor-pointer transition-all">
                  <UploadCloud className="w-8 h-8 text-accent-orange mb-2" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 text-center">
                    {language === 'ar' ? 'رفع صورة فاتورة الشراء موضحاً بها التاريخ وختم المحل' : 'Upload Purchase Invoice with Date & Stamp'}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1">
                    {t.supportedFormats} {language === 'ar' ? '(ضغط تلقائي أقل من 150 ك.ب)' : '(Auto compression < 150KB)'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'invoice', setInvoicePhoto)}
                  />
                </label>
              )}
            </div>

          </div>

          {/* Dynamic Warning Alert in Step 3 */}
          {isWarrantyCardMandatory ? (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-600/60 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>{t.warnWarrantyCardDate}</span>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-600/60 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>{t.warnInvoiceDate}</span>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/80 border border-red-300 dark:border-red-600 text-red-800 dark:text-red-200 text-xs font-bold flex items-center gap-3 shadow-sm">
            <XCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={isSubmitting || (isSerialMandatory && verificationResult.status !== 'AVAILABLE')}
            className={`w-full py-4 rounded-2xl font-black text-base shadow-lg flex items-center justify-center gap-3 transition-all ${
              isSubmitting || (isSerialMandatory && verificationResult.status !== 'AVAILABLE')
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700'
                : 'bg-gradient-to-r from-accent-red via-accent-orange to-amber-500 hover:from-accent-red/90 hover:to-amber-500 text-white shadow-glow-orange cursor-pointer'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin text-white" />
                <span>{t.submitting}</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-6 h-6 text-white" />
                <span>{t.submitActivation}</span>
                <ArrowIcon className="w-5 h-5 text-white" />
              </>
            )}
          </motion.button>
        </div>

      </form>
    </div>
  );
}
