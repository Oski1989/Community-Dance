'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Building2,
  Calendar,
  Plus,
  Trash2,
  QrCode,
  Trophy,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Music,
  DollarSign,
  MapPin,
  Flame,
  Award,
  Printer,
} from 'lucide-react';

export const SchoolDashboardView: React.FC = () => {
  const {
    currentSchool,
    schools,
    disciplines,
    quests,
    createQuest,
    deleteQuest,
    toggleQuestActive,
    generateEventQR,
    weeklySocials,
    createWeeklySocial,
    deleteWeeklySocial,
    updateSchoolConfig,
    addNotification,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'info_styles' | 'quests_qr' | 'events'>('info_styles');

  // General Info Form State
  const [schoolName, setSchoolName] = useState<string>(currentSchool.name);
  const [schoolCity, setSchoolCity] = useState<string>(currentSchool.city);
  const [venueName, setVenueName] = useState<string>(currentSchool.venue_name || '');
  const [monthlyFee, setMonthlyFee] = useState<number>(currentSchool.membership_fee_monthly || 50);
  const [hasSocialEngine, setHasSocialEngine] = useState<boolean>(currentSchool.has_social_engine);
  const [offeredDisciplineIds, setOfferedDisciplineIds] = useState<string[]>(
    currentSchool.offered_discipline_ids || disciplines.map((d) => d.id)
  );

  // New Quest / Desafío Form State
  const [questTitle, setQuestTitle] = useState<string>('');
  const [questPoints, setQuestPoints] = useState<number>(50);
  const [questDesc, setQuestDesc] = useState<string>('');

  // Event QR Generator Form State
  const [qrTitle, setQrTitle] = useState<string>('Clase Magistral & Social');
  const [qrCode, setQrCode] = useState<string>(`VICTORYS-${Math.floor(Math.random() * 900 + 100)}`);
  const [qrPoints, setQrPoints] = useState<number>(100);

  // New Weekly Social Form State
  const [socialTitle, setSocialTitle] = useState<string>('');
  const [socialDay, setSocialDay] = useState<string>('Viernes');
  const [socialTime, setSocialTime] = useState<string>('22:00h - 02:30h');
  const [socialLocation, setSocialLocation] = useState<string>(currentSchool.venue_name || 'Sala Principal');
  const [socialDesc, setSocialDesc] = useState<string>('');

  // Filter events published by this school
  const schoolSocials = weeklySocials.filter((s) => s.school_id === currentSchool.id || !s.school_id);
  const monthlyEventLimit = currentSchool.monthly_event_limit || 4;
  const isLimitReached = schoolSocials.length >= monthlyEventLimit;

  // Filter quests for this school
  const schoolQuests = quests.filter((q) => q.school_id === currentSchool.id || !q.school_id);

  const handleSaveGeneralInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolConfig(currentSchool.id, {
      name: schoolName,
      city: schoolCity,
      venue_name: venueName,
      membership_fee_monthly: monthlyFee,
      has_social_engine: hasSocialEngine,
      offered_discipline_ids: offeredDisciplineIds,
    });
    addNotification('Ficha de Escuela Guardada ⚙️', 'Información general y estilos que imparte la sede actualizados.', 'info');
  };

  const toggleStyleOffer = (discId: string) => {
    setOfferedDisciplineIds((prev) =>
      prev.includes(discId) ? prev.filter((id) => id !== discId) : [...prev, discId]
    );
  };

  const handleCreateQuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questTitle || !questDesc) return;
    createQuest(questTitle, questPoints, questDesc);
    setQuestTitle('');
    setQuestDesc('');
    setQuestPoints(50);
  };

  const handleGenerateQRSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrTitle || !qrCode) return;
    generateEventQR(qrTitle, qrCode, qrPoints);
  };

  const handleCreateSocialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLimitReached) {
      addNotification(
        'Límite de Eventos Alcanzado 🛑',
        `No puedes publicar más de ${monthlyEventLimit} eventos al mes. Contacta con el administrador.`,
        'info'
      );
      return;
    }
    if (!socialTitle || !socialDesc) return;
    createWeeklySocial(socialTitle, socialDay, socialTime, socialLocation, socialDesc);
    setSocialTitle('');
    setSocialDesc('');
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Banner Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold">
            <Building2 className="w-4 h-4 text-purple-400" /> Panel Oficial de la Sede / Escuela
          </div>
          <h2 className="text-2xl font-black text-white">{currentSchool.name}</h2>
          <p className="text-xs text-slate-300">
            📍 {currentSchool.venue_name || currentSchool.city} · Gestión autónoma de estilos, desafíos con QR y agenda de sociales.
          </p>
        </div>

        {/* Quota Gauge Indicator */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-1 relative z-10 flex flex-col items-end">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Publicación de Eventos</span>
          <div className="flex items-center gap-2">
            <span
              className={`text-lg font-black ${
                isLimitReached ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {schoolSocials.length} / {monthlyEventLimit}
            </span>
            <span className="text-xs text-slate-400 font-medium">este mes</span>
          </div>
          <div className="w-32 bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800 mt-1">
            <div
              className={`h-full rounded-full transition-all ${
                isLimitReached ? 'bg-rose-500' : 'bg-gradient-to-r from-purple-500 to-emerald-400'
              }`}
              style={{ width: `${Math.min(100, (schoolSocials.length / monthlyEventLimit) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center p-1 bg-slate-900 rounded-2xl border border-slate-800 gap-1">
        <button
          onClick={() => setActiveTab('info_styles')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
            activeTab === 'info_styles'
              ? 'bg-purple-600 text-white shadow-glow-violet'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Ficha General & Estilos de Baile</span>
        </button>

        <button
          onClick={() => setActiveTab('quests_qr')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
            activeTab === 'quests_qr'
              ? 'bg-purple-600 text-white shadow-glow-violet'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <QrCode className="w-4 h-4 text-amber-400" />
          <span>Desafíos & Generador de QR</span>
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
            activeTab === 'events'
              ? 'bg-purple-600 text-white shadow-glow-violet'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4 text-rose-400" />
          <span>Publicar Eventos ({schoolSocials.length}/{monthlyEventLimit})</span>
        </button>
      </div>

      {/* TAB 1: INFORMACIÓN GENERAL & ESTILOS DE BAILE QUE IMPARTE */}
      {activeTab === 'info_styles' && (
        <div className="space-y-6">
          <form onSubmit={handleSaveGeneralInfo} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-purple-400" /> Datos Generales de la Escuela
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Configura el nombre, ubicación y cuota de tu sede.</p>
              </div>

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-glow-violet flex items-center gap-1.5 transition-all"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Guardar Cambios</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nombre de la Escuela / Sede:</label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Ciudad:</label>
                <input
                  type="text"
                  value={schoolCity}
                  onChange={(e) => setSchoolCity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nombre del Local / Sala (Venue):</label>
                <input
                  type="text"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  placeholder="Ej: Sala Principal Victorys Club"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Cuota Mensual Estándar (€/mes):</label>
                <input
                  type="number"
                  value={monthlyFee}
                  onChange={(e) => setMonthlyFee(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Social Engine Status Toggle */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-xs text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" /> Motor Social & Gamificación Victorys
                </h4>
                <p className="text-[11px] text-slate-400">Activa los podios de ritmo, rachas de asistencia y canje de puntos.</p>
              </div>

              <button
                type="button"
                onClick={() => setHasSocialEngine(!hasSocialEngine)}
                className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all border ${
                  hasSocialEngine
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}
              >
                {hasSocialEngine ? 'ON (Motor Social Activo ✅)' : 'OFF (Solo Técnico 🔒)'}
              </button>
            </div>
          </form>

          {/* Dance Styles / Disciplines Offered Section */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div>
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <Music className="w-5 h-5 text-amber-400" /> Estilos de Baile & Disciplinas que Imparte la Escuela
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Selecciona qué programas oficiales están disponibles en esta sede para que los alumnos puedan matricularse.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {disciplines.map((disc) => {
                const isOffered = offeredDisciplineIds.includes(disc.id);
                return (
                  <button
                    type="button"
                    key={disc.id}
                    onClick={() => toggleStyleOffer(disc.id)}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${
                      isOffered
                        ? 'bg-purple-950/40 border-purple-500/50 text-white shadow-glow-violet/20'
                        : 'bg-slate-950 border-slate-800 text-slate-500 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-900 text-purple-300 border border-purple-500/30">
                        {disc.style_tag || 'Estilo Oficial'}
                      </span>
                      <input
                        type="checkbox"
                        checked={isOffered}
                        onChange={() => {}}
                        className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
                      />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-white">{disc.name}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{disc.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GESTIÓN DE DESAFÍOS & GENERADOR DE QR */}
      {activeTab === 'quests_qr' && (
        <div className="space-y-6">
          {/* Create New Quest / Desafío Form */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" /> Crear Nuevo Desafío (Misión con Puntos)
            </h3>
            <p className="text-xs text-slate-400">
              Los alumnos podrán cumplir este desafío y solicitar los puntos de ritmo asignados.
            </p>

            <form onSubmit={handleCreateQuestSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1">Título del Desafío:</label>
                <input
                  type="text"
                  value={questTitle}
                  onChange={(e) => setQuestTitle(e.target.value)}
                  placeholder="Ej: Asistir a 3 Sociales de Viernes seguidos"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Puntos de Recompensa:</label>
                <input
                  type="number"
                  value={questPoints}
                  onChange={(e) => setQuestPoints(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500 font-extrabold text-amber-300"
                  required
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-slate-300 mb-1">Descripción / Instrucciones:</label>
                <input
                  type="text"
                  value={questDesc}
                  onChange={(e) => setQuestDesc(e.target.value)}
                  placeholder="Ej: Tómate una foto en el photocall del social y menciónanos en Instagram."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="md:col-span-3 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-glow-gold flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publicar Desafío</span>
                </button>
              </div>
            </form>
          </div>

          {/* Active Quests List */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <h4 className="font-extrabold text-white text-base flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" /> Desafíos Activos de la Escuela ({schoolQuests.length})
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {schoolQuests.map((quest) => (
                <div key={quest.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between gap-3 relative">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black">
                        +{quest.reward_points} Puntos
                      </span>
                      {quest.is_active !== false ? (
                        <span className="text-[10px] font-bold text-emerald-400">Activo ✅</span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-500">Pausado ⏸️</span>
                      )}
                    </div>
                    <h5 className="font-extrabold text-sm text-white">{quest.title}</h5>
                    <p className="text-xs text-slate-400">{quest.description}</p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleQuestActive(quest.id)}
                      className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold"
                    >
                      {quest.is_active !== false ? 'Pausar' : 'Activar'}
                    </button>
                    <button
                      onClick={() => deleteQuest(quest.id)}
                      className="p-1.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* QR Code Generator & Printable View */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-amber-500/30 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-amber-400" /> Generador de QR para Imprimir en Sala / Evento
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Genera un código QR único que los alumnos pueden escanear con su móvil para validar su presencia y ganar puntos.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form */}
              <form onSubmit={handleGenerateQRSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Título del Evento / Check-in:</label>
                  <input
                    type="text"
                    value={qrTitle}
                    onChange={(e) => setQrTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Código Único (Alfanumérico):</label>
                  <input
                    type="text"
                    value={qrCode}
                    onChange={(e) => setQrCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-amber-300 font-mono font-bold outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Puntos de Ritmo Otorgados por Escaneo:</label>
                  <input
                    type="number"
                    value={qrPoints}
                    onChange={(e) => setQrPoints(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500 font-extrabold"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black text-xs shadow-glow-gold flex items-center justify-center gap-2 transition-all"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Activar Nuevo Código QR</span>
                </button>
              </form>

              {/* Printable QR Card Preview */}
              {currentSchool.active_event_qr && (
                <div className="p-6 rounded-3xl bg-slate-950 border-2 border-amber-500/50 space-y-4 text-center relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase inline-block">
                    🎟️ Poster QR Oficial Activo
                  </span>

                  <h4 className="font-black text-white text-lg">{currentSchool.active_event_qr.title}</h4>
                  <p className="text-xs text-slate-300">Escanea desde tu app DanceXP para ganar <strong className="text-amber-400">+{currentSchool.active_event_qr.points} Puntos</strong></p>

                  <div className="w-40 h-40 mx-auto bg-white p-3 rounded-2xl shadow-glow-gold flex items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(currentSchool.active_event_qr.code)}`}
                      alt="QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="font-mono text-xs font-bold text-amber-300 bg-slate-900 py-1.5 px-3 rounded-xl inline-block border border-slate-800">
                    CÓDIGO: {currentSchool.active_event_qr.code}
                  </div>

                  <button
                    onClick={() => window.print()}
                    className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Printer className="w-4 h-4 text-amber-400" />
                    <span>Imprimir Poster de Sala</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PUBLICACIÓN DE EVENTOS / SOCIALES SEGÚN LÍMITE MENSUAL */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          {/* Limit Alert Warning */}
          {isLimitReached ? (
            <div className="p-5 rounded-3xl bg-rose-950/60 border border-rose-500/40 flex items-center gap-4 text-rose-200">
              <AlertTriangle className="w-8 h-8 text-rose-400 flex-shrink-0" />
              <div>
                <h4 className="font-black text-sm text-white">Cupo Mensual de Eventos Alcanzado ({schoolSocials.length} / {monthlyEventLimit})</h4>
                <p className="text-xs text-rose-300 mt-0.5">
                  Tu escuela ha alcanzado el límite máximo de {monthlyEventLimit} eventos por mes asignado por la administración. Para publicar eventos adicionales, contacta al administrador de la plataforma.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs font-bold text-emerald-300">
              <span>✅ Dispones de cupo para publicar {monthlyEventLimit - schoolSocials.length} eventos adicionales este mes.</span>
              <span>Cupo: {schoolSocials.length} / {monthlyEventLimit}</span>
            </div>
          )}

          {/* Create Event Form (Disabled if limit reached) */}
          <div className={`p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl ${isLimitReached ? 'opacity-50 pointer-events-none' : ''}`}>
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-rose-400" /> Publicar Nuevo Evento Social
            </h3>

            <form onSubmit={handleCreateSocialSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Nombre del Social / Evento:</label>
                  <input
                    type="text"
                    value={socialTitle}
                    onChange={(e) => setSocialTitle(e.target.value)}
                    placeholder="Ej: Social de Salsa & Bachata Victorys"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-rose-500"
                    required
                    disabled={isLimitReached}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Día de la Semana:</label>
                  <select
                    value={socialDay}
                    onChange={(e) => setSocialDay(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-rose-500"
                    disabled={isLimitReached}
                  >
                    <option value="Viernes">Viernes</option>
                    <option value="Sábado">Sábado</option>
                    <option value="Domingo">Domingo</option>
                    <option value="Jueves">Jueves</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Horario:</label>
                  <input
                    type="text"
                    value={socialTime}
                    onChange={(e) => setSocialTime(e.target.value)}
                    placeholder="Ej: 22:00h - 02:30h"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-rose-500"
                    required
                    disabled={isLimitReached}
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-300 mb-1">Ubicación / Sala:</label>
                  <input
                    type="text"
                    value={socialLocation}
                    onChange={(e) => setSocialLocation(e.target.value)}
                    placeholder="Ej: Sala Principal Victorys Club Palma"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-rose-500"
                    required
                    disabled={isLimitReached}
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-300 mb-1">Descripción / Detalles del Evento:</label>
                  <textarea
                    rows={2}
                    value={socialDesc}
                    onChange={(e) => setSocialDesc(e.target.value)}
                    placeholder="Ej: Taller previo a las 21:00h + 2 Ambientes (Salsa en línea & Bachata Sensual). Entrada con consumición."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-rose-500"
                    required
                    disabled={isLimitReached}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLimitReached}
                  className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-black text-xs shadow-glow-rose flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publicar Social de la Semana</span>
                </button>
              </div>
            </form>
          </div>

          {/* Published Events Feed */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <h4 className="font-extrabold text-white text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-rose-400" /> Eventos Sociales Publicados por esta Sede ({schoolSocials.length})
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {schoolSocials.map((social) => (
                <div key={social.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 relative">
                  <button
                    onClick={() => deleteWeeklySocial(social.id)}
                    className="absolute top-4 right-4 p-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30"
                    title="Eliminar evento social"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-black text-[10px] uppercase inline-block">
                    {social.day_of_week} · {social.time}
                  </span>

                  <h5 className="font-extrabold text-white text-base">{social.title}</h5>
                  <p className="text-xs text-slate-400">📍 {social.location}</p>
                  <p className="text-xs text-slate-300 leading-relaxed">{social.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
