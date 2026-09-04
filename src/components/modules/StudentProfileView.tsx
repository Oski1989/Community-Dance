'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Zap,
  Flame,
  Award,
  Users,
  Star,
  Music,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  Upload,
  FileText,
  Clock,
  X,
  ChevronRight,
  ShieldCheck,
  Check,
  UserCheck,
  Heart,
  Sparkles,
  ChevronLeft,
  Calendar,
  Compass,
} from 'lucide-react';
import { INITIAL_PROFILES } from '@/lib/mockData';
import { InactiveStudentBanner } from '@/components/modules/InactiveStudentBanner';
import { Discipline } from '@/types/database';

interface StudentProfileViewProps {
  onNavigateToLevels?: (disciplineId?: string) => void;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({ onNavigateToLevels }) => {
  const {
    currentUser,
    currentSchool,
    studentXP,
    studentRhythmPoints,
    victoryStreakWeeks,
    disciplines,
    profiles,
    levelTrees,
    quests,
    requestCourseEnrollment,
    toggleEnrollDiscipline,
    toggleRankingPrivacy,
    toggleRankingPrivacyGranular,
    updateProfile,
    addNotification,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'courses' | 'full_profile'>('courses');
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState<boolean>(true);
  const [leaderboardTab, setLeaderboardTab] = useState<'rhythm' | 'technical'>('technical');

  // Modal for requesting enrollment with payment receipt
  const [selectedDiscForEnrollment, setSelectedDiscForEnrollment] = useState<Discipline | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string>('');
  const [paymentNote, setPaymentNote] = useState<string>('');
  const [isSubmittingEnrollment, setIsSubmittingEnrollment] = useState<boolean>(false);

  // Student Editable Full Profile Form State
  const [prefDiscipline, setPrefDiscipline] = useState<string>(currentUser.discipline_preference || 'Salsa & Bachata');
  const [danceRole, setDanceRole] = useState<'leader' | 'follower' | 'both'>(currentUser.dance_role || 'leader');
  const [maritalStatus, setMaritalStatus] = useState<'single' | 'in_relationship' | 'married' | 'other'>(currentUser.marital_status || 'single');
  const [gender, setGender] = useState<string>(currentUser.gender || 'Masculino');
  const [socialInstagram, setSocialInstagram] = useState<string>(currentUser.social_instagram || '');
  const [socialTiktok, setSocialTiktok] = useState<string>(currentUser.social_tiktok || '');
  const [phone, setPhone] = useState<string>(currentUser.phone || '');
  const [bio, setBio] = useState<string>(currentUser.bio || '');
  const [isSavingFullProfile, setIsSavingFullProfile] = useState<boolean>(false);

  // Enrolled discipline IDs for student
  const enrolledIds = currentUser.enrolled_discipline_ids && currentUser.enrolled_discipline_ids.length > 0
    ? currentUser.enrolled_discipline_ids
    : ['disc-salsa-linea'];

  const enrolledDisciplines = disciplines.filter((d) => enrolledIds.includes(d.id));

  // Teachers in the academy
  const teacherProfiles = profiles.filter((p) => p.role === 'teacher');

  const isPublicInRankings = currentUser.is_public_in_rankings !== false;

  // Filter leaderboard students who allowed ranking visibility (or self)
  const studentLeaderboard = [
    {
      name: 'Laura Martinez',
      xp: 520,
      rhythm: 620,
      streak: 6,
      avatar: INITIAL_PROFILES[3]?.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    },
    {
      name: `${currentUser.full_name} (Tú)`,
      xp: studentXP,
      rhythm: studentRhythmPoints,
      streak: victoryStreakWeeks,
      avatar: currentUser?.avatar_url || '',
    },
    {
      name: 'Carlos Ruiz',
      xp: 210,
      rhythm: 180,
      streak: 2,
      avatar: INITIAL_PROFILES[4]?.avatar_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    },
  ].sort((a, b) => (leaderboardTab === 'technical' ? b.xp - a.xp : b.rhythm - a.rhythm));

  const handleEnrollmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDiscForEnrollment) return;

    setIsSubmittingEnrollment(true);
    setTimeout(() => {
      requestCourseEnrollment(selectedDiscForEnrollment.id, receiptUrl, paymentNote);
      setIsSubmittingEnrollment(false);
      setSelectedDiscForEnrollment(null);
      setReceiptUrl('');
      setPaymentNote('');
    }, 600);
  };

