import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#0f766e',
  width: 'device-width',
  initialScale: 1
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'Family Diabetes Care | ថែទាំជំងឺទឹកនោមផ្អែមគ្រួសារ',
    template: '%s | Family Diabetes Care'
  },
  description: 'Bilingual mobile-first family diabetes monitoring web application for mom. Track daily blood glucose, medication adherence, and wellness routines with ADA clinical standards.',
  keywords: [
    'diabetes care',
    'blood glucose tracker',
    'Cambodia healthcare',
    'ADA diabetes standards',
    'family health monitoring',
    'ថែទាំជំងឺទឹកនោមផ្អែម',
    'ជាតិស្ករ'
  ],
  authors: [{ name: 'Family Diabetes Care' }],
  creator: 'Family Diabetes Care',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' }
    ]
  },
  openGraph: {
    title: 'Family Diabetes Care | ថែទាំជំងឺទឹកនោមផ្អែមគ្រួសារ',
    description: 'Bilingual mobile-first family diabetes monitoring web application for mom. Track blood sugar, medications, and daily wellness routines.',
    url: '/',
    siteName: 'Family Diabetes Care',
    images: [
      {
        url: '/og-image.png',
        width: 1376,
        height: 768,
        alt: 'Family Diabetes Care - Blood Sugar & Wellness Monitoring for Mom'
      }
    ],
    locale: 'km_KH',
    alternateLocale: ['en_US'],
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Family Diabetes Care | ថែទាំជំងឺទឹកនោមផ្អែមគ្រួសារ',
    description: 'Bilingual mobile-first family diabetes monitoring web application for mom.',
    images: ['/og-image.png']
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
