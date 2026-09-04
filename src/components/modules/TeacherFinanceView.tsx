'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Users,
  TrendingUp,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Building2,
  PieChart,
} from 'lucide-react';

export const TeacherFinanceView: React.FC = () => {
  const { profiles, currentSchool, classes, updateSchoolConfig } = useApp();

  const [monthlyFeeInput, setMonthlyFeeInput] = useState<number>(currentSchool.membership_fee_monthly || 50);

  const students = profiles.filter((p) => p.role === 'student');
  const activeStudents = students.filter((s) => s.membership_status === 'active');
  const payingStudents = activeStudents.filter((s) => s.is_paying !== false);
  const scholarshipStudents = activeStudents.filter((s) => s.is_paying === false);
  const pendingStudents = students.filter((s) => s.membership_status === 'pending_approval');
  const inactiveStudents = students.filter((s) => s.membership_status === 'inactive');

  const monthlyFee = currentSchool.membership_fee_monthly || 50;
  const totalMonthlyRevenue = payingStudents.length * monthlyFee;
  const projectedAnnualRevenue = totalMonthlyRevenue * 12;

  const handleUpdateFee = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolConfig(currentSchool.id, { membership_fee_monthly: Number(monthlyFeeInput) });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold mb-2">
              <DollarSign className="w-4 h-4 text-emerald-400" /> Contabilidad & Finanzas {currentSchool.name}
            </div>
            <h2 className="text-2xl font-black text-white">Resumen Financiero & Control de Alumnado</h2>
            <p className="text-xs text-slate-400">
              Desglose contable automático basado en cuotas mensuales y alumnos pagadores activos.
            </p>
          </div>

          {/* Monthly Fee Quick Config Form */}
          <form onSubmit={handleUpdateFee} className="flex items-center gap-2 p-2 bg-slate-950 rounded-2xl border border-slate-800">
            <span className="text-xs font-bold text-slate-300 pl-2">Cuota Mensual:</span>
            <input
              type="number"
              value={monthlyFeeInput}
              onChange={(e) => setMonthlyFeeInput(Number(e.target.value))}
              className="w-20 px-2 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-xs text-center focus:outline-none focus:border-emerald-500"
            />
            <span className="text-xs font-bold text-slate-300">€</span>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs shadow-glow-emerald"
            >
              Guardar
            </button>
          </form>
        </div>
      </div>

      {/* Main KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Monthly Estimated Revenue */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-emerald-500/30 space-y-2 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Ingreso Mensual</span>
            <span className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </span>
          </div>
          <div className="text-3xl font-black text-white">{totalMonthlyRevenue} €</div>
          <p className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> {payingStudents.length} alumnos pagadores × {monthlyFee}€
          </p>
        </div>

        {/* Metric 2: Annual Projected Revenue */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-purple-500/30 space-y-2 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Proyección Anual</span>
            <span className="p-2 rounded-2xl bg-purple-500/10 text-purple-400">
              <PieChart className="w-5 h-5" />
            </span>
          </div>
          <div className="text-3xl font-black text-white">{projectedAnnualRevenue} €</div>
          <p className="text-[11px] font-bold text-slate-400">Estimado en 12 meses continuos</p>
        </div>

        {/* Metric 3: Active vs Scholarship Students */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-amber-500/30 space-y-2 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Alumnos Activos</span>
            <span className="p-2 rounded-2xl bg-amber-500/10 text-amber-400">
              <Users className="w-5 h-5" />
            </span>
          </div>
          <div className="text-3xl font-black text-white">{activeStudents.length}</div>
          <p className="text-[11px] font-bold text-amber-300">
            {payingStudents.length} Pagadores | {scholarshipStudents.length} Becados / Cortesía
          </p>
        </div>

        {/* Metric 4: Pending / Action Needed */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-rose-500/30 space-y-2 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Sin Activar / Pendientes</span>
            <span className="p-2 rounded-2xl bg-rose-500/10 text-rose-400">
              <AlertCircle className="w-5 h-5" />
            </span>
          </div>
          <div className="text-3xl font-black text-white">{pendingStudents.length + inactiveStudents.length}</div>
          <p className="text-[11px] font-bold text-rose-400">
            {pendingStudents.length} con Bizum por revisar | {inactiveStudents.length} de baja
          </p>
        </div>
      </div>

      {/* Financial Breakdown Table per Class */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" /> Desglose Financiero por Clase & Disciplina
            </h3>
            <p className="text-xs text-slate-400">
              Ingresos generados por cada grupo en base a los alumnos inscritos activos.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classes.map((cls) => {
            const registeredInClass = students.filter((s) => s.discipline_preference === cls.discipline);
            const activeInClass = registeredInClass.filter((s) => s.membership_status === 'active' && s.is_paying !== false);
            const estimatedClassRevenue = activeInClass.length * monthlyFee;

            return (
              <div key={cls.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-sm text-white">{cls.name}</h4>
                    <span className="text-xs text-purple-300 font-bold">{cls.discipline}</span>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-xs font-black">
                    {estimatedClassRevenue} € / mes
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-900">
                  <span>Alumnos Inscritos: <strong className="text-white">{registeredInClass.length}</strong></span>
                  <span>Pagadores Activos: <strong className="text-emerald-400">{activeInClass.length}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Student Roster Accounting Table */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-amber-400" /> Registro General de Estado de Cobros
            </h3>
            <p className="text-xs text-slate-400">Auditoría contable individualizada de cuotas mensuales de la sede.</p>
          </div>
        </div>

        <div className="space-y-2">
          {students.map((student) => (
            <div
              key={student.id}
              className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <img
                  src={student.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80'}
                  alt={student.full_name}
                  className="w-9 h-9 rounded-full object-cover border border-white/10"
                />
                <div>
                  <span className="font-bold text-xs text-white block">{student.full_name}</span>
                  <span className="text-[10px] text-slate-400">{student.email} • {student.discipline_preference}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    student.membership_status === 'active'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                      : student.membership_status === 'pending_approval'
                      ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                      : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {student.membership_status === 'active'
                    ? 'ALTA (Activo)'
                    : student.membership_status === 'pending_approval'
                    ? 'Bizum Pendiente'
                    : 'INACTIVO'}
                </span>

                <span
                  className={`text-xs font-extrabold ${
                    student.membership_status !== 'active'
                      ? 'text-slate-500'
                      : student.is_paying === false
                      ? 'text-indigo-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {student.membership_status !== 'active'
                    ? '0 €'
                    : student.is_paying === false
                    ? 'Beca (0€)'
                    : `${monthlyFee} €`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