  const handleSaveFullProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingFullProfile(true);
    setTimeout(() => {
      updateProfile(currentUser.id, {
        discipline_preference: prefDiscipline,
        dance_role: danceRole,
        marital_status: maritalStatus,
        gender: gender,
        social_instagram: socialInstagram,
        social_tiktok: socialTiktok,
        phone: phone,
        bio: bio,
      });
      setIsSavingFullProfile(false);
      addNotification('Ficha de Alumno Actualizada 💾', 'Tus datos personales y rol de baile fueron guardados correctamente.', 'info');
    }, 500);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Inactive Student Banner Notice */}
      <InactiveStudentBanner />

      {/* Main Grid: Left Area (Main Content) & Right Collapsible Sidebar (Rankings, Quests, Streaks) */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Main Content Area (2/3 width or full width when sidebar collapsed) */}
        <div className="flex-1 space-y-6 w-full">
          {/* Profile Header Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-slate-950 border border-purple-500/30 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 relative z-10">
              <div className="relative">
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.full_name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-purple-500/50 shadow-glow-violet"
                />
                <span
                  className={`absolute -bottom-2 -right-2 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border shadow-md ${
                    currentUser.role === 'admin'
                      ? 'bg-indigo-500 text-white border-indigo-400'
                      : currentUser.role === 'teacher'
                      ? 'bg-purple-600 text-white border-purple-400'
                      : 'bg-emerald-500 text-slate-950 border-emerald-400'
                  }`}
                >
                  {currentUser.role}
                </span>
              </div>

              <div className="text-center sm:text-left space-y-1 flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-2xl sm:text-3xl font-black text-white">{currentUser.full_name}</h2>
                  <span
                    className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                      currentUser.membership_status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : currentUser.membership_status === 'pending_approval'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    Membresía: {currentUser.membership_status}
                  </span>
                </div>

                <p className="text-xs text-slate-300">
                  Sede Principal: <span className="text-purple-300 font-bold">{currentSchool.name}</span> ({currentSchool.city})
                </p>

                <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-3">
                  <div className="px-3 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-bold text-amber-300">{studentXP} XP Técnico</span>
                  </div>

                  {currentSchool.has_social_engine && (
                    <>
                      <div className="px-3 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                        <span className="text-xs font-bold text-emerald-300">{studentRhythmPoints} Puntuación Ritmo</span>
                      </div>

                      <div className="px-3 py-1.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2">
                        <Flame className="w-4 h-4 text-rose-400 fill-rose-400" />
                        <span className="text-xs font-bold text-rose-300">{victoryStreakWeeks} Semanas Racha</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Toggle Sidebar Button (Top Right Header) */}
              <button
                onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                className="px-3 py-2 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-xs font-extrabold text-amber-300 flex items-center gap-1.5 transition-all shadow-md"
                title={isRightSidebarOpen ? 'Ocultar barra de rankings y desafíos' : 'Mostrar barra de rankings y desafíos'}
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>{isRightSidebarOpen ? 'Ocultar Panel Lateral' : 'Podio & Desafíos'}</span>
              </button>
            </div>
          </div>

          {/* Sub-Navigation Tabs: Programas & Cursos vs Ficha Completa de Alumno */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center p-1 bg-slate-900 rounded-2xl border border-slate-800 space-x-1">
              <button
                onClick={() => setActiveTab('courses')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
                  activeTab === 'courses'
                    ? 'bg-purple-600 text-white shadow-glow-violet'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Music className="w-4 h-4" />
                <span>Mis Programas & Catálogo</span>
              </button>

              <button
                onClick={() => setActiveTab('full_profile')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
                  activeTab === 'full_profile'
                    ? 'bg-purple-600 text-white shadow-glow-violet'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserCheck className="w-4 h-4 text-amber-400" />
                <span>Ficha Completa de Alumno & Pareja</span>
              </button>
            </div>

            {/* Granular Privacy Toggles for Rankings */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => toggleRankingPrivacyGranular('technical')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                  currentUser.is_public_in_technical_ranking !== false
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/40'
                    : 'bg-slate-950 text-slate-500 border-slate-800'
                }`}
                title="Visibilidad en Ranking Técnico (XP)"
              >
                {currentUser.is_public_in_technical_ranking !== false ? <Eye className="w-3.5 h-3.5 text-amber-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
                <span>XP Técnico</span>
              </button>

              <button
                onClick={() => toggleRankingPrivacyGranular('rhythm')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                  currentUser.is_public_in_rhythm_ranking !== false
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-950 text-slate-500 border-slate-800'
                }`}
                title="Visibilidad en Ranking de Ritmo"
              >
                {currentUser.is_public_in_rhythm_ranking !== false ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
                <span>Ritmo</span>
              </button>

              <button
                onClick={() => toggleRankingPrivacyGranular('streak')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                  currentUser.is_public_in_streak_ranking !== false
                    ? 'bg-rose-500/10 text-rose-300 border-rose-500/40'
                    : 'bg-slate-950 text-slate-500 border-slate-800'
                }`}
                title="Visibilidad en Racha de Asistencia"
              >
                {currentUser.is_public_in_streak_ranking !== false ? <Eye className="w-3.5 h-3.5 text-rose-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
                <span>Racha</span>
              </button>
            </div>
          </div>

          {/* TAB 1: MIS CURSOS & CATÁLOGO GENERAL */}
          {activeTab === 'courses' && (
            <div className="space-y-6">
              {/* Section: Mis Cursos Inscritos */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
                    <Music className="w-5 h-5 text-purple-400" /> Mis Cursos & Programas ({enrolledDisciplines.length})
                  </h3>
                  <span className="text-xs text-slate-400 font-semibold">Seguimiento Pedagógico</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {enrolledDisciplines.map((discipline, idx) => {
                    const leadTeacher = teacherProfiles[idx % teacherProfiles.length] || teacherProfiles[0];
                    const discTrees = levelTrees.filter((lt) => lt.discipline_id === discipline.id);
                    const totalNodes = discTrees.flatMap((t) => (t.sections ? t.sections.flatMap((s) => s.items) : t.nodes)).length;
                    const completedNodes = discTrees.flatMap((t) => (t.sections ? t.sections.flatMap((s) => s.items) : t.nodes)).filter((n) => n.completed).length;
                    const progressPct = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 65;

                    const status = currentUser.enrolled_disciplines_status?.[discipline.id] || 'active';

                    return (
                      <div
                        key={discipline.id}
                        className="p-5 rounded-3xl bg-slate-900 border border-purple-500/30 space-y-4 shadow-xl relative overflow-hidden flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-black uppercase">
                              {discipline.style_tag || 'Programa Oficial'}
                            </span>
                            {status === 'pending_approval' ? (
                              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 animate-pulse">
                                <Clock className="w-3 h-3" /> Pendiente de Aprobación
                              </span>
                            ) : (
                              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Activo
                              </span>
                            )}
                          </div>

                          <h4 className="font-black text-white text-base leading-snug">{discipline.name}</h4>

                          {leadTeacher && (
                            <div className="flex items-center gap-2 pt-1">
                              <img src={leadTeacher.avatar_url} alt={leadTeacher.full_name} className="w-6 h-6 rounded-full object-cover border border-amber-400" />
                              <span className="text-xs text-amber-300 font-bold">Profesor: {leadTeacher.full_name}</span>
                            </div>
                          )}

                          <p className="text-xs text-slate-400 line-clamp-2">{discipline.description}</p>
                        </div>

                        <div className="space-y-3 pt-2 border-t border-slate-800">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] font-bold text-slate-300">
                              <span>Progreso de Temario</span>
                              <span className="text-purple-400">{progressPct}%</span>
                            </div>
                            <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                              <div
                                className="bg-gradient-to-r from-purple-500 to-amber-500 h-full rounded-full transition-all duration-500 shadow-glow-violet"
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-1">
                            <button
                              onClick={() => onNavigateToLevels && onNavigateToLevels(discipline.id)}
                              className="flex-1 py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-glow-violet flex items-center justify-center gap-1.5 transition-all"
                            >
                              <Award className="w-4 h-4" />
                              <span>Entrar al Temario 🚀</span>
                            </button>

                            <button
                              onClick={() => toggleEnrollDiscipline(discipline.id)}
                              className="px-2.5 py-2 rounded-xl bg-slate-950 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-800 text-[11px] font-bold transition-all"
                              title="Baja del Curso"
                            >
                              Baja
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section: Catálogo General de Cursos & Matrícula con Comprobante */}
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                      <Users className="w-5 h-5 text-amber-400" /> Catálogo de Cursos & Solicitud de Matrícula
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Inscríbete enviando tu comprobante de pago para aprobación del profesor.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {disciplines.map((disc, idx) => {
                    const isEnrolled = enrolledIds.includes(disc.id);
                    const teacher = teacherProfiles[idx % teacherProfiles.length] || teacherProfiles[0];
                    const status = currentUser.enrolled_disciplines_status?.[disc.id];

                    return (
                      <div key={disc.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-amber-300 border border-amber-500/20">
                              {disc.style_tag || 'Estilo Oficial'}
                            </span>
                            {isEnrolled ? (
                              status === 'pending_approval' ? (
                                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                  ⏳ En Aprobación
                                </span>
                              ) : (
                                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> En tu Plan
                                </span>
                              )
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400">Disponible</span>
                            )}
                          </div>

                          <h4 className="font-bold text-white text-sm mt-2">{disc.name}</h4>
                          <p className="text-xs text-slate-400 mt-1">{disc.description}</p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                          {teacher && (
                            <div className="flex items-center gap-1.5">
                              <img src={teacher.avatar_url} alt={teacher.full_name} className="w-5 h-5 rounded-full object-cover" />
                              <span className="text-[11px] text-slate-300 font-medium">{teacher.full_name}</span>
                            </div>
                          )}

                          {!isEnrolled && (
                            <button
                              onClick={() => setSelectedDiscForEnrollment(disc)}
                              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-glow-gold transition-all flex items-center gap-1"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>Inscribirme con Comprobante</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section: Profesores de la Academia */}
              <div className="space-y-4">
                <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400" /> Profesores & Equipo Docente
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teacherProfiles.map((teacher) => (
                    <div
                      key={teacher.id}
                      className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-purple-950/20 to-slate-950 border border-purple-500/30 shadow-2xl space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={teacher.avatar_url}
                          alt={teacher.full_name}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500/40 shadow-glow-gold"
                        />
                        <div>
                          <h4 className="text-base font-black text-white">{teacher.full_name}</h4>
                          <p className="text-xs text-purple-300 font-semibold">Profesor Acreditado DanceXP</p>
                          {teacher.schools_taught && teacher.schools_taught.length > 0 && (
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              🏫 {teacher.schools_taught.join(' · ')}
                            </p>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed italic line-clamp-3">
                        "{teacher.bio || 'Instructor especializado en dinámica de parejas y ritmo.'}"
                      </p>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {teacher.social_instagram && (
                          <span className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-rose-300 font-bold text-[11px]">
                            📸 {teacher.social_instagram}
                          </span>
                        )}
                        {teacher.featured_video_url && (
                          <a
                            href={teacher.featured_video_url}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-[11px] hover:bg-amber-500/30 transition-all"
                          >
                            🎬 Ver Vídeo
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FICHA COMPLETA DE ALUMNO & SOCIAL MATCHING */}
          {activeTab === 'full_profile' && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
              <div className="border-b border-slate-800 pb-4 space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
                  <UserCheck className="w-4 h-4" /> Datos de Alumno & Matching Social
                </div>
                <h3 className="text-xl font-black text-white">Ficha Personal de Baile</h3>
                <p className="text-xs text-slate-400">
                  Completa tus datos personales, rol técnico en baile y redes sociales para conectar con compañeros en los eventos.
                </p>
              </div>

              <form onSubmit={handleSaveFullProfile} className="space-y-6">
                {/* Basic Personal Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Nombre Completo:</label>
                    <input
                      type="text"
                      disabled
                      value={currentUser.full_name}
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Correo Electrónico:</label>
                    <input
                      type="email"
                      disabled
                      value={currentUser.email}
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Teléfono / WhatsApp:</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+34 600 000 000"
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Género:</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none focus:border-purple-500"
                    >
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                      <option value="No Binario / Otro">No Binario / Otro</option>
                    </select>
                  </div>
                </div>

                {/* Dance & Social Profile Fields */}
                <div className="p-5 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-4">
                  <h4 className="font-extrabold text-amber-300 text-sm flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-400" /> Perfil de Baile & Estado Social
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Rol de Baile */}
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Rol Principal en Pareja:</label>
                      <select
                        value={danceRole}
                        onChange={(e) => setDanceRole(e.target.value as any)}
                        className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-bold outline-none focus:border-amber-500"
                      >
                        <option value="leader">🕺 Líder (Lead)</option>
                        <option value="follower">💃 Seguidor/a (Follower)</option>
                        <option value="both">🔄 Ambos (Dual Role)</option>
                      </select>
                    </div>

                    {/* Estado Civil / Social */}
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Estado Social / Civil:</label>
                      <select
                        value={maritalStatus}
                        onChange={(e) => setMaritalStatus(e.target.value as any)}
                        className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none focus:border-amber-500"
                      >
                        <option value="single">Soltero/a (Busco pareja de baile/social)</option>
                        <option value="in_relationship">En Pareja</option>
                        <option value="married">Casado/a</option>
                        <option value="other">Prefiero no especificar</option>
                      </select>
                    </div>

                    {/* Estilo Favorito */}
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Estilo Favorito:</label>
                      <input
                        type="text"
                        value={prefDiscipline}
                        onChange={(e) => setPrefDiscipline(e.target.value)}
                        placeholder="Ej. Salsa L.A., Bachata Sensual"
                        className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Social Networks */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Instagram (@usuario):</label>
                    <input
                      type="text"
                      value={socialInstagram}
                      onChange={(e) => setSocialInstagram(e.target.value)}
                      placeholder="@micuenta.baile"
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">TikTok (@usuario):</label>
                    <input
                      type="text"
                      value={socialTiktok}
                      onChange={(e) => setSocialTiktok(e.target.value)}
                      placeholder="@micuenta.dance"
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Bio / Partner Notes */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Presentación / Objetivos de Baile:</label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Escribe algo sobre tus objetivos en el baile, horarios disponibles para practicar..."
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSavingFullProfile}
                    className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-glow-gold transition-all flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isSavingFullProfile ? 'Guardando...' : 'Guardar Ficha de Alumno'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* RIGHT COLLAPSIBLE SIDEBAR: Misiones, Rachas & Leaderboard */}
        <AnimatePresence>
          {isRightSidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full lg:w-80 space-y-6 sticky top-24 shrink-0"
            >
              {/* Sidebar Header & Close Button */}
              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-2xl relative">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <h3 className="font-extrabold text-white text-base">Podio & Desafíos</h3>
                  </div>

                  <button
                    onClick={() => setIsRightSidebarOpen(false)}
                    className="p-1.5 rounded-xl bg-slate-950 text-slate-400 hover:text-white border border-slate-800 transition-all"
                    title="Cerrar panel lateral"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Section: Rachas de Asistencia / Sociales */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 to-slate-950 border border-rose-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-rose-400 fill-rose-400 animate-pulse" /> Racha Social
                    </span>
                    <span className="text-xs font-black text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/40">
                      🔥 {victoryStreakWeeks} Semanas
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Asiste a 1 social por semana o valida tu QR en clase para mantener activa tu racha de ritmo.
                  </p>
                </div>

                {/* Section: Active Quests & Missions preview */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Desafíos Activos ({quests.length})
                    </span>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                    {quests.slice(0, 3).map((quest) => (
                      <div
                        key={quest.id}
                        className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1 hover:border-amber-500/30 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-white truncate max-w-[150px]">{quest.title}</span>
                          <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full">
                            +{quest.reward_points} pts
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{quest.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section: Leaderboards & Podium Tabs */}
                <div className="space-y-4 pt-2 border-t border-slate-800">
                  <div className="flex items-center p-1 bg-slate-950 rounded-2xl border border-slate-800">
                    <button
                      onClick={() => setLeaderboardTab('technical')}
                      className={`flex-1 py-1.5 text-[11px] font-extrabold rounded-xl transition-all ${
                        leaderboardTab === 'technical'
                          ? 'bg-amber-500 text-slate-950 shadow-glow-gold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      ⭐ XP Técnico
                    </button>
                    {currentSchool.has_social_engine && (
                      <button
                        onClick={() => setLeaderboardTab('rhythm')}
                        className={`flex-1 py-1.5 text-[11px] font-extrabold rounded-xl transition-all ${
                          leaderboardTab === 'rhythm'
                            ? 'bg-emerald-500 text-slate-950 shadow-glow-emerald'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        ⚡ Ritmo
                      </button>
                    )}
                  </div>

                  {/* Podium (Top 3) */}
                  <div className="grid grid-cols-3 gap-2 items-end">
                    {/* Rank 2 */}
                    {studentLeaderboard[1] && (
                      <div className="flex flex-col items-center text-center space-y-1 p-2 rounded-2xl bg-slate-950/80 border border-slate-800">
                        <span className="text-base">🥈</span>
                        <img
                          src={studentLeaderboard[1].avatar}
                          alt={studentLeaderboard[1].name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-400"
                        />
                        <span className="font-bold text-[10px] text-white truncate max-w-[60px]">
                          {studentLeaderboard[1].name}
                        </span>
                        <span className="text-[9px] font-black text-slate-300">
                          {leaderboardTab === 'technical' ? `${studentLeaderboard[1].xp} XP` : `${studentLeaderboard[1].rhythm} Pts`}
                        </span>
                      </div>
                    )}

                    {/* Rank 1 */}
                    {studentLeaderboard[0] && (
                      <div className="flex flex-col items-center text-center space-y-1 p-2.5 rounded-2xl bg-gradient-to-b from-amber-950/50 via-slate-950 to-slate-950 border border-amber-500/60 shadow-glow-gold scale-105">
                        <span className="text-lg">👑</span>
                        <img
                          src={studentLeaderboard[0].avatar}
                          alt={studentLeaderboard[0].name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-amber-400"
                        />
                        <span className="font-black text-[10px] text-amber-300 truncate max-w-[65px]">
                          {studentLeaderboard[0].name}
                        </span>
                        <span className="text-[9px] font-black text-amber-400">
                          {leaderboardTab === 'technical' ? `${studentLeaderboard[0].xp} XP` : `${studentLeaderboard[0].rhythm} Pts`}
                        </span>
                      </div>
                    )}

                    {/* Rank 3 */}
                    {studentLeaderboard[2] && (
                      <div className="flex flex-col items-center text-center space-y-1 p-2 rounded-2xl bg-slate-950/80 border border-slate-800">
                        <span className="text-base">🥉</span>
                        <img
                          src={studentLeaderboard[2].avatar}
                          alt={studentLeaderboard[2].name}
                          className="w-9 h-9 rounded-full object-cover border border-amber-700"
                        />
                        <span className="font-bold text-[10px] text-white truncate max-w-[60px]">
                          {studentLeaderboard[2].name}
                        </span>
                        <span className="text-[9px] font-black text-amber-600">
                          {leaderboardTab === 'technical' ? `${studentLeaderboard[2].xp} XP` : `${studentLeaderboard[2].rhythm} Pts`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Ranking List */}
                  <div className="space-y-1.5 pt-1">
                    {studentLeaderboard.map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                          item.name.includes('Tú')
                            ? 'bg-purple-950/40 border-purple-500/50'
                            : 'bg-slate-950/60 border-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-black text-[11px] text-slate-400 w-3">#{idx + 1}</span>
                          <img src={item.avatar} alt={item.name} className="w-6 h-6 rounded-full object-cover" />
                          <span className="font-bold text-white truncate max-w-[90px]">{item.name}</span>
                        </div>
                        <span className="font-black text-amber-400 text-[11px]">
                          {leaderboardTab === 'technical' ? `${item.xp} XP` : `${item.rhythm} pts`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal: Request Enrollment with Payment Receipt */}
      <AnimatePresence>
        {selectedDiscForEnrollment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-4"
            >
              <button
                onClick={() => setSelectedDiscForEnrollment(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase">
                  Solicitud de Inscripción
                </span>
                <h3 className="text-xl font-black text-white">{selectedDiscForEnrollment.name}</h3>
                <p className="text-xs text-slate-400">
                  Envía el comprobante de transferencia o pago de la cuota para recibir la validación del profesor.
                </p>
              </div>

              <form onSubmit={handleEnrollmentSubmit} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Comprobante de Pago (Enlace o archivo PDF/JPG):
                  </label>
                  <input
                    type="text"
                    placeholder="https://comprobantes.com/pago_123.pdf o referencia Bizum"
                    value={receiptUrl}
                    onChange={(e) => setReceiptUrl(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Nota / Mensaje para el Profesor (opcional):
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ej. Realicé el pago por Bizum con concepto Matrícula Salsa..."
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDiscForEnrollment(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmittingEnrollment}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-glow-gold transition-all"
                  >
                    {isSubmittingEnrollment ? 'Enviando...' : 'Enviar Solicitud al Profesor'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
