'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Profile, MembershipStatus } from '@/types/database';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  XCircle,
  Search,
  Eye,
  CheckSquare,
  Square,
  DollarSign,
  AlertTriangle,
  Gift,
  Coins,
  CalendarDays,
} from 'lucide-react';

export const TeacherManagementView: React.FC = () => {
  const {
    profiles,
    disciplines,
    updateStudentStatus,
    bulkUpdateStudentStatus,
    updateStudentPayingStatus,
    approveCourseEnrollment,
    rejectCourseEnrollment,
    currentSchool,
    updateSchoolConfig,
    questSubmissions,
    approveQuestSubmission,
    rejectQuestSubmission,
  } = useApp();

  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'pending' | 'overdue'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedReceiptStudent, setSelectedReceiptStudent] = useState<Profile | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [monthlyFeeInput, setMonthlyFeeInput] = useState<number>(currentSchool.membership_fee_monthly || 50);

  const students = profiles.filter((p) => p.role === 'student');

  // Helper to check 30 days renewal alert
  const isOverdue = (student: Profile): boolean => {
    if (student.membership_status !== 'active') return false;
    if (!student.membership_start_date) return true;
    const days = Math.floor((Date.now() - new Date(student.membership_start_date).getTime()) / (1000 * 60 * 60 * 24));
    return days >= 30;
  };

  const filteredStudents = students.filter((s) => {
    const matchesFilter =
      filter === 'all'
        ? true
        : filter === 'active'
        ? s.membership_status === 'active'
        : filter === 'inactive'
        ? s.membership_status === 'inactive'
        : filter === 'pending'
        ? s.membership_status === 'pending_approval'
        : isOverdue(s);

    const matchesSearch =
      s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const pendingCount = students.filter((s) => s.membership_status === 'pending_approval').length;
  const activeStudents = students.filter((s) => s.membership_status === 'active');
  const payingActiveCount = activeStudents.filter((s) => s.is_paying !== false).length;
  const nonPayingActiveCount = activeStudents.filter((s) => s.is_paying === false).length;
  const overdueCount = students.filter((s) => isOverdue(s)).length;

  const estimatedMonthlyRevenue = payingActiveCount * (currentSchool.membership_fee_monthly || 50);

  // Bulk Selection Handlers
  const handleSelectAll = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map((s) => s.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter((item) => item !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  const handleBulkActivate = () => {
    if (selectedStudentIds.length === 0) return;
    bulkUpdateStudentStatus(selectedStudentIds, 'active');
    setSelectedStudentIds([]);
  };

  const handleBulkDeactivate = () => {
    if (selectedStudentIds.length === 0) return;
    bulkUpdateStudentStatus(selectedStudentIds, 'inactive');
    setSelectedStudentIds([]);
  };

  const handleUpdateMonthlyFee = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolConfig(currentSchool.id, { membership_fee_monthly: monthlyFeeInput });
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Financial & Membership Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-emerald-950/40 border border-purple-500/30 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold mb-2">
              <Users className="w-4 h-4" /> Control Avanzado de Alumnos & Finanzas
            </div>
            <h2 className="text-2xl font-black text-white">Gestión de Membresías e Ingresos</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-lg">
              Revisa altas/bajas, marca alumnos en cuota o beca, controla alertas mensuales y consulta la proyección de ingresos.
            </p>
          </div>

          {/* Monthly Revenue Counter Widget */}
          <div className="bg-slate-950/90 border border-emerald-500/40 p-4 rounded-2xl flex items-center gap-4 text-xs">
            <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Ingreso Mensual Estimado</span>
              <span className="text-2xl font-black text-emerald-400">{estimatedMonthlyRevenue} €/mes</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {payingActiveCount} Pagadores ({nonPayingActiveCount} Beca/Cortesía)
              </span>
            </div>
          </div>
        </div>

        {/* Edit Monthly Fee Bar */}
        <form onSubmit={handleUpdateMonthlyFee} className="flex items-center gap-3 pt-3 border-t border-slate-800 text-xs">
          <span className="font-bold text-slate-300">Precio Cuota Mensual:</span>
          <input
            type="number"
            min={0}
            step={5}
            value={monthlyFeeInput}
            onChange={(e) => setMonthlyFeeInput(Number(e.target.value))}
            className="w-24 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-bold text-xs outline-none focus:border-purple-500"
          />
          <button type="submit" className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs">
            Actualizar Cuota
          </button>
        </form>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-3xl">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {[
            { id: 'all', label: `Todos (${students.length})` },
            { id: 'active', label: `Activos (${activeStudents.length})` },
            { id: 'pending', label: `Solicitudes Alta (${pendingCount})` },
            { id: 'overdue', label: `Revisión +30d (${overdueCount})` },
            { id: 'inactive', label: `Inactivos (${students.filter((s) => s.membership_status === 'inactive').length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === tab.id
                  ? 'bg-purple-600 text-white shadow-glow-violet'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Bulk Action Controls */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800"
          >
            {selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0 ? (
              <>
                <CheckSquare className="w-4 h-4 text-purple-400" /> Desseleccionar Todos
              </>
            ) : (
              <>
                <Square className="w-4 h-4 text-slate-500" /> Seleccionar Todos
              </>
            )}
          </button>
          <span className="text-xs text-purple-300 font-extrabold">
            {selectedStudentIds.length} Seleccionados
          </span>
        </div>

        {selectedStudentIds.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkActivate}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs shadow-glow-emerald flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" /> Dar de Alta Masiva ({selectedStudentIds.length})
            </button>

            <button
              onClick={handleBulkDeactivate}
              className="px-4 py-2 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 hover:bg-rose-900/60 font-bold text-xs flex items-center gap-1.5"
            >
              <UserX className="w-4 h-4" /> Dar de Baja Masiva ({selectedStudentIds.length})
            </button>
          </div>
        )}
      </div>

      {/* Student Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredStudents.map((student) => {
          const isStudentOverdue = isOverdue(student);
          const isSelected = selectedStudentIds.includes(student.id);

          return (
            <div
              key={student.id}
              className={`p-5 rounded-3xl border transition-all space-y-4 flex flex-col justify-between relative ${
                isSelected ? 'ring-2 ring-purple-500 bg-purple-950/20' : ''
              } ${
                student.membership_status === 'active'
                  ? 'bg-slate-900/80 border-emerald-500/30'
                  : student.membership_status === 'pending_approval'
                  ? 'bg-amber-950/20 border-amber-500/40 shadow-glow-gold/20'
                  : 'bg-slate-950/60 border-slate-800 opacity-80'
              }`}
            >
              {/* Overdue Banner Warning */}
              {isStudentOverdue && (
                <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>⚠️ Membresía cumplió 30 días. Revisar continuidad mensual.</span>
                </div>
              )}

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Select Checkbox */}
                  <button onClick={() => handleToggleSelect(student.id)} className="p-1">
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-purple-400" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                    )}
                  </button>

                  <img
                    src={student.avatar_url}
                    alt={student.full_name}
                    className="w-12 h-12 rounded-2xl object-cover border border-white/20"
                  />
                  <div>
                    <h3 className="font-extrabold text-base text-white">{student.full_name}</h3>
                    <span className="text-xs text-purple-400 font-semibold">{student.discipline_preference || 'Salsa en Línea'}</span>
                  </div>
                </div>

                {/* Status Badge */}
                <span
                  className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${
                    student.membership_status === 'active'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : student.membership_status === 'pending_approval'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  }`}
                >
                  {student.membership_status === 'active'
                    ? 'ACTIVO'
                    : student.membership_status === 'pending_approval'
                    ? 'PENDIENTE ALTA'
                    : 'INACTIVO'}
                </span>
              </div>

              {/* Paying Status Toggle & Contact */}
              <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-1.5">
                    {student.is_paying !== false ? (
                      <Coins className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Gift className="w-4 h-4 text-purple-400" />
                    )}
                    <span className="font-extrabold text-white text-[11px]">
                      {student.is_paying !== false ? `Pagador (${currentSchool.membership_fee_monthly || 50}€)` : 'Beca / Cortesía (0€)'}
                    </span>
                  </div>

                  <button
                    onClick={() => updateStudentPayingStatus(student.id, student.is_paying === false ? true : false)}
                    className={`px-3 py-1 rounded-xl text-[10px] font-black border transition-all ${
                      student.is_paying !== false
                        ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                        : 'bg-purple-950/50 border-purple-500/40 text-purple-300'
                    }`}
                  >
                    {student.is_paying !== false ? 'Cambiar a Beca' : 'Marcar Pagador'}
                  </button>
                </div>

                <div className="space-y-1 text-slate-300">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>{student.email}</span>
                  </div>
                  {student.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{student.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bizum / Payment Note Preview */}
              {student.payment_note && (
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between text-amber-300 font-bold">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" /> Comprobante de Pago Bizum
                    </span>
                    {student.payment_receipt_url && (
                      <button
                        onClick={() => setSelectedReceiptStudent(student)}
                        className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-1 underline"
                      >
                        <Eye className="w-3 h-3" /> Ver Imagen
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300 italic">"{student.payment_note}"</p>
                </div>
              )}

              {/* Action Buttons: Give High (Dar de Alta) or Give Low (Dar de Baja) */}
              <div className="flex items-center justify-end gap-2 pt-2">
                {student.membership_status !== 'active' ? (
                  <button
                    onClick={() => updateStudentStatus(student.id, 'active')}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs shadow-glow-emerald transition-all flex items-center justify-center gap-1.5"
                  >
                    <UserCheck className="w-4 h-4" /> Dar de Alta (Activar Membresía)
                  </button>
                ) : (
                  <button
                    onClick={() => updateStudentStatus(student.id, 'inactive')}
                    className="w-full py-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 hover:bg-rose-900/60 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <UserX className="w-4 h-4" /> Dar de Baja (Inactivar)
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pending Course Enrollment Requests Section */}
      {(() => {
        const pendingCourseEnrollments = students.flatMap((student) => {
          if (!student.enrolled_disciplines_status) return [];
          return Object.entries(student.enrolled_disciplines_status)
            .filter(([_, status]) => status === 'pending_approval')
            .map(([discId]) => ({
              student,
              discipline: disciplines.find((d) => d.id === discId),
              receiptUrl: student.enrolled_receipt_urls?.[discId],
            }));
        }).filter((item) => item.discipline !== undefined);

        if (pendingCourseEnrollments.length === 0) return null;

        return (
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400 animate-pulse" /> Solicitudes de Inscripción a Cursos ({pendingCourseEnrollments.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Alumnos que han solicitado inscribirse en programas específicos adjuntando su comprobante de pago.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingCourseEnrollments.map(({ student, discipline, receiptUrl }) => (
                <div key={`${student.id}-${discipline?.id}`} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-3">
                    <img src={student.avatar_url} alt={student.full_name} className="w-10 h-10 rounded-xl object-cover border border-purple-500/40" />
                    <div>
                      <h4 className="font-extrabold text-sm text-white">{student.full_name}</h4>
                      <p className="text-xs text-amber-300 font-bold">Curso: {discipline?.name}</p>
                    </div>
                  </div>

                  {receiptUrl && (
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between">
                      <span className="text-slate-400 font-mono truncate max-w-[200px]">🧾 Comprobante: {receiptUrl}</span>
                      <a
                        href={receiptUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-400 font-bold hover:underline"
                      >
                        Abrir
                      </a>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => rejectCourseEnrollment(student.id, discipline!.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-400 border border-rose-500/30 text-xs font-bold"
                    >
                      Rechazar
                    </button>
                    <button
                      onClick={() => approveCourseEnrollment(student.id, discipline!.id)}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs shadow-glow-emerald"
                    >
                      Aprobar Matrícula
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Pending Quest Point Submissions Section */}
      {questSubmissions.filter((qs) => qs.status === 'pending').length > 0 && (
        <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-400" /> Solicitudes Pendientes de Puntos por Desafíos ({questSubmissions.filter((qs) => qs.status === 'pending').length})
              </h3>
              <p className="text-xs text-slate-400">
                Los alumnos solicitan acreditación de misiones sociales. Revisa y aprueba para sumar los Puntos de Ritmo.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questSubmissions
              .filter((qs) => qs.status === 'pending')
              .map((sub) => (
                <div key={sub.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-white">{sub.student_name}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/30 text-xs font-bold">
                      +{sub.reward_points} Pts
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">
                    Desafío: <strong className="text-amber-300">{sub.quest_title}</strong>
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => rejectQuestSubmission(sub.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-400 border border-rose-500/30 text-xs font-bold"
                    >
                      Rechazar
                    </button>
                    <button
                      onClick={() => approveQuestSubmission(sub.id)}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs shadow-glow-emerald"
                    >
                      Aprobar +{sub.reward_points} Pts
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Receipt Image Viewer Modal */}
      <AnimatePresence>
        {selectedReceiptStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-center relative"
            >
              <h3 className="text-lg font-black text-white">Comprobante de {selectedReceiptStudent.full_name}</h3>
              <p className="text-xs text-slate-400">"{selectedReceiptStudent.payment_note}"</p>

              <div className="rounded-2xl overflow-hidden border border-slate-800 max-h-80">
                <img
                  src={selectedReceiptStudent.payment_receipt_url}
                  alt="Recibo Bizum"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setSelectedReceiptStudent(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    updateStudentStatus(selectedReceiptStudent.id, 'active');
                    setSelectedReceiptStudent(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-slate-950 font-black text-xs shadow-glow-emerald"
                >
                  Dar de Alta Ahora
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
