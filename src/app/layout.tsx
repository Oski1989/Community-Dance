import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { NotificationToasts } from '@/components/layout/NotificationToasts';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'DanceXP - Progressive Web App (PWA)',
  description: 'Plataforma SaaS Multi-Profesor/Multi-Sede enfocada en la gamificación del aprendizaje de baile e integración nocturna con Victorys Palma.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'DanceXP',
  },
};

export const viewport: Viewport = {
  themeColor: '#0B0F17',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} dark`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="bg-[#0B0F17] text-slate-100 font-sans antialiased min-h-screen selection:bg-purple-500 selection:text-white">
        <AppProvider>
          <NotificationToasts />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
