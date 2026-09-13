'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/ui/Navbar';
import { Sidebar } from '@/components/ui/Sidebar';
import { StatCard, Modal } from '@/components/ui/StatCard';
import { AuthModal } from '@/components/ui/AuthModal';
import { NotificationsModal, NotificationItem } from '@/components/ui/NotificationsModal';

export default function HomePage() {
  // Auth State
  const [currentUser, setCurrentUser] = useState({
    name: 'Óscar Director',
    email: 'director@plazadance.com',
    role: 'owner',
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // App Navigation & UI State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string>('');

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

  // Sample Data for Modules
  const [programs, setPrograms] = useState([
    { id: 'p1', name: 'Salsa Cubana y Rueda de Casino', discipline: 'Salsa', level: 'Intermedio', modulesCount: 6, xpPoints: 120 },
    { id: 'p2', name: 'Bachata Sensual & Flow', discipline: 'Bachata', level: 'Avanzado', modulesCount: 8, xpPoints: 180 },
    { id: 'p3', name: 'Kizomba Fusion', discipline: 'Kizomba', level: 'Iniciación', modulesCount: 4, xpPoints: 90 },
    { id: 'p4', name: 'Estilo Chica & Técnica Corporal', discipline: 'Lady Style', level: 'Todos los niveles', modulesCount: 5, xpPoints: 100 },
  ]);

  const [sessions, setSessions] = useState([
    { id: 's1', name: 'Salsa Cubana Nivel 2', time: 'Hoy 19:00 - 20:00', confirmed: 14, capacity: 16, leaders: 7, followers: 7, waitlist: 2 },
    { id: 's2', name: 'Bachata Sensual Parejas', time: 'Hoy 20:00 - 21:00', confirmed: 18, capacity: 18, leaders: 9, followers: 9, waitlist: 4 },
    { id: 's3', name: 'Kizomba Iniciación', time: 'Mañana 18:30 - 19:30', confirmed: 8, capacity: 14, leaders: 4, followers: 4, waitlist: 0 },
    { id: 's4', name: 'Rueda de Casino Especial', time: 'Viernes 21:00 - 22:30', confirmed: 12, capacity: 20, leaders: 6, followers: 6, waitlist: 0 },
  ]);

  const [quests, setQuests] = useState([
    { id: 'q1', title: 'Paso Básico Salsa en 8 Tiempos', program: 'Salsa Cubana', points: 20, status: 'approved', teacher: 'Carlos Pro' },
    { id: 'q2', title: 'Onda Sensual Bachata sin Perder Ritmo', program: 'Bachata Sensual', points: 30, status: 'submitted', teacher: 'Laura Dance' },
    { id: 'q3', title: 'Saida Esquerda Kizomba', program: 'Kizomba', points: 15, status: 'in_progress', teacher: 'Carlos Pro' },
    { id: 'q4', title: 'Disociación de Torso y Cadera', program: 'Lady Style', points: 25, status: 'submitted', teacher: 'Elena Gómez' },
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
    { id: 'm5', name: 'Roberto Fernández', email: 'roberto@email.com', role: 'student', status: 'Pendiente' },
  ]);

  // Form States
  const [newProgramName, setNewProgramName] = useState('');
  const [newProgramDiscipline, setNewProgramDiscipline] = useState('Salsa');
  const [newProgramLevel, setNewProgramLevel] = useState('Iniciación');
  const [newQuestTitle, setNewQuestTitle] = useState('');
  const [newQuestPoints, setNewQuestPoints] = useState(20);
  const [newPostContent, setNewPostContent] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('student');

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
    setToastMessage(`👋 ¡Bienvenido de nuevo, ${user.name}! (Rol: ${user.role})`);
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

    setPrograms([
      ...programs,
      {
        id: `p_${Date.now()}`,
        name: newProgramName,
        discipline: newProgramDiscipline,
        level: newProgramLevel,
        modulesCount: 4,
        xpPoints: 100,
      },
    ]);
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
    setToastMessage(`🏆 Reto "${newQuestTitle}" publicado.`);
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

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {/* Global Toast Message */}
          {toastMessage && (
            <div className="mb-6 p-4 rounded-xl bg-purple-900/40 border border-purple-500/50 text-purple-200 text-sm flex items-center justify-between animate-fade-in shadow-glow-violet">
              <span>{toastMessage}</span>
              <button onClick={() => setToastMessage('')} className="text-gray-400 hover:text-white font-bold ml-2">✕</button>
            </div>
          )}

          {/* ─── 1. TAB: DASHBOARD (RESUMEN KPI) ─── */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">Panel de Dirección</h1>
                <p className="text-gray-400 text-sm mt-1">Gestión académica, aforos en tiempo real, facturación "a cuenta" y métricas de la escuela.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                <StatCard title="Alumnos Activos" value="248" subtitle="En 14 grupos semanales" icon="👥" trend="+12%" trendUp={true} />
                <StatCard title="Ocupación de Aforos" value="89%" subtitle="182 plazas reservadas de 204" icon="📊" trend="+5%" trendUp={true} />
                <StatCard title="Recaudación Mes" value="14.850 €" subtitle="Cobros totales + 'A cuenta'" icon="💳" trend="+18%" trendUp={true} />
                <StatCard title="Pendiente de Cobro" value="620 €" subtitle="8 alumnos con saldo parcial" icon="⚠️" trend="-4%" trendUp={false} />
              </div>

              <div className="glass-panel p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="font-heading font-bold text-xl text-white">Próximas Clases y Aforos Atómicos</h2>
                    <p className="text-xs text-gray-400">Control transaccional en PostgreSQL contra sobreventas (Líderes / Seguidores)</p>
                  </div>
                  <button
                    onClick={() => { setModalType('session'); setIsModalOpen(true); }}
                    className="btn-primary text-xs shrink-0"
                  >
                    + Nueva Clase
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {sessions.map((sess) => (
                    <div key={sess.id} className="p-5 rounded-2xl bg-gray-900/80 border border-gray-800 flex flex-col justify-between hover:border-purple-500/40 transition">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="badge badge-purple">{sess.time}</span>
                          <span className="text-xs text-gray-400 font-mono">ID: {sess.id}</span>
                        </div>
                        <h3 className="font-heading font-bold text-lg text-white mb-2">{sess.name}</h3>

                        <div className="space-y-1 mb-4">
                          <div className="flex justify-between text-xs text-gray-300">
                            <span>Aforo Ocupado:</span>
                            <span className="font-bold">{sess.confirmed} / {sess.capacity}</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-gray-800 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                              style={{ width: `${(sess.confirmed / sess.capacity) * 100}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-400 bg-gray-950 p-2.5 rounded-xl border border-gray-800">
                          <span>🕺 Líderes: <strong className="text-white">{sess.leaders}</strong></span>
                          <span>💃 Seguidores: <strong className="text-white">{sess.followers}</strong></span>
                          <span>⏳ Espera: <strong className="text-amber-400">{sess.waitlist}</strong></span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleReserve(sess.id)}
                        className="mt-4 w-full py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/30 transition text-xs font-semibold"
                      >
                        Simular Reserva Atómica
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── 2. TAB: PROGRAMAS & CLASES ─── */}
          {activeTab === 'programs' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">Programas & Diseñador de Temario</h1>
                  <p className="text-gray-400 text-sm mt-1">Disciplinas de baile, árbol de niveles, módulos técnicos y asignación de puntos XP.</p>
                </div>
                <button
                  onClick={() => { setModalType('program'); setIsModalOpen(true); }}
                  className="btn-primary text-xs"
                >
                  + Nuevo Programa
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {programs.map((prog) => (
                  <div key={prog.id} className="glass-panel p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="badge badge-cyan">{prog.discipline}</span>
                        <span className="badge badge-purple">{prog.level}</span>
                      </div>
                      <h3 className="font-heading font-bold text-xl text-white mb-2">{prog.name}</h3>
                      <p className="text-xs text-gray-400 mb-4">
                        Diseño curricular pedagógico estructurado en {prog.modulesCount} módulos secuenciales con vídeos de técnica.
                      </p>
                    </div>

                    <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
                      <span className="text-xs text-amber-400 font-semibold">🏆 Recompensa: +{prog.xpPoints} XP</span>
                      <button className="btn-secondary text-xs">Editar Temario</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── 3. TAB: RESERVAS & AFOROS ─── */}
          {activeTab === 'reservations' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">Gestión de Reservas & Control de Aforos</h1>
                <p className="text-gray-400 text-sm mt-1">Control de asistencia por pareja, balance de roles y gestión de lista de espera.</p>
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

          {/* ─── 4. TAB: ASISTENCIA & CHECK-IN ─── */}
          {activeTab === 'attendance' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">Recepción & Check-In QR</h1>
                <p className="text-gray-400 text-sm mt-1">Lector de código QR en puerta, cobros parciales "a cuenta" y marcas de asistencia.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel p-6 flex flex-col justify-between">
                  <div>
                    <h2 className="font-heading font-bold text-lg text-white mb-2">Terminal Check-In QR</h2>
                    <p className="text-xs text-gray-400 mb-6">Escanea el código QR del alumno desde su móvil o introduce ID</p>

                    <div className="p-8 rounded-2xl bg-gray-950 border-2 border-dashed border-purple-500/40 flex flex-col items-center justify-center text-center space-y-3">
                      <div className="w-16 h-16 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center text-3xl animate-bounce">
                        📱
                      </div>
                      <p className="font-semibold text-white text-sm">Escáner de Cámara Listo</p>
                      <p className="text-xs text-gray-500">Apunta la cámara al código QR para validar reserva instantánea</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setToastMessage('✅ Check-In COMPLETADO: Elena Gómez (Salsa Cubana - 19:00)')}
                    className="mt-6 btn-primary w-full justify-center"
                  >
                    Simular Lectura QR Exitosa
                  </button>
                </div>

                <div className="glass-panel p-6">
                  <h2 className="font-heading font-bold text-lg text-white mb-2">Cobro "A Cuenta" (Saldos Pendientes)</h2>
                  <p className="text-xs text-gray-400 mb-4">Registro de entrega parcial de efectivo o tarjeta</p>

                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white text-sm">Roberto Fernández</p>
                        <p className="text-xs text-gray-400">Bono 10 Clases • Total: 90€ | Pagado: 50€</p>
                      </div>
                      <div className="text-right">
                        <span className="badge badge-amber font-bold mb-1">Pendiente: 40€</span>
                        <button
                          onClick={() => setToastMessage('💶 Pago "a cuenta" registrado: 40€ añadidos. Pendiente: 0€ (COMPLETADO)')}
                          className="block text-xs text-purple-400 hover:text-purple-300 font-semibold mt-1"
                        >
                          Cobrar +40€
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── 5. TAB: PAGOS & BONOS ─── */}
          {activeTab === 'payments' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">Pagos, Bonos & Finanzas</h1>
                <p className="text-gray-400 text-sm mt-1">Control de suscripciones, bono de 10 clases y cobros fraccionados "a cuenta".</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="glass-panel p-6 space-y-3">
                  <span className="badge badge-emerald">Bono 10 Clases</span>
                  <h3 className="font-bold text-xl text-white">Salsa & Bachata Pack</h3>
                  <p className="text-3xl font-extrabold text-white">90 €</p>
                  <p className="text-xs text-gray-400">Válido durante 60 días desde la primera clase.</p>
                  <button className="btn-primary w-full text-xs mt-2">Asignar a Alumno</button>
                </div>

                <div className="glass-panel p-6 space-y-3">
                  <span className="badge badge-purple">Mensualidad</span>
                  <h3 className="font-bold text-xl text-white">Tarifa Plana Completa</h3>
                  <p className="text-3xl font-extrabold text-white">65 € <span className="text-xs font-normal text-gray-400">/mes</span></p>
                  <p className="text-xs text-gray-400">Acceso ilimitado a todos los grupos de la escuela.</p>
                  <button className="btn-primary w-full text-xs mt-2">Asignar a Alumno</button>
                </div>

                <div className="glass-panel p-6 space-y-3">
                  <span className="badge badge-amber">Saldos Pendientes</span>
                  <h3 className="font-bold text-xl text-white">Pendientes "A Cuenta"</h3>
                  <p className="text-3xl font-extrabold text-amber-400">620 €</p>
                  <p className="text-xs text-gray-400">Total acumulado a cobrar en recepción esta semana.</p>
                  <button className="btn-secondary w-full text-xs mt-2">Ver Lista Pendientes</button>
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
                    <div className="flex items-center gap-2 pt-2 text-xs text-gray-400">
                      <button className="hover:text-pink-400 transition">❤️ {post.likes} Me gusta</button>
                    </div>
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
                  <p className="text-gray-400 text-sm mt-1">Gestión de usuarios y asignación de roles (Directores, Profesores, Recepción, Alumnos).</p>
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

      {/* Auth Modal (Login / Register / Fast Accounts) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

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

        {modalType === 'session' && (
          <div className="text-center py-4 space-y-3">
            <p className="text-sm text-gray-300">Nueva sesión en proceso de programación en calendario.</p>
            <button onClick={() => setIsModalOpen(false)} className="btn-primary text-xs">Cerrar</button>
          </div>
        )}
      </Modal>
    </div>
  );
}
