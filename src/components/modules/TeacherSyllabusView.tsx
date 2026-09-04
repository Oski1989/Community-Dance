import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { LevelNode, SyllabusSection, LevelTree } from '@/types/database';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  FolderPlus,
  Sparkles,
  Layers,
  Award,
  Video,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  FileCode,
  ShieldCheck,
  Send,
  Clock,
  UserCheck,
} from 'lucide-react';

export const TeacherSyllabusView: React.FC = () => {
  const {
    disciplines,
    levelTrees,
    createDiscipline,
    updateDiscipline,
    deleteDiscipline,
    requestProgramCollaboration,
    acceptProgramCollaboration,
    rejectProgramCollaboration,
    toggleLinkSchoolToProgram,
    createLevelTree,
    updateLevelTree,
    deleteLevelTree,
    addSyllabusSection,
    updateSyllabusSection,
    deleteSyllabusSection,
    addSyllabusItem,
    updateSyllabusItem,
    deleteSyllabusItem,
    applyPresetSyllabusTemplate,
    currentUser,
    schools,
    profiles,
    reorderSyllabusSection,
    reorderSyllabusItem,
  } = useApp();

  // Pending collaboration invitations for current teacher
  const pendingInvitations = disciplines.filter((d) =>
    (d.pending_shared_teacher_ids || []).includes(currentUser.id)
  );

  // Filter disciplines created by or ACCEPTED shared with current teacher
  const teacherDisciplines = currentUser.role === 'admin'
    ? disciplines
    : disciplines.filter(
        (d) =>
          d.creator_teacher_id === currentUser.id ||
          ((d.shared_teacher_ids || []).includes(currentUser.id))
      );

  const [selectedDisciplineId, setSelectedDisciplineId] = useState<string>(
    teacherDisciplines[0]?.id || disciplines[0]?.id || 'disc-salsa-linea'
  );
  
  // State for creating a new Discipline / Program
  const [showAddDisciplineModal, setShowAddDisciplineModal] = useState<boolean>(false);
  const [newProgramName, setNewProgramName] = useState<string>('');
  const [newProgramStyle, setNewProgramStyle] = useState<string>('');
  const [newProgramDesc, setNewProgramDesc] = useState<string>('');
  const [newProgramAudience, setNewProgramAudience] = useState<string>('');
  const [newProgramBPM, setNewProgramBPM] = useState<string>('');

  // State for editing Program Metadata
  const [isEditingProgramInfo, setIsEditingProgramInfo] = useState<boolean>(false);

  // State for adding new Level
  const [showAddLevelModal, setShowAddLevelModal] = useState<boolean>(false);
  const [newLevelName, setNewLevelName] = useState<string>('');

  // State for editing Level name
  const [editingLevelId, setEditingLevelId] = useState<string | null>(null);
  const [editedLevelName, setEditedLevelName] = useState<string>('');

  // State for adding new Section (Apartado)
  const [addingSectionForTreeId, setAddingSectionForTreeId] = useState<string | null>(null);
  const [newSectionTitle, setNewSectionTitle] = useState<string>('');

  // State for editing Section title
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editedSectionTitle, setEditedSectionTitle] = useState<string>('');

  // State for adding / editing Item (Paso / Tema)
  const [itemModalState, setItemModalState] = useState<{
    isOpen: boolean;
    treeId: string;
    sectionId: string;
    itemToEdit?: LevelNode | null;
  }>({ isOpen: false, treeId: '', sectionId: '', itemToEdit: null });

  const [itemTitle, setItemTitle] = useState<string>('');
  const [itemDescription, setItemDescription] = useState<string>('');
  const [itemXP, setItemXP] = useState<number>(50);
  const [itemVideoSample, setItemVideoSample] = useState<string>('');

  // Active Selected Discipline Object
  const currentDiscipline =
    teacherDisciplines.find((d) => d.id === selectedDisciplineId) ||
    teacherDisciplines[0] ||
    disciplines[0];

  const otherTeacherProfiles = profiles.filter(
    (p) => p.role === 'teacher' && p.id !== currentUser.id
  );

  // Editable discipline metadata state
  const [editStyleTag, setEditStyleTag] = useState<string>(currentDiscipline?.style_tag || '');
  const [editDesc, setEditDesc] = useState<string>(currentDiscipline?.description || '');
  const [editAudience, setEditAudience] = useState<string>(currentDiscipline?.target_audience || '');
  const [editBPM, setEditBPM] = useState<string>(currentDiscipline?.recommended_bpm || '');
  const [editIsShared, setEditIsShared] = useState<boolean>(currentDiscipline?.is_shared || false);
  const [editSharedTeacherIds, setEditSharedTeacherIds] = useState<string[]>(currentDiscipline?.shared_teacher_ids || []);
  const [editLinkedSchoolIds, setEditLinkedSchoolIds] = useState<string[]>(currentDiscipline?.linked_school_ids || [schools[0]?.id || 'school-1']);

  // Filter level trees by selected discipline
  const activeTrees = levelTrees.filter((lt) => lt.discipline_id === selectedDisciplineId);

  // Sync edit states when discipline selection changes
  React.useEffect(() => {
    if (currentDiscipline) {
      setEditStyleTag(currentDiscipline.style_tag || '');
      setEditDesc(currentDiscipline.description || '');
      setEditAudience(currentDiscipline.target_audience || '');
      setEditBPM(currentDiscipline.recommended_bpm || '');
      setEditIsShared(currentDiscipline.is_shared || false);
      setEditSharedTeacherIds(currentDiscipline.shared_teacher_ids || []);
      setEditLinkedSchoolIds(currentDiscipline.linked_school_ids || [schools[0]?.id || 'school-1']);
    }
  }, [selectedDisciplineId, currentDiscipline, schools]);

  const handleSaveProgramInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDiscipline) return;
    updateDiscipline(currentDiscipline.id, {
      style_tag: editStyleTag,
      description: editDesc,
      target_audience: editAudience,
      recommended_bpm: editBPM,
      is_shared: editIsShared,
      shared_teacher_ids: editSharedTeacherIds,
      linked_school_ids: editLinkedSchoolIds,
    });
    setIsEditingProgramInfo(false);
  };

  const handleCreateNewDisciplineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgramName.trim()) return;
    createDiscipline(
      newProgramName.trim(),
      newProgramStyle.trim(),
      newProgramDesc.trim(),
      newProgramAudience.trim(),
      newProgramBPM.trim()
    );
    setShowAddDisciplineModal(false);
    setNewProgramName('');
    setNewProgramStyle('');
    setNewProgramDesc('');
    setNewProgramAudience('');
    setNewProgramBPM('');
  };

  // Handle open item modal
  const openItemModal = (treeId: string, sectionId: string, item?: LevelNode) => {
    setItemModalState({ isOpen: true, treeId, sectionId, itemToEdit: item || null });
    if (item) {
      setItemTitle(item.title);
      setItemDescription(item.description);
      setItemXP(item.required_xp);
      setItemVideoSample(item.video_sample || '');
    } else {
      setItemTitle('');
      setItemDescription('');
      setItemXP(50);
      setItemVideoSample('');
    }
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemTitle.trim()) return;

    if (itemModalState.itemToEdit) {
      updateSyllabusItem(itemModalState.treeId, itemModalState.sectionId, itemModalState.itemToEdit.id, {
        title: itemTitle,
        description: itemDescription,
        required_xp: itemXP,
        video_sample: itemVideoSample || undefined,
      });
    } else {
      addSyllabusItem(
        itemModalState.treeId,
        itemModalState.sectionId,
        itemTitle,
        itemDescription,
        itemXP,
        itemVideoSample || undefined
      );
    }

    setItemModalState({ isOpen: false, treeId: '', sectionId: '', itemToEdit: null });
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Pending Collaboration Invitations Banner */}
      {pendingInvitations.length > 0 && (
        <div className="space-y-3">
          {pendingInvitations.map((invDisc) => {
            const creator = profiles.find((p) => p.id === invDisc.creator_teacher_id);
            return (
              <div
                key={invDisc.id}
                className="p-4 rounded-2xl bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 border border-amber-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
                    📩
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                      <span>Invitación a Co-Administrar Programa</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                        {invDisc.name}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      El profesor <strong className="text-amber-300">{creator?.full_name || 'Docente'}</strong> te ha invitado a co-administrar este programa.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => acceptProgramCollaboration(invDisc.id)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-glow-emerald"
                  >
                    <Check className="w-4 h-4" /> Aceptar Petición
                  </button>
                  <button
                    onClick={() => rejectProgramCollaboration(invDisc.id)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-900/50 text-slate-300 hover:text-rose-200 border border-slate-700 text-xs font-bold transition-all"
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950 via-indigo-950/80 to-slate-900 border border-purple-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold mb-2">
            <BookOpen className="w-4 h-4 text-amber-400" /> Panel de Gestión del Programa Pedagógico
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Gestión del Programa & Temario</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Crea y administra tus programas de baile independientes o compartidos con otros docentes de la academia.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAddDisciplineModal(true)}
            className="px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-glow-gold"
          >
            <Plus className="w-4 h-4" />
            <span>+ Crear Nuevo Programa</span>
          </button>

          <button
            onClick={() => applyPresetSyllabusTemplate(selectedDisciplineId)}
            className="px-3.5 py-2 rounded-2xl bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/40 text-purple-200 font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Cargar Plantilla Base</span>
          </button>
        </div>
      </div>

      {/* Discipline / Program Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {teacherDisciplines.map((disc) => {
          const count = levelTrees.filter((lt) => lt.discipline_id === disc.id).length;
          const isShared = disc.is_shared;
          return (
            <button
              key={disc.id}
              onClick={() => setSelectedDisciplineId(disc.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
                selectedDisciplineId === disc.id
                  ? 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-glow-gold/20'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4 text-amber-400" />
              <span>{disc.name}</span>
              {isShared && (
                <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/30 text-indigo-300 text-[9px] font-bold">
                  Compartido
                </span>
              )}
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300 font-mono">
                {count} {count === 1 ? 'Nivel' : 'Niveles'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Program Container & Action Bar */}
      {currentDiscipline && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase">
                  {currentDiscipline.style_tag || 'Programa de Baile'}
                </span>
                <span className="text-xs text-slate-400 font-mono">{currentDiscipline.recommended_bpm}</span>
                {currentDiscipline.is_shared && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                    👥 Programa Compartido
                  </span>
                )}
              </div>
              <h3 className="text-xl font-black text-white mt-1">{currentDiscipline.name}</h3>
            </div>

            <div className="flex items-center gap-2">
              {/* Relocated Crear Nuevo Nivel Button inside Program Container */}
              <button
                onClick={() => setShowAddLevelModal(true)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-glow-violet"
              >
                <Plus className="w-4 h-4" />
                <span>+ Crear Nivel en este Programa</span>
              </button>

              <button
                onClick={() => setIsEditingProgramInfo(!isEditingProgramInfo)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all border border-slate-700"
              >
                <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                <span>{isEditingProgramInfo ? 'Cancelar' : 'Editar Ficha'}</span>
              </button>

              {teacherDisciplines.length > 1 && (
                <button
                  onClick={() => {
                    if (confirm(`¿Eliminar el programa "${currentDiscipline.name}" y sus niveles?`)) {
                      deleteDiscipline(currentDiscipline.id);
                      setSelectedDisciplineId(teacherDisciplines[0].id);
                    }
                  }}
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all"
                  title="Eliminar Programa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* View or Edit Program Details */}
          {isEditingProgramInfo ? (
            <form onSubmit={handleSaveProgramInfo} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Etiqueta de Estilo:</label>
                  <input
                    type="text"
                    value={editStyleTag}
                    onChange={(e) => setEditStyleTag(e.target.value)}
                    placeholder="ej. Salsa L.A. Style On1"
                    className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-semibold outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Público Objetivo:</label>
                  <input
                    type="text"
                    value={editAudience}
                    onChange={(e) => setEditAudience(e.target.value)}
                    placeholder="ej. Nivel Iniciación a Avanzado"
                    className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-semibold outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Rango BPM Recomendado:</label>
                  <input
                    type="text"
                    value={editBPM}
                    onChange={(e) => setEditBPM(e.target.value)}
                    placeholder="ej. 180 - 210 BPM"
                    className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-semibold outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Descripción & Objetivos Pedagógicos:</label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="Describe los objetivos clave de este programa pedagógico..."
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-medium outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Compartir Programa con otros Profesores</span>
                    <span className="text-[10px] text-slate-400">Permite que otros docentes acreditados puedan ver y co-administrar este programa.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={editIsShared}
                    onChange={(e) => setEditIsShared(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </div>

                {editIsShared && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-2">
                    <span className="text-[11px] font-bold text-amber-300 block">👨‍🏫 Invitar Docentes Colaboradores:</span>
                    {otherTeacherProfiles.length === 0 ? (
                      <p className="text-[10px] text-slate-500 italic">No hay otros profesores registrados en la plataforma.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {otherTeacherProfiles.map((tp) => {
                          const isShared = (currentDiscipline?.shared_teacher_ids || []).includes(tp.id);
                          const isPending = (currentDiscipline?.pending_shared_teacher_ids || []).includes(tp.id);
                          return (
                            <div
                              key={tp.id}
                              className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                            >
                              <div className="flex items-center gap-2 overflow-hidden">
                                <img
                                  src={tp.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                                  alt=""
                                  className="w-5 h-5 rounded-full object-cover"
                                />
                                <span className="font-bold text-white truncate">{tp.full_name}</span>
                              </div>

                              {isShared ? (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
                                  <UserCheck className="w-3 h-3" /> Colaborador
                                </span>
                              ) : isPending ? (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> Pendiente
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => requestProgramCollaboration(currentDiscipline.id, tp.id)}
                                  className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold flex items-center gap-1 transition-all shadow-sm"
                                >
                                  <Send className="w-3 h-3" /> Invitar
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Multi-School Linking */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-amber-300 block">🏫 Vincular Programa a Escuelas / Sedes:</span>
                <span className="text-[10px] text-slate-400 block">
                  Los puntos y la racha conseguidos en este programa computarán para la escuela seleccionada.
                </span>

                <div className="flex flex-wrap gap-3 pt-1">
                  {schools.map((sch) => {
                    const isLinked = editLinkedSchoolIds.includes(sch.id);
                    return (
                      <label key={sch.id} className="flex items-center gap-2 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-white">
                        <input
                          type="checkbox"
                          checked={isLinked}
                          onChange={() => {
                            if (isLinked) {
                              setEditLinkedSchoolIds(editLinkedSchoolIds.filter((id) => id !== sch.id));
                            } else {
                              setEditLinkedSchoolIds([...editLinkedSchoolIds, sch.id]);
                            }
                          }}
                          className="w-4 h-4 accent-amber-500 rounded"
                        />
                        <span className="font-semibold">{sch.name} ({sch.city})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs shadow-glow-gold"
                >
                  Guardar Ficha
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-slate-300 leading-relaxed">{currentDiscipline.description || 'Programa de enseñanza gradual para la formación técnica en baile.'}</p>
              <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                <span>🎯 Target: <strong className="text-slate-200">{currentDiscipline.target_audience || 'Todos los niveles'}</strong></span>
                <span>🎵 Ritmo: <strong className="text-slate-200">{currentDiscipline.recommended_bpm || '160-200 BPM'}</strong></span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Level Trees List */}
      {activeTrees.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-3xl space-y-4">
          <Layers className="w-12 h-12 text-slate-600 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-white">Aún no hay niveles en esta disciplina</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Puedes crear un nivel desde cero o pulsar en "Cargar Plantilla Predefinida" para iniciar con una estructura recomendada.
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => applyPresetSyllabusTemplate(selectedDisciplineId)}
              className="px-4 py-2 bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs rounded-xl hover:bg-amber-500/30 transition-all"
            >
              ⚡ Usar Plantilla Base
            </button>
            <button
              onClick={() => setShowAddLevelModal(true)}
              className="px-4 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl hover:bg-purple-500 transition-all"
            >
              + Crear Nivel 1
            </button>
          </div>
        </div>
      ) : (
        activeTrees.map((tree) => (
          <div key={tree.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl">
            {/* Level Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center justify-center font-black text-sm">
                  #{tree.level_order}
                </span>

                {editingLevelId === tree.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editedLevelName}
                      onChange={(e) => setEditedLevelName(e.target.value)}
                      className="bg-slate-950 border border-purple-500 rounded-xl px-3 py-1.5 text-sm font-extrabold text-white outline-none"
                    />
                    <button
                      onClick={() => {
                        updateLevelTree(tree.id, editedLevelName);
                        setEditingLevelId(null);
                      }}
                      className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditingLevelId(null)} className="p-2 bg-slate-800 text-slate-400 rounded-xl">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <span>{tree.level_name}</span>
                      <button
                        onClick={() => {
                          setEditingLevelId(tree.id);
                          setEditedLevelName(tree.level_name);
                        }}
                        className="text-slate-500 hover:text-purple-400 p-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </h3>
                    <p className="text-xs text-slate-400">
                      {tree.sections?.length || 0} Apartados · Total {tree.nodes?.length || 0} Pasos/Temas
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setAddingSectionForTreeId(tree.id);
                    setNewSectionTitle('');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-purple-900/50 border border-slate-700 hover:border-purple-500 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  <FolderPlus className="w-4 h-4 text-purple-400" />
                  <span>Añadir Apartado</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm(`¿Eliminar completo ${tree.level_name}?`)) {
                      deleteLevelTree(tree.id);
                    }
                  }}
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all"
                  title="Eliminar Nivel"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Form to Add Section inline if requested */}
            {addingSectionForTreeId === tree.id && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newSectionTitle.trim()) {
                    addSyllabusSection(tree.id, newSectionTitle.trim());
                    setAddingSectionForTreeId(null);
                    setNewSectionTitle('');
                  }
                }}
                className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/40 flex items-center gap-3"
              >
                <FolderPlus className="w-5 h-5 text-purple-400" />
                <input
                  type="text"
                  placeholder="Nombre del apartado (ej. Pasos Básicos, En Pareja, Combinaciones...)"
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl"
                >
                  Crear Apartado
                </button>
                <button
                  type="button"
                  onClick={() => setAddingSectionForTreeId(null)}
                  className="px-3 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
              </form>
            )}

            {/* Sections (Apartados) */}
            <div className="space-y-4">
              {(!tree.sections || tree.sections.length === 0) ? (
                <div className="p-6 text-center border border-dashed border-slate-800 rounded-2xl text-xs text-slate-500">
                  No hay apartados en este nivel. Haz clic en <strong>"Añadir Apartado"</strong> (ej. Pasos Básicos / En Pareja).
                </div>
              ) : (
                tree.sections.map((section) => (
                  <div key={section.id} className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-3">
                    {/* Section Header */}
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400 text-sm">📂</span>

                        {editingSectionId === section.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editedSectionTitle}
                              onChange={(e) => setEditedSectionTitle(e.target.value)}
                              className="bg-slate-900 border border-amber-500 rounded-lg px-2.5 py-1 text-xs font-bold text-white outline-none"
                            />
                            <button
                              onClick={() => {
                                updateSyllabusSection(tree.id, section.id, editedSectionTitle);
                                setEditingSectionId(null);
                              }}
                              className="p-1 bg-emerald-600 text-white rounded-lg"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setEditingSectionId(null)} className="p-1 bg-slate-800 text-slate-400 rounded-lg">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <h4 className="font-extrabold text-sm text-slate-200 flex items-center gap-2">
                            <span>{section.title}</span>
                            <button
                              onClick={() => {
                                setEditingSectionId(section.id);
                                setEditedSectionTitle(section.title);
                              }}
                              className="text-slate-500 hover:text-amber-400 p-0.5"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </h4>
                        )}
                        <span className="text-[10px] text-slate-500 font-mono">({section.items.length} ítems)</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Section Reorder Up/Down */}
                        <div className="flex items-center gap-0.5 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                          <button
                            onClick={() => reorderSyllabusSection(tree.id, section.id, 'up')}
                            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
                            title="Mover Apartado Arriba"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => reorderSyllabusSection(tree.id, section.id, 'down')}
                            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
                            title="Mover Apartado Abajo"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => openItemModal(tree.id, section.id)}
                          className="px-2.5 py-1 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/40 text-purple-300 font-bold text-[11px] flex items-center gap-1 transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Paso / Tema</span>
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar apartado "${section.title}"?`)) {
                              deleteSyllabusSection(tree.id, section.id);
                            }
                          }}
                          className="p-1 text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Items List */}
                    {section.items.length === 0 ? (
                      <div className="p-4 text-center text-[11px] text-slate-500 italic">
                        Apartado vacío. Haz clic en "+ Paso / Tema" para agregar un ejercicio con sus puntos de XP.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {section.items.map((item, idx) => (
                          <div
                            key={item.id}
                            className="bg-slate-900 border border-slate-800 hover:border-purple-500/40 p-3 rounded-xl flex flex-col justify-between gap-2 transition-all"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-0.5">
                                <h5 className="font-extrabold text-xs text-white flex items-center gap-1.5">
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                                    #{idx + 1}
                                  </span>
                                  <span>{item.title}</span>
                                </h5>
                                <p className="text-[11px] text-slate-400 line-clamp-2">{item.description}</p>
                              </div>

                              <div className="flex items-center gap-1">
                                {/* Item Reorder Up/Down */}
                                <button
                                  onClick={() => reorderSyllabusItem(tree.id, section.id, item.id, 'up')}
                                  className="p-1 text-slate-500 hover:text-white"
                                  title="Mover Tema Arriba"
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => reorderSyllabusItem(tree.id, section.id, item.id, 'down')}
                                  className="p-1 text-slate-500 hover:text-white"
                                  title="Mover Tema Abajo"
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => openItemModal(tree.id, section.id, item)}
                                  className="p-1 text-slate-400 hover:text-purple-300"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => deleteSyllabusItem(tree.id, section.id, item.id)}
                                  className="p-1 text-slate-500 hover:text-rose-400"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Customizable XP Input & Video Badge */}
                            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                              <div className="flex items-center gap-1.5">
                                <Award className="w-3.5 h-3.5 text-amber-400" />
                                <span className="text-[11px] text-slate-400 font-bold">XP del Paso:</span>
                                <input
                                  type="number"
                                  min="5"
                                  max="1000"
                                  value={item.required_xp}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    updateSyllabusItem(tree.id, section.id, item.id, { required_xp: val });
                                  }}
                                  className="w-16 bg-slate-950 border border-amber-500/40 rounded-lg px-2 py-0.5 text-xs font-black text-amber-300 text-center outline-none focus:border-amber-400"
                                  title="El profesor puede variar los puntos de XP de cada paso libremente"
                                />
                              </div>

                              {item.video_sample && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-indigo-400 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                                  <Video className="w-3 h-3" /> Vídeo Muestra
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ))
      )}

      {/* Modal Add Level */}
      <AnimatePresence>
        {showAddLevelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 relative"
            >
              <button onClick={() => setShowAddLevelModal(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                <Layers className="w-5 h-5" />
                <span>Crear Nuevo Nivel</span>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newLevelName.trim()) {
                    createLevelTree(selectedDisciplineId, newLevelName.trim());
                    setShowAddLevelModal(false);
                    setNewLevelName('');
                  }
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">
                    Nombre del Nivel (ej. Nivel 1: Básico Inicio, Nivel 2: Avanzado):
                  </label>
                  <input
                    type="text"
                    placeholder="ej. Nivel 1 - Básico Inicio Salsa"
                    value={newLevelName}
                    onChange={(e) => setNewLevelName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-purple-500"
                    autoFocus
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddLevelModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-glow-violet"
                  >
                    Crear Nivel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Add / Edit Item */}
      <AnimatePresence>
        {itemModalState.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 relative"
            >
              <button
                onClick={() => setItemModalState({ isOpen: false, treeId: '', sectionId: '', itemToEdit: null })}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Sparkles className="w-5 h-5" />
                <span>{itemModalState.itemToEdit ? 'Editar Paso / Tema' : 'Añadir Paso / Tema al Apartado'}</span>
              </div>

              <form onSubmit={handleSaveItem} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 block">Nombre del Paso / Movimiento:</label>
                  <input
                    type="text"
                    placeholder="ej. Giro de la Chica (Right Turn), Paso Lateral, Cambré..."
                    value={itemTitle}
                    onChange={(e) => setItemTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 block">Descripción / Detalle Técnico:</label>
                  <textarea
                    placeholder="ej. Preparación en 1, disociación de torso y giros en tiempo 3..."
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-amber-300 block">Puntos XP (Profesor):</label>
                    <input
                      type="number"
                      min="5"
                      max="1000"
                      value={itemXP}
                      onChange={(e) => setItemXP(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-amber-500/50 rounded-xl px-3 py-2 text-xs font-black text-amber-300 outline-none focus:border-amber-400"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 block">Vídeo Muestra (Opcional URL):</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={itemVideoSample}
                      onChange={(e) => setItemVideoSample(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setItemModalState({ isOpen: false, treeId: '', sectionId: '', itemToEdit: null })}
                    className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-slate-950 font-extrabold text-xs shadow-glow-amber transition-all"
                  >
                    {itemModalState.itemToEdit ? 'Guardar Cambios' : 'Añadir al Temario'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Modal Add New Discipline / Dance Program */}
      <AnimatePresence>
        {showAddDisciplineModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 relative"
            >
              <button
                onClick={() => setShowAddDisciplineModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Layers className="w-5 h-5 text-amber-400" />
                <span>Crear Nuevo Programa de Enseñanza desde Cero</span>
              </div>

              <form onSubmit={handleCreateNewDisciplineSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 block">Nombre del Programa / Disciplina:</label>
                  <input
                    type="text"
                    placeholder="ej. Salsa en Línea On2 / Mambo, Bachata Sensual..."
                    value={newProgramName}
                    onChange={(e) => setNewProgramName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                    required
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Etiqueta Estilo:</label>
                    <input
                      type="text"
                      placeholder="ej. L.A. Style On1"
                      value={newProgramStyle}
                      onChange={(e) => setNewProgramStyle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Público Objetivo:</label>
                    <input
                      type="text"
                      placeholder="ej. Todos los niveles"
                      value={newProgramAudience}
                      onChange={(e) => setNewProgramAudience(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">BPM Recomendado:</label>
                    <input
                      type="text"
                      placeholder="ej. 180 - 210 BPM"
                      value={newProgramBPM}
                      onChange={(e) => setNewProgramBPM(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 block">Descripción del Programa & Metodología:</label>
                  <textarea
                    rows={3}
                    placeholder="Resume el enfoque pedagógico y la progresión..."
                    value={newProgramDesc}
                    onChange={(e) => setNewProgramDesc(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddDisciplineModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-glow-gold transition-all"
                  >
                    Crear Programa & Nivel 1
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
