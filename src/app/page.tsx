'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/ui/Navbar';
import { Sidebar } from '@/components/ui/Sidebar';
import { StatCard, Modal } from '@/components/ui/StatCard';

export default function HomePage() {
  const [currentRole, setCurrentRole] = useState<string>('owner');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<string>('');

  // Sample State Data for Dynamic UI Testing
  const [programs] = useState([
    { id: 'p1', name: 'Salsa Cubana y Rueda de Casino', discipline: 'Salsa', level: 'Intermedio' },
    { id: 'p2', name: 'Bachata Sensual & Flow', discipline: 'Bachata', level: 'Avanzado' },
    { id: 'p3', name: 'Kizomba Fusion', discipline: 'Kizomba', level: 'Iniciación' },
  ]);

  const [sessions, setSessions] = useState([
    { id: 's1', name: 'Salsa Cubana Nivel 2', time: 'Hoy 19:00 - 20:00', confirmed: 14, capacity: 16, leaders: 7, followers: 7, waitlist: 2 },
    { id: 's2', name: 'Bachata Sensual Parejas', time: 'Hoy 20:00 - 21:00', confirmed: 18, capacity: 18, leaders: 9, followers: 9, waitlist: 4 },
    { id: 's3', name: 'Kizomba Iniciación', time: 'Mañana 18:30 - 19:30', confirmed: 8, capacity: 14, leaders: 4, followers: 4, waitlist: 0 },
  ]);

  const [quests, setQuests] = useState([
    { id: 'q1', title: 'Paso Básico Salsa en 8 Tiempos', program: 'Salsa Cubana', points: 20, status: 'approved', teacher: 'Carlos Pro' },
    { id: 'q2', title: 'Onda Sensual Bachata sin Perder Ritmo', program: 'Bachata Sensual', points: 30, status: 'submitted', teacher: 'Laura Dance' },
    { id: 'q3', title: 'Saida Esquerda Kizomba', program: 'Kizomba', points: 15, status: 'in_progress', teacher: 'Carlos Pro' },
  ]);

  const [communityPosts, setCommunityPosts] = useState([
    { id: 'c1', user: 'Elena Gómez', role: 'Alumno', time: 'Hace 2 horas', content: '¡Increíble la clase de Bachata Sensual de ayer! 🔥 ¿Quién viene al social del viernes?', likes: 12 },
    { id: 'c2', user: 'Carlos Profesor', role: 'Profesor', time: 'Hace 5 horas', content: 'Recordatorio a los alumnos de Salsa Intermedio: Ya tenéis activo el nuevo Reto de Rueda de Casino en la sección de Quests 💃', likes: 24 },
  ]);

  const [newPostContent, setNewPostContent] = useState('');
  const [reservationMessage, setReservationMessage] = useState('');

  // Handle Quick Reservation Simulation (Atomic Concurrency Rule Test UI)
  const handleReserve = (sessionId: string) => {
    const target = sessions.find((s) => s.id === sessionId);
    if (!target) return;

    if (target.confirmed < target.capacity) {
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, confirmed: s.confirmed + 1 } : s))
      );
      setReservationMessage(`✅ Reserva CONFIRMADA para "${target.name}". ¡Plaza asegurada!`);
    } else {
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, waitlist: s.waitlist + 1 } : s))
      );
      setReservationMessage(`⚠️ Aforo lleno. Has sido añadido a la LISTA DE ESPERA en Posición #${target.waitlist + 1}.`);
    }
  };

  // Handle Post Creation
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    setCommunityPosts([
      {
        id: `c_${Date.now()}`,
        user: 'Óscar Admin',
        role: currentRole.toUpperCase(),
        time: 'Justo ahora',
        content: newPostContent,
        likes: 0,
      },
      ...communityPosts,
    ]);
    setNewPostContent('');
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-gray-100 flex flex-col">
      {/* Top Navigation */}
      <Navbar currentRole={currentRole} onRoleChange={(r) => { setCurrentRole(r); setActiveTab('dashboard'); }} />

      <div className="flex-1 flex">
        {/* Left Sidebar */}
        <Sidebar currentRole={currentRole} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main Content View Container */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {/* Global Toast Message */}
          {reservationMessage && (
            <div className="mb-6 p-4 rounded-xl bg-purple-900/40 border border-purple-500/50 text-purple-200 text-sm flex items-center justify-between animate-fade-in">
              <span>{reservationMessage}</span>
              <button onClick={() => setReservationMessage('')} className="text-gray-400 hover:text-white">✕</button>
            </div>
          )}

          {/* ─── ROLE: OWNER / ADMIN DASHBOARD ─── */}
          {(currentRole === 'owner' || currentRole === 'admin') && activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h1 className="font-heading font-extrabold text-3xl text-white">Panel de Dirección</h1>
                <p className="text-gray-400 text-sm mt-1">Gestión académica, aforos en tiempo real, facturación "a cuenta" y métricas de la escuela.</p>
              </div>

              {/* KPI Stat Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard title="Alumnos Activos" value="248" subtitle="En 14 grupos semanales" icon="👥" trend="+12%" trendUp={true} />
                <StatCard title="Ocupación de Aforos" value="89%" subtitle="182 plazas reservadas de 204" icon="📊" trend="+5%" trendUp={true} />
                <StatCard title="Recaudación Mes" value="14.850 €" subtitle="Cobros totales + 'A cuenta'" icon="💳" trend="+18%" trendUp={true} />
                <StatCard title="Pendiente de Cobro" value="620 €" subtitle="8 alumnos con saldo parcial" icon="⚠️" trend="-4%" trendUp={false} />
              </div>

              {/* Live Session Capacity Overview */}
              <div className="glass-panel p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-heading font-bold text-xl text-white">Próximas Clases y Aforos Atómicos</h2>
                    <p className="text-xs text-gray-400">Control transaccional contra sobreventas (Líderes / Seguidores)</p>
                  </div>
                  <button
                    onClick={() => { setModalType('session'); setIsModalOpen(true); }}
                    className="btn-primary text-xs"
                  >
                    + Nueva Clase
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {sessions.map((sess) => (
                    <div key={sess.id} className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 flex flex-col justify-between hover:border-purple-500/40 transition">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="badge badge-purple">{sess.time}</span>
                          <span className="text-xs text-gray-400 font-mono">ID: {sess.id}</span>
                        </div>
                        <h3 className="font-heading font-bold text-lg text-white mb-2">{sess.name}</h3>

                        {/* Capacity Progress Bar */}
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

                        {/* Role Breakdown */}
                        <div className="flex items-center justify-between text-xs text-gray-400 bg-gray-950 p-2.5 rounded-xl border border-gray-800">
                          <span>🕺 Líderes: <strong className="text-white">{sess.leaders}</strong></span>
                          <span>💃 Seguidores: <strong className="text-white">{sess.followers}</strong></span>
                          <span>⏳ Lista Espera: <strong className="text-amber-400">{sess.waitlist}</strong></span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleReserve(sess.id)}
                        className="mt-4 w-full py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/30 transition text-xs font-semibold"
                      >
                        Simular Reserva Atómica
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── ROLE: TEACHER PORTAL ─── */}
          {(currentRole === 'teacher' || (currentRole === 'owner' && activeTab === 'quests')) && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h1 className="font-heading font-extrabold text-3xl text-white">Portal del Profesor</h1>
                <p className="text-gray-400 text-sm mt-1">Gestión descentralizada de programas, revisión de retos por disciplina y paso de lista.</p>
              </div>

              {/* Teacher Quests Inbox */}
              <div className="glass-panel p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-heading font-bold text-xl text-white">Retos y Entregas de Alumnos</h2>
                    <p className="text-xs text-gray-400">Revisa pruebas en vídeo y otorga puntos comunitarios</p>
                  </div>
                  <button
                    onClick={() => { setModalType('quest'); setIsModalOpen(true); }}
                    className="btn-primary text-xs"
                  >
                    + Crear Reto
                  </button>
                </div>

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
                              setQuests((prev) =>
                                prev.map((item) => (item.id === q.id ? { ...item, status: 'approved' } : item))
                              );
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

          {/* ─── ROLE: RECEPTION & CHECK-IN ─── */}
          {(currentRole === 'reception' || (currentRole === 'owner' && activeTab === 'attendance')) && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h1 className="font-heading font-extrabold text-3xl text-white">Recepción & Check-In QR</h1>
                <p className="text-gray-400 text-sm mt-1">Lector de código QR en puerta, cobros parciales "a cuenta" y marcas de asistencia.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* QR Check-In Terminal Simulator */}
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
                    onClick={() => setReservationMessage('✅ Check-In COMPLETADO: Elena Gómez (Salsa Cubana - 19:00)')}
                    className="mt-6 btn-primary w-full justify-center"
                  >
                    Simular Lectura QR Exitosa
                  </button>
                </div>

                {/* Partial Payments "A Cuenta" Collector */}
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
                          onClick={() => setReservationMessage('💶 Pago "a cuenta" registrado: 40€ añadidos. Pendiente: 0€ (COMPLETADO)')}
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

          {/* ─── ROLE: STUDENT PORTAL ─── */}
          {(currentRole === 'student' || activeTab === 'community') && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h1 className="font-heading font-extrabold text-3xl text-white">Portal del Alumno & Comunidad</h1>
                <p className="text-gray-400 text-sm mt-1">Tus clases reservadas, saldo de bonos, retos conseguidos y feed de la escuela.</p>
              </div>

              {/* Student Credits & Feed */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Active Passes & Credits */}
                <div className="glass-panel p-6 space-y-4">
                  <h2 className="font-heading font-bold text-lg text-white">Mis Bonos Activos</h2>
                  <div className="p-4 rounded-xl bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/30">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-white text-sm">Bono 10 Clases Salsa/Bachata</span>
                      <span className="badge badge-emerald">Activo</span>
                    </div>
                    <p className="text-3xl font-black text-white my-1">6 <span className="text-xs font-normal text-purple-200">créditos restantes</span></p>
                    <p className="text-xs text-gray-300">Caduca en: 24 días</p>
                  </div>
                </div>

                {/* Community Feed */}
                <div className="md:col-span-2 glass-panel p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-heading font-bold text-lg text-white">Muro Social de la Escuela</h2>
                    <button
                      onClick={() => { setModalType('post'); setIsModalOpen(true); }}
                      className="btn-primary text-xs"
                    >
                      + Publicar
                    </button>
                  </div>

                  <div className="space-y-4">
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
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal Dialog Container */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalType === 'post' ? 'Nueva Publicación' : 'Crear Elemento'}>
        {modalType === 'post' ? (
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Mensaje para la Comunidad</label>
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Escribe tu mensaje o duda sobre las clases..."
                className="form-input h-28 resize-none"
                required
              ></textarea>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary text-xs">Cancelar</button>
              <button type="submit" className="btn-primary text-xs">Publicar</button>
            </div>
          </form>
        ) : (
          <div className="text-center py-4 space-y-3">
            <p className="text-sm text-gray-300">Formulario listo para guardar cambios vía API REST multi-tenant.</p>
            <button onClick={() => setIsModalOpen(false)} className="btn-primary text-xs">Cerrar</button>
          </div>
        )}
      </Modal>
    </div>
  );
}
