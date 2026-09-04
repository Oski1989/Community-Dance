'use client';

import QRCode from 'qrcode';
import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Settings,
  Building2,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Zap,
  Gift,
  CheckCircle,
  Save,
  PlusCircle,
  Users,
  Eye,
  EyeOff,
  Layers,
  Award,
  Calendar,
  Tag,
  Coins,
  Edit,
} from 'lucide-react';

const EventQRGeneratorSection: React.FC = () => {
  const { currentSchool, generateEventQR } = useApp();

  const activeQR = currentSchool.active_event_qr;
  const [eventTitle, setEventTitle] = useState<string>(activeQR?.title || 'Social Viernes Neón Victorys Palma');
  const [eventCode, setEventCode] = useState<string>(activeQR?.code || 'VICTORYS-NEON-2026');
  const [eventPoints, setEventPoints] = useState<number>(activeQR?.points || 75);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    const codeToRender = activeQR?.code || eventCode;
    // Generate QR with Victorys signature deep Magenta dark modules (#BE185D / fuchsia)
    QRCode.toDataURL(codeToRender, {
      margin: 1,
      width: 340,
      color: {
        dark: '#BE185D',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch(console.error);
  }, [activeQR, eventCode]);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    generateEventQR(eventTitle, eventCode, eventPoints);
  };

  const handlePrintPoster = () => {
    setShowPrintModal(true);
    setTimeout(() => {
      window.print();
    }, 400);
  };

  return (
    <>
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fuchsia-500/20 border border-fuchsia-500/30 text-fuchsia-300 text-xs font-bold mb-1">
              <Zap className="w-4 h-4 text-fuchsia-400" /> Generador de QR para Victorys Sociales
            </div>
            <h3 className="text-lg font-black text-white">Generar & Imprimir Código QR del Local Victorys</h3>
            <p className="text-xs text-slate-400">
              Imprime este cartel con QR estilo Victorys Magenta para colocarlo en la entrada o barra del local.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Event QR Form */}
          <form onSubmit={handleGenerate} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Nombre del Social / Evento:</label>
              <input
                type="text"
                required
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="ej: Social Viernes Neón Victorys"
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-semibold focus:border-fuchsia-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Código QR / Token:</label>
                <input
                  type="text"
                  required
                  value={eventCode}
                  onChange={(e) => setEventCode(e.target.value.toUpperCase())}
                  placeholder="ej: VICTORYS-2026"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-fuchsia-400 font-mono text-xs font-bold focus:border-fuchsia-500 outline-none uppercase"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Puntos Otorgados:</label>
                <input
                  type="number"
                  required
                  min={10}
                  value={eventPoints}
                  onChange={(e) => setEventPoints(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-bold focus:border-fuchsia-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white font-black text-xs shadow-glow-violet transition-all"
            >
              🎟️ Generar & Actualizar QR de Evento
            </button>
          </form>

          {/* Printable QR Display Card */}
          {activeQR && (
            <div className="p-6 rounded-3xl bg-slate-950 border-2 border-fuchsia-500/40 text-center space-y-4 shadow-glow-violet/20 relative overflow-hidden">
              <div className="space-y-1">
                <span className="text-[10px] font-black tracking-widest text-fuchsia-400 uppercase block">Cartel Imprimible Victorys Magenta</span>
                <h4 className="text-lg font-black text-white">{activeQR.title}</h4>
                <p className="text-xs font-bold text-fuchsia-300">{currentSchool.venue_name || 'Discoteca Victorys Palma'}</p>
              </div>

              {/* QR Code Graphic */}
              <div className="mx-auto w-44 h-44 p-3 bg-white rounded-2xl shadow-2xl flex flex-col items-center justify-center border-4 border-fuchsia-600">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="QR Code Victorys Magenta" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-slate-950 text-xs font-bold">Generando QR...</span>
                )}
              </div>

              <div className="space-y-1">
                <span className="inline-block px-3 py-1 rounded-full bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/30 text-xs font-mono font-black">
                  CÓDIGO: {activeQR.code}
                </span>
                <p className="text-[11px] text-slate-400 pt-1">
                  Escanea con la PWA DanceXP para obtener <strong className="text-fuchsia-400">+{activeQR.points} Puntos de Ritmo</strong>
                </p>
              </div>

              <button
                onClick={handlePrintPoster}
                className="w-full py-2.5 rounded-xl bg-fuchsia-950 hover:bg-fuchsia-900 text-fuchsia-200 font-black text-xs border border-fuchsia-600/60 hover:border-fuchsia-500 transition-all flex items-center justify-center gap-2"
              >
                🖨️ Imprimir Cartel QR Victorys (1 Página)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Standalone Printable Modal View in Victorys Magenta Theme */}
      {showPrintModal && activeQR && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 text-white overflow-y-auto">
          <div
            id="printable-qr-poster"
            className="max-w-lg w-full bg-white text-slate-950 border-8 border-fuchsia-600 rounded-3xl p-8 text-center space-y-6 shadow-2xl relative"
          >
            {/* Header Victorys Brand */}
            <div className="space-y-2 border-b-4 border-fuchsia-600 pb-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fuchsia-100 text-fuchsia-900 font-black text-xs tracking-widest uppercase border border-fuchsia-300">
                ✨ VICTORYS BAILE & SOCIALES
              </div>
              <h2 className="text-4xl font-black text-fuchsia-950 uppercase tracking-tight">VICTORYS</h2>
              <p className="text-sm font-black text-fuchsia-700">{currentSchool.venue_name || 'Discoteca & Sala Victorys Palma'}</p>
            </div>

            {/* Event Title */}
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-slate-950 leading-tight">{activeQR.title}</h1>
              <p className="text-sm text-slate-700 font-bold">¡Escanea este código QR con la PWA DanceXP y gana Puntos de Ritmo!</p>
            </div>

            {/* Magenta QR Code Box */}
            <div className="mx-auto w-64 h-64 p-4 bg-white rounded-3xl border-4 border-fuchsia-600 shadow-2xl flex items-center justify-center">
              {qrDataUrl && <img src={qrDataUrl} alt="QR Code Victorys Magenta" className="w-full h-full object-contain" />}
            </div>

            {/* Token & Points Tag */}
            <div className="space-y-2">
              <div className="text-2xl font-mono font-black text-fuchsia-950 bg-fuchsia-100 px-6 py-2.5 rounded-2xl border-2 border-fuchsia-600 inline-block">
                CÓDIGO: {activeQR.code}
              </div>
              <p className="text-lg font-black text-fuchsia-700 block">Recompensa: +{activeQR.points} Puntos de Ritmo</p>
            </div>

            {/* Print Action Buttons */}
            <div className="pt-4 flex justify-center gap-4 no-print">
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-6 py-2.5 rounded-xl bg-slate-200 text-slate-800 hover:bg-slate-300 font-bold text-xs"
              >
                Cerrar Impresión
              </button>
              <button
                onClick={() => window.print()}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white font-black text-xs shadow-lg"
              >
                🖨️ Confirmar Impresión Victorys (1 Página)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const TeacherConfigView: React.FC = () => {
  const {
    currentSchool,
    classes,
    createClass,
    toggleRankingsPublic,
    quests,
    createQuest,
    toggleQuestActive,
    disciplines,
    currentUser,
    updateProfile,
  } = useApp();

  // Teacher Profile State
  const [teacherBio, setTeacherBio] = useState<string>(currentUser.bio || '');
  const [schoolsTaught, setSchoolsTaught] = useState<string>((currentUser.schools_taught || ['Victorys Palma']).join(', '));
  const [instagram, setInstagram] = useState<string>(currentUser.social_instagram || '');
  const [youtube, setYoutube] = useState<string>(currentUser.social_youtube || '');
  const [tiktok, setTiktok] = useState<string>(currentUser.social_tiktok || '');
  const [featuredVideoUrl, setFeaturedVideoUrl] = useState<string>(currentUser.featured_video_url || '');
  const [isProfileSaved, setIsProfileSaved] = useState<boolean>(false);

  // Visible Teacher Disciplines (Programs)
  const myDisciplines = disciplines.filter(
    (d) =>
      currentUser.role === 'admin' ||
      d.creator_teacher_id === currentUser.id ||
      (d.shared_teacher_ids && d.shared_teacher_ids.includes(currentUser.id))
  );

  // New Class Form State
  const [className, setClassName] = useState<string>('');
  const [classDiscipline, setClassDiscipline] = useState<string>(myDisciplines[0]?.name || disciplines[0]?.name || 'Salsa en Línea');
  const [classSchedule, setClassSchedule] = useState<string>('Jueves 20:30h');
  const [classLocation, setClassLocation] = useState<string>('Victorys Sala Principal');

  // New Quest Form State
  const [questTitle, setQuestTitle] = useState<string>('');
  const [questPoints, setQuestPoints] = useState<number>(100);
  const [questDescription, setQuestDescription] = useState<string>('');
  const [questDisciplineId, setQuestDisciplineId] = useState<string>(myDisciplines[0]?.id || '');
  const [questRewardType, setQuestRewardType] = useState<'rhythm_points' | 'school_reward'>('rhythm_points');
  const [questRewardText, setQuestRewardText] = useState<string>('');

  const handleSaveTeacherProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(currentUser.id, {
      bio: teacherBio,
      schools_taught: schoolsTaught.split(',').map((s) => s.trim()).filter(Boolean),
      social_instagram: instagram,
      social_youtube: youtube,
      social_tiktok: tiktok,
      featured_video_url: featuredVideoUrl,
    });
    setIsProfileSaved(true);
    setTimeout(() => setIsProfileSaved(false), 2000);
  };

  const handleCreateClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;
    createClass(className.trim(), classDiscipline, classSchedule, classLocation);
    setClassName('');
  };

  const handleCreateQuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questTitle.trim()) return;
    createQuest(
      questTitle.trim(),
      questPoints,
      questDescription,
      questDisciplineId || undefined,
      'teacher',
      questRewardType,
      questRewardText || undefined
    );
    setQuestTitle('');
    setQuestDescription('');
    setQuestRewardText('');
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/20 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold mb-2">
            <Settings className="w-4 h-4" /> Configuración del Profesor
          </div>
          <h2 className="text-2xl font-black text-white">Perfil, Clases & Desafíos del Programa</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-lg">
            Personaliza tu perfil público, organiza tus clases presenciales y publica desafíos vinculados a tus programas de baile.
          </p>
        </div>

        {/* Quick Toggle Ranking Visibility */}
        <button
          onClick={() => toggleRankingsPublic(currentSchool.id)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border font-bold text-xs shadow-lg transition-all ${
            currentSchool.is_rankings_public
              ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300'
              : 'bg-amber-950/50 border-amber-500/50 text-amber-300'
          }`}
        >
          {currentSchool.is_rankings_public ? (
            <>
              <Eye className="w-4 h-4 text-emerald-400" /> Rankings Públicos para Alumnos
            </>
          ) : (
            <>
              <EyeOff className="w-4 h-4 text-amber-400" /> Rankings Privados (Solo Profesor)
            </>
          )}
        </button>
      </div>

      {/* Teacher Profile Customization */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" /> Perfil Público del Profesor
            </h3>
            <p className="text-xs text-slate-400">
              Personaliza la información que verán tus alumnos: biografía, escuelas donde enseñas, redes sociales y vídeo destacado.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveTeacherProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Nombre Completo:</label>
              <input
                type="text"
                disabled
                value={currentUser.full_name}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-400 font-semibold cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Escuelas / Sedes donde enseñas (separadas por coma):</label>
              <input
                type="text"
                placeholder="ej: Victorys Palma, BCN Dance Studio"
                value={schoolsTaught}
                onChange={(e) => setSchoolsTaught(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-semibold focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Biografía & Filosofía de Enseñanza:</label>
            <textarea
              rows={3}
              placeholder="Escribe brevemente tu experiencia, especialidades de baile y visión pedagógica..."
              value={teacherBio}
              onChange={(e) => setTeacherBio(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-medium focus:border-amber-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Instagram (@usuario):</label>
              <input
                type="text"
                placeholder="@adrianpapito_dance"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:border-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">YouTube Channel URL:</label>
              <input
                type="text"
                placeholder="https://youtube.com/@adrian"
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:border-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">TikTok (@usuario):</label>
              <input
                type="text"
                placeholder="@adrianpapito"
                value={tiktok}
                onChange={(e) => setTiktok(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Enlace a Vídeo de Demostración / Show (YouTube / Vimeo / MP4):</label>
            <input
              type="text"
              placeholder="https://www.youtube.com/watch?v=..."
              value={featuredVideoUrl}
              onChange={(e) => setFeaturedVideoUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:border-amber-500 outline-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-glow-gold transition-all flex items-center gap-2"
            >
              {isProfileSaved ? (
                <>
                  <CheckCircle className="w-4 h-4" /> Perfil Guardado
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Guardar Perfil de Profesor
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Class Management Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" /> Crear & Gestionar Clases Presenciales
            </h3>
            <p className="text-xs text-slate-400">Organiza las clases activas en tu sede.</p>
          </div>
          <span className="px-3 py-1 bg-purple-950 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold">
            {classes.filter((c) => c.school_id === currentSchool.id).length} Clases Creadas
          </span>
        </div>

        {/* Create Class Form */}
        <form onSubmit={handleCreateClassSubmit} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <h4 className="text-xs font-bold uppercase text-purple-300 flex items-center gap-1.5">
            <PlusCircle className="w-4 h-4" /> Agregar Nueva Clase
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Nombre de la Clase:</label>
              <input
                type="text"
                required
                placeholder="ej: Salsa en Línea Nivel 2"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-semibold focus:border-purple-500 outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Programa / Disciplina:</label>
              <select
                value={classDiscipline}
                onChange={(e) => setClassDiscipline(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-semibold focus:border-purple-500 outline-none"
              >
                {myDisciplines.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Día y Horario:</label>
              <input
                type="text"
                required
                placeholder="ej: Jueves 20:30h"
                value={classSchedule}
                onChange={(e) => setClassSchedule(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-semibold focus:border-purple-500 outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Aula / Sede:</label>
              <input
                type="text"
                required
                placeholder="ej: Victorys Sala A"
                value={classLocation}
                onChange={(e) => setClassLocation(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-semibold focus:border-purple-500 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-glow-violet transition-all"
            >
              + Guardar y Publicar Clase
            </button>
          </div>
        </form>

        {/* Active Classes List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classes
            .filter((c) => c.school_id === currentSchool.id)
            .map((cls) => (
              <div key={cls.id} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-white">{cls.name}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/30 text-[10px] font-extrabold">
                    {cls.discipline}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" /> {cls.schedule}
                  </span>
                  <span className="font-bold text-emerald-400">{cls.student_count || 12} Alumnos Inscritos</span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Quests / Desafíos Creation Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-400" /> Crear & Activar Desafíos del Programa
            </h3>
            <p className="text-xs text-slate-400">
              Publica misiones asociadas a tus programas de baile con recompensas en Puntos de Ritmo o beneficios de la escuela.
            </p>
          </div>
        </div>

        {/* Create Quest Form */}
        <form onSubmit={handleCreateQuestSubmit} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <h4 className="text-xs font-bold uppercase text-purple-300 flex items-center gap-1.5">
            <PlusCircle className="w-4 h-4" /> Publicar Nuevo Desafío para tus Alumnos
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Programa Vinculado:</label>
              <select
                value={questDisciplineId}
                onChange={(e) => setQuestDisciplineId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-semibold focus:border-purple-500 outline-none"
              >
                <option value="">Desafío General del Profesor</option>
                {myDisciplines.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Título del Desafío:</label>
              <input
                type="text"
                required
                placeholder="ej: Grabar combo Nivel 1 en vídeo"
                value={questTitle}
                onChange={(e) => setQuestTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-semibold focus:border-purple-500 outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Recompensa Puntos de Ritmo:</label>
              <input
                type="number"
                min={10}
                step={10}
                required
                value={questPoints}
                onChange={(e) => setQuestPoints(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-semibold focus:border-purple-500 outline-none text-amber-300 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Descripción / Indicaciones:</label>
              <input
                type="text"
                placeholder="ej: Sube tu vídeo al Inbox Zero antes del domingo."
                value={questDescription}
                onChange={(e) => setQuestDescription(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-semibold focus:border-purple-500 outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Premio Adicional de la Escuela (Opcional):</label>
              <input
                type="text"
                placeholder="ej: Copa gratis en barra la próxima vez"
                value={questRewardText}
                onChange={(e) => setQuestRewardText(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-semibold focus:border-purple-500 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-glow-violet transition-all"
            >
              + Publicar Desafío del Profesor
            </button>
          </div>
        </form>

        {/* Quests List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quests.map((q) => {
            const linkedDisc = disciplines.find((d) => d.id === q.discipline_id);
            const isSchoolQuest = q.creator_type === 'school';
            return (
              <div key={q.id} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {isSchoolQuest ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold">
                        🏫 Desafío de la Escuela (Sede)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-extrabold">
                        📚 Misión del Profesor ({linkedDisc?.name || 'Programa'})
                      </span>
                    )}
                    <span className="text-xs font-extrabold text-amber-400">+{q.reward_points} Puntos</span>
                  </div>
                  <span className="font-extrabold text-sm text-white block">{q.title}</span>
                  {q.description && <p className="text-[11px] text-slate-400">{q.description}</p>}
                  {q.reward_text && <p className="text-[11px] font-bold text-amber-300">🎁 {q.reward_text}</p>}
                </div>

                <button
                  onClick={() => toggleQuestActive(q.id)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black border transition-all ${
                    q.is_active !== false
                      ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-900 border-slate-700 text-slate-500'
                  }`}
                >
                  {q.is_active !== false ? 'ACTIVADO' : 'DESACTIVADO'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Social Event QR Code Generator for Printing */}
      <EventQRGeneratorSection />
    </div>
  );
};
