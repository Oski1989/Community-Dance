'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Role } from '@/types/database';
import {
  Shield,
  ShieldAlert,
  UserCheck,
  ShieldCheck,
  Users,
  Search,
  Award,
  Building2,
  DollarSign,
  Calendar,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

export const AdminDashboardView: React.FC = () => {
  const {
    profiles,
    updateUserRole,
    updateStudentStatus,
    schools,
    disciplines,
    weeklySocials,
    createWeeklySocial,
    deleteWeeklySocial,
    updateSchoolMonthlyEventLimit,
    currentUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'teachers' | 'students' | 'schools' | 'finance'>('overview');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Weekly Social Creation Modal / Form State
  const [showSocialModal, setShowSocialModal] = useState<boolean>(false);
  const [socialTitle, setSocialTitle] = useState<string>('');
  const [socialDay, setSocialDay] = useState<string>('Viernes');
  const [socialTime, setSocialTime] = useState<string>('22:00h - 02:30h');
  const [socialLocation, setSocialLocation] = useState<string>('Sala Principal Victorys');
  const [socialDesc, setSocialDesc] = useState<string>('');

  const filteredProfiles = profiles.filter(
    (p) =>
      p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const teacherProfiles = profiles.filter((p) => p.role === 'teacher');
  const studentProfiles = profiles.filter((p) => p.role === 'student');

  const activeStudentsCount = studentProfiles.filter((s) => s.membership_status === 'active').length;
  const totalRevenue = activeStudentsCount * (schools[0]?.membership_fee_monthly || 50);

  const handleCreateSocialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socialTitle || !socialDesc) return;
    createWeeklySocial(socialTitle, socialDay, socialTime, socialLocation, socialDesc);
    setSocialTitle('');
    setSocialDesc('');
    setShowSocialModal(false);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950 via-purple-950/60 to-slate-900 border border-indigo-500/40 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold mb-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" /> Panel de Administración & Gestión de Escuela
          </div>
          <h2 className="text-2xl font-black text-white">Administración Sectorizada DanceXP</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-lg">
            Control de usuarios, profesores, escuelas/sedes, publicación de sociales semanales y gestión de finanzas por sector.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-xs font-bold">
          <div>
            <span className="text-[10px] text-slate-400 block">Total Usuarios</span>
            <span className="text-base text-indigo-300 font-extrabold">{profiles.length} Registrados</span>
          </div>
          <div className="border-l border-slate-800 pl-3">
            <span className="text-[10px] text-slate-400 block">Ingresos Estimados</span>
            <span className="text-base text-emerald-400 font-extrabold">{totalRevenue}€ / mes</span>
          </div>
        </div>
      </div>

      {/* Sectorized Navigation Tabs */}
      <div className="flex flex-wrap items-center p-1 bg-slate-900 rounded-2xl border border-slate-800 gap-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
            activeTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-glow-indigo'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Usuarios Totales ({profiles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('teachers')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
            activeTab === 'teachers'
              ? 'bg-indigo-600 text-white shadow-glow-indigo'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4 text-purple-400" />
          <span>Profesores & Cursos ({teacherProfiles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
            activeTab === 'students'
              ? 'bg-indigo-600 text-white shadow-glow-indigo'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <UserCheck className="w-4 h-4 text-emerald-400" />
          <span>Directorio de Alumnos ({studentProfiles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('schools')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
            activeTab === 'schools'
              ? 'bg-indigo-600 text-white shadow-glow-indigo'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4 text-amber-400" />
          <span>Escuelas & Sociales ({schools.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('finance')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
            activeTab === 'finance'
              ? 'bg-indigo-600 text-white shadow-glow-indigo'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span>Cuentas & Finanzas por Sector</span>
        </button>
      </div>

      {/* TAB 1: USUARIOS TOTALES & ASIGNACIÓN DE ROLES */}
      {activeTab === 'overview' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" /> Listado Global de Usuarios ({profiles.length})
            </h3>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar por usuario o correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Usuario</th>
                  <th className="py-3 px-4">Correo</th>
                  <th className="py-3 px-4">Rol Actual</th>
                  <th className="py-3 px-4">Membresía</th>
                  <th className="py-3 px-4 text-right">Asignar Rol & Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProfiles.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-950/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                      <img src={user.avatar_url} alt={user.full_name} className="w-8 h-8 rounded-full object-cover border border-white/10" />
                      <span>{user.full_name}</span>
                    </td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase border ${
                          user.role === 'admin'
                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                            : user.role === 'school'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : user.role === 'teacher'
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          user.membership_status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : user.membership_status === 'pending_approval'
                            ? 'bg-amber-500/20 text-amber-300 animate-pulse'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {user.membership_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value as Role)}
                          className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                        >
                          <option value="student">Alumno (Student)</option>
                          <option value="teacher">Profesor (Teacher)</option>
                          <option value="school">Escuela (School)</option>
                          <option value="admin">Administrador (Admin)</option>
                        </select>

                        {user.membership_status !== 'active' ? (
                          <button
                            onClick={() => updateStudentStatus(user.id, 'active')}
                            className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[10px]"
                          >
                            Activar
                          </button>
                        ) : (
                          <button
                            onClick={() => updateStudentStatus(user.id, 'inactive')}
                            className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px]"
                          >
                            Inactivar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PROFESORES & PROGRAMAS */}
      {activeTab === 'teachers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-400" /> Profesores Acreditados ({teacherProfiles.length})
            </h3>
            <span className="text-xs text-slate-400">Total Programas Creados: {disciplines.length}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teacherProfiles.map((teacher) => {
              const teacherDisciplines = disciplines.filter((d) => d.creator_teacher_id === teacher.id || d.shared_teacher_ids?.includes(teacher.id));
              return (
                <div key={teacher.id} className="p-5 rounded-3xl bg-slate-900 border border-purple-500/30 space-y-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <img src={teacher.avatar_url} alt={teacher.full_name} className="w-12 h-12 rounded-2xl object-cover border-2 border-purple-500/50" />
                    <div>
                      <h4 className="font-black text-white text-base">{teacher.full_name}</h4>
                      <p className="text-xs text-purple-300 font-semibold">{teacher.email}</p>
                      {teacher.schools_taught && (
                        <p className="text-[11px] text-slate-400 mt-0.5">🏫 {teacher.schools_taught.join(' · ')}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-slate-800 pt-3">
                    <span className="text-[11px] font-bold text-slate-400 block">Programas Administrados ({teacherDisciplines.length}):</span>
                    <div className="flex flex-wrap gap-1.5">
                      {teacherDisciplines.map((d) => (
                        <span key={d.id} className="px-2.5 py-1 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-200 text-xs font-bold">
                          {d.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: DIRECTORIO DE ALUMNOS */}
      {activeTab === 'students' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
          <h3 className="font-extrabold text-white text-base flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-400" /> Directorio de Alumnos ({studentProfiles.length})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Alumno</th>
                  <th className="py-3 px-4">Rol Baile</th>
                  <th className="py-3 px-4">Estado Social</th>
                  <th className="py-3 px-4">Estado Membresía</th>
                  <th className="py-3 px-4">Comprobante Pago</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {studentProfiles.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-950/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                      <img src={student.avatar_url} alt={student.full_name} className="w-8 h-8 rounded-full object-cover border border-white/10" />
                      <div>
                        <span>{student.full_name}</span>
                        <span className="block text-[10px] text-slate-400">{student.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-950 text-amber-300 font-bold text-[10px]">
                        {student.dance_role === 'leader' ? '🕺 Leader' : student.dance_role === 'follower' ? '💃 Follower' : '🔄 Ambos'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-300 font-medium text-[11px]">
                        {student.marital_status === 'single' ? 'Soltero/a' : student.marital_status === 'in_relationship' ? 'En Pareja' : 'Otro'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          student.membership_status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {student.membership_status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {student.payment_receipt_url ? (
                        <a
                          href={student.payment_receipt_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-amber-300 hover:underline font-mono text-[11px] flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" /> Ver Comprobante
                        </a>
                      ) : (
                        <span className="text-slate-500 text-[10px]">Sin comprobante</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ESCUELAS, SEDES & PUBLICACIÓN DE SOCIALES */}
      {activeTab === 'schools' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" /> Escuelas, Sedes & Tablón de Sociales
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Gestiona las sedes activas y publica los eventos sociales oficiales de la semana para los alumnos.
              </p>
            </div>

            <button
              onClick={() => setShowSocialModal(true)}
              className="px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-glow-gold flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Publicar Social de la Semana</span>
            </button>
          </div>

          {/* List of Registered Schools */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schools.map((school) => (
              <div key={school.id} className="p-5 rounded-3xl bg-slate-900 border border-amber-500/30 space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase">
                    Sede Oficial
                  </span>
                  <span className="text-xs text-emerald-400 font-bold">Cuota: {school.membership_fee_monthly || 50}€ / mes</span>
                </div>
                <h4 className="font-black text-white text-lg">{school.name}</h4>
                <p className="text-xs text-slate-300">📍 {school.venue_name || school.city}</p>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span>Motor Social: {school.has_social_engine ? 'Sí ✅' : 'No ❌'}</span>
                    <span>Niveles Temario: {school.levels_count || 4}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-950 p-2 rounded-xl border border-slate-800">
                    <span className="text-amber-300 font-bold">Límite Publicación Eventos Mensuales:</span>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      defaultValue={school.monthly_event_limit || 4}
                      onBlur={(e) => updateSchoolMonthlyEventLimit(school.id, Number(e.target.value))}
                      className="w-16 bg-slate-900 border border-amber-500/40 rounded-lg px-2 py-1 text-xs text-white font-extrabold text-center outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Weekly Social Events Feed */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-2xl">
            <h4 className="font-extrabold text-white text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-rose-400" /> Sociales de la Semana Publicados ({weeklySocials.length})
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {weeklySocials.map((social) => (
                <div key={social.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 relative">
                  <button
                    onClick={() => deleteWeeklySocial(social.id)}
                    className="absolute top-4 right-4 p-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30"
                    title="Eliminar evento social"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-black text-[10px] uppercase">
                      {social.day_of_week} · {social.time}
                    </span>
                  </div>

                  <h5 className="font-extrabold text-white text-base">{social.title}</h5>
                  <p className="text-xs text-slate-400">📍 {social.location}</p>
                  <p className="text-xs text-slate-300 leading-relaxed">{social.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: FINANZAS Y CUENTAS POR SECTOR */}
      {activeTab === 'finance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2 shadow-xl">
              <span className="text-xs font-bold text-slate-400">Total Recaudado Membresías</span>
              <h4 className="text-2xl font-black text-emerald-400">{totalRevenue}€</h4>
              <p className="text-[11px] text-slate-400">Basado en {activeStudentsCount} alumnos activos</p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2 shadow-xl">
              <span className="text-xs font-bold text-slate-400">Profesores Activos</span>
              <h4 className="text-2xl font-black text-purple-400">{teacherProfiles.length}</h4>
              <p className="text-[11px] text-slate-400">{disciplines.length} programas impartidos</p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2 shadow-xl">
              <span className="text-xs font-bold text-slate-400">Sedes Registradas</span>
              <h4 className="text-2xl font-black text-amber-400">{schools.length}</h4>
              <p className="text-[11px] text-slate-400">Palma, Barcelona y sedes afiliadas</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Publish Weekly Social */}
      {showSocialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-white">Publicar Social de la Semana</h3>
              <p className="text-xs text-slate-400">Anuncia el evento oficial de baile social para tus alumnos.</p>
            </div>

            <form onSubmit={handleCreateSocialSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Título del Social:</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Social SBK Victorys & Rueda"
                  value={socialTitle}
                  onChange={(e) => setSocialTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Día de la Semana:</label>
                  <input
                    type="text"
                    required
                    placeholder="Viernes"
                    value={socialDay}
                    onChange={(e) => setSocialDay(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Horario:</label>
                  <input
                    type="text"
                    required
                    placeholder="22:00h - 02:30h"
                    value={socialTime}
                    onChange={(e) => setSocialTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Lugar / Ubicación:</label>
                <input
                  type="text"
                  required
                  placeholder="Sala Principal Victorys"
                  value={socialLocation}
                  onChange={(e) => setSocialLocation(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Descripción / Detalles:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detalles sobre DJs, descuento para alumnos, talleres previos..."
                  value={socialDesc}
                  onChange={(e) => setSocialDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSocialModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-glow-gold"
                >
                  Publicar Social
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
