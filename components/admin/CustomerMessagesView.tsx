'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { CustomerMessage } from '@/types/admin';
import { 
  Mail, 
  Search, 
  Phone, 
  MessageCircle, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Check, 
  Calendar, 
  User, 
  Inbox
} from 'lucide-react';

export default function CustomerMessagesView() {
  const { customerMessages, markMessageAsRead, deleteMessage } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNREAD' | 'READ'>('ALL');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredMessages = customerMessages
    .filter((msg) => {
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        msg.name.toLowerCase().includes(q) ||
        msg.phone.includes(q) ||
        (msg.subject && msg.subject.toLowerCase().includes(q)) ||
        msg.message.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'ALL' || msg.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalCount = customerMessages.length;
  const unreadCount = customerMessages.filter((m) => m.status === 'UNREAD').length;
  const readCount = customerMessages.filter((m) => m.status === 'READ').length;

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذه الرسالة نهائياً؟')) {
      setDeletingId(id);
      await deleteMessage(id);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Summary */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Mail className="w-6 h-6 text-blue-400" />
              <span>رسائل واستفسارات العملاء المباشرة</span>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold animate-pulse">
                  {unreadCount} رسالة جديدة
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              صندوق الوارد لكافة الاستفسارات والطلبات المرسلة من صفحة تواصل معنا بالموقع مع الرد السريع عبر واتساب
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block font-medium">إجمالي الرسائل</span>
            <span className="text-xl font-black text-white mt-1 block">{totalCount}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/30 text-center">
            <span className="text-[11px] text-red-300 block font-medium">رسائل جديدة غير مقروءة</span>
            <span className="text-xl font-black text-red-400 mt-1 block">{unreadCount}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-center">
            <span className="text-[11px] text-emerald-300 block font-medium">تمت متابعتها والرد</span>
            <span className="text-xl font-black text-emerald-400 mt-1 block">{readCount}</span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث بالاسم أو الهاتف أو نص الرسالة..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pr-10 pl-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              الكل ({totalCount})
            </button>
            <button
              onClick={() => setStatusFilter('UNREAD')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === 'UNREAD'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              غير مقروء ({unreadCount})
            </button>
            <button
              onClick={() => setStatusFilter('READ')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === 'READ'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              تمت المتابعة ({readCount})
            </button>
          </div>
        </div>
      </div>

      {/* Messages List */}
      {filteredMessages.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <Inbox className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white mb-1">لا توجد رسائل مطابقة حالياً</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            ستظهر هنا مباشرة أي رسائل أو استفسارات يرسلها العملاء من الموقع الإلكتروني.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredMessages.map((msg) => {
            const cleanPhone = msg.phone.replace(/[^0-9]/g, '');
            const waPhone = cleanPhone.startsWith('0') ? `2${cleanPhone}` : cleanPhone;
            const isUnread = msg.status === 'UNREAD';
            const formattedDate = msg.createdAt
              ? new Date(msg.createdAt).toLocaleString('ar-EG', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })
              : 'منذ قليل';

            return (
              <div
                key={msg.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isUnread
                    ? 'bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border-blue-500/50 shadow-lg shadow-blue-950/20'
                    : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Customer Info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 font-black text-white text-sm">
                        <User className="w-4 h-4 text-blue-400" />
                        <span>{msg.name}</span>
                      </div>

                      {isUnread && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                          جديد
                        </span>
                      )}

                      {msg.subject && (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-slate-800 text-amber-400 border border-slate-700">
                          الموضوع: {msg.subject}
                        </span>
                      )}

                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{formattedDate}</span>
                      </span>
                    </div>

                    {/* Phone details */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400">الهاتف:</span>
                      <a
                        href={`tel:${msg.phone}`}
                        className="font-mono font-bold text-blue-400 hover:underline"
                        dir="ltr"
                      >
                        {msg.phone}
                      </a>
                    </div>

                    {/* Message Body */}
                    <div className="mt-3 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                      {msg.message}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row md:flex-col items-center md:items-end gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                    {/* WhatsApp Quick Reply */}
                    <a
                      href={`https://wa.me/${waPhone}?text=${encodeURIComponent(`أهلاً بك يا أستاذ ${msg.name}، معك إدارة شركة المستقبل تك رداً على استفسارك:`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>رد واتساب</span>
                    </a>

                    {/* Call Directly */}
                    <a
                      href={`tel:${msg.phone}`}
                      className="px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5 text-blue-400" />
                      <span>اتصال</span>
                    </a>

                    {/* Mark Read */}
                    {isUnread ? (
                      <button
                        onClick={() => markMessageAsRead(msg.id)}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>تحديد كمقروء</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-400 flex items-center gap-1 px-2 py-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>تمت المتابعة</span>
                      </span>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(msg.id)}
                      disabled={deletingId === msg.id}
                      className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="حذف الرسالة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
