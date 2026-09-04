'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { LevelNode } from '@/types/database';
import { SmartVideoPlayer } from './SmartVideoPlayer';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Lock, Upload, Sparkles, Award, Video, X } from 'lucide-react';
import { InactiveUserBanner } from '@/components/modules/InactiveUserBanner';

export const LevelTreesView: React.FC = () => {
  const { levelTrees, disciplines, submissions, submitVideo, currentUser, currentSchool, addNotification } = useApp();
  const [selectedDisciplineId, setSelectedDisciplineId] = useState<string>(disciplines[0]?.id || 'disc-salsa-linea');
  const [selectedNode, setSelectedNode] = useState<LevelNode | null>(null);
  const [videoFileUrl, setVideoFileUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isInactive = currentUser.role === 'student' && currentUser.membership_status !== 'active';

  // Filter level trees by active selected discipline
  const filteredTrees = levelTrees.filter((lt) => lt.discipline_id === selectedDisciplineId);

  const handleVideoUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNode) return;
    if (isInactive) {
      addNotification('Cuenta Inactiva 🔒', 'Debes estar activo en la escuela para enviar vídeos al profesor.', 'info');
      return;
    }

    const finalUrl = videoFileUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
    setIsSubmitting(true);
    setTimeout(() => {
      submitVideo(selectedNode.id, finalUrl);
      setIsSubmitting(false);
      setSelectedNode(null);
      setVideoFileUrl('');
    }, 600);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Inactive User Banner */}
      <InactiveUserBanner />

      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900/50 via-slate-900 to-indigo-950/60 border border-purple-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold mb-2">
              <Award className="w-4 h-4" /> Progresión Técnica & Temario del Curso
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Árboles de Nivel & Evaluación</h2>
            <p className="text-sm text-slate-300 max-w-xl mt-1">
              Selecciona tu disciplina para ver el temario gradual, marcar pasos aprendidos y subir vídeos de 15s para revisión técnica del profesor.
            </p>
          </div>
        </div>
      </div>

      {/* Course / Discipline Filter Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {disciplines.map((disc) => {
          const count = levelTrees.filter((lt) => lt.discipline_id === disc.id).length;
          const isSelected = selectedDisciplineId === disc.id;
          return (
            <button
              key={disc.id}
              onClick={() => setSelectedDisciplineId(disc.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
                isSelected
                  ? 'bg-purple-600 border-purple-400 text-white shadow-glow-violet'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>{disc.name}</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-950/60 text-[10px] font-mono text-purple-200">
                {count} {count === 1 ? 'Nivel' : 'Niveles'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Level Trees List */}
      {filteredTrees.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-3xl space-y-2">
          <p className="text-slate-400 text-sm font-semibold">No hay niveles creados aún para este programa.</p>
        </div>
      ) : (
        filteredTrees.map((tree) => {
          const customLevelName =
            currentSchool.level_names && currentSchool.level_names[tree.level_order - 1]
              ? currentSchool.level_names[tree.level_order - 1]
              : tree.level_name;

          const allTreeNodes = tree.sections && tree.sections.length > 0
            ? tree.sections.flatMap((s) => s.items)
            : tree.nodes;

          const completedCount = allTreeNodes.filter((n) => n.completed).length;

          return (
            <div key={tree.id} className="bg-slate-900/70 backdrop-blur-md border border-slate-800 rounded-3xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-xs font-bold uppercase text-purple-400 tracking-wider">Nivel {tree.level_order}</span>
                  <h3 className="text-lg font-extrabold text-white">{customLevelName}</h3>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-300 font-semibold">
                  {completedCount} / {allTreeNodes.length} Completados
                </span>
              </div>

              {/* Render by Sections if available */}
              {tree.sections && tree.sections.length > 0 ? (
                <div className="space-y-6">
                  {tree.sections.map((section) => (
                    <div key={section.id} className="space-y-3">
                      <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
                        <span>📂 Apartado:</span>
                        <span className="text-white">{section.title}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {section.items.map((node, index) => {
                          const isNodeUnlocked = index === 0 || Boolean(section.items[index - 1]?.completed);
                          const nodeSubmissions = submissions.filter((s) => s.node_id === node.id && s.student_id === currentUser.id);
                          const latestSub = nodeSubmissions[nodeSubmissions.length - 1];

                          return (
                            <motion.div
                              key={node.id}
                              whileHover={{ scale: isNodeUnlocked ? 1.02 : 1 }}
                              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                                node.completed
                                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-100 shadow-glow-emerald/30'
                                  : isNodeUnlocked
                                  ? 'bg-slate-800/80 border-purple-500/40 text-slate-100 shadow-glow-violet/20 hover:border-purple-400'
                                  : 'bg-slate-900/40 border-slate-800/60 text-slate-500 opacity-65 cursor-not-allowed'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  <span className="w-7 h-7 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-300">
                                    #{index + 1}
                                  </span>
                                  <h4 className="font-bold text-sm leading-tight text-white">{node.title}</h4>
                                </div>

                                <div>
                                  {node.completed ? (
                                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                                  ) : isNodeUnlocked ? (
                                    <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                                  ) : (
                                    <Lock className="w-5 h-5 text-slate-600" />
                                  )}
                                </div>
                              </div>

                              <p className="text-xs text-slate-300 line-clamp-2">{node.description}</p>

                              {/* Teacher Correction Preview Snippet */}
                              {latestSub && (
                                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                                  <div className="flex items-center justify-between text-[10px] font-bold">
                                    <span className="text-purple-300 flex items-center gap-1">
                                      📹 Tu Vídeo Enviado
                                    </span>
                                    <span
                                      className={`px-2 py-0.5 rounded-full border ${
                                        latestSub.status === 'approved'
                                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                          : latestSub.status === 'rejected'
                                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                      }`}
                                    >
                                      {latestSub.status === 'approved'
                                        ? `✅ Aprobado (${latestSub.grade || 100} pts)`
                                        : latestSub.status === 'rejected'
                                        ? '❌ Corrección Necesaria'
                                        : '⏳ Pendiente de Evaluación'}
                                    </span>
                                  </div>
                                  {latestSub.feedback && (
                                    <p className="text-[11px] text-slate-300 italic line-clamp-2">
                                      💬 Nota del Profesor: "{latestSub.feedback}"
                                    </p>
                                  )}
                                </div>
                              )}

                              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                                  <Award className="w-3.5 h-3.5" /> +{node.required_xp} XP
                                </span>

                                {isNodeUnlocked && (
                                  <button
                                    disabled={isInactive}
                                    onClick={() => {
                                      if (isInactive) {
                                        addNotification('Membresía Inactiva 🔒', 'Para enviar vídeos de corrección debes solicitar la activación de tu cuota.', 'info');
                                        return;
                                      }
                                      setSelectedNode(node);
                                    }}
                                    className={`px-3 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md ${
                                      isInactive
                                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                                        : 'bg-purple-600 hover:bg-purple-500 text-white shadow-glow-violet'
                                    }`}
                                  >
                                    {isInactive ? (
                                      <>
                                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                                        <span>Inactivo (Solo Lectura)</span>
                                      </>
                                    ) : (
                                      <>
                                        <Video className="w-3.5 h-3.5" />
                                        <span>{node.completed || latestSub ? 'Ver / Re-evaluar Clip' : 'Subir Vídeo'}</span>
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Fallback direct nodes pathway */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tree.nodes.map((node, index) => {
                    const nodeSubmissions = submissions.filter((s) => s.node_id === node.id && s.student_id === currentUser.id);
                    const latestSub = nodeSubmissions[nodeSubmissions.length - 1];

                    return (
                      <motion.div
                        key={node.id}
                        whileHover={{ scale: node.unlocked ? 1.02 : 1 }}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                          node.completed
                            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-100 shadow-glow-emerald/30'
                            : node.unlocked
                            ? 'bg-slate-800/80 border-purple-500/40 text-slate-100 shadow-glow-violet/20 hover:border-purple-400'
                            : 'bg-slate-900/40 border-slate-800/60 text-slate-500 opacity-65 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-300">
                              #{index + 1}
                            </span>
                            <h4 className="font-bold text-sm leading-tight text-white">{node.title}</h4>
                          </div>

                          <div>
                            {node.completed ? (
                              <CheckCircle className="w-5 h-5 text-emerald-400" />
                            ) : node.unlocked ? (
                              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                            ) : (
                              <Lock className="w-5 h-5 text-slate-600" />
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 line-clamp-2">{node.description}</p>

                        {/* Teacher Correction Preview Snippet */}
                        {latestSub && (
                          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-bold">
                              <span className="text-purple-300 flex items-center gap-1">
                                📹 Tu Vídeo Enviado
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full border ${
                                  latestSub.status === 'approved'
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                    : latestSub.status === 'rejected'
                                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                }`}
                              >
                                {latestSub.status === 'approved'
                                  ? `✅ Aprobado (${latestSub.grade || 100} pts)`
                                  : latestSub.status === 'rejected'
                                  ? '❌ Corrección Necesaria'
                                  : '⏳ Pendiente de Evaluación'}
                              </span>
                            </div>
                            {latestSub.feedback && (
                              <p className="text-[11px] text-slate-300 italic line-clamp-2">
                                💬 Nota del Profesor: "{latestSub.feedback}"
                              </p>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                          <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                            <Award className="w-3.5 h-3.5" /> +{node.required_xp} XP
                          </span>

                          {node.unlocked && (
                            <button
                              disabled={isInactive}
                              onClick={() => {
                                if (isInactive) {
                                  addNotification('Membresía Inactiva 🔒', 'Para enviar vídeos de corrección debes solicitar la activación de tu cuota.', 'info');
                                  return;
                                }
                                setSelectedNode(node);
                              }}
                              className={`px-3 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md ${
                                isInactive
                                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                                  : 'bg-purple-600 hover:bg-purple-500 text-white shadow-glow-violet'
                              }`}
                            >
                              {isInactive ? (
                                <>
                                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                                  <span>Inactivo (Solo Lectura)</span>
                                </>
                              ) : (
                                <>
                                  <Video className="w-3.5 h-3.5" />
                                  <span>{node.completed || latestSub ? 'Ver / Re-evaluar Clip' : 'Subir Vídeo'}</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Modal Subir Clip de Vídeo */}
      <AnimatePresence>
        {selectedNode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-4"
            >
              <button
                onClick={() => setSelectedNode(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                <Video className="w-5 h-5" />
                <span>Envío de Vídeo de 15s</span>
              </div>

              <div>
                <h3 className="text-lg font-black text-white">{selectedNode.title}</h3>
                <p className="text-xs text-slate-300 mt-1">{selectedNode.description}</p>
              </div>

              <form onSubmit={handleVideoUpload} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">
                    Selecciona un Clip o Graba desde Cámara Nativa (PWA):
                  </label>
                  <div className="border-2 border-dashed border-slate-700 rounded-2xl p-4 text-center hover:border-purple-500 transition-colors bg-slate-950/40">
                    <Upload className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                    <p className="text-xs font-semibold text-slate-300">Haz clic para cargar tu vídeo (15s máx)</p>
                    <input
                      type="file"
                      accept="video/*"
                      capture="environment"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setVideoFileUrl(URL.createObjectURL(e.target.files[0]));
                        }
                      }}
                      className="hidden"
                      id="video-input"
                    />
                    <label
                      htmlFor="video-input"
                      className="mt-2 inline-block px-4 py-1.5 bg-purple-600/30 border border-purple-500/50 hover:bg-purple-600 text-purple-200 text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Abrir Cámara / Archivos
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 block">
                    o pega un Enlace Externo (YouTube / Google Drive / MP4):
                  </label>
                  <input
                    type="url"
                    placeholder="https://youtu.be/... o Google Drive link"
                    value={videoFileUrl}
                    onChange={(e) => setVideoFileUrl(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono outline-none focus:border-purple-500"
                  />
                </div>

                {videoFileUrl && (
                  <div className="rounded-xl overflow-hidden bg-black max-h-44 border border-slate-800">
                    <SmartVideoPlayer url={videoFileUrl} className="w-full h-full" />
                  </div>
                )}

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedNode(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-glow-violet transition-all flex items-center gap-2"
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar al Inbox del Profesor'}
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
