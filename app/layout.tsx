import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import ClientLayoutWrapper from '@/components/ClientLayoutWrapper';

export const metadata: Metadata = {
  title: 'المستقبل تك | بوابة الضمان وخدمات ما بعد البيع المعتمدة (AIWA - TIGER - A90 PRO)',
  description: 'بوابة تفعيل ومتابعة الضمان والصيانة لشركة المستقبل تك للتجارة والتوريدات (استيراد وتصدير). الوكيل المعتمد لشاشات وأنظمة الصوت وليدات السيارات.',
  icons: {
    icon: '/images/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className="scroll-smooth overflow-x-hidden w-full max-w-full">
      <body className="min-h-screen flex flex-col font-arabic bg-slate-50 dark:bg-[#070B12] text-slate-900 dark:text-slate-100 antialiased selection:bg-brand-500 selection:text-white transition-colors duration-300 overflow-x-hidden w-full max-w-full">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AppProvider>
            <ClientLayoutWrapper>
              {children}
            </ClientLayoutWrapper>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
