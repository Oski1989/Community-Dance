'use client';

import React, { useEffect, useState } from 'react';

export const PwaInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    // Check iOS
    const ua = window.navigator.userAgent;
    const iosDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIos(iosDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      alert('📲 Para instalar Plaza Dance en tu iPhone/iPad:\n\n1. Toca el botón "Compartir" (el ícono del cuadrado con la flecha arriba en Safari).\n2. Selecciona "Añadir a la pantalla de inicio" ➕.');
    } else {
      alert('📲 Para instalar la app en tu navegador:\n\nBusca la opción "Instalar aplicación" o "Añadir a pantalla de inicio" en el menú de opciones de tu navegador.');
    }
  };

  if (!showBanner) return null;

  return (
    <div className="bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-slate-900 border-b border-purple-500/30 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-lg animate-fade-in z-50">
      <div className="flex items-center gap-2">
        <span className="text-base">📱</span>
        <span>
          <strong>Instala Plaza Dance App en tu móvil:</strong> Acceso instantáneo sin descargas en tienda.
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleInstallClick}
          className="px-3 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-md transition transform hover:scale-105"
        >
          📲 Instalar como WebApp
        </button>
        <button
          onClick={() => setShowBanner(false)}
          className="text-gray-400 hover:text-white p-1 text-sm font-bold"
          aria-label="Cerrar aviso"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
