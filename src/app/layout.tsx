import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Plaza Dance App — Plataforma de Gestión de Escuelas de Baile Multi-Tenant',
  description: 'Plataforma segura y escalable para la gestión de academias de baile, control de reservas, aforos, asistencia por QR, bonos y retos comunitarios.',
  keywords: ['baile', 'escuela de baile', 'academias', 'salsa', 'bachata', 'kizomba', 'reservas', 'aforos', 'gestión multi-tenant'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Plaza Dance',
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
