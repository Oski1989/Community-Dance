'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Sparkles, BookOpen, PartyPopper, Users, Award, ChevronRight, LogIn, UserPlus, Heart, CheckCircle2, ChevronLeft, ArrowRight } from 'lucide-react';
import { AuthModal } from '@/components/modules/AuthModal';

export const LandingHomeView: React.FC = () => {
  const { currentSchool, currentUser, webConfig } = useApp();
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [activeSlide, setActiveSlide] = useState<number>(0);

  const isGuest = currentUser.id.startsWith('guest');

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  // Lifestyle Carousel Items
  const carouselItems = [
    {
      id: 'slide-1',
      title: 'Ambiente Social & Fiestas SBK',
      subtitle: 'Practica lo aprendido en un ambiente inclusivo con la mejor comunidad de baile.',
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80',
      tag: 'Sociales Semanales',
    },
    {
      id: 'slide-2',
      title: 'Temarios Graduales por Niveles',
      subtitle: 'Aprende paso a paso con programas diseñados para que avances sin vacíos.',
      image: 'https://images.unsplash.com/photo-1545128485-c400e7702796?w=800&auto=format&fit=crop&q=80',
      tag: 'Formación de Calidad',
    },
    {
      id: 'slide-3',
      title: 'Profesores Certificados & Comunidad',
      subtitle: 'Conecta con otros bailarines, encuentra tu pareja de baile y diviértete en cada clase.',
      image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80',
      tag: 'Comunidad Unida',
    },
  ];

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % carouselItems.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
  };

  return (
    <div className="space-y-10 pb-16 max-w-5xl mx-auto">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-tr from-purple-950 via-slate-900 to-indigo-950 border border-purple-500/30 p-6 md:p-12 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-5 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-amber-400" /> {webConfig.tagline || 'Academia Oficial & Plataforma de Baile'}
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight">
            {webConfig.hero_title || 'Aprende a Bailar Salsa, Bachata y Más'}
          </h1>

          <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-2xl">
            {webConfig.hero_subtitle || 'Disfruta de la mejor experiencia de aprendizaje con temarios graduales, profesores certificados y la comunidad de baile social más activa.'}
          </p>

          {isGuest && (
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                onClick={() => handleOpenAuth('register')}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs md:text-sm shadow-glow-violet transition-all flex items-center gap-2 cursor-pointer scale-100 hover:scale-105"
              >
                <UserPlus className="w-4.5 h-4.5" /> Registrarme como Alumno
              </button>

              <button
                onClick={() => handleOpenAuth('login')}
                className="px-6 py-3.5 rounded-2xl bg-slate-950/80 border border-slate-700 hover:border-slate-500 text-white font-bold text-xs md:text-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4.5 h-4.5 text-purple-400" /> Iniciar Sesión
              </button>
            </div>
          )}
        </div>
      </div>

      {/* "¿Por qué bailar con nosotros?" Section */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-purple-400 bg-purple-500/10 border border-purple-500/30 px-3 py-1 rounded-full inline-block">
            Beneficios Exclusivos
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-white">
            ¿Por qué aprender en <span className="text-purple-400">{webConfig.app_name || 'DanceXP'}</span>?
          </h2>
          <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto">
            Metodología diseñada para que disfrutes desde tu primera clase y te sientas seguro en la pista de baile.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 hover:border-purple-500/40 transition-all shadow-lg group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-black text-lg text-white">Temarios Graduales</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Paso a paso estructurado desde nivel cero hasta avanzado para que tengas una base sólida sin huecos técnicos.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 hover:border-rose-500/40 transition-all shadow-lg group">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-black text-lg text-white">Profesores Certificados</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Aprende con instructores experimentados y apasionados dedicados a enseñarte ritmo, musicalidad y estilo.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 hover:border-emerald-500/40 transition-all shadow-lg group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <PartyPopper className="w-6 h-6" />
            </div>
            <h3 className="font-black text-lg text-white">Comunidad & Sociales</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Forma parte de la comunidad de baile social, asiste a las fiestas semanales y practica lo aprendido bailando.
            </p>
          </div>
        </div>
      </div>

      {/* Carrusel de Publicaciones y Experiencia */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-400" /> La Experiencia de Baile
            </h3>
            <p className="text-xs text-slate-400">Momentos y ambiente social en nuestra academia</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={prevSlide}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextSlide}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Interactive Slider */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl h-80">
          <img
            src={carouselItems[activeSlide].image}
            alt={carouselItems[activeSlide].title}
            className="w-full h-full object-cover transition-all duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6 space-y-2 z-10">
            <span className="px-3 py-1 rounded-full bg-purple-600 text-white font-black text-[11px] uppercase tracking-wider inline-block">
              {carouselItems[activeSlide].tag}
            </span>
            <h4 className="text-2xl font-black text-white">
              {carouselItems[activeSlide].title}
            </h4>
            <p className="text-xs md:text-sm text-slate-200 max-w-xl">
              {carouselItems[activeSlide].subtitle}
            </p>
          </div>

          {/* Dots Indicator */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10">
            {carouselItems.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                  idx === activeSlide ? 'bg-purple-400 w-6' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Call To Action Banner */}
      {isGuest && (
        <div className="p-8 rounded-3xl bg-gradient-to-r from-purple-900/60 via-indigo-900/60 to-slate-900 border border-purple-500/30 text-center space-y-4 shadow-2xl">
          <h3 className="text-2xl font-black text-white">
            ¿Listo para dar tu primer paso en la pista?
          </h3>
          <p className="text-xs md:text-sm text-slate-300 max-w-md mx-auto">
            Crea tu cuenta de alumno en segundos y comienza tu viaje en Salsa, Bachata y ritmos sociales.
          </p>
          <button
            onClick={() => handleOpenAuth('register')}
            className="px-8 py-3.5 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-black text-xs md:text-sm shadow-xl transition-all inline-flex items-center gap-2 cursor-pointer scale-100 hover:scale-105"
          >
            Crear Mi Cuenta Ahora <ArrowRight className="w-4 h-4 text-purple-600" />
          </button>
        </div>
      )}

      {/* Auth Modal Trigger */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
};

