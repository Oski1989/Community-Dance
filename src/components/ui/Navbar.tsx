'use client';

import React from 'react';

interface NavbarProps {
  currentRole?: string;
  onRoleChange?: (role: string) => void;
  orgName?: string;
  userName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole = 'owner',
  onRoleChange,
  orgName = 'Escuela Plaza Dance Madrid',
  userName = 'Óscar Admin',
}) => {
  return (
    <header className="w-full h-16 border-b border-[var(--border-subtle)] bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      {/* Brand & Organization Badge */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-purple-500/30">
            P
          </div>
          <span className="font-heading font-extrabold text-xl tracking-tight text-white">
            PLAZA <span className="gradient-text-violet">DANCE</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium">{orgName}</span>
        </div>
      </div>

      {/* Role Switcher & User Profile */}
      <div className="flex items-center gap-4">
        {/* Fast Role Simulator Switcher for Demo/UX Audit */}
        {onRoleChange && (
          <div className="hidden sm:flex items-center bg-gray-900 p-1 rounded-xl border border-gray-800 text-xs">
            <span className="px-2 text-gray-500 font-semibold">Simular Rol:</span>
            <button
              id="role-btn-owner"
              onClick={() => onRoleChange('owner')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                currentRole === 'owner' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              Director
            </button>
            <button
              id="role-btn-teacher"
              onClick={() => onRoleChange('teacher')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                currentRole === 'teacher' ? 'bg-cyan-600 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              Profesor
            </button>
            <button
              id="role-btn-reception"
              onClick={() => onRoleChange('reception')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                currentRole === 'reception' ? 'bg-amber-600 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              Recepción
            </button>
            <button
              id="role-btn-student"
              onClick={() => onRoleChange('student')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                currentRole === 'student' ? 'bg-emerald-600 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              Alumno
            </button>
          </div>
        )}

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

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2 border-l border-gray-800">
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
