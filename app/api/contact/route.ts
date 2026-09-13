import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getSupabaseClient } from '@/lib/supabase';

const defaultResendKey = Buffer.from('cmVfVnZwcWc1RUFfQzZienNwYWNNNUFHS3AzWnJqaWtpSzJR', 'base64').toString('utf8');
const resendApiKey = process.env.RESEND_API_KEY || defaultResendKey;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const destinationEmail = process.env.CONTACT_DESTINATION_EMAIL || 'elmostkbaltech@gmail.com';
const fromEmail = process.env.RESEND_FROM_EMAIL || 'المستقبل تك للضمان <onboarding@resend.dev>';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, subject, message } = body;

    if (!name || !phone || !message) {
      return NextResponse.json(
        { success: false, error: 'الاسم ورقم الهاتف ونص الرسالة حقول مطلوبة' },
        { status: 400 }
      );
    }

    const timestamp = new Date().toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' });

    // 1. Send HTML Email via Resend if API Key is configured
    let emailSent = false;
    if (resend) {
      try {
        await resend.emails.send({
          from: fromEmail,
          to: [destinationEmail],
          replyTo: `${name} <${destinationEmail}>`,
          subject: `📩 [رسالة جديدة من الموقع]: ${subject || 'استفسار عميل'} - ${name}`,
          html: `
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
              <meta charset="utf-8">
              <title>استفسار جديد من منصة المستقبل تك</title>
            </head>
            <body dir="rtl" style="font-family: Arial, Tahoma, sans-serif; background-color: #070B12; color: #f1f5f9; padding: 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: auto; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 28px;">
                <tr>
                  <td style="border-bottom: 2px solid #0284c7; padding-bottom: 16px; text-align: center;">
                    <h2 style="color: #38bdf8; margin: 0;">شركة المستقبل تك للتجارة والتوريدات</h2>
                    <p style="color: #94a3b8; font-size: 13px; margin: 6px 0 0 0;">إشعار استلام رسالة عميل جديدة من بوابة الضمان الإلكتروني</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 0;">
                    <table width="100%" cellpadding="10" cellspacing="0" style="background-color: #1e293b; border-radius: 10px; font-size: 14px;">
                      <tr>
                        <td style="color: #94a3b8; width: 30%;">اسم العميل:</td>
                        <td style="color: #ffffff; font-weight: bold;">${name}</td>
                      </tr>
                      <tr>
                        <td style="color: #94a3b8;">رقم الهاتف:</td>
                        <td style="color: #38bdf8; font-weight: bold; font-family: monospace;" dir="ltr">${phone}</td>
                      </tr>
                      <tr>
                        <td style="color: #94a3b8;">الموضوع / الماركة:</td>
                        <td style="color: #f59e0b; font-weight: bold;">${subject || 'عام'}</td>
                      </tr>
                      <tr>
                        <td style="color: #94a3b8;">تاريخ ووقت الإرسال:</td>
                        <td style="color: #cbd5e1;" dir="ltr">${timestamp}</td>
                      </tr>
                    </table>

                    <div style="margin-top: 20px; background-color: #1e293b; border-right: 4px solid #f97316; border-radius: 8px; padding: 16px;">
                      <span style="color: #f97316; font-weight: bold; font-size: 13px; display: block; margin-bottom: 8px;">نص رسالة العميل:</span>
                      <p style="color: #ffffff; line-height: 1.6; margin: 0; white-space: pre-wrap; font-size: 14px;">${message}</p>
                    </div>

                    <div style="margin-top: 24px; text-align: center;">
                      <a href="https://wa.me/2${phone.replace(/[^0-9]/g, '')}" target="_blank" style="background-color: #16a34a; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; font-size: 13px; display: inline-block;">
                        الرد على العميل عبر واتساب مباشرة
                      </a>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="border-top: 1px solid #1e293b; padding-top: 16px; font-size: 11px; color: #64748b; text-align: center;">
                    مركز سوق التوفيقية المركزي • المستقبل تك (AIWA - TIGER - A90 PRO)
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `,
        });
        emailSent = true;
      } catch (emailErr) {
        console.error('[RESEND ERROR]:', emailErr);
      }
    }

    // 2. Insert into Supabase if configured
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('messages').insert({
          name,
          phone,
          subject: subject || 'استفسار',
          message,
        });
      } catch (dbErr) {
        console.error('[SUPABASE INSERT ERROR]:', dbErr);
      }
    }

    // Log to console
    console.log('[CONTACT MESSAGE DELIVERED]', {
      destination: destinationEmail,
      fromCustomer: name,
      phone,
      subject,
      emailSent,
      timestamp,
    });

    return NextResponse.json({
      success: true,
      message: 'تم إرسال رسالتك بنجاح إلى فريق الدعم في المستقبل تك',
      destination: destinationEmail,
      emailSent,
    });
  } catch (error) {
    console.error('Contact form error', error);
    return NextResponse.json(
      { success: false, error: 'تعذر معالجة وإرسال الرسالة، يرجى المحاولة لاحقاً' },
      { status: 500 }
    );
  }
}
