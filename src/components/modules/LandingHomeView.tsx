'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Sparkles, BookOpen, Video, PartyPopper, Users, Award, ChevronRight, Calendar, MapPin, Clock, Info, LogIn, UserPlus } from 'lucide-react';
import { AuthModal } from '@/components/modules/AuthModal';

export const LandingHomeView: React.FC = () => {
  const { currentSchool, disciplines, classes, weeklySocials, currentUser } = useApp();
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('current_week');

  const isGuest = currentUser.id.startsWith('guest');

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  // Filter weekly socials for the current week or selected day
  const filteredSocials = weeklySocials.filter((social) => {
    if (selectedDayFilter === 'current_week') return true;
    return social.day_of_week.toLowerCase().includes(selectedDayFilter.toLowerCase());
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-tr from-purple-950 via-slate-900 to-indigo-950 border border-purple-500/30 p-6 md:p-10 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-amber-400" /> Plataforma Pedagógica y Social de Baile
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight">
            Aprende a Bailar con <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-rose-400 to-amber-300">DanceXP</span>
          </h1>

          <p className="text-sm md:text-base text-slate-300 leading-relaxed">
            Bienvenido a la comunidad oficial de baile de <strong className="text-white">{currentSchool.name}</strong>. Accede a tu itinerario por niveles, envía tus vídeos para corrección asíncrona y participa en nuestros sociales semanales para acumular Puntos de Ritmo.
          </p>

          {isGuest && (
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => handleOpenAuth('register')}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs md:text-sm shadow-glow-violet transition-all flex items-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4.5 h-4.5" /> Registrarme como Alumno
              </button>

              <button
                onClick={() => handleOpenAuth('login')}
                className="px-5 py-3 rounded-2xl bg-slate-950/80 border border-slate-700 hover:border-slate-500 text-white font-bold text-xs md:text-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4.5 h-4.5 text-purple-400" /> Iniciar Sesión
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pillars & Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 hover:border-purple-500/40 transition-all">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-base text-white">Niveles & Temarios</h3>
          <p className="text-xs text-slate-400">
            Itinerario técnico estructurado módulo a módulo para garantizar una progresión real sin lagunas.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 hover:border-purple-500/40 transition-all">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <Video className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-base text-white">Inbox Zero de Vídeo</h3>
          <p className="text-xs text-slate-400">
            Sube tus ejecuciones técnicas y recibe correcciones detalladas con audio y marcas en pantalla por tus profesores.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 hover:border-purple-500/40 transition-all">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <PartyPopper className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-base text-white">Sociales & Puntos</h3>
          <p className="text-xs text-slate-400">
            Escanea tu código QR en las fiestas semanales, sube tu racha y canjea consumiciones gratis en la barra.
          </p>
        </div>
      </div>

      {/* Courses & Teachers Section (Dynamic with Empty State) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" /> Cursos & Profesores Impartidos
            </h2>
            <p className="text-xs text-slate-400">Oferta formativa y disciplinas activas de la escuela</p>
          </div>
        </div>

        {disciplines.length === 0 && classes.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 text-center space-y-3 shadow-inner">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400">
              <Info className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-white">No hay cursos ni profesores publicados todavía</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              El equipo de administración y profesores está configurando las listas oficiales de clases y disciplinas. ¡Crea tu cuenta de alumno para recibir las novedades al instante!
            </p>
            {isGuest && (
              <button
                onClick={() => handleOpenAuth('register')}
                className="mt-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-glow-violet transition-all inline-flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" /> Registrarse como Alumno
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {disciplines.map((disc) => (
              <div key={disc.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {disc.style_tag || 'Disciplina'}
                </span>
                <h4 className="font-extrabold text-base text-white">{disc.name}</h4>
                <p className="text-xs text-slate-400 line-clamp-2">{disc.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weekly Socials Section (Predeterminada Semana Actual) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <PartyPopper className="w-5 h-5 text-emerald-400" /> Sociales de la Semana Actual
            </h2>
            <p className="text-xs text-slate-400">Eventos de baile social en {currentSchool.venue_name || currentSchool.name}</p>
          </div>

          {/* Date / Day Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto">
            <button
              onClick={() => setSelectedDayFilter('current_week')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedDayFilter === 'current_week'
                  ? 'bg-emerald-600 text-slate-950 font-black shadow-glow-emerald'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Semana Actual
            </button>
            <button
              onClick={() => setSelectedDayFilter('Viernes')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedDayFilter === 'Viernes'
                  ? 'bg-emerald-600 text-slate-950 font-black shadow-glow-emerald'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Viernes
            </button>
            <button
              onClick={() => setSelectedDayFilter('Sábado')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedDayFilter === 'Sábado'
                  ? 'bg-emerald-600 text-slate-950 font-black shadow-glow-emerald'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sábados
            </button>
            <button
              onClick={() => setSelectedDayFilter('Domingo')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedDayFilter === 'Domingo'
                  ? 'bg-emerald-600 text-slate-950 font-black shadow-glow-emerald'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Domingos
            </button>
          </div>
        </div>

        {filteredSocials.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
            No hay sociales programados para esta selección.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSocials.map((social) => (
              <div
                key={social.id}
                className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden hover:border-emerald-500/40 transition-all flex flex-col justify-between shadow-xl"
              >
                {social.banner_url && (
                  <div className="h-40 overflow-hidden relative">
                    <img src={social.banner_url} alt={social.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                    <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-xs shadow-lg">
                      {social.day_of_week}
                    </span>
                  </div>
                )}

                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h3 className="font-black text-lg text-white leading-snug">{social.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{social.description}</p>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-slate-800 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{social.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{social.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Auth Modal Trigger */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
};
