'use client';

import React from 'react';

interface SidebarProps {
  currentRole: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  activeTab,
  onTabChange,
  isMobileOpen = false,
  onMobileClose,
}) => {
  const getNavItems = () => {
    switch (currentRole) {
      case 'owner':
      case 'admin':
        return [
          { id: 'dashboard', label: 'Resumen KPI', icon: '📊' },
          { id: 'programs', label: 'Programas & Clases', icon: '💃' },
          { id: 'reservations', label: 'Reservas & Aforos', icon: '📅' },
          { id: 'attendance', label: 'Asistencia & Check-In', icon: '📋' },
          { id: 'payments', label: 'Pagos & Bonos', icon: '💳' },
          { id: 'quests', label: 'Retos & Quests', icon: '🏆' },
          { id: 'community', label: 'Comunidad', icon: '💬' },
          { id: 'invitations', label: 'Miembros & Equipos', icon: '👥' },
        ];
      case 'teacher':
        return [
          { id: 'programs', label: 'Programas & Clases', icon: '💃' },
          { id: 'reservations', label: 'Reservas & Aforos', icon: '📅' },
          { id: 'attendance', label: 'Pasar Asistencia', icon: '📋' },
          { id: 'quests', label: 'Revisar Retos', icon: '🏆' },
          { id: 'community', label: 'Muro Social', icon: '💬' },
        ];
      case 'reception':
        return [
          { id: 'attendance', label: 'Check-In QR', icon: '📋' },
          { id: 'reservations', label: 'Gestión Aforos', icon: '📅' },
          { id: 'payments', label: 'Cobro "A Cuenta"', icon: '💳' },
          { id: 'community', label: 'Comunidad', icon: '💬' },
        ];
      case 'student':
      default:
        return [
          { id: 'reservations', label: 'Mis Reservas', icon: '📅' },
          { id: 'payments', label: 'Mis Bonos & Pagos', icon: '💳' },
          { id: 'quests', label: 'Retos & Misiones', icon: '🏆' },
          { id: 'community', label: 'Comunidad', icon: '💬' },
          { id: 'attendance', label: 'Mi Asistencia', icon: '📋' },
        ];
    }
  };

  const navItems = getNavItems();

  const handleSelectTab = (id: string) => {
    onTabChange(id);
    if (onMobileClose) onMobileClose();
  };

  const renderNavContent = () => (
    <div className="flex flex-col justify-between h-full p-4">
      <div className="space-y-2">
        <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Menú Principal</p>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-link-${item.id}`}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition ${
                  isActive
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-inner'
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

      <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border border-purple-500/20 text-xs">
        <p className="font-semibold text-purple-300 mb-1">💡 RGPD & Seguridad</p>
        <p className="text-gray-400">Multi-Tenant aislado con RLS en PostgreSQL y cifrado activo.</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-[var(--border-subtle)] bg-slate-950/60 hidden md:flex flex-col min-h-[calc(100vh-4rem)]">
        {renderNavContent()}
      </aside>

      {/* Mobile Drawer Backdrop */}
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
              <span className="font-heading font-bold text-white text-base">Navegación</span>
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

