'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Profile,
  School,
  Discipline,
  LevelTree,
  LevelNode,
  Submission,
  Quest,
  QuestSubmission,
  Reward,
  FlashProp,
  Redemption,
  DanceClass,
  Role,
  MembershipStatus,
  WeeklySocial,
  WebConfig,
} from '@/types/database';
import {
  INITIAL_PROFILES,
  INITIAL_SCHOOLS,
  INITIAL_CLASSES,
  INITIAL_DISCIPLINES,
  INITIAL_LEVEL_TREES,
  INITIAL_SUBMISSIONS,
  INITIAL_FLASH_PROPS,
  INITIAL_QUESTS,
  INITIAL_QUEST_SUBMISSIONS,
  INITIAL_REWARDS,
  INITIAL_REDEMPTIONS,
} from '@/lib/mockData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

interface NotificationToast {
  id: string;
  title: string;
  message: string;
  type: 'xp' | 'rhythm' | 'badge' | 'info';
  read?: boolean;
  created_at?: string;
}

interface AppContextType {
  // Current user & state
  currentUser: Profile;
  profiles: Profile[];
  currentSchool: School;
  schools: School[];
  classes: DanceClass[];
  disciplines: Discipline[];
  levelTrees: LevelTree[];
  submissions: Submission[];
  quests: Quest[];
  questSubmissions: QuestSubmission[];
  rewards: Reward[];
  redemptions: Redemption[];
  flashProps: FlashProp[];
  webConfig: WebConfig;
  updateWebConfig: (updates: Partial<WebConfig>) => void;

  // Points & Streaks
  studentXP: number;
  studentRhythmPoints: number;
  victoryStreakWeeks: number;

  // Notifications
  notifications: NotificationToast[];
  addNotification: (title: string, message: string, type?: NotificationToast['type']) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;

  // Navigation & Role Switch
  setSchoolById: (schoolId: string) => void;
  setCurrentUserById: (userId: string) => void;
  
  // Auth & Student Membership Management
  registerUser: (fullName: string, email: string, phone: string, disciplinePreference: string, userId?: string) => void;
  loginUser: (email: string) => boolean;
  logoutUser: () => void;
  requestActivation: (paymentNote: string, receiptUrl?: string) => void;
  updateStudentStatus: (studentId: string, status: MembershipStatus) => void;
  bulkUpdateStudentStatus: (studentIds: string[], status: MembershipStatus) => void;
  updateStudentPayingStatus: (studentId: string, isPaying: boolean) => void;
  updateUserRole: (userId: string, newRole: Role) => void;
  updateSchoolConfig: (schoolId: string, updates: Partial<School>) => void;
  createClass: (name: string, discipline: string, schedule: string, location: string) => void;
  toggleRankingsPublic: (schoolId: string) => void;
  createQuest: (
    title: string,
    rewardPoints: number,
    description: string,
    disciplineId?: string,
    creatorType?: 'teacher' | 'school',
    rewardType?: 'rhythm_points' | 'school_reward',
    rewardText?: string
  ) => void;
  toggleQuestActive: (questId: string) => void;
  requestQuestPoints: (questId: string) => void;
  approveQuestSubmission: (submissionId: string) => void;
  rejectQuestSubmission: (submissionId: string) => void;
  generateEventQR: (title: string, code: string, points: number) => void;
  scanEventQR: (scannedCode: string) => { success: boolean; message: string };

  // Gamification & Feedback
  submitVideo: (nodeId: string, videoUrl: string) => void;
  gradeSubmission: (
    submissionId: string,
    status: 'approved' | 'rejected',
    xpAwarded: number,
    drawingData?: any,
    audioUrl?: string,
    rhythmPointsUsed?: number
  ) => void;
  sendFlashProp: (studentId: string, title: string, xp: number) => void;
  performCheckIn: (coords?: { lat: number; lng: number }) => { success: boolean; message: string };
  claimQuest: (questId: string) => void;
  redeemReward: (rewardId: string) => Redemption | null;
  markRedemptionUsed: (redemptionId: string) => void;

  // Student Course Enrollment & Request with Receipt
  toggleEnrollDiscipline: (disciplineId: string) => void;
  requestCourseEnrollment: (disciplineId: string, receiptUrl?: string, note?: string) => void;
  approveCourseEnrollment: (studentId: string, disciplineId: string) => void;
  rejectCourseEnrollment: (studentId: string, disciplineId: string) => void;
  toggleRankingPrivacy: () => void;

  // Teacher Profile & Program Management
  updateProfile: (profileId: string, updates: Partial<Profile>) => void;
  createDiscipline: (name: string, styleTag?: string, description?: string, targetAudience?: string, bpm?: string) => void;
  updateDiscipline: (disciplineId: string, updates: Partial<Discipline>) => void;
  deleteDiscipline: (disciplineId: string) => void;
  requestProgramCollaboration: (disciplineId: string, targetTeacherId: string) => void;
  acceptProgramCollaboration: (disciplineId: string) => void;
  rejectProgramCollaboration: (disciplineId: string) => void;
  toggleLinkSchoolToProgram: (disciplineId: string, schoolId: string) => void;

  // Syllabus & Level Management (Teacher / Admin)
  createLevelTree: (disciplineId: string, levelName: string) => void;
  updateLevelTree: (treeId: string, levelName: string) => void;
  deleteLevelTree: (treeId: string) => void;
  addSyllabusSection: (treeId: string, sectionTitle: string) => void;
  updateSyllabusSection: (treeId: string, sectionId: string, newTitle: string) => void;
  deleteSyllabusSection: (treeId: string, sectionId: string) => void;
  addSyllabusItem: (treeId: string, sectionId: string, title: string, description: string, xp: number, videoSample?: string) => void;
  updateSyllabusItem: (treeId: string, sectionId: string, itemId: string, updates: Partial<LevelNode>) => void;
  deleteSyllabusItem: (treeId: string, sectionId: string, itemId: string) => void;
  reorderSyllabusSection: (treeId: string, sectionId: string, direction: 'up' | 'down') => void;
  reorderSyllabusItem: (treeId: string, sectionId: string, itemId: string, direction: 'up' | 'down') => void;
  applyPresetSyllabusTemplate: (disciplineId: string) => void;

  // School Weekly Social Events Publishing & Limits
  weeklySocials: WeeklySocial[];
  createWeeklySocial: (title: string, dayOfWeek: string, time: string, location: string, description: string, bannerUrl?: string) => void;
  deleteWeeklySocial: (socialId: string) => void;
  updateSchoolMonthlyEventLimit: (schoolId: string, limit: number) => void;
  deleteQuest: (questId: string) => void;

  // Granular Ranking Privacy Toggles
  toggleRankingPrivacyGranular: (type: 'technical' | 'rhythm' | 'streak') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const GUEST_PROFILE: Profile = {
  id: 'guest-visitor',
  full_name: 'Invitado',
  email: 'invitado@dance.com',
  role: 'student',
  membership_status: 'inactive',
  avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
  xp: 0,
  rhythm_points: 0,
  victory_streak_weeks: 0,
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    if (typeof window !== 'undefined') {
      const savedProfiles = localStorage.getItem('dancexp_all_profiles_data');
      if (savedProfiles) {
        try {
          const parsed = JSON.parse(savedProfiles);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch (e) {}
      }
    }
    return INITIAL_PROFILES;
  });
  
