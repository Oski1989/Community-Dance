import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Plaza Dance App — Plataforma de Gestión de Escuelas de Baile Multi-Tenant',
  description: 'Plataforma segura y escalable para la gestión de academias de baile, control de reservas, aforos, asistencia por QR, bonos y retos comunitarios.',
  keywords: ['baile', 'escuela de baile', 'academias', 'salsa', 'bachata', 'reservas', 'aforos', 'gestión multi-tenant'],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased">
        <div id="app-root" className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
