import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Family Diabetes Care | ថែទាំជំងឺទឹកនោមផ្អែមគ្រួសារ',
  description: 'Bilingual mobile-first family diabetes monitoring web application for mom.',
  icons: {
    icon: '/favicon.ico'
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="km" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 antialiased selection:bg-teal-200">
        {children}
      </body>
    </html>
  );
}
