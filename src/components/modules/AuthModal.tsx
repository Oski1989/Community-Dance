'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, X, Check, Shield, User, Sparkles, Mail, Phone, Music, KeyRound } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { registerUser, loginUser, setCurrentUserById, profiles, currentUser } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form State
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [discipline, setDiscipline] = useState<string>('Salsa en Línea');
  const [loginEmail, setLoginEmail] = useState<string>('');

  if (!isOpen) return null;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;
    registerUser(fullName, email, phone, discipline);
    onClose();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) return;
    const success = loginUser(loginEmail);
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-950 border border-slate-800"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Mode Switcher */}
        <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-purple-600 text-white shadow-glow-violet'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" /> Iniciar Sesión
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'bg-purple-600 text-white shadow-glow-violet'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" /> Registrar Nuevo Alumno
          </button>
        </div>

        {mode === 'register' ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">Formulario de Alta de Alumno</h3>
              <p className="text-xs text-slate-400">
                Rellena tus datos. Al registrarte quedarás en estado inactivo hasta adjuntar el recibo o ser activado por tu Profesor.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 block">Nombre Completo (*):</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Ej: Osqui Fernández"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 block">Correo Electrónico (*):</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="ejemplo@dancexp.app"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 block">Teléfono / WhatsApp:</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="tel"
                  placeholder="+34 600 000 000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 block">Disciplina Preferida:</label>
              <div className="relative">
                <Music className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <select
                  value={discipline}
                  onChange={(e) => setDiscipline(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="Salsa en Línea">Salsa en Línea (On1/On2)</option>
                  <option value="Bachata Sensual">Bachata Sensual</option>
                  <option value="Salsa Cubana">Salsa Cubana & Rueda</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-glow-violet transition-all flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" /> Completar Registro de Alumno
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-white">Acceso a la Plataforma</h3>
                <p className="text-xs text-slate-400">Ingresa con tu correo registrado para acceder a tu sesión.</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">Correo Electrónico:</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="ejemplo@dancexp.app"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-glow-violet transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" /> Iniciar Sesión
              </button>
            </form>

            {/* Quick Demo Selector */}
            <div className="border-t border-slate-800 pt-4 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Simulación Rápida de Usuarios / Roles:
              </span>
              <div className="space-y-1.5">
                {profiles.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setCurrentUserById(p.id);
                      onClose();
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                      currentUser.id === p.id
                        ? 'bg-purple-950/60 border-purple-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <img src={p.avatar_url} alt={p.full_name} className="w-7 h-7 rounded-full object-cover" />
                      <div>
                        <span className="font-bold block text-white">{p.full_name}</span>
                        <span className="text-[10px] text-slate-400">{p.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          p.role === 'admin'
                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                            : p.role === 'teacher'
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {p.role}
                      </span>

                      <span
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          p.membership_status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : p.membership_status === 'pending_approval'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {p.membership_status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
