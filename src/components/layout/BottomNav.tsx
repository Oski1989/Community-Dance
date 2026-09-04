import React from 'react';
import { useApp } from '@/context/AppContext';
import { User, Award, Video, PartyPopper, Users, Settings, ShieldCheck, DollarSign, BookOpen, Building2, Sparkles } from 'lucide-react';

export type TabType = 'home' | 'profile' | 'levels' | 'videos' | 'social' | 'flash' | 'management' | 'syllabus' | 'finance' | 'config' | 'admin' | 'school_panel';

interface BottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const { currentSchool, currentUser } = useApp();
  const isAdmin = currentUser.role === 'admin';
  const isTeacher = currentUser.role === 'teacher';
  const isSchool = currentUser.role === 'school';
  const isStudent = currentUser.role === 'student';
  const isGuest = currentUser.id.startsWith('guest');

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0B0F17]/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-2">
      <div className="max-w-2xl mx-auto flex items-center justify-around gap-1">
        {/* Guest or Public Navigation Tabs */}
        {isGuest ? (
          <>
            <button
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'home'
                  ? 'text-purple-400 bg-purple-500/10 border border-purple-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-[10px]">Conócenos</span>
            </button>

            {currentSchool.has_social_engine && (
              <button
                onClick={() => setActiveTab('social')}
                className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === 'social'
                    ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <PartyPopper className="w-5 h-5" />
                <span className="text-[10px]">Sociales</span>
              </button>
            )}
          </>
        ) : (
          <>
            {/* Home / Conócenos Tab for Logged In Users */}
            <button
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'home'
                  ? 'text-purple-400 bg-purple-500/10 border border-purple-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-[10px]">Inicio</span>
            </button>

            {/* Admin Navigation Tabs */}
            {isAdmin && (
              <>
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-2xl text-xs font-bold transition-all ${
                    activeTab === 'admin'
                      ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-[10px]">Admin</span>
                </button>

                <button
                  onClick={() => setActiveTab('school_panel')}
                  className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-2xl text-xs font-bold transition-all ${
                    activeTab === 'school_panel'
                      ? 'text-purple-400 bg-purple-500/10 border border-purple-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                  <span className="text-[10px]">Sede</span>
                </button>
              </>
            )}

            {/* Student Navigation Tabs */}
            {isStudent && (
              <>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl text-xs font-bold transition-all ${
                    activeTab === 'profile'
                      ? 'text-purple-400 bg-purple-500/10 border border-purple-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span className="text-[10px]">Perfil</span>
                </button>

                <button
                  onClick={() => setActiveTab('levels')}
                  className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl text-xs font-bold transition-all ${
                    activeTab === 'levels'
                      ? 'text-purple-400 bg-purple-500/10 border border-purple-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Award className="w-5 h-5" />
                  <span className="text-[10px]">Niveles</span>
                </button>

                <button
                  onClick={() => setActiveTab('videos')}
                  className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl text-xs font-bold transition-all ${
                    activeTab === 'videos'
                      ? 'text-purple-400 bg-purple-500/10 border border-purple-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Video className="w-5 h-5" />
                  <span className="text-[10px]">Vídeos</span>
                </button>

                {currentSchool.has_social_engine && (
                  <button
                    onClick={() => setActiveTab('social')}
                    className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl text-xs font-bold transition-all ${
                      activeTab === 'social'
                        ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <PartyPopper className="w-5 h-5" />
                    <span className="text-[10px]">Sociales</span>
                  </button>
                )}
              </>
            )}

            {/* Teacher Navigation Tabs */}
            {isTeacher && (
              <>
                <button
                  onClick={() => setActiveTab('syllabus')}
                  className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-2xl text-xs font-bold transition-all ${
                    activeTab === 'syllabus'
                      ? 'text-purple-400 bg-purple-500/10 border border-purple-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BookOpen className="w-5 h-5" />
                  <span className="text-[10px]">Programa</span>
                </button>

                <button
                  onClick={() => setActiveTab('management')}
                  className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-2xl text-xs font-bold transition-all ${
                    activeTab === 'management'
                      ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span className="text-[10px]">Alumnos</span>
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
