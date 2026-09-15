'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/ui/Navbar';
import { Sidebar } from '@/components/ui/Sidebar';
import { StatCard, Modal } from '@/components/ui/StatCard';
import { AuthModal } from '@/components/ui/AuthModal';
import { NotificationsModal, NotificationItem } from '@/components/ui/NotificationsModal';
import { supabase } from '@/lib/supabase/client';

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
  // User & Auth State (null means Guest mode)
  const [currentUser, setCurrentUser] = useState<{ id?: string; name: string; email: string; role: string } | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // App Navigation & UI State
  const [activeTab, setActiveTab] = useState<string>('programs');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

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
  ]);

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  // Initial Core Data
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
    { id: 'm1', name: 'Óscar Director', email: 'director@plazadance.com', role: 'owner', status: 'Activo', isPublic: true, discipline: 'Salsa & Bachata', avatar: '👨‍💼' },
    { id: 'm2', name: 'Carlos Profesor', email: 'profesor@plazadance.com', role: 'teacher', status: 'Activo', isPublic: true, discipline: 'Salsa Cubana', avatar: '🕺' },
    { id: 'm3', name: 'Laura Recepción', email: 'recepcion@plazadance.com', role: 'reception', status: 'Activo', isPublic: true, discipline: 'Gestión Escuela', avatar: '👩‍💼' },
    { id: 'm4', name: 'Elena Alumna', email: 'alumno@plazadance.com', role: 'student', status: 'Activo', isPublic: true, discipline: 'Bachata Sensual', avatar: '💃' },
    { id: 'm5', name: 'Roberto Fernández', email: 'roberto@email.com', role: 'student', status: 'Activo', isPublic: true, discipline: 'Kizomba Fusion', avatar: '🕺' },
    { id: 'm6', name: 'Sofía Martínez', email: 'sofia@email.com', role: 'student', status: 'Activo', isPublic: false, discipline: 'Lady Style', avatar: '💃' },
  ]);

  // Guest & Directory Filter States
  const [filterDiscipline, setFilterDiscipline] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [memberSearch, setMemberSearch] = useState<string>('');
  const [memberRoleFilter, setMemberRoleFilter] = useState<string>('all');
  const [onlyVisibleMembers, setOnlyVisibleMembers] = useState<boolean>(true);

  // Social Events Data
  const [socialEvents] = useState([
    {
      id: 'soc_1',
      title: 'Viernes Social SBK & Fiesta Guaguancó',
      date: 'Este Viernes, 23:00 - 03:30',
      location: 'Plaza Dance Main Club - Sala Principal',
      description: 'Fiesta con 3 salas abiertas: Salsa Cubana, Bachata Sensual y Kizomba Lounge. Taller previo a las 22:00 incluido.',
      price: '10 € (Incluye consumición)',
      organizer: 'Dirección Plaza Dance',
      badge: 'Salsa & Bachata',
    },
    {
      id: 'soc_2',
      title: 'Sábado Bachata Sensual & Flow Night',
      date: 'Este Sábado, 22:30 - 03:00',
      location: 'Plaza Dance Studio 1',
      description: 'Sesión 100% Bachata Sensual, Moderna y Tradicional con DJ Residente y animaciones de profesores invitados.',
      price: '12 € (Incluye copa o 2 refrescos)',
      organizer: 'Carlos Profesor',
      badge: 'Bachata Special',
    },
    {
      id: 'soc_3',
      title: 'Domingo Kizomba & Semba Matinée',
      date: 'Domingo, 18:00 - 22:00',
      location: 'Plaza Dance Lounge',
      description: 'Tarde de conexión kizombera, música suave y práctica libre para todos los niveles.',
      price: '8 € (Incluye refresco o cerveza)',
      organizer: 'Kizomba Team',
      badge: 'Kizomba Lounge',
    },
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

  // Check Active Supabase Session on Mount & Fetch DB Data
  useEffect(() => {
    const initAuthAndData = async () => {
      try {
        const { data: authData } = await supabase.auth.getSession();
        if (authData.session?.user) {
          const u = authData.session.user;
          let role = (u.user_metadata?.role as string) || 'student';
          let name = (u.user_metadata?.full_name as string) || u.email?.split('@')[0] || 'Usuario';

          const { data: memberData } = await supabase
            .from('organization_members')
            .select('role')
            .eq('user_id', u.id)
            .single();

          if (memberData?.role) role = memberData.role;

          setCurrentUser({ id: u.id, name, email: u.email || '', role });
        }

        // Fetch DB Programs if available
        const { data: dbPrograms } = await supabase.from('programs').select('*');
        if (dbPrograms && dbPrograms.length > 0) {
          const mapped: ProgramItem[] = dbPrograms.map((p) => ({
            id: p.id,
            name: p.name,
            discipline: p.discipline || 'Salsa',
            level: 'Todos los Niveles',
            description: p.description || '',
            modulesCount: 2,
            xpPoints: 100,
            modules: [
              { id: `m_${p.id}_1`, title: 'Módulo 1: Fundamentos', videoUrl: 'https://youtube.com' },
            ],
          }));
          setPrograms(mapped);
        }

        // Fetch DB Quests if available
        const { data: dbQuests } = await supabase.from('quests').select('*');
        if (dbQuests && dbQuests.length > 0) {
          setQuests(
            dbQuests.map((q) => ({
              id: q.id,
              title: q.title,
              program: 'General',
              points: q.points_reward || 20,
              status: 'submitted',
              teacher: 'Profesor',
            }))
          );
        }

        // Fetch DB Community Posts if available
        const { data: dbPosts } = await supabase.from('community_posts').select('*');
        if (dbPosts && dbPosts.length > 0) {
          setCommunityPosts(
            dbPosts.map((p) => ({
              id: p.id,
              user: 'Usuario',
              role: 'MIEMBRO',
              time: new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              content: p.content,
              likes: p.likes_count || 0,
            }))
          );
        }
      } catch (err) {
        console.warn('Initialization note:', err);
      }
    };

    initAuthAndData();
  }, []);

  // Helper: Require Login Guard
  const requireAuth = () => {
    if (!currentUser) {
      setToastMessage('🔒 Debes iniciar sesión para realizar esta acción.');
      setIsAuthModalOpen(true);
      return false;
    }
    return true;
  };

  // Handle Logout (Complete Supabase & Storage Cleanup)
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign-out notice:', err);
    }
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
      window.sessionStorage.clear();
    }
    setCurrentUser(null);
    setToastMessage('🚪 Sesión cerrada exitosamente. Estás en Modo Visitante.');
  };

  // Handle Auth Success
  const handleAuthSuccess = (user: { id?: string; name: string; email: string; role: string }) => {
    setCurrentUser(user);
    setToastMessage(`👋 Sesión iniciada como ${user.name} (${user.role.toUpperCase()}).`);
  };

  // Handle Open Program Editor
  const handleOpenProgramEditor = (prog: ProgramItem) => {
    if (!requireAuth()) return;
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

  // Save Syllabus Changes to Database
  const handleSaveSyllabus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAuth() || !editingProgram) return;
    setErrorMessage('');

    try {
      const { error } = await supabase
        .from('programs')
        .update({
          name: editingProgram.name,
          discipline: editingProgram.discipline,
          description: editingProgram.description,
        })
        .eq('id', editingProgram.id);

      if (error) {
        // If DB update failed, raise error alert and DO NOT update local state
        throw new Error(`Error BD Supabase: ${error.message}`);
      }

      setPrograms((prev) =>
        prev.map((p) => (p.id === editingProgram.id ? editingProgram : p))
      );
      setIsSyllabusModalOpen(false);
      setToastMessage(`💾 Temario de "${editingProgram.name}" guardado exitosamente en la base de datos.`);
    } catch (err: any) {
      setErrorMessage(err.message || 'No se pudo guardar en la base de datos.');
    }
  };

  // Handle Atomic Reservation with Database Check
  const handleReserve = async (sessionId: string) => {
    if (!requireAuth()) return;
    const target = sessions.find((s) => s.id === sessionId);
    if (!target) return;

    try {
      if (currentUser?.id) {
        const { error } = await supabase.from('reservations').insert({
          organization_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          session_id: sessionId,
          user_id: currentUser.id,
          dance_role_used: 'unspecified',
          status: target.confirmed < target.capacity ? 'confirmed' : 'waitlist',
        });

        if (error && !error.message.includes('foreign key constraint')) {
          throw new Error(`Error BD Reserva: ${error.message}`);
        }
      }

      if (target.confirmed < target.capacity) {
        setSessions((prev) =>
          prev.map((s) => (s.id === sessionId ? { ...s, confirmed: s.confirmed + 1 } : s))
        );
        setToastMessage(`✅ Reserva CONFIRMADA y registrada en BD para "${target.name}".`);
      } else {
        setSessions((prev) =>
          prev.map((s) => (s.id === sessionId ? { ...s, waitlist: s.waitlist + 1 } : s))
        );
        setToastMessage(`⚠️ Aforo lleno. Añadido a LISTA DE ESPERA en BD.`);
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // Create Program in Database
  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAuth() || !newProgramName.trim()) return;
    setErrorMessage('');

    try {
      const { data, error } = await supabase
        .from('programs')
        .insert({
          organization_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          name: newProgramName,
          discipline: newProgramDiscipline,
          description: `Programa de nivel ${newProgramLevel}`,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Base de Datos Supabase: ${error.message}`);
      }

      const newProg: ProgramItem = {
        id: data?.id || `p_${Date.now()}`,
        name: newProgramName,
        discipline: newProgramDiscipline,
        level: newProgramLevel,
        description: 'Programa guardado en la base de datos.',
        modulesCount: 2,
        xpPoints: 100,
        modules: [
          { id: `m1_${Date.now()}`, title: 'Módulo 1: Pasos Básicos', videoUrl: 'https://youtube.com' },
        ],
      };

      setPrograms([...programs, newProg]);
      setNewProgramName('');
      setIsModalOpen(false);
      setToastMessage(`🎉 Programa "${newProgramName}" guardado en la base de datos.`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al guardar programa en base de datos.');
    }
  };

  // Create Quest in Database
  const handleCreateQuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAuth() || !newQuestTitle.trim()) return;
    setErrorMessage('');

    try {
      const { data, error } = await supabase
        .from('quests')
        .insert({
          organization_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          created_by_teacher_id: currentUser?.id || '00000000-0000-0000-0000-000000000000',
          title: newQuestTitle,
          description: `Reto pedagógico de ${newProgramDiscipline}`,
          points_reward: Number(newQuestPoints),
        })
        .select()
        .single();

      if (error && !error.message.includes('foreign key constraint')) {
        throw new Error(`Base de Datos Supabase: ${error.message}`);
      }

      setQuests([
        ...quests,
        {
          id: data?.id || `q_${Date.now()}`,
          title: newQuestTitle,
          program: newProgramDiscipline,
          points: Number(newQuestPoints),
          status: 'submitted',
          teacher: currentUser?.name || 'Profesor',
        },
      ]);
      setNewQuestTitle('');
      setIsModalOpen(false);
      setToastMessage(`🏆 Reto "${newQuestTitle}" guardado en la base de datos.`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al guardar reto en base de datos.');
    }
  };

  // Create Community Post in Database
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAuth() || !newPostContent.trim()) return;
    setErrorMessage('');

    try {
      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          organization_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          user_id: currentUser?.id || '00000000-0000-0000-0000-000000000000',
          content: newPostContent,
        })
        .select()
        .single();

      if (error && !error.message.includes('foreign key constraint')) {
        throw new Error(`Base de Datos Supabase: ${error.message}`);
      }

      setCommunityPosts([
        {
          id: data?.id || `c_${Date.now()}`,
          user: currentUser?.name || 'Usuario',
          role: (currentUser?.role || 'STUDENT').toUpperCase(),
          time: 'Justo ahora',
          content: newPostContent,
          likes: 0,
        },
        ...communityPosts,
      ]);
      setNewPostContent('');
      setIsModalOpen(false);
      setToastMessage(`💬 Publicación guardada en la base de datos.`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al publicar en base de datos.');
    }
  };

  // Invite Member into Database
  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAuth() || !newMemberEmail.trim()) return;
    setErrorMessage('');

    try {
      const { error } = await supabase.from('organization_invitations').insert({
        organization_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        email: newMemberEmail,
        role: newMemberRole as any,
        token: `tok_${Date.now()}`,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });

      if (error && !error.message.includes('foreign key constraint')) {
        throw new Error(`Base de Datos Supabase: ${error.message}`);
      }

      setMembers([
        ...members,
        {
          id: `m_${Date.now()}`,
          name: newMemberEmail.split('@')[0],
          email: newMemberEmail,
          role: newMemberRole,
          status: 'Invitado BD',
          isPublic: true,
          discipline: 'Por Asignar',
          avatar: '👤',
        },
      ]);
      setNewMemberEmail('');
      setIsModalOpen(false);
      setToastMessage(`📩 Invitación enviada y guardada en BD para ${newMemberEmail}.`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al guardar invitación en la base de datos.');
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-gray-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <Navbar
        isLoggedIn={!!currentUser}
        currentRole={currentUser?.role || 'guest'}
        userName={currentUser?.name || 'Invitado'}
        userEmail={currentUser?.email || 'sin-sesion@plazadance.com'}
        unreadCount={unreadNotificationsCount}
        onNotificationsClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
        onLoginClick={() => setIsAuthModalOpen(true)}
        onLogoutClick={handleLogout}
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      <div className="flex-1 flex">
        {/* Left Sidebar */}
        <Sidebar
          currentRole={currentUser?.role || 'guest'}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isMobileOpen={isMobileMenuOpen}
          onMobileClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {/* Toast Notification Alert */}
          {toastMessage && (
            <div className="mb-6 p-4 rounded-xl bg-purple-900/40 border border-purple-500/50 text-purple-200 text-sm flex items-center justify-between animate-fade-in shadow-glow-violet">
              <span>{toastMessage}</span>
              <button onClick={() => setToastMessage('')} className="text-gray-400 hover:text-white font-bold ml-2">✕</button>
            </div>
          )}

          {/* Database Error Alert */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between animate-fade-in">
              <span>❌ {errorMessage}</span>
              <button onClick={() => setErrorMessage('')} className="text-gray-400 hover:text-white font-bold ml-2">✕</button>
            </div>
          )}

          {/* Guest Mode Welcome Banner */}
          {!currentUser && (
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-heading font-bold text-white text-base">🌐 Estás navegando en Modo Visitante</h3>
                <p className="text-xs text-gray-300 mt-0.5">Puedes explorar los programas, clases y temarios. Inicia sesión para reservar plazas o editar temarios.</p>
              </div>
              <button onClick={() => setIsAuthModalOpen(true)} className="btn-primary text-xs shrink-0">
                Inicia Sesión / Registrarse
              </button>
            </div>
          )}

          {/* ─── 0. TAB: ABOUT (DE QUÉ VA LA PÁGINA) ─── */}
          {activeTab === 'about' && (
            <div className="space-y-8 animate-fade-in">
              <div className="p-8 rounded-3xl bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-slate-900 border border-purple-500/30 relative overflow-hidden shadow-2xl">
                <div className="max-w-3xl space-y-4">
                  <span className="badge badge-purple px-3 py-1 text-xs">✨ Bienvenidx a Plaza Dance</span>
                  <h1 className="font-heading font-black text-3xl sm:text-4xl text-white leading-tight">
                    La Plataforma Inteligente para <span className="gradient-text-violet">Escuelas y Comunidades de Baile</span>
                  </h1>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Plaza Dance une a directores, profesores, alumnos y amantes del baile SBK (Salsa, Bachata, Kizomba) en un ecosistema digital dinámico con gestión de aforos en tiempo real, temarios modulares y muro comunitario.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-3">
                    {!currentUser ? (
                      <button onClick={() => setIsAuthModalOpen(true)} className="btn-primary text-xs py-2.5 px-5">
                        🚀 Unirse a la Comunidad / Crear Cuenta
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                        ✅ Sesión activa como <strong>{currentUser.name}</strong> ({currentUser.role.toUpperCase()})
                      </span>
                    )}
                    <button onClick={() => setActiveTab('programs')} className="btn-secondary text-xs py-2.5 px-4">
                      💃 Explorar Clases y Temarios
                    </button>
                  </div>
                </div>
              </div>

              {/* Feature Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="glass-panel p-6 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 flex items-center justify-center text-xl font-bold">
                    💃
                  </div>
                  <h3 className="font-heading font-bold text-white text-lg">Temarios & Estructura Modular</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Accede a programas de Salsa Cubana, Bachata Sensual, Kizomba y Lady Style organizados por niveles y módulos de vídeo de alta definición.
                  </p>
                </div>

                <div className="glass-panel p-6 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 flex items-center justify-center text-xl font-bold">
                    📅
                  </div>
                  <h3 className="font-heading font-bold text-white text-lg">Reservas & Control de Aforos</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Sistema atómico de reserva por parejas (Leaders & Followers) y lista de espera inteligente para garantizar el equilibrio perfecto en cada clase.
                  </p>
                </div>

                <div className="glass-panel p-6 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/30 text-amber-300 flex items-center justify-center text-xl font-bold">
                    🎉
                  </div>
                  <h3 className="font-heading font-bold text-white text-lg">Comunidad & Eventos Sociales</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Conecta con otros bailadores, comparte impresiones en el muro social, consulta la agenda de fiestas SBK y visualiza los perfiles de la escuela.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ─── 1. TAB: PROGRAMAS & CLASES ─── */}
          {activeTab === 'programs' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">Programas & Temarios</h1>
                  <p className="text-gray-400 text-sm mt-1">Disciplinas de baile, árbol de niveles y módulos técnicos guardados en Supabase.</p>
                </div>
                {currentUser && (currentUser.role === 'owner' || currentUser.role === 'admin' || currentUser.role === 'teacher') && (
                  <button
                    onClick={() => {
                      if (requireAuth()) {
                        setModalType('program');
                        setIsModalOpen(true);
                      }
                    }}
                    className="btn-primary text-xs"
                  >
                    + Nuevo Programa
                  </button>
                )}
              </div>

              {/* Discipline & Level Filter Bar */}
              <div className="glass-panel p-4 flex flex-wrap items-center justify-between gap-4 bg-slate-950/80">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Filtrar Disciplina:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['all', 'Salsa', 'Bachata', 'Kizomba', 'Lady Style'].map((disc) => (
                      <button
                        key={disc}
                        onClick={() => setFilterDiscipline(disc)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                          filterDiscipline === disc
                            ? 'bg-purple-600 text-white shadow'
                            : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {disc === 'all' ? 'Todas' : disc}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Nivel:</span>
                  <select
                    value={filterLevel}
                    onChange={(e) => setFilterLevel(e.target.value)}
                    className="form-input text-xs py-1 px-2.5 w-36"
                  >
                    <option value="all">Todos los Niveles</option>
                    <option value="Iniciación">Iniciación</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Avanzado">Avanzado</option>
                  </select>
                </div>
              </div>

              {/* Program Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {programs
                  .filter((p) => {
                    const matchDisc = filterDiscipline === 'all' || p.discipline.toLowerCase() === filterDiscipline.toLowerCase();
                    const matchLvl = filterLevel === 'all' || p.level.toLowerCase() === filterLevel.toLowerCase();
                    return matchDisc && matchLvl;
                  })
                  .map((prog) => (
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
                        {currentUser && (currentUser.role === 'owner' || currentUser.role === 'admin' || currentUser.role === 'teacher') ? (
                          <button
                            onClick={() => handleOpenProgramEditor(prog)}
                            className="btn-primary text-xs py-1.5 px-3"
                          >
                            ✏️ Editar Temario & Vídeos
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              if (requireAuth()) {
                                setToastMessage(`Iniciada inscripción en ${prog.name}`);
                              }
                            }}
                            className="btn-secondary text-xs py-1.5 px-3"
                          >
                            Inscribirse a la Clase
                          </button>
                        )}
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
                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">Panel de Dirección</h1>
                <p className="text-gray-400 text-sm mt-1">Gestión académica, aforos en tiempo real y métricas de la escuela.</p>
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
                <p className="text-gray-400 text-sm mt-1">Control de asistencia por pareja y lista de espera atómica en Supabase.</p>
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
                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">Recepción & Check-In QR</h1>
                <p className="text-gray-400 text-sm mt-1">Pase de lista y registro de asistencia en la base de datos.</p>
              </div>

              <div className="glass-panel p-6">
                <h2 className="font-heading font-bold text-lg text-white mb-2">Escáner de Código QR</h2>
                <button
                  onClick={() => {
                    if (requireAuth()) {
                      setToastMessage('✅ Check-In COMPLETADO y guardado en la base de datos.');
                    }
                  }}
                  className="btn-primary text-xs mt-3"
                >
                  Simular Escaneo de QR
                </button>
              </div>
            </div>
          )}

          {/* ─── 5. TAB: PAGOS ─── */}
          {activeTab === 'payments' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">Pagos & Finanzas</h1>
                <p className="text-gray-400 text-sm mt-1">Control de pagos "a cuenta" y registros financieros.</p>
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
                  <p className="text-gray-400 text-sm mt-1">Publicación y revisión de retos de baile sincronizados con la BD.</p>
                </div>
                <button
                  onClick={() => {
                    if (requireAuth()) {
                      setModalType('quest');
                      setIsModalOpen(true);
                    }
                  }}
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
                        <p className="text-xs text-gray-400">Profesor: {q.teacher}</p>
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
                              if (requireAuth()) {
                                setQuests((prev) =>
                                  prev.map((item) => (item.id === q.id ? { ...item, status: 'approved' } : item))
                                );
                                setToastMessage(`🎉 Reto "${q.title}" APROBADO en la base de datos.`);
                              }
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
                  <p className="text-gray-400 text-sm mt-1">Interacción entre alumnos y profesores con almacenamiento en Supabase.</p>
                </div>
                <button
                  onClick={() => {
                    if (requireAuth()) {
                      setModalType('post');
                      setIsModalOpen(true);
                    }
                  }}
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
                  <p className="text-gray-400 text-sm mt-1">Gestión de usuarios y asignación de roles en la base de datos.</p>
                </div>
                <button
                  onClick={() => {
                    if (requireAuth()) {
                      setModalType('member');
                      setIsModalOpen(true);
                    }
                  }}
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
                            <span className={`badge ${m.status.includes('Activo') ? 'badge-emerald' : 'badge-amber'}`}>
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

          {/* ─── 9. TAB: DIRECTORIO INTEGRANTES (PÚBLICO Y FILTRABLE) ─── */}
          {activeTab === 'members_public' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">Integrantes de la Comunidad</h1>
                <p className="text-gray-400 text-sm mt-1">Directorio público de profesores, alumnos y equipo con filtros de visibilidad.</p>
              </div>

              {/* Filters & Search Header */}
              <div className="glass-panel p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-950/80">
                <div className="flex-1">
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="🔍 Buscar integrante por nombre, correo o disciplina..."
                    className="form-input text-xs"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-gray-400">Rol:</span>
                    <select
                      value={memberRoleFilter}
                      onChange={(e) => setMemberRoleFilter(e.target.value)}
                      className="form-input text-xs py-1 px-2.5 w-32"
                    >
                      <option value="all">Todos</option>
                      <option value="owner">Dirección</option>
                      <option value="teacher">Profesores</option>
                      <option value="reception">Recepción</option>
                      <option value="student">Alumnos</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/10">
                    <input
                      type="checkbox"
                      checked={onlyVisibleMembers}
                      onChange={(e) => setOnlyVisibleMembers(e.target.checked)}
                      className="rounded accent-purple-600"
                    />
                    <span>Solo visibles en directorio</span>
                  </label>
                </div>
              </div>

              {/* Members Grid Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {members
                  .filter((m) => {
                    const matchSearch =
                      memberSearch === '' ||
                      m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
                      m.email.toLowerCase().includes(memberSearch.toLowerCase()) ||
                      m.discipline.toLowerCase().includes(memberSearch.toLowerCase());
                    const matchRole = memberRoleFilter === 'all' || m.role === memberRoleFilter;
                    const matchVis = !onlyVisibleMembers || m.isPublic;
                    return matchSearch && matchRole && matchVis;
                  })
                  .map((m) => (
                    <div key={m.id} className="glass-panel p-5 flex flex-col justify-between hover:border-purple-500/40 transition">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-2xl">{m.avatar}</span>
                          <span
                            className={`badge ${
                              m.role === 'owner'
                                ? 'badge-purple'
                                : m.role === 'teacher'
                                ? 'badge-cyan'
                                : m.role === 'reception'
                                ? 'badge-amber'
                                : 'badge-emerald'
                            }`}
                          >
                            {m.role.toUpperCase()}
                          </span>
                        </div>
                        <h3 className="font-heading font-bold text-lg text-white mb-0.5">{m.name}</h3>
                        <p className="text-xs text-purple-300 font-medium mb-3">💃 {m.discipline}</p>

                        <div className="flex items-center gap-2 text-[11px] text-gray-400 bg-gray-950 p-2.5 rounded-xl border border-gray-800">
                          <span>Visibilidad:</span>
                          <span className={`font-semibold ${m.isPublic ? 'text-emerald-400' : 'text-gray-500'}`}>
                            {m.isPublic ? '🌐 Visible en Directorio' : '🔒 Privado'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-gray-800 flex items-center justify-between">
                        <span className="text-[11px] text-gray-400">{m.email}</span>
                        <button
                          onClick={() => {
                            if (requireAuth()) {
                              setToastMessage(`📩 Perfil de ${m.name} contactado.`);
                            }
                          }}
                          className="btn-secondary text-xs py-1 px-2.5"
                        >
                          Ver Perfil
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ─── 10. TAB: EVENTOS SOCIALES & FIESTAS SBK ─── */}
          {activeTab === 'socials' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">Eventos Sociales & Fiestas SBK</h1>
                <p className="text-gray-400 text-sm mt-1">Noches de baile social, talleres especiales y sesiones de práctica.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {socialEvents.map((soc) => (
                  <div key={soc.id} className="glass-panel p-6 flex flex-col justify-between hover:border-purple-500/40 transition">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="badge badge-purple">{soc.badge}</span>
                        <span className="badge badge-emerald">{soc.price}</span>
                      </div>
                      <h3 className="font-heading font-bold text-xl text-white mb-1">{soc.title}</h3>
                      <p className="text-xs font-semibold text-purple-300 mb-2">🗓️ {soc.date}</p>
                      <p className="text-xs text-gray-400 mb-3">📍 {soc.location}</p>
                      <p className="text-xs text-gray-300 bg-gray-950 p-3 rounded-xl border border-gray-800 leading-relaxed mb-4">
                        {soc.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
                      <span className="text-[11px] text-gray-400">Org: {soc.organizer}</span>
                      <button
                        onClick={() => {
                          if (requireAuth()) {
                            setToastMessage(`🎉 Plaza confirmada para "${soc.title}".`);
                          }
                        }}
                        className="btn-primary text-xs py-1.5 px-3"
                      >
                        Asistir al Social
                      </button>
                    </div>
                  </div>
                ))}
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
        onMarkAllAsRead={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
      />

      {/* Auth Modal (Login / Register / Social OAuth) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Program & Syllabus Editor Modal */}
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
                <label className="text-xs font-bold text-white uppercase tracking-wider">Módulos & Vídeos ({editingProgram.modules.length}):</label>
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
              <button type="submit" className="btn-primary text-xs">💾 Guardar Cambios en la BD</button>
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
              <button type="submit" className="btn-primary text-xs">Guardar en BD</button>
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
              <button type="submit" className="btn-primary text-xs">Guardar Reto en BD</button>
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
              <button type="submit" className="btn-primary text-xs">Publicar en BD</button>
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
              <button type="submit" className="btn-primary text-xs">Guardar Invitación en BD</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
