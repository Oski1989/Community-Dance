'use client';

import React, { useState } from 'react';

interface NavbarProps {
  isLoggedIn?: boolean;
  currentRole?: string;
  orgName?: string;
  userName?: string;
  userEmail?: string;
  unreadCount?: number;
  onNotificationsClick?: () => void;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
  onMobileMenuToggle?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isLoggedIn = false,
  currentRole = 'student',
  orgName = 'Escuela Plaza Dance Madrid',
  userName = 'Invitado',
  userEmail = 'sin-sesion@plazadance.com',
  unreadCount = 0,
  onNotificationsClick,
  onLoginClick,
  onLogoutClick,
  onMobileMenuToggle,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
      case 'admin':
        return { label: 'Director / Admin', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      case 'teacher':
        return { label: 'Profesor', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
      case 'reception':
        return { label: 'Recepción', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'student':
        return { label: 'Alumno', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      default:
        return { label: 'Visitante', color: 'bg-gray-500/20 text-gray-300 border-gray-500/30' };
    }
  };

  const roleInfo = getRoleLabel(currentRole);

  return (
    <header className="w-full h-16 border-b border-[var(--border-subtle)] bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between">
      {/* Brand & Organization Badge */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Button */}
        {onMobileMenuToggle && (
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-300 hover:text-white"
            aria-label="Abrir menú"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-purple-500/30">
            P
          </div>
          <span className="font-heading font-extrabold text-xl tracking-tight text-white">
            PLAZA <span className="gradient-text-violet">DANCE</span>
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium">{orgName}</span>
        </div>
      </div>

      {/* User Controls & Profile */}
      <div className="flex items-center gap-3">
        {isLoggedIn ? (
          <>
            <span className={`hidden xs:inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleInfo.color}`}>
              {roleInfo.label}
            </span>

            {/* Notifications Icon Button */}
            <button
              id="btn-notifications"
              onClick={onNotificationsClick}
              aria-label="Notificaciones"
              className="relative p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white transition hover:border-purple-500/40"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-[10px] flex items-center justify-center border-2 border-slate-950">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* User Profile Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2.5 pl-2 border-l border-gray-800 text-left focus:outline-none"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-md">
                  {userName.charAt(0)}
                </div>
                <div className="hidden lg:block">
                  <p className="font-semibold text-white text-xs">{userName}</p>
                  <p className="text-[11px] text-gray-400 truncate max-w-[120px]">{userEmail}</p>
                </div>
                <svg className="w-4 h-4 text-gray-400 hidden lg:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* User Dropdown Menu Popup (ONLY Sign Out) */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-slate-950 border border-purple-500/30 p-2 shadow-2xl z-50 animate-fade-in text-xs space-y-1">
                  <div className="p-2 border-b border-gray-800">
                    <p className="font-bold text-white">{userName}</p>
                    <p className="text-gray-400 text-[11px] truncate">{userEmail}</p>
                    <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${roleInfo.color}`}>
                      {roleInfo.label}
                    </span>
                  </div>

                  <button
                    onClick={() => { setIsUserMenuOpen(false); if (onLogoutClick) onLogoutClick(); }}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-rose-400 hover:bg-rose-500/15 transition flex items-center gap-2 font-semibold"
                  >
                    🚪 Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Guest Mode Login Button */
          <button
            onClick={onLoginClick}
            className="btn-primary text-xs py-2 px-4 flex items-center gap-2"
          >
            <span>🔑</span> Iniciar Sesión / Registrarse
          </button>
        )}
      </div>
    </header>
  );
};
