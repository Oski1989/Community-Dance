'use client';

import React from 'react';

interface SidebarProps {
  currentRole: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  onLoginClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  activeTab,
  onTabChange,
  isMobileOpen = false,
  onMobileClose,
  onLoginClick,
}) => {
  const getNavItems = () => {
    switch (currentRole) {
      case 'owner':
      case 'admin':
        return [
          { id: 'dashboard', label: 'Resumen KPI & Dirección', icon: '📊' },
          { id: 'reservations', label: 'Reservas & Control Aforos', icon: '📅' },
          { id: 'attendance', label: 'Asistencia & Check-In', icon: '📋' },
          { id: 'payments', label: 'Pagos & Finanzas', icon: '💳' },
          { id: 'quests', label: 'Retos & Quests', icon: '🏆' },
          { id: 'invitations', label: 'Gestión de Equipos', icon: '⚙️' },
        ];
      case 'teacher':
        return [
          { id: 'programs', label: 'Editar Temarios & Vídeos', icon: '💃' },
          { id: 'reservations', label: 'Reservas de Mis Clases', icon: '📅' },
          { id: 'attendance', label: 'Pasar Asistencia', icon: '📋' },
          { id: 'quests', label: 'Revisar Retos Entregados', icon: '🏆' },
        ];
      case 'reception':
        return [
          { id: 'attendance', label: 'Check-In QR', icon: '📋' },
          { id: 'reservations', label: 'Gestión de Aforos', icon: '📅' },
          { id: 'payments', label: 'Cobro "A Cuenta"', icon: '💳' },
        ];
      case 'student':
        return [
          { id: 'reservations', label: 'Mis Reservas', icon: '📅' },
          { id: 'attendance', label: 'Mi Asistencia', icon: '📋' },
          { id: 'payments', label: 'Mis Bonos & Pagos', icon: '💳' },
          { id: 'quests', label: 'Retos & Desafíos', icon: '🏆' },
        ];
      case 'guest':
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const handleSelectTab = (id: string) => {
    onTabChange(id);
    if (onMobileClose) onMobileClose();
  };

  const renderNavContent = () => (
    <div className="flex flex-col justify-between h-full p-4">
      <div className="space-y-4">
        {currentRole !== 'guest' ? (
          <div>
            <p className="px-3 text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3">
              ⚡ Panel de Gestión ({currentRole.toUpperCase()})
            </p>
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`sidebar-link-${item.id}`}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition ${
                      isActive
                        ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-inner font-semibold'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/60 to-indigo-950/60 border border-purple-500/30 space-y-3">
            <span className="badge badge-purple text-xs">🌐 Modo Visitante</span>
            <h4 className="font-heading font-bold text-white text-sm">¿Quieres reservar plazas o publicar en la comunidad?</h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              Crea tu cuenta de alumno en segundos para inscribirte a clases, entregar retos y conectar con otros bailadores.
            </p>
            {onLoginClick && (
              <button
                onClick={onLoginClick}
                className="btn-primary w-full justify-center text-xs py-2 mt-1"
              >
                🔑 Iniciar Sesión / Registrarse
              </button>
            )}
          </div>
        )}
      </div>

      <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-900 to-purple-950/40 border border-purple-500/20 text-xs space-y-1">
        <p className="font-semibold text-purple-300">📱 Plaza Dance WebApp</p>
        <p className="text-gray-400 text-[11px]">Accede directo desde tu móvil instalando la app.</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Only rendered if items exist or in guest mode) */}
      <aside className="w-64 border-r border-[var(--border-subtle)] bg-slate-950/60 hidden md:flex flex-col min-h-[calc(100vh-4rem)]">
        {renderNavContent()}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm md:hidden"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-72 h-full bg-slate-950 border-r border-purple-500/20 shadow-2xl flex flex-col justify-between"
          >
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <span className="font-heading font-bold text-white text-base">Panel de Gestión</span>
              <button
                onClick={onMobileClose}
                className="text-gray-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {renderNavContent()}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
