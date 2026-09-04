'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Search,
  Sparkles,
  Music,
  Users,
  Trophy,
  ChevronRight,
  X,
  UserPlus,
  Flame,
  Award,
  Layers,
  Clock,
  Lock,
} from 'lucide-react';
import { Discipline, LevelTree, Profile } from '@/types/database';
import { AuthModal } from '@/components/modules/AuthModal';

export const PublicCoursesView: React.FC = () => {
  const { disciplines, levelTrees, profiles, currentUser, currentSchool } = useApp();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<Discipline | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [detailTab, setDetailTab] = useState<'syllabus' | 'ranking'>('syllabus');

  const filteredDisciplines = disciplines.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.style_tag && d.style_tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get syllabus trees for selected discipline
  const activeTrees = selectedDiscipline
    ? levelTrees.filter((lt) => lt.discipline_id === selectedDiscipline.id)
    : [];

  // Filter students enrolled or active in this discipline for ranking
  const activeStudents = profiles.filter((p) => p.role === 'student' && p.membership_status === 'active');

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950/70 border border-blue-500/30 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-bold">
            <BookOpen className="w-4 h-4" /> Catálogo de Cursos & Temarios Pedagógicos
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white">
            Explora Cursos & Ritmos
          </h2>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl">
            Descubre las disciplinas impartidas por nuestros profesores certificados. Revisa los temarios graduales, niveles de aprendizaje y rankings públicos.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
        <input
          type="text"
          placeholder="Buscar por curso o ritmo (ej. Salsa, Bachata, Kizomba)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/60 shadow-lg"
        />
      </div>

      {/* Disciplines Grid */}
      {filteredDisciplines.length === 0 ? (
        <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 flex items-center justify-center mx-auto text-slate-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">No hay cursos coincidentes</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Aún no se han añadido cursos con esa búsqueda. Los profesores están agregando nuevos ritmos a la escuela.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDisciplines.map((discipline) => {
            const trees = levelTrees.filter((lt) => lt.discipline_id === discipline.id);
            const totalLevels = trees.length;

            return (
              <motion.div
                key={discipline.id}
                whileHover={{ y: -4 }}
                onClick={() => setSelectedDiscipline(discipline)}
                className="bg-slate-900 border border-slate-800 hover:border-blue-500/40 rounded-3xl p-5 shadow-xl transition-all cursor-pointer flex flex-col justify-between space-y-4 group relative overflow-hidden"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[11px] font-bold">
                      {discipline.style_tag || 'Ritmo Social'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-indigo-400" /> {totalLevels} {totalLevels === 1 ? 'Nivel' : 'Niveles'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-white group-hover:text-blue-300 transition-colors">
                      {discipline.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                      {discipline.description || 'Programa oficial con temarios graduales de aprendizaje.'}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium text-[11px]">
                    BPM: <strong className="text-slate-200">{discipline.recommended_bpm || 'Estándar'}</strong>
                  </span>
                  <div className="inline-flex items-center gap-1 text-blue-400 font-bold text-xs group-hover:translate-x-1 transition-transform">
                    Ver Temario <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Course Detail Modal */}
      <AnimatePresence>
        {selectedDiscipline && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setSelectedDiscipline(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-950 border border-slate-800"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold">
                  {selectedDiscipline.style_tag || 'Disciplina de Baile'}
                </div>
                <h3 className="text-2xl font-black text-white">{selectedDiscipline.name}</h3>
                <p className="text-xs text-slate-300">{selectedDiscipline.description}</p>
              </div>

              {/* Tabs: Temario vs Ranking */}
              <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
                <button
                  onClick={() => setDetailTab('syllabus')}
                  className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                    detailTab === 'syllabus'
                      ? 'bg-blue-600 text-white shadow-glow-violet'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-4 h-4" /> Temario Gradual ({activeTrees.length} Niveles)
                </button>
                <button
                  onClick={() => setDetailTab('ranking')}
                  className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                    detailTab === 'ranking'
                      ? 'bg-blue-600 text-white shadow-glow-violet'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Trophy className="w-4 h-4" /> Ranking del Curso
                </button>
              </div>

              {/* Tab 1: Syllabus */}
              {detailTab === 'syllabus' && (
                <div className="space-y-4">
                  {activeTrees.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
                      <p className="text-xs text-slate-400">
                        El temario oficial de esta disciplina se encuentra en fase de carga por los profesores.
                      </p>
                    </div>
                  ) : (
                    activeTrees.map((tree) => (
                      <div
                        key={tree.id}
                        className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                          <span className="text-sm font-extrabold text-blue-400">
                            Nivel {tree.level_order}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">
                            {tree.nodes ? tree.nodes.length : 0} Figuras / Conceptos
                          </span>
                        </div>

                        {tree.sections && tree.sections.length > 0 ? (
                          <div className="space-y-2">
                            {tree.sections.map((section) => (
                              <div key={section.id} className="space-y-1">
                                <h5 className="text-xs font-bold text-slate-300">{section.title}</h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2">
                                  {section.items.map((node) => (
                                    <div
                                      key={node.id}
                                      className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between"
                                    >
                                      <span className="text-slate-200 font-medium truncate">{node.title}</span>
                                      <span className="text-[10px] text-indigo-400 font-bold ml-2">+{node.required_xp} XP</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : tree.nodes && tree.nodes.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {tree.nodes.map((node) => (
                              <div
                                key={node.id}
                                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between"
                              >
                                <span className="text-slate-200 font-medium truncate">{node.title}</span>
                                <span className="text-[10px] text-indigo-400 font-bold">+{node.required_xp} XP</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-500 italic">Próximamente clases y figuras en este nivel.</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 2: Ranking */}
              {detailTab === 'ranking' && (
                <div className="space-y-3">
                  {!currentSchool.is_rankings_public ? (
                    <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs text-center space-y-2">
                      <Lock className="w-6 h-6 mx-auto text-amber-400" />
                      <p className="font-bold">Ranking Privado</p>
                      <p className="text-[11px] text-amber-200/80">
                        El profesor o la academia tienen la tabla de clasificación configurada en modo privado para los alumnos inscritos.
                      </p>
                    </div>
                  ) : activeStudents.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
                      Aún no hay alumnos puntuados públicamente en este curso.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {activeStudents.map((student, idx) => (
                        <div
                          key={student.id}
                          className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 text-center text-xs font-black text-slate-400">
                              #{idx + 1}
                            </span>
                            <img
                              src={student.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                              alt={student.full_name}
                              className="w-8 h-8 rounded-full object-cover border border-slate-700"
                            />
                            <div>
                              <p className="text-xs font-bold text-white">{student.full_name}</p>
                              <span className="text-[10px] text-slate-400">{student.discipline_preference || selectedDiscipline.name}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-black text-indigo-400 block">{student.xp || 0} XP</span>
                            <span className="text-[10px] text-emerald-400 font-bold">{student.rhythm_points || 0} Pts</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    setSelectedDiscipline(null);
                    setIsAuthModalOpen(true);
                  }}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-glow-violet transition-all flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" /> Registrarme para Entrar a este Curso
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};
