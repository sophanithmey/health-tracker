import React from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { RoleProvider } from '@/context/RoleContext';
import { AppHeader } from '@/components/layout/AppHeader';
import { DesktopSidebar } from '@/components/layout/DesktopSidebar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { EmergencyHypoBanner } from '@/components/layout/EmergencyHypoBanner';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <QueryProvider>
        <RoleProvider>
          <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 pb-16 md:pb-0">
            <AppHeader />
            <EmergencyHypoBanner />
            <div className="flex-1 flex max-w-7xl w-full mx-auto">
              <DesktopSidebar />
              <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
                {children}
              </main>
            </div>
            <MobileBottomNav />
          </div>
        </RoleProvider>
      </QueryProvider>
    </NextIntlClientProvider>
  );
}