  // Persisted current active user state
  const [currentUser, setCurrentUser] = useState<Profile>(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('dancexp_active_user_data');
      if (savedUser) {
        try {
          return JSON.parse(savedUser);
        } catch (e) {
          console.error('Error parsing stored session:', e);
        }
      }
    }
    return GUEST_PROFILE;
  });

  const updateCurrentUserState = (user: Profile) => {
    setCurrentUser(user);
    if (typeof window !== 'undefined') {
      if (user.id.startsWith('guest')) {
        localStorage.removeItem('dancexp_active_user_data');
      } else {
        localStorage.setItem('dancexp_active_user_data', JSON.stringify(user));
      }
    }
  };

  const [schools, setSchools] = useState<School[]>(INITIAL_SCHOOLS);
  const [currentSchool, setCurrentSchool] = useState<School>(INITIAL_SCHOOLS[0]);
  const [classes, setClasses] = useState<DanceClass[]>(INITIAL_CLASSES);
  const [disciplines, setDisciplines] = useState<Discipline[]>(INITIAL_DISCIPLINES);
  const [levelTrees, setLevelTrees] = useState<LevelTree[]>(INITIAL_LEVEL_TREES);
  const [submissions, setSubmissions] = useState<Submission[]>(INITIAL_SUBMISSIONS);
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [questSubmissions, setQuestSubmissions] = useState<QuestSubmission[]>(INITIAL_QUEST_SUBMISSIONS);
  const [rewards, setRewards] = useState<Reward[]>(INITIAL_REWARDS);
  const [redemptions, setRedemptions] = useState<Redemption[]>(INITIAL_REDEMPTIONS);
  const [flashProps, setFlashProps] = useState<FlashProp[]>(INITIAL_FLASH_PROPS);

  const [webConfig, setWebConfig] = useState<WebConfig>(() => {
    if (typeof window !== 'undefined') {
      const savedConfig = localStorage.getItem('dancexp_web_config');
      if (savedConfig) {
        try {
          return JSON.parse(savedConfig);
        } catch (e) {}
      }
    }
    return {
      app_name: 'DanceXP',
      tagline: 'Academia Oficial & Plataforma de Baile',
      hero_title: 'Aprende a Bailar Salsa, Bachata y Más',
      hero_subtitle: 'Formación pedagógica estructurada, temarios graduales y la mejor experiencia social de baile.',
      logo_url: '',
      favicon_url: '',
      pwa_app_name: 'DanceXP WebApp',
      contact_phone: '+34 600 000 000',
      contact_email: 'info@dancexp.app',
      instagram_url: 'https://instagram.com',
      youtube_url: 'https://youtube.com',
    };
  });

  const updateWebConfig = (updates: Partial<WebConfig>) => {
    setWebConfig((prev) => {
      const newConfig = { ...prev, ...updates };
      if (typeof window !== 'undefined') {
        localStorage.setItem('dancexp_web_config', JSON.stringify(newConfig));
      }
      return newConfig;
    });
    addNotification('Configuración Web Guardada ⚙️', 'Los títulos, logos y ajustes de la web han sido actualizados.', 'info');
  };
  const [weeklySocials, setWeeklySocials] = useState<WeeklySocial[]>([
    {
      id: 'ws-1',
      school_id: 'school-1',
      title: 'Social de Salsa & Bachata Victorys',
      day_of_week: 'Viernes',
      time: '22:00h - 02:30h',
      location: 'Sala Victorys Palma',
      description: 'Música 100% baile social con DJ residente. Entrada reducida para alumnos acreditados.',
      banner_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'ws-2',
      school_id: 'school-1',
      title: 'Tardeo de Rueda de Casino & SBK',
      day_of_week: 'Domingos',
      time: '18:30h - 22:00h',
      location: 'Terraza Victorys Beach',
      description: 'Prácticas libres de Rueda de Casino y sesión social SBK.',
      banner_url: 'https://images.unsplash.com/photo-1545128485-c400e7702796?w=600&auto=format&fit=crop&q=80',
    },
  ]);

  const createWeeklySocial = (
    title: string,
    dayOfWeek: string,
    time: string,
    location: string,
    description: string,
    bannerUrl?: string
  ) => {
    const newSocial: WeeklySocial = {
      id: `ws-${Date.now()}`,
      school_id: currentSchool.id,
      title,
      day_of_week: dayOfWeek,
      time,
      location,
      description,
      banner_url: bannerUrl || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
      created_at: new Date().toISOString(),
    };
    setWeeklySocials([newSocial, ...weeklySocials]);
    addNotification('Social Publicado 🎉', `"${title}" ya está anunciado en el tablón de la escuela.`, 'info');
  };

  const deleteWeeklySocial = (socialId: string) => {
    setWeeklySocials(weeklySocials.filter((s) => s.id !== socialId));
    addNotification('Social Eliminado 🗑️', 'El evento fue retirado del tablón.', 'info');
  };

  // Supabase Data Sync & Auth State Listener
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    // Fetch initial Supabase data
    const fetchSupabaseData = async () => {
      try {
        const { data: dbProfiles } = await supabase.from('profiles').select('*');
        setProfiles((prev) => {
          const profilesList = (dbProfiles || []) as Profile[];
          const merged = [...profilesList];
          prev.forEach((p) => {
            if (!merged.some((m) => m.id === p.id || m.email.toLowerCase() === p.email.toLowerCase())) {
              merged.push(p);
            }
          });
          if (typeof window !== 'undefined') {
            localStorage.setItem('dancexp_all_profiles_data', JSON.stringify(merged));
          }
          return merged;
        });

        // Restore current active user from latest merged profiles list
        if (typeof window !== 'undefined') {
          const savedUser = localStorage.getItem('dancexp_active_user_data');
          if (savedUser) {
            try {
              const parsed = JSON.parse(savedUser);
              if (parsed && parsed.id) {
                updateCurrentUserState(parsed);
              }
            } catch (e) {}
          }
        }

        const { data: dbDisciplines } = await supabase.from('disciplines').select('*');
        if (dbDisciplines && dbDisciplines.length > 0) {
          setDisciplines(dbDisciplines as Discipline[]);
        }

        const { data: dbLevelTrees } = await supabase.from('level_trees').select('*');
        if (dbLevelTrees && dbLevelTrees.length > 0) {
          setLevelTrees(dbLevelTrees as LevelTree[]);
        }

        const { data: dbSchools } = await supabase.from('schools').select('*');
        if (dbSchools && dbSchools.length > 0) {
          setSchools(dbSchools as School[]);
          setCurrentSchool(dbSchools[0] as School);
        }
      } catch (err) {
        console.error('Error loading Supabase data:', err);
      }
    };

    fetchSupabaseData();

    // Listen to Supabase Auth State Changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userProfile) {
          updateCurrentUserState(userProfile as Profile);
        }
      } else if (event === 'SIGNED_OUT') {
        updateCurrentUserState(GUEST_PROFILE);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Student Gamification stats (defaults to 0 for real production users)
  const [studentXP, setStudentXP] = useState<number>(currentUser?.xp ?? 0);
  const [studentRhythmPoints, setStudentRhythmPoints] = useState<number>(currentUser?.rhythm_points ?? 0);
  const [victoryStreakWeeks, setVictoryStreakWeeks] = useState<number>(currentUser?.victory_streak_weeks ?? 0);

  // Synchronize gamification stats whenever currentUser changes
  useEffect(() => {
    setStudentXP(currentUser?.xp ?? 0);
    setStudentRhythmPoints(currentUser?.rhythm_points ?? 0);
    setVictoryStreakWeeks(currentUser?.victory_streak_weeks ?? 0);
  }, [currentUser?.id, currentUser?.xp, currentUser?.rhythm_points, currentUser?.victory_streak_weeks]);

  // Toast Notifications
  const [notifications, setNotifications] = useState<NotificationToast[]>([]);

  // Request quest points (Student initiates quest claim -> Pending Teacher Approval)
  const requestQuestPoints = (questId: string) => {
    const targetQuest = quests.find((q) => q.id === questId);
    if (!targetQuest) return;

    // Check if already submitted or approved
    const existing = questSubmissions.find(
      (qs) => qs.quest_id === questId && qs.student_id === currentUser.id && qs.status === 'pending'
    );
    if (existing) {
      addNotification('Solicitud Ya Enviada ⏳', 'Tu solicitud está en espera de revisión del profesor', 'info');
      return;
    }

    const newSub: QuestSubmission = {
      id: `qsub-${Date.now()}`,
      quest_id: questId,
      student_id: currentUser.id,
      student_name: currentUser.full_name,
      quest_title: targetQuest.title,
      reward_points: targetQuest.reward_points,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    setQuestSubmissions((prev) => [newSub, ...prev]);
    addNotification(
      'Solicitud de Desafío Enviada 📩',
      `El profesor revisará tu participación en "${targetQuest.title}" para otorgar +${targetQuest.reward_points} Puntos.`,
      'rhythm'
    );
  };

  // Approve Quest Submission (Teacher action)
  const approveQuestSubmission = (submissionId: string) => {
    const sub = questSubmissions.find((qs) => qs.id === submissionId);
    if (!sub || sub.status !== 'pending') return;

    setQuestSubmissions((prev) =>
      prev.map((qs) => (qs.id === submissionId ? { ...qs, status: 'approved' } : qs))
    );

    // Mark quest completed if for currentUser
    setQuests((prev) =>
      prev.map((q) => (q.id === sub.quest_id ? { ...q, completed: true } : q))
    );

    // Grant points
    if (sub.student_id === currentUser.id) {
      setStudentRhythmPoints((prev) => prev + sub.reward_points);
    }

    addNotification(
      'Desafío Aprobado! 🎉',
      `Se otorgaron +${sub.reward_points} Puntos a ${sub.student_name} por "${sub.quest_title}"`,
      'rhythm'
    );
  };

  // Reject Quest Submission (Teacher action)
  const rejectQuestSubmission = (submissionId: string) => {
    setQuestSubmissions((prev) =>
      prev.map((qs) => (qs.id === submissionId ? { ...qs, status: 'rejected' } : qs))
    );
    addNotification('Solicitud Rechazada', 'Se ha denegado la solicitud de puntos por desafío.', 'info');
  };

  const createClass = (name: string, discipline: string, schedule: string, location: string) => {
    const newClass: DanceClass = {
      id: `class-${Date.now()}`,
      school_id: currentSchool.id,
      teacher_id: currentUser.id,
      name,
      discipline,
      schedule,
      location,
      student_count: 0,
    };
    setClasses((prev) => [newClass, ...prev]);
    addNotification('Clase Creada 💃', `Nueva clase "${name}" agregada a ${currentSchool.name}`, 'info');
  };

  const toggleRankingsPublic = (schoolId: string) => {
    setSchools((prev) =>
      prev.map((s) => (s.id === schoolId ? { ...s, is_rankings_public: !s.is_rankings_public } : s))
    );
    if (currentSchool.id === schoolId) {
      setCurrentSchool((prev) => ({ ...prev, is_rankings_public: !prev.is_rankings_public }));
    }
    const updatedStatus = !currentSchool.is_rankings_public ? 'PÚBLICO' : 'PRIVADO';
    addNotification('Visibilidad de Ranking', `El Ranking ahora es ${updatedStatus} para los alumnos`, 'info');
  };

  const addNotification = (title: string, message: string, type: NotificationToast['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotif: NotificationToast = {
      id,
      title,
      message,
      type,
      read: false,
      created_at: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const setSchoolById = (schoolId: string) => {
    const found = schools.find((s) => s.id === schoolId);
    if (found) {
      setCurrentSchool(found);
      addNotification('Sede Cambiada', `Navegando en ${found.name}`, 'info');
    }
  };

  const setCurrentUserById = (userId: string) => {
    const user = profiles.find((p) => p.id === userId);
    if (user) {
      updateCurrentUserState(user);
      addNotification(
        'Usuario Alternado',
        `Sesión activa como: ${user.full_name} (${user.role.toUpperCase()} - Status: ${user.membership_status})`,
        'info'
      );
    }
  };

  // Auth & Student Registration
  const registerUser = (fullName: string, email: string, phone: string, disciplinePreference: string, userId?: string) => {
    const idToUse = userId || `user-${Date.now()}`;
    const newProfile: Profile = {
      id: idToUse,
      full_name: fullName,
      email: email.toLowerCase(),
      role: 'student',
      membership_status: 'inactive', // Default inactive upon registration!
      phone,
      discipline_preference: disciplinePreference,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      xp: 0,
      rhythm_points: 0,
      victory_streak_weeks: 0,
    };

    setProfiles((prev) => {
      const exists = prev.some((p) => p.id === idToUse || p.email.toLowerCase() === email.toLowerCase());
      const updated = exists
        ? prev.map((p) => (p.id === idToUse || p.email.toLowerCase() === email.toLowerCase() ? { ...p, ...newProfile } : p))
        : [...prev, newProfile];

      if (typeof window !== 'undefined') {
        localStorage.setItem('dancexp_all_profiles_data', JSON.stringify(updated));
      }
      return updated;
    });

    updateCurrentUserState(newProfile);

    if (isSupabaseConfigured()) {
      supabase.from('profiles').upsert(newProfile).then();
    }

    addNotification(
      'Registro Exitoso 🎉',
      'Tu cuenta de alumno ha sido creada correctamente.',
      'info'
    );
  };

  const loginUser = (email: string): boolean => {
    const found = profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
    if (found) {
      updateCurrentUserState(found);
      addNotification('Sesión Iniciada', `Bienvenido de nuevo, ${found.full_name}`, 'info');
      return true;
    }
    return false;
  };

  const logoutUser = () => {
    if (isSupabaseConfigured()) {
      supabase.auth.signOut().then();
    }
    updateCurrentUserState(GUEST_PROFILE);
    addNotification('Sesión Cerrada 🔒', 'Has cerrado tu sesión de usuario correctamente.', 'info');
  };

  // Student Activation Request (with Bizum receipt)
  const requestActivation = (paymentNote: string, receiptUrl?: string) => {
    const updatedUser: Profile = {
      ...currentUser,
      membership_status: 'pending_approval',
      payment_note: paymentNote,
      payment_receipt_url: receiptUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80',
    };

    setProfiles((prev) => prev.map((p) => (p.id === currentUser.id ? updatedUser : p)));
    updateCurrentUserState(updatedUser);
    addNotification(
      'Solicitud Enviada 📩',
      'Tu comprobante de pago ha sido enviado al Profesor para su revisión y alta.',
      'info'
    );
  };

  // Teacher / Admin: Activate or Deactivate any student
  const updateStudentStatus = (studentId: string, status: MembershipStatus) => {
    setProfiles((prev) =>
      prev.map((p) =>
        p.id === studentId
          ? {
              ...p,
              membership_status: status,
              membership_start_date: status === 'active' ? new Date().toISOString() : p.membership_start_date,
            }
          : p
      )
    );
    if (currentUser.id === studentId) {
      updateCurrentUserState({
        ...currentUser,
        membership_status: status,
        membership_start_date: status === 'active' ? new Date().toISOString() : currentUser.membership_start_date,
      });
    }

    const student = profiles.find((p) => p.id === studentId);
    const actionText = status === 'active' ? 'ALTA (Activado)' : status === 'inactive' ? 'BAJA (Inactivado)' : 'Pendiente';
    addNotification('Estado de Membresía Actualizado', `${student?.full_name}: ${actionText}`, 'info');
  };

  // Bulk update student statuses (Alta Masiva / Baja Masiva)
  const bulkUpdateStudentStatus = (studentIds: string[], status: MembershipStatus) => {
    setProfiles((prev) =>
      prev.map((p) =>
        studentIds.includes(p.id)
          ? {
              ...p,
              membership_status: status,
              membership_start_date: status === 'active' ? new Date().toISOString() : p.membership_start_date,
            }
          : p
      )
    );
    const actionText = status === 'active' ? 'Altas Procesadas' : 'Bajas Procesadas';
    addNotification(`Acción Masiva Completada ⚡`, `${studentIds.length} Alumnos actualizados a ${actionText}`, 'badge');
  };

  // Toggle student paying status (paying vs scholarship/courtesy)
  const updateStudentPayingStatus = (studentId: string, isPaying: boolean) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === studentId ? { ...p, is_paying: isPaying } : p))
    );
    const student = profiles.find((p) => p.id === studentId);
    addNotification(
      'Membresía Finanzas Actualizada',
      `${student?.full_name}: ${isPaying ? 'Alumno Pagador' : 'Beca / Cortesía (No suma a ingresos)'}`,
      'info'
    );
  };

  // Teacher/School/Admin: Create custom quest / desafío
  const createQuest = (
    title: string,
    rewardPoints: number,
    description: string,
    disciplineId?: string,
    creatorType: 'teacher' | 'school' = 'teacher',
    rewardType: 'rhythm_points' | 'school_reward' = 'rhythm_points',
    rewardText?: string
  ) => {
    const newQuest: Quest = {
      id: `quest-${Date.now()}`,
      school_id: currentSchool.id,
      discipline_id: disciplineId,
      creator_type: creatorType,
      title,
      reward_points: rewardPoints,
      reward_type: rewardType,
      reward_text: rewardText,
      description,
      completed: false,
      is_active: true,
    };
    setQuests((prev) => [newQuest, ...prev]);
    addNotification('Nuevo Desafío Creado 🏆', `Misión "${title}" publicada.`, 'badge');
  };

  const toggleQuestActive = (questId: string) => {
    setQuests((prev) =>
      prev.map((q) => (q.id === questId ? { ...q, is_active: q.is_active === false ? true : false } : q))
    );
  };

  const deleteQuest = (questId: string) => {
    setQuests((prev) => prev.filter((q) => q.id !== questId));
    addNotification('Desafío Eliminado 🗑️', 'El desafío fue eliminado del catálogo.', 'info');
  };

  // SuperAdmin: Grant Teacher or Admin Role
  const updateUserRole = (userId: string, newRole: Role) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === userId ? { ...p, role: newRole } : p))
    );
    if (currentUser.id === userId) {
      updateCurrentUserState({ ...currentUser, role: newRole });
    }
    const target = profiles.find((p) => p.id === userId);
    addNotification('Rol de Usuario Modificado 🛡️', `${target?.full_name} ahora tiene rol de ${newRole.toUpperCase()}`, 'badge');
  };

  // Teacher: Update School Configuration & Feature Flags
  const updateSchoolConfig = (schoolId: string, updates: Partial<School>) => {
    setSchools((prev) =>
      prev.map((s) => (s.id === schoolId ? { ...s, ...updates } : s))
    );
    if (currentSchool.id === schoolId) {
      setCurrentSchool((prev) => ({ ...prev, ...updates }));
    }
    addNotification('Configuración Guardada ⚙️', 'Ajustes de la sede actualizados correctamente', 'info');
  };

  // Submissions & Grading
  const submitVideo = (nodeId: string, videoUrl: string) => {
    // Guard: Only ACTIVE students can submit videos!
    if (currentUser.role === 'student' && currentUser.membership_status !== 'active') {
      addNotification('Membresía Inactiva', 'Debes estar de alta para enviar vídeos de evaluación.', 'info');
      return;
    }

    const node = levelTrees.flatMap((lt) => lt.nodes).find((n) => n.id === nodeId);
    const newSub: Submission = {
      id: `sub-${Date.now()}`,
      student_id: currentUser.id,
      node_id: nodeId,
      video_url: videoUrl,
      status: 'pending',
      xp_awarded: 0,
      created_at: new Date().toISOString(),
      student_name: currentUser.full_name,
      node_title: node ? node.title : 'Evaluación Técnica',
    };
    setSubmissions((prev) => [newSub, ...prev]);
    addNotification('Vídeo Enviado', 'Tu profesor lo revisará en el Inbox Zero', 'info');
  };

  const gradeSubmission = (
    submissionId: string,
    status: 'approved' | 'rejected',
    xpAwarded: number,
    drawingData?: any,
    audioUrl?: string,
    rhythmPointsUsed: number = 0
  ) => {
    // Guard: Students CANNOT grade submissions or award XP!
    if (currentUser.role === 'student') {
      addNotification('Permiso Denegado', 'Los alumnos no pueden otorgar XP ni calificar vídeos.', 'info');
      return;
    }

    setSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id === submissionId) {
          return {
            ...sub,
            status,
            xp_awarded: xpAwarded,
            drawing_data: drawingData,
            feedback_audio_url: audioUrl,
          };
        }
        return sub;
      })
    );

    if (status === 'approved') {
      setStudentXP((prev) => prev + xpAwarded);
      if (rhythmPointsUsed > 0) {
        setStudentRhythmPoints((prev) => Math.max(0, prev - rhythmPointsUsed));
      }
      addNotification('¡Vídeo Aprobado! 🎉', `+${xpAwarded} XP Técnico acreditado y Feedback enviado`, 'xp');
    } else {
      addNotification('Feedback Enviado', 'Revisión técnica enviada al alumno', 'info');
    }
  };

  const sendFlashProp = (studentId: string, title: string, xp: number) => {
    // Guard: Students CANNOT send flash props!
    if (currentUser.role === 'student') {
      addNotification('Permiso Denegado', 'Los alumnos no pueden otorgar Flash XP.', 'info');
      return;
    }

    setStudentXP((prev) => prev + xp);
    addNotification('¡Elogio Exprés Recibido! ⚡', `Profesor te otorgó "${title}" (+${xp} XP)`, 'xp');
  };

  const performCheckIn = (coords?: { lat: number; lng: number }) => {
    if (currentUser.membership_status !== 'active') {
      return { success: false, message: 'Tu membresía está inactiva. Solicita activación para hacer Check-In.' };
    }

    if (!currentSchool.has_social_engine) {
      return { success: false, message: 'Esta sede no tiene habilitado el módulo social Victorys.' };
    }

    const basePoints = 50;
    const bonus = Math.round(basePoints * 1.5);
    setStudentRhythmPoints((prev) => prev + bonus);
    setVictoryStreakWeeks((prev) => prev + 1);

    addNotification(
      '¡Check-In GPS Validado! 🔥',
      `Has ingresado a ${currentSchool.venue_name}. +${bonus} Puntos de Ritmo. Racha: ${victoryStreakWeeks + 1} semanas!`,
      'rhythm'
    );

    return {
      success: true,
      message: `Check-in confirmado en ${currentSchool.venue_name}! +${bonus} Puntos de Ritmo.`,
    };
  };

  // Generate venue event QR code for printing/display (Teacher action)
  const generateEventQR = (title: string, code: string, points: number) => {
    const newQR = {
      id: `eqr-${Date.now()}`,
      title,
      code: code.toUpperCase().trim(),
      points,
      valid_until: new Date(Date.now() + 86400000 * 7).toISOString(),
      created_at: new Date().toISOString(),
    };

    setSchools((prev) =>
      prev.map((s) => (s.id === currentSchool.id ? { ...s, active_event_qr: newQR } : s))
    );
    setCurrentSchool((prev) => ({ ...prev, active_event_qr: newQR }));
    addNotification('QR del Evento Generado 🎟️', `Listo para imprimir: "${title}" (Código: ${newQR.code})`, 'rhythm');
  };

  // Scan & validate event QR code (Student action)
  const scanEventQR = (scannedCode: string): { success: boolean; message: string } => {
    if (currentUser.membership_status !== 'active') {
      addNotification('Membresía Inactiva', 'Debes estar activo para escanear QR de eventos.', 'info');
      return { success: false, message: 'Membresía inactiva.' };
    }

    const activeQR = currentSchool.active_event_qr;
    if (!activeQR) {
      addNotification('Sin Evento Activo', 'No hay QR de evento activo actualmente en esta sede.', 'info');
      return { success: false, message: 'No hay QR de evento activo.' };
    }

    const cleanInput = scannedCode.toUpperCase().trim();
    if (cleanInput === activeQR.code.toUpperCase().trim() || cleanInput.includes(activeQR.code)) {
      setStudentRhythmPoints((prev) => prev + activeQR.points);
      setVictoryStreakWeeks((prev) => prev + 1);
      addNotification(
        'QR Social Validado! 🎉',
        `Has escaneado "${activeQR.title}". +${activeQR.points} Puntos de Ritmo otorgados al instante.`,
        'rhythm'
      );
      return {
        success: true,
        message: `¡QR Validado! +${activeQR.points} Puntos de Ritmo por asistirte a ${activeQR.title}.`,
      };
    } else {
      addNotification('Código QR Inválido ❌', 'El código escaneado no coincide con el evento actual.', 'info');
      return { success: false, message: 'El código escaneado no es válido para este evento.' };
    }
  };

  const claimQuest = (questId: string) => {
    if (currentUser.membership_status !== 'active') {
      addNotification('Membresía Inactiva', 'Debes estar activo para reclamar misiones.', 'info');
      return;
    }

    const q = quests.find((item) => item.id === questId);
    if (!q || q.completed) return;

    setQuests((prev) => prev.map((item) => (item.id === questId ? { ...item, completed: true } : item)));
    setStudentRhythmPoints((prev) => prev + q.reward_points);
    addNotification('Misión Completada! 🏆', `Recibes +${q.reward_points} Puntos de Ritmo`, 'badge');
  };

  const redeemReward = (rewardId: string): Redemption | null => {
    if (currentUser.membership_status !== 'active') {
      addNotification('Membresía Inactiva', 'Debes estar activo para canjear bebidas en barra.', 'info');
      return null;
    }

    const reward = rewards.find((r) => r.id === rewardId);
    if (!reward) return null;

    if (studentRhythmPoints < reward.cost_points) {
      addNotification('Puntos Insuficientes', `Necesitas ${reward.cost_points} Puntos de Ritmo`, 'info');
      return null;
    }

    setStudentRhythmPoints((prev) => prev - reward.cost_points);
    const newRedemption: Redemption = {
      id: `red-${Date.now()}`,
      reward_id: reward.id,
      student_id: currentUser.id,
      status: 'claimed',
      created_at: new Date().toISOString(),
      reward_title: reward.title,
      cost_points: reward.cost_points,
    };

    setRedemptions((prev) => [newRedemption, ...prev]);
    addNotification('Recompensa Canjeada! 🍹', 'Muestra el QR dinámico de 60s en la barra', 'rhythm');
    return newRedemption;
  };

  const markRedemptionUsed = (redemptionId: string) => {
    setRedemptions((prev) => prev.map((r) => (r.id === redemptionId ? { ...r, status: 'used' } : r)));
    addNotification('Consumición Consolidada', 'El camarero ha verificado tu consumición', 'info');
  };

  // Syllabus & Level Management Implementation
  const createLevelTree = (disciplineId: string, levelName: string) => {
    const existingForDiscipline = levelTrees.filter((lt) => lt.discipline_id === disciplineId);
    const nextOrder = existingForDiscipline.length + 1;
    const newTree: LevelTree = {
      id: `lt-${disciplineId}-${Date.now()}`,
      school_id: currentSchool.id,
      discipline_id: disciplineId,
      level_name: levelName || `Nivel ${nextOrder}`,
      level_order: nextOrder,
      sections: [
        {
          id: `sec-${Date.now()}-1`,
          title: 'Pasos Básicos (Solo)',
          items: [],
        },
        {
          id: `sec-${Date.now()}-2`,
          title: 'Trabajo en Pareja',
          items: [],
        },
      ],
      nodes: [],
    };

    setLevelTrees((prev) => [...prev, newTree]);
    addNotification('Nivel Creado 📚', `"${newTree.level_name}" añadido a la disciplina`, 'badge');
  };

  const updateLevelTree = (treeId: string, levelName: string) => {
    setLevelTrees((prev) =>
      prev.map((lt) => (lt.id === treeId ? { ...lt, level_name: levelName } : lt))
    );
    addNotification('Nivel Actualizado ✏️', 'Nombre de nivel modificado', 'info');
  };

  const deleteLevelTree = (treeId: string) => {
    setLevelTrees((prev) => prev.filter((lt) => lt.id !== treeId));
    addNotification('Nivel Eliminado 🗑️', 'El nivel y su temario han sido removidos', 'info');
  };

  const addSyllabusSection = (treeId: string, sectionTitle: string) => {
    const newSection = {
      id: `sec-${Date.now()}`,
      title: sectionTitle || 'Nuevo Apartado',
      items: [],
    };
    setLevelTrees((prev) =>
      prev.map((lt) => {
        if (lt.id === treeId) {
          const updatedSections = [...(lt.sections || []), newSection];
          return { ...lt, sections: updatedSections };
        }
        return lt;
      })
    );
    addNotification('Apartado Creado 📁', `Apartado "${sectionTitle}" agregado al temario`, 'info');
  };

  const updateSyllabusSection = (treeId: string, sectionId: string, newTitle: string) => {
    setLevelTrees((prev) =>
      prev.map((lt) => {
        if (lt.id === treeId) {
          const updatedSections = (lt.sections || []).map((sec) =>
            sec.id === sectionId ? { ...sec, title: newTitle } : sec
          );
          return { ...lt, sections: updatedSections };
        }
        return lt;
      })
    );
    addNotification('Apartado Renombrado ✏️', `Apartado actualizado a "${newTitle}"`, 'info');
  };

  const deleteSyllabusSection = (treeId: string, sectionId: string) => {
    setLevelTrees((prev) =>
      prev.map((lt) => {
        if (lt.id === treeId) {
          const updatedSections = (lt.sections || []).filter((sec) => sec.id !== sectionId);
          const allNodes = updatedSections.flatMap((s) => s.items);
          return { ...lt, sections: updatedSections, nodes: allNodes };
        }
        return lt;
      })
    );
    addNotification('Apartado Eliminado 🗑️', 'Se eliminó el apartado y sus ítems', 'info');
  };

  // Program Collaboration & School Linking
  const requestProgramCollaboration = (disciplineId: string, targetTeacherId: string) => {
    setDisciplines((prev) =>
      prev.map((d) => {
        if (d.id === disciplineId) {
          const pending = d.pending_shared_teacher_ids || [];
          if (pending.includes(targetTeacherId)) return d;
          return {
            ...d,
            pending_shared_teacher_ids: [...pending, targetTeacherId],
          };
        }
        return d;
      })
    );
    const targetTeacher = profiles.find((p) => p.id === targetTeacherId);
    addNotification(
      'Invitación Enviada 📩',
      `Petición de colaboración enviada a ${targetTeacher?.full_name || 'Profesor'}. Esperando confirmación.`,
      'info'
    );
  };

  const acceptProgramCollaboration = (disciplineId: string) => {
    setDisciplines((prev) =>
      prev.map((d) => {
        if (d.id === disciplineId) {
          const pending = (d.pending_shared_teacher_ids || []).filter((id) => id !== currentUser.id);
          const shared = [...(d.shared_teacher_ids || [])];
          if (!shared.includes(currentUser.id)) {
            shared.push(currentUser.id);
          }
          return {
            ...d,
            is_shared: true,
            shared_teacher_ids: shared,
            pending_shared_teacher_ids: pending,
          };
        }
        return d;
      })
    );
    addNotification('Invitación Aceptada 🎉', 'Ahora eres co-administrador oficial de este programa.', 'badge');
  };

  const rejectProgramCollaboration = (disciplineId: string) => {
    setDisciplines((prev) =>
      prev.map((d) => {
        if (d.id === disciplineId) {
          return {
            ...d,
            pending_shared_teacher_ids: (d.pending_shared_teacher_ids || []).filter((id) => id !== currentUser.id),
          };
        }
        return d;
      })
    );
    addNotification('Invitación Rechazada', 'Petición de colaboración descartada.', 'info');
  };

  const toggleLinkSchoolToProgram = (disciplineId: string, schoolId: string) => {
    setDisciplines((prev) =>
      prev.map((d) => {
        if (d.id === disciplineId) {
          const linked = d.linked_school_ids || [];
          const isLinked = linked.includes(schoolId);
          const updatedLinked = isLinked ? linked.filter((id) => id !== schoolId) : [...linked, schoolId];
          return { ...d, linked_school_ids: updatedLinked };
        }
        return d;
      })
    );
    addNotification('Vínculo de Escuela Actualizado 🏫', 'La disponibilidad del programa en la sede ha sido modificada.', 'info');
  };

  const addSyllabusItem = (
    treeId: string,
    sectionId: string,
    title: string,
    description: string,
    xp: number,
    videoSample?: string
  ) => {
    const newItem: LevelNode = {
      id: `node-${Date.now()}`,
      title: title || 'Paso / Tema Nuevo',
      description: description || 'Detalle del paso o técnica',
      required_xp: xp > 0 ? xp : 50,
      unlocked: true,
      completed: false,
      video_sample: videoSample,
    };

    setLevelTrees((prev) =>
      prev.map((lt) => {
        if (lt.id === treeId) {
          const updatedSections = (lt.sections || []).map((sec) => {
            if (sec.id === sectionId) {
              return { ...sec, items: [...sec.items, newItem] };
            }
            return sec;
          });
          const allNodes = updatedSections.flatMap((s) => s.items);
          return { ...lt, sections: updatedSections, nodes: allNodes };
        }
        return lt;
      })
    );
    addNotification('Ítem Añadido ✨', `"${title}" (+${newItem.required_xp} XP) añadido al apartado`, 'xp');
  };

  const updateSyllabusItem = (
    treeId: string,
    sectionId: string,
    itemId: string,
    updates: Partial<LevelNode>
  ) => {
    setLevelTrees((prev) =>
      prev.map((lt) => {
        if (lt.id === treeId) {
          const updatedSections = (lt.sections || []).map((sec) => {
            if (sec.id === sectionId) {
              const updatedItems = sec.items.map((it) =>
                it.id === itemId ? { ...it, ...updates } : it
              );
              return { ...sec, items: updatedItems };
            }
            return sec;
          });
          const allNodes = updatedSections.flatMap((s) => s.items);
          return { ...lt, sections: updatedSections, nodes: allNodes };
        }
        return lt;
      })
    );
    addNotification('Paso / Tema Actualizado ⚡', 'Cambios e XP guardados', 'info');
  };

  const deleteSyllabusItem = (treeId: string, sectionId: string, itemId: string) => {
    setLevelTrees((prev) =>
      prev.map((lt) => {
        if (lt.id === treeId) {
          const updatedSections = (lt.sections || []).map((sec) => {
            if (sec.id === sectionId) {
              return { ...sec, items: sec.items.filter((it) => it.id !== itemId) };
            }
            return sec;
          });
          const allNodes = updatedSections.flatMap((s) => s.items);
          return { ...lt, sections: updatedSections, nodes: allNodes };
        }
        return lt;
      })
    );
    addNotification('Ítem Eliminado 🗑️', 'Paso removido del temario', 'info');
  };

  const applyPresetSyllabusTemplate = (disciplineId: string) => {
    const isSalsa = disciplineId.includes('salsa');
    const presetTree: LevelTree = {
      id: `lt-${disciplineId}-preset-${Date.now()}`,
      school_id: currentSchool.id,
      discipline_id: disciplineId,
      level_name: isSalsa ? 'Nivel 1: Salsa Fundamentos (Plantilla Predefinida)' : 'Nivel 1: Bachata Sensual (Plantilla Predefinida)',
      level_order: 1,
      sections: [
        {
          id: `sec-preset-1`,
          title: 'Pasos Básicos (Solo)',
          items: isSalsa
            ? [
                { id: `node-pr-1`, title: 'Pasos Básicos Adelante / Atrás', description: 'Base 1-2-3, 5-6-7', required_xp: 30, unlocked: true },
                { id: `node-pr-2`, title: 'Paso Lateral & Suzy Q', description: 'Cruces laterales y disociación', required_xp: 40, unlocked: true },
              ]
            : [
                { id: `node-pr-1b`, title: 'Paso Básico Bachata & Tap', description: 'Movimiento lateral 1-2-3 tap', required_xp: 30, unlocked: true },
                { id: `node-pr-2b`, title: 'Disociación Cadera & Cuadro', description: 'Aislamiento de pelvis en tiempo 4', required_xp: 40, unlocked: true },
              ],
        },
        {
          id: `sec-preset-2`,
          title: 'En Pareja & Figuras Principales',
          items: isSalsa
            ? [
                { id: `node-pr-3`, title: 'Giro de la Chica (Right Turn)', description: 'Giro hacia la derecha con marca en 1', required_xp: 60, unlocked: true },
                { id: `node-pr-4`, title: 'Cross Body Lead (Pase de la Dama)', description: 'Apertura limpia en tiempo 2', required_xp: 80, unlocked: true },
              ]
            : [
                { id: `node-pr-3b`, title: 'Giro de la Chica en Bachata', description: 'Giro en 4 tiempos con traslación', required_xp: 60, unlocked: true },
                { id: `node-pr-4b`, title: 'Onda Corporal & Cambré', description: 'Guiado desde omóplato', required_xp: 90, unlocked: true },
              ],
        },
      ],
      nodes: [],
    };

    presetTree.nodes = (presetTree.sections || []).flatMap((s) => s.items);
    setLevelTrees((prev) => [...prev, presetTree]);
    addNotification('Plantilla Predefinida Cargada 🎨', 'Estructura base de niveles e ítems añadida. Puedes modificar sus títulos y XP libremente.', 'badge');
  };

  // Toggle Course / Discipline Enrollment for Student
  const toggleEnrollDiscipline = (disciplineId: string) => {
    const currentEnrolled = currentUser.enrolled_discipline_ids || ['disc-salsa-linea'];
    const isEnrolled = currentEnrolled.includes(disciplineId);

    const updatedEnrolled = isEnrolled
      ? currentEnrolled.filter((id) => id !== disciplineId)
      : [...currentEnrolled, disciplineId];

    // Always ensure at least 1 discipline remains enrolled
    if (updatedEnrolled.length === 0) {
      addNotification('Atención ⚠️', 'Debes estar inscrito al menos en 1 programa de baile.', 'info');
      return;
    }

    setCurrentUser((prev) => ({ ...prev, enrolled_discipline_ids: updatedEnrolled }));
    setProfiles((prev) =>
      prev.map((p) => (p.id === currentUser.id ? { ...p, enrolled_discipline_ids: updatedEnrolled } : p))
    );

    const targetDisc = disciplines.find((d) => d.id === disciplineId);
    if (isEnrolled) {
      addNotification('Curso Cancelado 🔴', `Has cancelado tu inscripción a ${targetDisc?.name || 'la disciplina'}.`, 'info');
    } else {
      addNotification('Inscripción Exitosa 🕺', `¡Te has inscrito en ${targetDisc?.name || 'la nueva disciplina'}!`, 'badge');
    }
  };

  // Student Request Course Enrollment with Receipt
  const requestCourseEnrollment = (disciplineId: string, receiptUrl?: string, note?: string) => {
    const currentEnrolled = currentUser.enrolled_discipline_ids || ['disc-salsa-linea'];
    const updatedEnrolled = Array.from(new Set([...currentEnrolled, disciplineId]));
    const updatedStatus = { ...(currentUser.enrolled_disciplines_status || {}), [disciplineId]: 'pending_approval' as const };
    const updatedReceipts = { ...(currentUser.enrolled_receipt_urls || {}), [disciplineId]: receiptUrl || 'comprobante_adjunto.pdf' };

    const updates: Partial<Profile> = {
      enrolled_discipline_ids: updatedEnrolled,
      enrolled_disciplines_status: updatedStatus,
      enrolled_receipt_urls: updatedReceipts,
      payment_note: note || currentUser.payment_note,
    };

    setCurrentUser((prev) => ({ ...prev, ...updates }));
    setProfiles((prev) => prev.map((p) => (p.id === currentUser.id ? { ...p, ...updates } : p)));

    const targetDisc = disciplines.find((d) => d.id === disciplineId);
    addNotification(
      'Solicitud Enviada 📄',
      `Tu comprobante de pago para ${targetDisc?.name || 'el curso'} ha sido enviado al profesor. Tu estado está en aprobación pendiente.`,
      'badge'
    );
  };

  // Approve Course Enrollment by Teacher
  const approveCourseEnrollment = (studentId: string, disciplineId: string) => {
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id !== studentId) return p;
        const updatedStatus = { ...(p.enrolled_disciplines_status || {}), [disciplineId]: 'active' as const };
        return { ...p, enrolled_disciplines_status: updatedStatus };
      })
    );
    if (currentUser.id === studentId) {
      setCurrentUser((prev) => ({
        ...prev,
        enrolled_disciplines_status: { ...(prev.enrolled_disciplines_status || {}), [disciplineId]: 'active' },
      }));
    }
    const student = profiles.find((p) => p.id === studentId);
    const targetDisc = disciplines.find((d) => d.id === disciplineId);
    addNotification('Inscripción Aprobada ✅', `Se ha aprobado la matrícula de ${student?.full_name || 'alumno'} en ${targetDisc?.name}.`, 'badge');
  };

  // Reject Course Enrollment by Teacher
  const rejectCourseEnrollment = (studentId: string, disciplineId: string) => {
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id !== studentId) return p;
        const updatedStatus = { ...(p.enrolled_disciplines_status || {}), [disciplineId]: 'inactive' as const };
        const updatedEnrolled = (p.enrolled_discipline_ids || []).filter((id) => id !== disciplineId);
        return { ...p, enrolled_discipline_ids: updatedEnrolled, enrolled_disciplines_status: updatedStatus };
      })
    );
    addNotification('Solicitud Rechazada ❌', 'La solicitud de inscripción fue rechazada.', 'info');
  };

  // Toggle Ranking Privacy for Student
  const toggleRankingPrivacy = () => {
    const isPublic = currentUser.is_public_in_rankings !== false;
    const nextVal = !isPublic;
    setCurrentUser((prev) => ({ ...prev, is_public_in_rankings: nextVal }));
    setProfiles((prev) => prev.map((p) => (p.id === currentUser.id ? { ...p, is_public_in_rankings: nextVal } : p)));
    addNotification(
      'Ajuste de Privacidad 🔒',
      nextVal ? 'Ahora eres visible en la tabla de clasificación pública.' : 'Te has ocultado de los rankings públicos.',
      'info'
    );
  };

  // Update User Profile (Teacher bio, socials, media, etc.)
  const updateProfile = (profileId: string, updates: Partial<Profile>) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === profileId ? { ...p, ...updates } : p))
    );
    if (currentUser.id === profileId) {
      updateCurrentUserState({ ...currentUser, ...updates });
    }

    if (isSupabaseConfigured()) {
      supabase.from('profiles').update(updates).eq('id', profileId).then();
    }

    addNotification('Perfil Actualizado 👤', 'Se han guardado los cambios en el perfil.', 'info');
  };

  // Create Discipline / Teaching Program
  const createDiscipline = (
    name: string,
    styleTag?: string,
    description?: string,
    targetAudience?: string,
    bpm?: string
  ) => {
    const newDiscipline: Discipline = {
      id: `disc-${Date.now()}`,
      name,
      style_tag: styleTag || 'Estilo Estándar',
      description: description || 'Programa de enseñanza y temario gradual.',
      target_audience: targetAudience || 'Todos los niveles',
      recommended_bpm: bpm || '160 - 200 BPM',
      creator_teacher_id: currentUser.id,
      is_shared: false,
      shared_teacher_ids: [],
    };
    setDisciplines((prev) => [...prev, newDiscipline]);

    // Also auto-create level 1 tree for this new discipline
    const initialTree: LevelTree = {
      id: `lt-${Date.now()}`,
      school_id: currentSchool.id,
      discipline_id: newDiscipline.id,
      level_order: 1,
      level_name: `Nivel 1: Iniciación en ${name}`,
      sections: [
        {
          id: `sec-${Date.now()}`,
          title: 'Pasos Básicos & Fundamentos',
          items: [],
        },
      ],
      nodes: [],
    };
    setLevelTrees((prev) => [...prev, initialTree]);
    addNotification('Programa Creado 🕺', `Programa "${name}" creado con su primer Nivel 1 listo para editar.`, 'badge');
  };

  // Update Discipline Metadata
  const updateDiscipline = (disciplineId: string, updates: Partial<Discipline>) => {
    setDisciplines((prev) =>
      prev.map((d) => (d.id === disciplineId ? { ...d, ...updates } : d))
    );
    addNotification('Programa Editado ✏️', 'Se actualizaron los datos del programa de enseñanza.', 'info');
  };

  // Delete Discipline
  const deleteDiscipline = (disciplineId: string) => {
    setDisciplines((prev) => prev.filter((d) => d.id !== disciplineId));
    setLevelTrees((prev) => prev.filter((lt) => lt.discipline_id !== disciplineId));
    addNotification('Programa Eliminado 🗑️', 'El programa y sus niveles asociados han sido eliminados.', 'info');
  };

  // Reorder Syllabus Sections (Up / Down)
  const reorderSyllabusSection = (treeId: string, sectionId: string, direction: 'up' | 'down') => {
    setLevelTrees((prev) =>
      prev.map((tree) => {
        if (tree.id !== treeId || !tree.sections) return tree;
        const sections = [...tree.sections];
        const index = sections.findIndex((s) => s.id === sectionId);
        if (index === -1) return tree;
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= sections.length) return tree;
        const temp = sections[index];
        sections[index] = sections[targetIndex];
        sections[targetIndex] = temp;
        return { ...tree, sections };
      })
    );
  };

  // Reorder Syllabus Items (Up / Down)
  const reorderSyllabusItem = (treeId: string, sectionId: string, itemId: string, direction: 'up' | 'down') => {
    setLevelTrees((prev) =>
      prev.map((tree) => {
        if (tree.id !== treeId || !tree.sections) return tree;
        const sections = tree.sections.map((sec) => {
          if (sec.id !== sectionId) return sec;
          const items = [...sec.items];
          const index = items.findIndex((i) => i.id === itemId);
          if (index === -1) return sec;
          const targetIndex = direction === 'up' ? index - 1 : index + 1;
          if (targetIndex < 0 || targetIndex >= items.length) return sec;
          const temp = items[index];
          items[index] = items[targetIndex];
          items[targetIndex] = temp;
          return { ...sec, items };
        });
        return { ...tree, sections };
      })
    );
  };

  // Admin Set School Monthly Event Publication Limit
  const updateSchoolMonthlyEventLimit = (schoolId: string, limit: number) => {
    setSchools((prev) => prev.map((s) => (s.id === schoolId ? { ...s, monthly_event_limit: limit } : s)));
    addNotification('Límite de Eventos Actualizado 📅', `La escuela ahora puede publicar hasta ${limit} eventos/mes.`, 'info');
  };

  // Granular Ranking Privacy Toggle
  const toggleRankingPrivacyGranular = (type: 'technical' | 'rhythm' | 'streak') => {
    const key =
      type === 'technical'
        ? 'is_public_in_technical_ranking'
        : type === 'rhythm'
        ? 'is_public_in_rhythm_ranking'
        : 'is_public_in_streak_ranking';

    const currentVal = currentUser[key] !== false;
    const updatedUser = { ...currentUser, [key]: !currentVal };
    setCurrentUser(updatedUser);
    setProfiles((prev) => prev.map((p) => (p.id === currentUser.id ? updatedUser : p)));
    addNotification(
      'Privacidad de Ranking 🔒',
      `Visibilidad de ranking (${type}) cambiada a ${!currentVal ? 'Pública ✅' : 'Privada 🔒'}.`,
      'info'
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        profiles,
        currentSchool,
        schools,
        classes,
        disciplines,
        levelTrees,
        submissions,
        quests,
        questSubmissions,
        rewards,
        redemptions,
        flashProps,
        webConfig,
        updateWebConfig,
        studentXP,
        studentRhythmPoints,
        victoryStreakWeeks,
        notifications,
        addNotification,
        removeNotification,
        clearNotifications,
        setSchoolById,
        setCurrentUserById,
        registerUser,
        loginUser,
        logoutUser,
        requestActivation,
        updateStudentStatus,
        bulkUpdateStudentStatus,
        updateStudentPayingStatus,
        updateUserRole,
        updateSchoolConfig,
        createClass,
        toggleRankingsPublic,
        createQuest,
        toggleQuestActive,
        requestQuestPoints,
        approveQuestSubmission,
        rejectQuestSubmission,
        generateEventQR,
        scanEventQR,
        submitVideo,
        gradeSubmission,
        sendFlashProp,
        performCheckIn,
        claimQuest,
        redeemReward,
        markRedemptionUsed,
        toggleEnrollDiscipline,
        requestCourseEnrollment,
        approveCourseEnrollment,
        rejectCourseEnrollment,
        toggleRankingPrivacy,
        updateProfile,
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
        reorderSyllabusSection,
        reorderSyllabusItem,
        applyPresetSyllabusTemplate,
        weeklySocials,
        createWeeklySocial,
        deleteWeeklySocial,
        updateSchoolMonthlyEventLimit,
        deleteQuest,
        toggleRankingPrivacyGranular,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
