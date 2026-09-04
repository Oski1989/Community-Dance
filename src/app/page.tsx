'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav, TabType } from '@/components/layout/BottomNav';
import { StudentProfileView } from '@/components/modules/StudentProfileView';
import { LevelTreesView } from '@/components/modules/LevelTreesView';
import { AsyncFeedbackView } from '@/components/modules/AsyncFeedbackView';
import { VictorysSocialEngine } from '@/components/modules/VictorysSocialEngine';
import { FlashPropsModal } from '@/components/modules/FlashPropsModal';
import { TeacherManagementView } from '@/components/modules/TeacherManagementView';
import { TeacherConfigView } from '@/components/modules/TeacherConfigView';
import { TeacherFinanceView } from '@/components/modules/TeacherFinanceView';
import { AdminDashboardView } from '@/components/modules/AdminDashboardView';
import { TeacherSyllabusView } from '@/components/modules/TeacherSyllabusView';
import { SchoolDashboardView } from '@/components/modules/SchoolDashboardView';
import { LandingHomeView } from '@/components/modules/LandingHomeView';
import { PublicCoursesView } from '@/components/modules/PublicCoursesView';
import { useApp } from '@/context/AppContext';

export default function Home() {
  const { currentSchool, currentUser } = useApp();
  const isGuest = currentUser.id.startsWith('guest');

  const [activeTab, setActiveTab] = useState<TabType>(
    isGuest
      ? 'home'
      : currentUser.role === 'admin'
      ? 'admin'
      : currentUser.role === 'school'
      ? 'school_panel'
      : currentUser.role === 'teacher'
      ? 'management'
      : 'profile'
  );

  // Sync activeTab if currentUser role changes
  React.useEffect(() => {
    if (isGuest && activeTab !== 'social' && activeTab !== 'courses') {
      setActiveTab('home');
    } else if (currentUser.role === 'admin' && activeTab === 'profile') {
      setActiveTab('admin');
    } else if (currentUser.role === 'school') {
      if (activeTab !== 'school_panel' && activeTab !== 'management' && activeTab !== 'home' && activeTab !== 'courses') {
        setActiveTab('school_panel');
      }
    } else if (currentUser.role === 'teacher' && (activeTab === 'profile' || activeTab === 'levels')) {
      setActiveTab('management');
    }
  }, [currentUser.role, currentUser.id]);

  // Safety Guards for tab permissions:
  // 1. Social engine tab disabled if school has_social_engine is false
  if (activeTab === 'social' && !currentSchool.has_social_engine) {
    setActiveTab(isGuest ? 'home' : currentUser.role === 'admin' ? 'admin' : currentUser.role === 'teacher' ? 'syllabus' : 'profile');
  }

  // 2. Admin cannot access Inbox Zero (videos tab)
  if (activeTab === 'videos' && currentUser.role === 'admin') {
    setActiveTab('admin');
  }

  // 3. Teacher/Admin tabs allowed for Teacher or Admin only
  if ((activeTab === 'syllabus' || activeTab === 'config' || activeTab === 'finance') && (currentUser.role === 'student' || isGuest)) {
    setActiveTab(isGuest ? 'home' : 'profile');
  }

  // 4. Admin panel allowed for SuperAdmin only
  if (activeTab === 'admin' && currentUser.role !== 'admin') {
    setActiveTab(isGuest ? 'home' : 'profile');
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17] text-slate-100 selection:bg-purple-500 selection:text-white">
      {/* Header Top Bar */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 pb-28">
        {activeTab === 'home' && <LandingHomeView />}
        {activeTab === 'courses' && <PublicCoursesView />}
        {activeTab === 'profile' && (
          <StudentProfileView onNavigateToLevels={() => setActiveTab('levels')} />
        )}
        {activeTab === 'levels' && <LevelTreesView />}
        {activeTab === 'videos' && currentUser.role !== 'admin' && <AsyncFeedbackView />}
        {activeTab === 'social' && currentSchool.has_social_engine && <VictorysSocialEngine />}
        {activeTab === 'flash' && currentUser.role === 'teacher' && <FlashPropsModal />}
        {activeTab === 'school_panel' && (currentUser.role === 'school' || currentUser.role === 'admin') && (
          <SchoolDashboardView />
        )}
        {activeTab === 'syllabus' && (currentUser.role === 'teacher' || currentUser.role === 'admin') && (
          <TeacherSyllabusView />
        )}
        {activeTab === 'management' && (currentUser.role === 'teacher' || currentUser.role === 'admin' || currentUser.role === 'school') && (
          <TeacherManagementView />
        )}
        {activeTab === 'finance' && (currentUser.role === 'teacher' || currentUser.role === 'admin') && (
          <TeacherFinanceView />
        )}
        {activeTab === 'config' && (currentUser.role === 'teacher' || currentUser.role === 'admin') && (
          <TeacherConfigView />
        )}
        {activeTab === 'admin' && currentUser.role === 'admin' && <AdminDashboardView />}
      </main>

      {/* Floating Bottom Navigation Bar */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

