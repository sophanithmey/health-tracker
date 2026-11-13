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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Kantumruy+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-slate-50/70 antialiased selection:bg-teal-200">
        {children}
      </body>
    </html>
  );
}
