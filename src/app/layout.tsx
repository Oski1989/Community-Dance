import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Comuny Dance — Plataforma Global y Comunidad de Baile',
  description: 'Plataforma integral para bailarines, profesores, escuelas y eventos de baile: gestión de clases, reservas, retos y comunidad social.',
  keywords: ['baile', 'comunidad de baile', 'escuela de baile', 'academias', 'salsa', 'bachata', 'kizomba', 'reservas', 'aforos', 'social dance'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Comuny Dance',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#9333ea',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased bg-slate-950">
        <div id="app-root" className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
