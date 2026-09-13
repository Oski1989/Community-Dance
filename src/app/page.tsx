'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/ui/Navbar';
import { Sidebar } from '@/components/ui/Sidebar';
import { StatCard, Modal } from '@/components/ui/StatCard';
import { AuthModal } from '@/components/ui/AuthModal';
import { NotificationsModal, NotificationItem } from '@/components/ui/NotificationsModal';

interface ModuleItem {
  id: string;
  title: string;
  videoUrl: string;
}

interface ProgramItem {
  id: string;
  name: string;
  discipline: string;
  level: string;
  description?: string;
  modulesCount: number;
  xpPoints: number;
  modules: ModuleItem[];
}

export default function HomePage() {
  // Auth State
  const [currentUser, setCurrentUser] = useState({
    name: 'Carlos Profesor',
    email: 'profesor@plazadance.com',
    role: 'teacher',
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // App Navigation & UI State
  const [activeTab, setActiveTab] = useState<string>('programs');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string>('');

  // Syllabus Program Editor Modal State
  const [isSyllabusModalOpen, setIsSyllabusModalOpen] = useState<boolean>(false);
  const [editingProgram, setEditingProgram] = useState<ProgramItem | null>(null);

  // Notifications State
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n1',
      title: 'Reserva Confirmada',
      message: 'Elena Gómez ha reservado plaza en Salsa Cubana (Hoy 19:00).',
      time: 'Hace 5 min',
      type: 'reservation',
      read: false,
    },
    {
      id: 'n2',
      title: 'Nuevo Reto Entregado',
      message: 'Roberto Fernández subió un vídeo para el reto: Onda Sensual Bachata.',
      time: 'Hace 30 min',
      type: 'quest',
      read: false,
    },
    {
      id: 'n3',
      title: 'Pago Recibido "A Cuenta"',
      message: 'Cobro de 40€ registrado en recepción para bono 10 clases.',
      time: 'Hace 2 horas',
      type: 'payment',
      read: true,
    },
  ]);

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  // Sample Data for Programs with Full Modules & Video Links
  const [programs, setPrograms] = useState<ProgramItem[]>([
    {
      id: 'p1',
      name: 'Salsa Cubana y Rueda de Casino',
      discipline: 'Salsa',
      level: 'Intermedio',
      description: 'Estructura modular con vídeos de técnica de Rueda de Casino y paseos complejos.',
      modulesCount: 3,
      xpPoints: 120,
      modules: [
        { id: 'm1', title: 'Módulo 1: Paseo y Guapea con Estilo', videoUrl: 'https://youtube.com/watch?v=salsa_guapea_demo' },
        { id: 'm2', title: 'Módulo 2: Enchufla Doble y Vacilala', videoUrl: 'https://youtube.com/watch?v=salsa_enchufla_demo' },
        { id: 'm3', title: 'Módulo 3: Setenta y Cambios de Rueda', videoUrl: 'https://youtube.com/watch?v=salsa_setenta_demo' },
      ],
    },
    {
      id: 'p2',
      name: 'Bachata Sensual & Flow',
      discipline: 'Bachata',
      level: 'Avanzado',
      description: 'Técnica de aislamiento de torso, ondas corporales y conducción fluida en pareja.',
      modulesCount: 2,
      xpPoints: 180,
      modules: [
        { id: 'm10', title: 'Módulo 1: Disociación de Cadera y Torso', videoUrl: 'https://youtube.com/watch?v=bachata_ondulation' },
        { id: 'm11', title: 'Módulo 2: Conducción en Onda Superior', videoUrl: 'https://youtube.com/watch?v=bachata_leading' },
      ],
    },
    {
      id: 'p3',
      name: 'Kizomba Fusion',
      discipline: 'Kizomba',
      level: 'Iniciación',
      description: 'Fundamentos de caminada, saídas laterales y conexión en abrazo cerrado.',
      modulesCount: 2,
      xpPoints: 90,
      modules: [
        { id: 'm20', title: 'Módulo 1: Caminada Básica en 3 Tiempos', videoUrl: 'https://youtube.com/watch?v=kizomba_caminada' },
        { id: 'm21', title: 'Módulo 2: Saída Esquerda y Dirita', videoUrl: 'https://youtube.com/watch?v=kizomba_saida' },
      ],
    },
  ]);

  const [sessions, setSessions] = useState([
    { id: 's1', name: 'Salsa Cubana Nivel 2', time: 'Hoy 19:00 - 20:00', confirmed: 14, capacity: 16, leaders: 7, followers: 7, waitlist: 2 },
    { id: 's2', name: 'Bachata Sensual Parejas', time: 'Hoy 20:00 - 21:00', confirmed: 18, capacity: 18, leaders: 9, followers: 9, waitlist: 4 },
    { id: 's3', name: 'Kizomba Iniciación', time: 'Mañana 18:30 - 19:30', confirmed: 8, capacity: 14, leaders: 4, followers: 4, waitlist: 0 },
  ]);

  const [quests, setQuests] = useState([
    { id: 'q1', title: 'Paso Básico Salsa en 8 Tiempos', program: 'Salsa Cubana', points: 20, status: 'approved', teacher: 'Carlos Profesor' },
    { id: 'q2', title: 'Onda Sensual Bachata sin Perder Ritmo', program: 'Bachata Sensual', points: 30, status: 'submitted', teacher: 'Carlos Profesor' },
    { id: 'q3', title: 'Saida Esquerda Kizomba', program: 'Kizomba', points: 15, status: 'in_progress', teacher: 'Carlos Profesor' },
  ]);

  const [communityPosts, setCommunityPosts] = useState([
    { id: 'c1', user: 'Elena Gómez', role: 'ALUMNO', time: 'Hace 2 horas', content: '¡Increíble la clase de Bachata Sensual de ayer! 🔥 ¿Quién viene al social del viernes?', likes: 12 },
    { id: 'c2', user: 'Carlos Profesor', role: 'PROFESOR', time: 'Hace 5 horas', content: 'Recordatorio a los alumnos de Salsa Intermedio: Ya tenéis activo el nuevo Reto de Rueda de Casino en la sección de Quests 💃', likes: 24 },
  ]);

  const [members, setMembers] = useState([
    { id: 'm1', name: 'Óscar Director', email: 'director@plazadance.com', role: 'owner', status: 'Activo' },
    { id: 'm2', name: 'Carlos Profesor', email: 'profesor@plazadance.com', role: 'teacher', status: 'Activo' },
    { id: 'm3', name: 'Laura Recepción', email: 'recepcion@plazadance.com', role: 'reception', status: 'Activo' },
    { id: 'm4', name: 'Elena Alumna', email: 'alumno@plazadance.com', role: 'student', status: 'Activo' },
  ]);

  // Form States
  const [newProgramName, setNewProgramName] = useState('');
  const [newProgramDiscipline, setNewProgramDiscipline] = useState('Salsa');
  const [newProgramLevel, setNewProgramLevel] = useState('Iniciación');
  const [newQuestTitle, setNewQuestTitle] = useState('');
  const [newQuestPoints, setNewQuestPoints] = useState(20);
  const [newPostContent, setNewPostContent] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('teacher');

  // Handle Open Program Editor
  const handleOpenProgramEditor = (prog: ProgramItem) => {
    setEditingProgram({ ...prog, modules: [...prog.modules] });
    setIsSyllabusModalOpen(true);
  };

  // Add Module to Editing Program
  const handleAddModule = () => {
    if (!editingProgram) return;
    const newMod: ModuleItem = {
      id: `m_${Date.now()}`,
      title: `Módulo ${editingProgram.modules.length + 1}: Nuevos Pasos Técnicos`,
      videoUrl: 'https://youtube.com/watch?v=ejemplo',
    };
    setEditingProgram({
      ...editingProgram,
      modules: [...editingProgram.modules, newMod],
      modulesCount: editingProgram.modules.length + 1,
    });
  };

  // Save Syllabus Changes
  const handleSaveSyllabus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProgram) return;

    setPrograms((prev) =>
      prev.map((p) => (p.id === editingProgram.id ? editingProgram : p))
    );
    setIsSyllabusModalOpen(false);
    setToastMessage(`💾 Temario del programa "${editingProgram.name}" actualizado correctamente por el profesor.`);
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser({
      name: 'Invitado',
      email: 'sin-sesion@plazadance.com',
      role: 'student',
    });
    setToastMessage('🚪 Sesión cerrada correctamente.');
    setIsAuthModalOpen(true);
  };

  // Handle Auth Login/Register Success
  const handleAuthSuccess = (user: { name: string; email: string; role: string }) => {
    setCurrentUser(user);
    setToastMessage(`👋 ¡Sesión iniciada como ${user.name}! (Rol: ${user.role})`);
  };

  // Handle Mark Notifications as Read
  const handleMarkNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Handle Atomic Reservation
  const handleReserve = (sessionId: string) => {
    const target = sessions.find((s) => s.id === sessionId);
    if (!target) return;

    if (target.confirmed < target.capacity) {
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, confirmed: s.confirmed + 1 } : s))
      );
      setToastMessage(`✅ Reserva CONFIRMADA para "${target.name}". ¡Plaza asegurada!`);
    } else {
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, waitlist: s.waitlist + 1 } : s))
      );
      setToastMessage(`⚠️ Aforo lleno. Añadido a LISTA DE ESPERA en Posición #${target.waitlist + 1}.`);
    }
  };

  // Create Program
  const handleCreateProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgramName.trim()) return;

    const newProg: ProgramItem = {
      id: `p_${Date.now()}`,
      name: newProgramName,
      discipline: newProgramDiscipline,
      level: newProgramLevel,
      description: 'Nuevo temario curricular creado.',
      modulesCount: 2,
      xpPoints: 100,
      modules: [
        { id: `m1_${Date.now()}`, title: 'Módulo 1: Introducción y Pasos', videoUrl: 'https://youtube.com/demo' },
        { id: `m2_${Date.now()}`, title: 'Módulo 2: Figuras y Ritmo', videoUrl: 'https://youtube.com/demo2' },
      ],
    };

    setPrograms([...programs, newProg]);
    setNewProgramName('');
    setIsModalOpen(false);
    setToastMessage(`🎉 Programa "${newProgramName}" creado con éxito.`);
  };

  // Create Quest
  const handleCreateQuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestTitle.trim()) return;

    setQuests([
      ...quests,
      {
        id: `q_${Date.now()}`,
        title: newQuestTitle,
        program: newProgramDiscipline,
        points: Number(newQuestPoints),
        status: 'submitted',
        teacher: currentUser.name,
      },
    ]);
    setNewQuestTitle('');
    setIsModalOpen(false);
    setToastMessage(`🏆 Reto "${newQuestTitle}" publicado para los alumnos.`);
  };

  // Create Post
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    setCommunityPosts([
      {
        id: `c_${Date.now()}`,
        user: currentUser.name,
        role: currentUser.role.toUpperCase(),
        time: 'Justo ahora',
        content: newPostContent,
        likes: 0,
      },
      ...communityPosts,
    ]);
    setNewPostContent('');
    setIsModalOpen(false);
  };

  // Invite Member
  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;

    setMembers([
      ...members,
      {
        id: `m_${Date.now()}`,
        name: newMemberEmail.split('@')[0],
        email: newMemberEmail,
        role: newMemberRole,
        status: 'Invitado',
      },
    ]);
    setNewMemberEmail('');
    setIsModalOpen(false);
    setToastMessage(`📩 Invitación enviada a ${newMemberEmail}.`);
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-gray-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        currentRole={currentUser.role}
        userName={currentUser.name}
        userEmail={currentUser.email}
        unreadCount={unreadNotificationsCount}
        onNotificationsClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
        onLoginClick={() => setIsAuthModalOpen(true)}
        onLogoutClick={handleLogout}
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      <div className="flex-1 flex">
        {/* Left Sidebar */}
        <Sidebar
          currentRole={currentUser.role}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isMobileOpen={isMobileMenuOpen}
          onMobileClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content View Container */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {/* Global Toast Message */}
          {toastMessage && (
            <div className="mb-6 p-4 rounded-xl bg-purple-900/40 border border-purple-500/50 text-purple-200 text-sm flex items-center justify-between animate-fade-in shadow-glow-violet">
              <span>{toastMessage}</span>
              <button onClick={() => setToastMessage('')} className="text-gray-400 hover:text-white font-bold ml-2">✕</button>
            </div>
          )}

          {/* ─── 1. TAB: PROGRAMAS & CLASES (EDICIÓN DOCENTE HABILITADA) ─── */}
          {activeTab === 'programs' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">Programas & Diseñador de Temario</h1>
                  <p className="text-gray-400 text-sm mt-1">Disciplinas de baile, árbol de niveles, módulos técnicos con vídeos y asignación de XP.</p>
                </div>
                {(currentUser.role === 'owner' || currentUser.role === 'teacher' || currentUser.role === 'admin') && (
                  <button
                    onClick={() => { setModalType('program'); setIsModalOpen(true); }}
                    className="btn-primary text-xs"
                  >
                    + Nuevo Programa
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {programs.map((prog) => (
                  <div key={prog.id} className="glass-panel p-6 flex flex-col justify-between hover:border-purple-500/40 transition">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="badge badge-cyan">{prog.discipline}</span>
                        <span className="badge badge-purple">{prog.level}</span>
                      </div>
                      <h3 className="font-heading font-bold text-xl text-white mb-2">{prog.name}</h3>
                      <p className="text-xs text-gray-400 mb-4">{prog.description}</p>

                      {/* Video Modules List */}
                      <div className="space-y-2 mb-4 bg-gray-950/70 p-3 rounded-xl border border-gray-800">
                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Módulos del Temario ({prog.modules.length}):</p>
                        {prog.modules.map((m) => (
                          <div key={m.id} className="flex items-center justify-between text-xs text-gray-300">
                            <span className="truncate pr-2">🎥 {m.title}</span>
                            <a href={m.videoUrl} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline shrink-0 text-[11px]">Ver Vídeo ↗</a>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
                      <span className="text-xs text-amber-400 font-semibold">🏆 Recompensa: +{prog.xpPoints} XP</span>
                      <button
                        onClick={() => handleOpenProgramEditor(prog)}
                        className="btn-primary text-xs py-1.5 px-3"
                      >
                        ✏️ Editar Temario & Vídeos
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── 2. TAB: DASHBOARD ─── */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">Panel de Gestión</h1>
                <p className="text-gray-400 text-sm mt-1">Gestión académica, aforos en tiempo real y facturación de la escuela.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                <StatCard title="Alumnos Activos" value="248" subtitle="En 14 grupos semanales" icon="👥" trend="+12%" trendUp={true} />
                <StatCard title="Ocupación de Aforos" value="89%" subtitle="182 plazas reservadas de 204" icon="📊" trend="+5%" trendUp={true} />
                <StatCard title="Recaudación Mes" value="14.850 €" subtitle="Cobros totales + 'A cuenta'" icon="💳" trend="+18%" trendUp={true} />
                <StatCard title="Pendiente de Cobro" value="620 €" subtitle="8 alumnos con saldo parcial" icon="⚠️" trend="-4%" trendUp={false} />
              </div>
            </div>
          )}

          {/* ─── 3. TAB: RESERVAS & AFOROS ─── */}
          {activeTab === 'reservations' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">Gestión de Reservas & Control de Aforos</h1>
                <p className="text-gray-400 text-sm mt-1">Control de asistencia por pareja y gestión de lista de espera.</p>
              </div>

              <div className="glass-panel p-6 space-y-4">
                <h2 className="font-heading font-bold text-lg text-white">Listado de Sesiones Activas</h2>
                <div className="space-y-3">
                  {sessions.map((sess) => (
                    <div key={sess.id} className="p-4 rounded-xl bg-gray-900 border border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="badge badge-purple">{sess.time}</span>
                          <span className="text-xs text-gray-400">Capacidad: {sess.capacity} plazas</span>
                        </div>
                        <h3 className="font-bold text-white text-base">{sess.name}</h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-300">
                          Confirmados: <strong className="text-emerald-400">{sess.confirmed}</strong>
                        </span>
                        <button
                          onClick={() => handleReserve(sess.id)}
                          className="btn-primary text-xs"
                        >
                          Reservar Plaza
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── 4. TAB: ASISTENCIA ─── */}
          {activeTab === 'attendance' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">Pasar Asistencia & Check-In</h1>
                <p className="text-gray-400 text-sm mt-1">Lector de código QR y pase de lista de alumnos por grupo.</p>
              </div>

              <div className="glass-panel p-6">
                <h2 className="font-heading font-bold text-lg text-white mb-2">Terminal de Lectura QR</h2>
                <button
                  onClick={() => setToastMessage('✅ Check-In COMPLETADO: Elena Gómez (Salsa Cubana - 19:00)')}
                  className="btn-primary text-xs mt-3"
                >
                  Simular Escaneo de Código QR
                </button>
              </div>
            </div>
          )}

          {/* ─── 5. TAB: PAGOS ─── */}
          {activeTab === 'payments' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">Pagos & Bonos</h1>
                <p className="text-gray-400 text-sm mt-1">Control de suscripciones, bono de 10 clases y cobros fraccionados "a cuenta".</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="glass-panel p-6 space-y-3">
                  <span className="badge badge-emerald">Bono 10 Clases</span>
                  <h3 className="font-bold text-xl text-white">Salsa & Bachata Pack</h3>
                  <p className="text-3xl font-extrabold text-white">90 €</p>
                </div>
              </div>
            </div>
          )}

          {/* ─── 6. TAB: RETOS & QUESTS ─── */}
          {activeTab === 'quests' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">Retos & Desafíos Comunitarios</h1>
                  <p className="text-gray-400 text-sm mt-1">Revisa vídeos de alumnos, otorga puntos XP y gestiona el ranking pedagógico.</p>
                </div>
                <button
                  onClick={() => { setModalType('quest'); setIsModalOpen(true); }}
                  className="btn-primary text-xs"
                >
                  + Crear Reto
                </button>
              </div>

              <div className="glass-panel p-6">
                <div className="space-y-4">
                  {quests.map((q) => (
                    <div key={q.id} className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="badge badge-cyan">{q.program}</span>
                          <span className="text-xs text-amber-400 font-semibold">+{q.points} Puntos</span>
                        </div>
                        <h3 className="font-semibold text-white text-base">{q.title}</h3>
                        <p className="text-xs text-gray-400">Profesor asignado: {q.teacher}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`badge ${
                            q.status === 'approved' ? 'badge-emerald' : q.status === 'submitted' ? 'badge-amber' : 'badge-purple'
                          }`}
                        >
                          {q.status === 'approved' ? 'Aprobado' : q.status === 'submitted' ? 'Pendiente Revisión' : 'En Progreso'}
                        </span>
                        {q.status === 'submitted' && (
                          <button
                            onClick={() => {
                              setQuests((prev) =>
                                prev.map((item) => (item.id === q.id ? { ...item, status: 'approved' } : item))
                              );
                              setToastMessage(`🎉 Reto "${q.title}" APROBADO. Puntos sumados al alumno.`);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition"
                          >
                            Aprobar (+{q.points} Pts)
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── 7. TAB: COMUNIDAD ─── */}
          {activeTab === 'community' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">Comunidad & Muro Social</h1>
                  <p className="text-gray-400 text-sm mt-1">Espacio de interacción entre profesores, alumnos y equipo de recepción.</p>
                </div>
                <button
                  onClick={() => { setModalType('post'); setIsModalOpen(true); }}
                  className="btn-primary text-xs"
                >
                  + Publicar
                </button>
              </div>

              <div className="glass-panel p-6 space-y-4">
                {communityPosts.map((post) => (
                  <div key={post.id} className="p-4 rounded-xl bg-gray-900 border border-gray-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs">
                          {post.user.charAt(0)}
                        </div>
                        <span className="font-semibold text-white text-sm">{post.user}</span>
                        <span className="badge badge-purple">{post.role}</span>
                      </div>
                      <span className="text-xs text-gray-500">{post.time}</span>
                    </div>
                    <p className="text-sm text-gray-300">{post.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── 8. TAB: MIEMBROS & EQUIPOS ─── */}
          {activeTab === 'invitations' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">Miembros & Equipo de la Escuela</h1>
                  <p className="text-gray-400 text-sm mt-1">Gestión de usuarios y asignación de roles.</p>
                </div>
                <button
                  onClick={() => { setModalType('member'); setIsModalOpen(true); }}
                  className="btn-primary text-xs"
                >
                  + Invitar Miembro
                </button>
              </div>

              <div className="glass-panel p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-400">
                        <th className="pb-3 font-semibold">Nombre</th>
                        <th className="pb-3 font-semibold">Email</th>
                        <th className="pb-3 font-semibold">Rol Asignado</th>
                        <th className="pb-3 font-semibold">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {members.map((m) => (
                        <tr key={m.id} className="hover:bg-white/5 transition">
                          <td className="py-3 font-semibold text-white">{m.name}</td>
                          <td className="py-3 text-gray-300">{m.email}</td>
                          <td className="py-3">
                            <span className="badge badge-purple uppercase font-bold">{m.role}</span>
                          </td>
                          <td className="py-3">
                            <span className={`badge ${m.status === 'Activo' ? 'badge-emerald' : 'badge-amber'}`}>
                              {m.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Notifications Modal Popup */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkNotificationsRead}
      />

      {/* Auth Modal (Login / Register / Social Google & Facebook) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* ─── PROGRAM & SYLLABUS EDITOR MODAL FOR TEACHERS & DIRECTORS ─── */}
      {editingProgram && (
        <Modal
          isOpen={isSyllabusModalOpen}
          onClose={() => setIsSyllabusModalOpen(false)}
          title={`✏️ Editar Temario: ${editingProgram.name}`}
        >
          <form onSubmit={handleSaveSyllabus} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Nombre del Programa</label>
              <input
                type="text"
                value={editingProgram.name}
                onChange={(e) => setEditingProgram({ ...editingProgram, name: e.target.value })}
                className="form-input"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Disciplina</label>
                <input
                  type="text"
                  value={editingProgram.discipline}
                  onChange={(e) => setEditingProgram({ ...editingProgram, discipline: e.target.value })}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Nivel</label>
                <input
                  type="text"
                  value={editingProgram.level}
                  onChange={(e) => setEditingProgram({ ...editingProgram, level: e.target.value })}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Descripción del Temario</label>
              <textarea
                value={editingProgram.description || ''}
                onChange={(e) => setEditingProgram({ ...editingProgram, description: e.target.value })}
                className="form-input h-20 resize-none text-xs"
              ></textarea>
            </div>

            {/* Modules & Videos List Editor */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white uppercase tracking-wider">Módulos & Vídeos de Técnica ({editingProgram.modules.length}):</label>
                <button
                  type="button"
                  onClick={handleAddModule}
                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
                >
                  + Añadir Módulo
                </button>
              </div>

              {editingProgram.modules.map((m, idx) => (
                <div key={m.id} className="p-3 rounded-xl bg-gray-950 border border-gray-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-purple-300">Módulo #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = editingProgram.modules.filter((item) => item.id !== m.id);
                        setEditingProgram({ ...editingProgram, modules: updated, modulesCount: updated.length });
                      }}
                      className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
                    >
                      Eliminar
                    </button>
                  </div>

                  <input
                    type="text"
                    value={m.title}
                    onChange={(e) => {
                      const updated = editingProgram.modules.map((item) =>
                        item.id === m.id ? { ...item, title: e.target.value } : item
                      );
                      setEditingProgram({ ...editingProgram, modules: updated });
                    }}
                    placeholder="Título del Módulo"
                    className="form-input text-xs"
                  />

                  <input
                    type="text"
                    value={m.videoUrl}
                    onChange={(e) => {
                      const updated = editingProgram.modules.map((item) =>
                        item.id === m.id ? { ...item, videoUrl: e.target.value } : item
                      );
                      setEditingProgram({ ...editingProgram, modules: updated });
                    }}
                    placeholder="URL del Vídeo (YouTube, Vimeo, Drive...)"
                    className="form-input text-xs"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
              <button type="button" onClick={() => setIsSyllabusModalOpen(false)} className="btn-secondary text-xs">Cancelar</button>
              <button type="submit" className="btn-primary text-xs">💾 Guardar Cambios en Temario</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Dynamic Creation Modals */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={
        modalType === 'program' ? 'Crear Nuevo Programa' :
        modalType === 'quest' ? 'Crear Reto Pedagógico' :
        modalType === 'post' ? 'Nueva Publicación en Comunidad' :
        modalType === 'member' ? 'Invitar Nuevo Miembro' : 'Crear Elemento'
      }>
        {modalType === 'program' && (
          <form onSubmit={handleCreateProgram} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Nombre del Programa</label>
              <input
                type="text"
                value={newProgramName}
                onChange={(e) => setNewProgramName(e.target.value)}
                placeholder="Ej: Salsa Cubana y Rueda de Casino"
                className="form-input"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Disciplina</label>
                <select
                  value={newProgramDiscipline}
                  onChange={(e) => setNewProgramDiscipline(e.target.value)}
                  className="form-input"
                >
                  <option value="Salsa">Salsa</option>
                  <option value="Bachata">Bachata</option>
                  <option value="Kizomba">Kizomba</option>
                  <option value="Lady Style">Lady Style</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Nivel</label>
                <select
                  value={newProgramLevel}
                  onChange={(e) => setNewProgramLevel(e.target.value)}
                  className="form-input"
                >
                  <option value="Iniciación">Iniciación</option>
                  <option value="Intermedio">Intermedio</option>
                  <option value="Avanzado">Avanzado</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary text-xs">Cancelar</button>
              <button type="submit" className="btn-primary text-xs">Guardar Programa</button>
            </div>
          </form>
        )}

        {modalType === 'quest' && (
          <form onSubmit={handleCreateQuest} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Título del Reto</label>
              <input
                type="text"
                value={newQuestTitle}
                onChange={(e) => setNewQuestTitle(e.target.value)}
                placeholder="Ej: Ejecución de Dile que No con estilo"
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Puntos XP de Recompensa</label>
              <input
                type="number"
                value={newQuestPoints}
                onChange={(e) => setNewQuestPoints(Number(e.target.value))}
                className="form-input"
                required
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary text-xs">Cancelar</button>
              <button type="submit" className="btn-primary text-xs">Publicar Reto</button>
            </div>
          </form>
        )}

        {modalType === 'post' && (
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Mensaje para la Comunidad</label>
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Escribe tu mensaje o aviso para la escuela..."
                className="form-input h-28 resize-none"
                required
              ></textarea>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary text-xs">Cancelar</button>
              <button type="submit" className="btn-primary text-xs">Publicar</button>
            </div>
          </form>
        )}

        {modalType === 'member' && (
          <form onSubmit={handleInviteMember} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Email del Nuevo Miembro</label>
              <input
                type="email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                placeholder="profesor@email.com"
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Rol a Asignar</label>
              <select
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value)}
                className="form-input"
              >
                <option value="owner">Director / Owner</option>
                <option value="teacher">Profesor</option>
                <option value="reception">Recepción</option>
                <option value="student">Alumno</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary text-xs">Cancelar</button>
              <button type="submit" className="btn-primary text-xs">Enviar Invitación</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
