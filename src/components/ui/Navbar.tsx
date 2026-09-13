'use client';

import React from 'react';

interface NavbarProps {
  currentRole?: string;
  onRoleChange?: (role: string) => void;
  orgName?: string;
  userName?: string;
  onMobileMenuToggle?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole = 'owner',
  orgName = 'Escuela Plaza Dance Madrid',
  userName = 'Óscar Director',
  onMobileMenuToggle,
}) => {
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
      default:
        return { label: 'Alumno', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
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

      {/* User Profile & Role Indicator */}
      <div className="flex items-center gap-3">
        <span className={`hidden xs:inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleInfo.color}`}>
          {roleInfo.label}
        </span>

        {/* Notifications Icon */}
        <button
          id="btn-notifications"
          aria-label="Notificaciones"
          className="relative p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-pink-500"></span>
        </button>

        {/* User Profile Info */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-gray-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-white text-sm">
            {userName.charAt(0)}
          </div>
          <div className="hidden lg:block text-left text-xs">
            <p className="font-semibold text-white">{userName}</p>
            <p className="text-gray-400 capitalize">{currentRole}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

