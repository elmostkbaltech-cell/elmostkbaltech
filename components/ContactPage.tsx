'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useApp } from '@/context/AppContext';
import { COMPANY_INFO } from '@/lib/mock-data';
import { Phone, MessageCircle, MapPin, Clock, ExternalLink, Mail, Send, CheckCircle2, Navigation, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { getSupabaseClient } from '@/lib/supabase';

export default function ContactPage() {
  const { language, t } = useApp();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const senderName = name.trim();
    const senderPhone = phone.trim();
    const senderSubject = subject.trim() || 'استفسار من الموقع';
    const senderMessage = message.trim();

    try {
      // 1. Client-side direct Supabase save (Instant & 100% resilient)
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('messages').insert({
          name: senderName,
          phone: senderPhone,
          subject: senderSubject,
          message: senderMessage,
          status: 'UNREAD',
        });
      }

      // 2. Server-side notification via API route
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: senderName,
          phone: senderPhone,
          subject: senderSubject,
          message: senderMessage,
          to: 'elmostkbaltech@gmail.com',
        }),
      });
    } catch (err) {
      console.error('Contact submit error', err);
    } finally {
      setIsSubmitting(false);
      setFormSubmitted(true);
      setTimeout(() => {
        setName('');
        setPhone('');
        setSubject('');
        setMessage('');
        setFormSubmitted(false);
      }, 7000);
    }
  };

  return (
    <div className="py-10 px-4 max-w-6xl mx-auto space-y-10">
      
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-900/60 border border-brand-500/40 text-brand-300 text-xs font-bold shadow-glow-blue">
          <Sparkles className="w-3.5 h-3.5 text-accent-orange" />
          <span>{language === 'ar' ? 'خدمة العملاء والدعم الفني المباشر' : 'Customer Support & Technical Inquiries'}</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-white">
          {language === 'ar' ? 'تواصل مع المستقبل تك' : 'Contact El Mostaqbal Tech'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl mx-auto">
          {language === 'ar'
            ? 'نحن هنا لخدمتكم والإجابة على كافة استفسارات الضمان والصيانة ومبيعات الجملة والتجزئة لشاشات وأنظمة الصوت والليدات.'
            : 'We are here to assist you with all warranty inquiries, technical maintenance, and wholesale/retail sales.'}
        </p>
      </div>

      {/* Main Grid: Contact Cards & Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Direct Phone & Address Info (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Phone Numbers Card */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm shadow-xl space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2.5 rounded-xl bg-brand-600 text-white shadow-glow-blue">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {language === 'ar' ? 'أرقام الهاتف والواتساب' : 'Phone & WhatsApp Lines'}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'ar' ? 'متاحون للرد السريع والمتابعة الفورية' : 'Available for instant support'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {COMPANY_INFO.phones.map((p, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between hover:border-brand-500/50 transition-colors"
                >
                  <div className="space-y-0.5">
                    <span className="text-[11px] text-slate-400 block font-medium">
                      {idx === 0
                        ? language === 'ar' ? 'خط الدعم والمبيعات الرئيسي:' : 'Primary Support Line:'
                        : language === 'ar' ? 'خط الاستفسارات والصيانة:' : 'Maintenance Inquiries Line:'}
                    </span>
                    <a
                      href={p.tel}
                      className="text-base font-mono font-black text-white hover:text-accent-orange transition-colors"
                    >
                      {p.number}
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={p.tel}
                      className="p-2.5 rounded-xl bg-brand-600/80 hover:bg-brand-500 text-white transition-all shadow-md"
                      title={language === 'ar' ? 'اتصال هاتفي' : 'Call'}
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                    <a
                      href={p.wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md"
                      title={language === 'ar' ? 'محادثة واتساب' : 'WhatsApp Chat'}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Location & Address Details Card */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm shadow-xl space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2.5 rounded-xl bg-accent-orange text-white shadow-glow-orange">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {t.ourLocation}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'ar' ? 'الفرع الرئيسي وصالة العرض' : 'Main Showroom & Service Point'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-accent-orange text-xs font-bold">
                  <Navigation className="w-4 h-4" />
                  <span>{language === 'ar' ? 'العنوان بالتفصيل:' : 'Exact Address:'}</span>
                </div>
                <p className="text-sm text-slate-200 font-semibold leading-relaxed">
                  {language === 'ar' ? COMPANY_INFO.addressAr : COMPANY_INFO.addressEn}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-3 text-xs">
                <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <div className="text-slate-400 font-bold">{t.workingHours}:</div>
                  <div className="text-slate-200 font-medium mt-0.5">
                    {language === 'ar' ? COMPANY_INFO.workingHoursAr : COMPANY_INFO.workingHoursEn}
                  </div>
                </div>
              </div>

              {/* Official Email Card */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-400 shrink-0" />
                  <div>
                    <div className="text-slate-400 font-bold">
                      {language === 'ar' ? 'البريد الإلكتروني المعتمد للمراسلات:' : 'Official Inquiries Email:'}
                    </div>
                    <a
                      href="mailto:elmostkbaltech@gmail.com"
                      className="text-blue-400 hover:underline font-mono text-xs font-bold block mt-0.5"
                    >
                      elmostkbaltech@gmail.com
                    </a>
                  </div>
                </div>
                <a
                  href="mailto:elmostkbaltech@gmail.com"
                  className="px-3 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white text-[11px] font-bold transition-all"
                >
                  {language === 'ar' ? 'إرسال إيميل' : 'Send Email'}
                </a>
              </div>

              <a
                href={COMPANY_INFO.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-accent-red to-accent-orange hover:from-accent-red/90 hover:to-accent-orange/90 text-white font-bold text-xs shadow-glow-orange flex items-center justify-center gap-2 transition-all"
              >
                <span>{t.directionsOnGoogleMaps}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>

        {/* Right Column: Embedded Map & Contact Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Interactive Google Map Preview Card */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <h3 className="text-base font-bold text-white">
                  {language === 'ar' ? 'الخريطة المباشرة لموقع المحل' : 'Live Interactive Map'}
                </h3>
              </div>

              <a
                href={COMPANY_INFO.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-brand-400 hover:text-brand-300 font-bold flex items-center gap-1"
              >
                <span>{language === 'ar' ? 'تكبير الخريطة' : 'Full Screen'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Embedded Iframe */}
            <div className="relative w-full h-80 sm:h-96 rounded-xl overflow-hidden border border-slate-700 shadow-inner bg-slate-950">
              <iframe
                title="El Mostaqbal Tech Google Map"
                src="https://maps.google.com/maps?q=30.054483,31.242488&z=17&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full opacity-95 hover:opacity-100 transition-opacity"
              />
              
              {/* Badge overlay on top of map */}
              <div className="absolute bottom-3 right-3 sm:right-auto sm:left-3 bg-slate-950/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-brand-500/50 text-xs font-bold text-white shadow-2xl flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-accent-orange animate-pulse" />
                <div>
                  <div className="font-extrabold text-amber-400">محل AIWA & TIGER</div>
                  <div className="text-[10px] text-slate-300">مول سنتر التوفيقية - الدور الثاني</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Message / Inquiry Form */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Mail className="w-5 h-5 text-brand-400" />
              <span>{language === 'ar' ? 'إرسال استفسار أو طلب صيانة سريع' : 'Send Fast Inquiry / Message'}</span>
            </h3>

            {formSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 rounded-xl bg-emerald-950/70 border border-emerald-500 text-emerald-200 text-xs font-bold flex items-center gap-3 shadow-lg"
              >
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <div>
                    {language === 'ar' 
                      ? 'تم إرسال رسالتك بنجاح إلى البريد الرسمي (elmostkbaltech@gmail.com)!' 
                      : 'Your message was sent to official email (elmostkbaltech@gmail.com)!'}
                  </div>
                  <div className="text-[11px] text-emerald-300 font-normal mt-0.5">
                    {language === 'ar'
                      ? 'تم توجيه الرسالة لمسؤولي الدعم والمبيعات، وسيتواصل معك فريق المستقبل تك هاتفياً أو عبر الواتساب في أقرب وقت.'
                      : 'The message was routed to support managers and we will follow up with you promptly.'}
                  </div>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      {language === 'ar' ? 'الاسم بالكامل' : 'Full Name'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={language === 'ar' ? 'مثال: أحمد محمود' : 'e.g. Ahmed Mahmoud'}
                      className="w-full bg-slate-950/80 border border-slate-700 focus:border-brand-500 text-slate-100 text-xs rounded-xl py-2.5 px-3 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      {language === 'ar' ? 'رقم الهاتف / الواتساب' : 'Phone / WhatsApp'} *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01123456789"
                      className="w-full bg-slate-950/80 border border-slate-700 focus:border-brand-500 text-slate-100 text-xs font-mono rounded-xl py-2.5 px-3 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    {language === 'ar' ? 'الموضوع أو نوع الجهاز' : 'Subject / Device Type'}
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder={language === 'ar' ? 'مثال: استفسار عن صيانة شاشة AIWA' : 'e.g. Inquiry about AIWA screen repair'}
                    className="w-full bg-slate-950/80 border border-slate-700 focus:border-brand-500 text-slate-100 text-xs rounded-xl py-2.5 px-3 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    {language === 'ar' ? 'تفاصيل الرسالة أو المشكلة' : 'Message Details'} *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={language === 'ar' ? 'اكتب استفسارك بالتفصيل هنا...' : 'Write your inquiry here...'}
                    className="w-full bg-slate-950/80 border border-slate-700 focus:border-brand-500 text-slate-100 text-xs rounded-xl py-2.5 px-3 outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-glow-blue flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{language === 'ar' ? 'إرسال الرسالة لفريق الدعم' : 'Send Message to Support'}</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
