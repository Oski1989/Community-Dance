import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { AuthModal } from '@/components/modules/AuthModal';
import { NotificationDrawer } from '@/components/modules/NotificationDrawer';
import { TabType } from '@/components/layout/BottomNav';
import { Shield, Sparkles, Building2, ChevronDown, User, LogIn, Award, Users, Settings, Bell, Video, PartyPopper, DollarSign, BookOpen } from 'lucide-react';

interface HeaderProps {
  activeTab?: TabType;
  setActiveTab?: (tab: TabType) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { currentSchool, schools, setSchoolById, currentUser, profiles, notifications } = useApp();
  const [isSchoolMenuOpen, setIsSchoolMenuOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const isTeacher = currentUser.role === 'teacher';
  const isAdmin = currentUser.role === 'admin';
  const isSchool = currentUser.role === 'school';

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0B0F17]/95 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-rose-500 to-amber-400 flex items-center justify-center shadow-glow-violet scale-95 hover:scale-100 transition-all cursor-pointer">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-black text-xl text-white leading-none tracking-tight">
                Dance<span className="text-purple-400">XP</span>
              </h1>
              <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase block mt-0.5">
                Plataforma Pedagógica
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links (Visible on Desktop screens > 1024px) */}
          {setActiveTab && (
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
              {isAdmin && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                    activeTab === 'admin'
                      ? 'bg-indigo-600 text-white shadow-glow-violet'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" /> Admin
                </button>
              )}

              {(isAdmin || isSchool) && (
                <button
                  onClick={() => setActiveTab('school_panel')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                    activeTab === 'school_panel'
                      ? 'bg-purple-600 text-white shadow-glow-violet'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" /> Panel Sede
                </button>
              )}

              {(isTeacher || isAdmin) && (
                <button
                  onClick={() => setActiveTab('syllabus')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                    activeTab === 'syllabus'
                      ? 'bg-amber-500 text-slate-950 shadow-glow-gold font-black'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" /> Gestión del Programa
                </button>
              )}

              {isTeacher && (
                <>
                  <button
                    onClick={() => setActiveTab('management')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                      activeTab === 'management'
                        ? 'bg-amber-600 text-white shadow-glow-gold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" /> Alumnos
                  </button>
                  <button
                    onClick={() => setActiveTab('videos')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                      activeTab === 'videos'
                        ? 'bg-purple-600 text-white shadow-glow-violet'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" /> Inbox Zero
                  </button>
                  <button
                    onClick={() => setActiveTab('finance')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                      activeTab === 'finance'
                        ? 'bg-emerald-600 text-slate-950 shadow-glow-emerald'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <DollarSign className="w-3.5 h-3.5" /> Contabilidad
                  </button>
                  <button
                    onClick={() => setActiveTab('config')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                      activeTab === 'config'
                        ? 'bg-slate-800 text-white border border-slate-700'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Settings className="w-3.5 h-3.5" /> Ajustes
                  </button>
                </>
              )}

              {!isTeacher && !isAdmin && (
                <>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                      activeTab === 'profile'
                        ? 'bg-purple-600 text-white shadow-glow-violet'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" /> Mi Perfil
                  </button>
                  <button
                    onClick={() => setActiveTab('levels')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                      activeTab === 'levels'
                        ? 'bg-purple-600 text-white shadow-glow-violet'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" /> Niveles
                  </button>
                  <button
                    onClick={() => setActiveTab('videos')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                      activeTab === 'videos'
                        ? 'bg-purple-600 text-white shadow-glow-violet'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" /> Mis Vídeos
                  </button>
                  {currentSchool.has_social_engine && (
                    <button
                      onClick={() => setActiveTab('social')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                        activeTab === 'social'
                          ? 'bg-emerald-600 text-slate-950 shadow-glow-emerald'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <PartyPopper className="w-3.5 h-3.5" /> Victorys Social
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* User Profile, Notifications & Auth Modal Button */}
          <div className="flex items-center gap-2.5">
            {/* Notification Drawer Trigger */}
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="p-2 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 text-slate-300 hover:text-white relative transition-all"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Profile Avatar Card */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-2xl p-1.5 pr-3">
              <img
                src={currentUser.avatar_url}
                alt={currentUser.full_name}
                className="w-7 h-7 rounded-xl object-cover border border-white/10"
              />
              <div className="hidden md:block text-left">
                <span className="font-bold text-xs text-white block leading-none">{currentUser.full_name}</span>
                <div className="flex items-center gap-1 mt-1">
                  <span
                    className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded border ${
                      currentUser.role === 'admin'
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                        : currentUser.role === 'teacher'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {currentUser.role}
                  </span>

                  <span
                    className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                      currentUser.membership_status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : currentUser.membership_status === 'pending_approval'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {currentUser.membership_status}
                  </span>
                </div>
              </div>
            </div>

            {/* Auth / Account Switcher Button */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-3 py-1.5 rounded-2xl bg-purple-600/20 border border-purple-500/40 hover:bg-purple-600 text-purple-300 hover:text-white font-bold text-xs transition-all flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cuenta / Rol</span>
            </button>
          </div>
        </div>
      </header>

      {/* Auth Modal & Notification Drawer */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <NotificationDrawer isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
    </>
  );
};
