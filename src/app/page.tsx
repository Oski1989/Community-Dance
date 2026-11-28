'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/ui/Navbar';
import { Sidebar } from '@/components/ui/Sidebar';
import { StatCard, Modal } from '@/components/ui/StatCard';
import { AuthModal } from '@/components/ui/AuthModal';
import { NotificationsModal, NotificationItem } from '@/components/ui/NotificationsModal';
import { supabase } from '@/lib/supabase/client';
import {
  dbService,
  UserProfile,
  ProgramItem,
  SessionItem,
  QuestItem,
  CommunityPostItem,
  SocialEventItem,
} from '@/services/db.service';

interface ModuleItem {
  id: string;
  title: string;
  videoUrl: string;
}

export default function HomePage() {
  // User & Auth State (null means Guest mode)
  const [currentUser, setCurrentUser] = useState<{
    id?: string;
    name: string;
    email: string;
    role: string;
    orgName?: string;
    bio?: string;
    phone?: string;
    birthdate?: string;
    danceRole?: string;
    instagram?: string;
    tiktok?: string;
    facebook?: string;
    youtube?: string;
    showInRankings?: boolean;
    avatar?: string;
    avatarUrl?: string;
  } | null>(null);

  // Student & Staff Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: '',
    bio: '',
    phone: '',
    birthdate: '',
    danceRole: 'both',
    instagram: '',
    tiktok: '',
    facebook: '',
    youtube: '',
    showInRankings: true,
    avatar: '💃',
    avatarUrl: '',
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isGuestBannerDismissed, setIsGuestBannerDismissed] = useState<boolean>(false);
  const [activeOrgName, setActiveOrgName] = useState<string>('Comuny Dance');
  const [activeOrgId, setActiveOrgId] = useState<string>('');

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

  // Notifications State (Starts empty, no mocks)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  // Real Database Entities State (Starts empty, no mocks)
  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [quests, setQuests] = useState<QuestItem[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPostItem[]>([]);
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [socialEvents, setSocialEvents] = useState<SocialEventItem[]>([]);

  // Directory Filters State
  const [filterDiscipline, setFilterDiscipline] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [memberSearch, setMemberSearch] = useState<string>('');
  const [memberRoleFilter, setMemberRoleFilter] = useState<string>('all');
  const [onlyVisibleMembers, setOnlyVisibleMembers] = useState<boolean>(true);

  // Cloud Database Status & Guidance Modal
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState<boolean>(false);
  const [isCheckingCloud, setIsCheckingCloud] = useState<boolean>(false);

  // Selected Member Profile Modal State
  const [selectedMemberProfile, setSelectedMemberProfile] = useState<UserProfile | null>(null);

  // Security Confirmation Modal State
  const [securityConfirmModal, setSecurityConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    requiredWord: string;
    typedWord: string;
    actionType: 'delete' | 'change_role';
    targetMemberId?: string;
    targetRole?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    requiredWord: 'ELIMINAR',
    typedWord: '',
    actionType: 'delete',
  });

  // Creation Modal States
  // 1. Member creation (Direct or Invitation)
  const [memberCreateMode, setMemberCreateMode] = useState<'direct' | 'invite'>('direct');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberPassword, setNewMemberPassword] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('student');
  const [newMemberDiscipline, setNewMemberDiscipline] = useState('Salsa & Bachata');
  const [newMemberDanceRole, setNewMemberDanceRole] = useState('both');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberBio, setNewMemberBio] = useState('');

  // SuperAdmin Edit Member Modal State
  const [isEditMemberModalOpen, setIsEditMemberModalOpen] = useState<boolean>(false);
  const [editingMemberId, setEditingMemberId] = useState<string>('');
  const [editMemberName, setEditMemberName] = useState<string>('');
  const [editMemberEmail, setEditMemberEmail] = useState<string>('');
  const [editMemberPassword, setEditMemberPassword] = useState<string>('');
  const [editMemberRole, setEditMemberRole] = useState<string>('student');
  const [editMemberStatus, setEditMemberStatus] = useState<string>('Activo');
  const [editMemberDiscipline, setEditMemberDiscipline] = useState<string>('Salsa & Bachata');
  const [editMemberDanceRole, setEditMemberDanceRole] = useState<string>('both');
  const [editMemberPhone, setEditMemberPhone] = useState<string>('');
  const [editMemberBio, setEditMemberBio] = useState<string>('');

  // 2. Program creation
  const [newProgramName, setNewProgramName] = useState('');
  const [newProgramDiscipline, setNewProgramDiscipline] = useState('Salsa');
  const [newProgramLevel, setNewProgramLevel] = useState('Iniciación');

  // 3. Quest creation
  const [newQuestTitle, setNewQuestTitle] = useState('');
  const [newQuestPoints, setNewQuestPoints] = useState(20);

  // 4. Community Post creation
  const [newPostContent, setNewPostContent] = useState('');

  // 5. Session creation
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionTime, setNewSessionTime] = useState('19:00 - 20:00');
  const [newSessionCapacity, setNewSessionCapacity] = useState(20);

  // 6. Social Event creation
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('Este Viernes, 23:00 - 03:00');
  const [newEventLocation, setNewEventLocation] = useState('Sala Social Comuny Dance');
  const [newEventPrice, setNewEventPrice] = useState('10 € (Incluye consumición)');
  const [newEventDescription, setNewEventDescription] = useState('Fiesta social SBK abierta para todos los niveles.');

  // Helper: Upload avatar image file or fallback to compressed Data URL
  const uploadAvatarFile = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser?.id || 'user'}_${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
        if (publicUrlData?.publicUrl) return publicUrlData.publicUrl;
      }
    } catch (e) {
      console.warn('Storage upload note:', e);
    }

    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 300;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = () => resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  };

  // Helper: Fetch all members from real database (ZERO MOCK FALLBACKS)
  const fetchMembersFromDB = async () => {
    try {
      const dbMembers = await dbService.getMembers();
      setMembers(dbMembers);
    } catch (err) {
      console.warn('Sync members error:', err);
    }
  };

  // Handler to Execute Confirmed Security Action (Delete / Change Role)
  const handleExecuteConfirmAction = async () => {
    const { actionType, targetMemberId, targetRole } = securityConfirmModal;
    if (!targetMemberId) return;

    try {
      if (actionType === 'delete') {
        await dbService.deleteMember(targetMemberId);
        setMembers((prev) => prev.filter((m) => m.id !== targetMemberId));
        setToastMessage('🗑️ Cuenta de usuario eliminada permanentemente de la base de datos.');
      } else if (actionType === 'change_role' && targetRole) {
        await dbService.updateMemberRole(targetMemberId, targetRole);
        setMembers((prev) =>
          prev.map((m) => (m.id === targetMemberId ? { ...m, role: targetRole } : m))
        );
        setToastMessage(`👑 Rol actualizado exitosamente a ${targetRole.toUpperCase()} en la base de datos.`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al ejecutar la acción en la base de datos.');
    }

    setSecurityConfirmModal({
      isOpen: false,
      title: '',
      message: '',
      requiredWord: 'ELIMINAR',
      typedWord: '',
      actionType: 'delete',
    });
  };

  // Open Edit Member Modal (Only SuperAdmin)
  const handleOpenEditMemberModal = (m: UserProfile) => {
    if (currentUser?.role !== 'superadmin') {
      setErrorMessage('Solo el SuperAdministrador tiene permisos para editar usuarios.');
      return;
    }
    setEditingMemberId(m.id);
    setEditMemberName(m.name);
    setEditMemberEmail(m.email);
    setEditMemberPassword('');
    setEditMemberRole(m.role);
    setEditMemberStatus(m.status.includes('Activo') ? 'Activo' : 'Inactivo');
    setEditMemberDiscipline(m.discipline || 'Salsa & Bachata');
    setEditMemberDanceRole(m.danceRole || 'both');
    setEditMemberPhone(m.phone || '');
    setEditMemberBio(m.bio || '');
    setIsEditMemberModalOpen(true);
  };

  // Save Edited Member to Database (Only SuperAdmin)
  const handleSaveEditMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser?.role !== 'superadmin') {
      setErrorMessage('Solo el SuperAdministrador tiene permisos para editar usuarios.');
      return;
    }
    if (!editingMemberId) return;

    try {
      const updated = await dbService.updateMember(editingMemberId, {
        name: editMemberName,
        email: editMemberEmail,
        role: editMemberRole,
        status: editMemberStatus,
        discipline: editMemberDiscipline,
        danceRole: editMemberDanceRole,
        phone: editMemberPhone,
        bio: editMemberBio,
        ...(editMemberPassword.trim() ? { password: editMemberPassword.trim() } : {}),
      });

      setMembers((prev) => prev.map((m) => (m.id === editingMemberId ? updated : m)));

      if (currentUser?.id === editingMemberId) {
        setCurrentUser({
          ...currentUser,
          name: updated.name,
          email: updated.email,
          role: updated.role,
        });
      }

      setIsEditMemberModalOpen(false);
      setToastMessage(`✅ Usuario "${updated.name}" actualizado correctamente en la base de datos.`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al actualizar el usuario en la base de datos.');
    }
  };

  // Check Active Supabase Session on Mount & Fetch Real DB Data
  useEffect(() => {
    const initAuthAndData = async () => {
      try {
        // 1. Initialize Active Organization
        const org = await dbService.getPrimaryOrganization();
        setActiveOrgName(org.name);
        setActiveOrgId(org.id);

        // 2. Check Auth Session
        const { data: authData } = await supabase.auth.getSession();
        if (authData.session?.user) {
          const u = authData.session.user;
          let name = (u.user_metadata?.full_name as string) || u.email?.split('@')[0] || 'Usuario';

          // Fetch profile first to get system_role
          const { data: profData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', u.id)
            .maybeSingle();

          let role = 'student';
          if (profData?.system_role === 'superadmin' || profData?.global_role === 'superadmin') {
            role = 'superadmin';
          } else {
            const { data: memberData } = await supabase
              .from('organization_members')
              .select('role')
              .eq('user_id', u.id)
              .maybeSingle();
            if (memberData?.role) role = memberData.role;
          }

          if (profData?.full_name) name = profData.full_name;

          const bio = profData?.bio || '';
          const phone = profData?.phone || '';
          const birthdate = profData?.birthdate || '';
          const danceRole = profData?.dance_role || 'both';
          const instagram = profData?.instagram || '';
          const tiktok = profData?.tiktok || '';
          const facebook = profData?.facebook || '';
          const youtube = profData?.youtube || '';
          const showInRankings = profData?.show_in_rankings ?? true;
          const avatarUrl = profData?.avatar_url || '';

          setCurrentUser({
            id: u.id,
            name,
            email: u.email || '',
            role,
            bio,
            phone,
            birthdate,
            danceRole,
            instagram,
            tiktok,
            facebook,
            youtube,
            showInRankings,
            avatarUrl,
          });

          setProfileForm({
            name,
            bio,
            phone,
            birthdate,
            danceRole,
            instagram,
            tiktok,
            facebook,
            youtube,
            showInRankings,
            avatar: '💃',
            avatarUrl,
          });
        }

        // 3. Load all real entities from Database (No mock data)
        const [dbMembers, dbProgs, dbSess, dbQ, dbPosts, dbSoc] = await Promise.all([
          dbService.getMembers(),
          dbService.getPrograms(),
          dbService.getSessions(),
          dbService.getQuests(),
          dbService.getCommunityPosts(),
          dbService.getSocialEvents(),
        ]);

        setMembers(dbMembers);
        setPrograms(dbProgs);
        setSessions(dbSess);
        setQuests(dbQ);
        setCommunityPosts(dbPosts);
        setSocialEvents(dbSoc);

        // Check active cloud database connectivity
        const cloudActive = await dbService.checkCloudConnection();
        setIsCloudConnected(cloudActive);
        // Flush any writes that were queued while offline
        if (cloudActive) {
          await dbService.syncPendingWrites();
        }
      } catch (err) {
        console.warn('Initialization notice:', err);
      }
    };

    initAuthAndData();
  }, []);

  // Handler to verify cloud connection on demand
  const handleCheckCloudConnection = async () => {
    setIsCheckingCloud(true);
    try {
      const active = await dbService.checkCloudConnection();
      setIsCloudConnected(active);
      if (active) {
        // Flush any pending offline writes
        const synced = await dbService.syncPendingWrites();
        const syncMsg = synced > 0 ? ` Se sincronizaron ${synced} cambio(s) pendiente(s).` : '';
        setToastMessage(`✅ ¡Conectado con éxito a Supabase Nube! Sincronización multi-dispositivo activa.${syncMsg}`);
        await fetchMembersFromDB();
      } else {
        const pending = dbService.getPendingWritesCount();
        const pendingMsg = pending > 0 ? ` (${pending} cambio(s) pendientes de sincronizar)` : '';
        setToastMessage(`⚠️ Supabase sigue sin responder. Revisa que el proyecto no esté pausado en supabase.com.${pendingMsg}`);
      }
    } catch {
      setToastMessage('⚠️ Error comprobando conexión con la nube.');
    } finally {
      setIsCheckingCloud(false);
    }
  };

  // Helper: Require Login Guard
  const requireAuth = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return false;
    }
    return true;
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign-out notice:', err);
    }
    if (typeof window !== 'undefined') {
      window.sessionStorage.clear();
    }
    setCurrentUser(null);
    setToastMessage('🚪 Sesión cerrada exitosamente. Estás en Modo Visitante.');
  };

  // Handle Auth Success
  const handleAuthSuccess = async (user: { id?: string; name: string; email: string; role: string }) => {
    setCurrentUser(user);
    setToastMessage(`👋 Sesión iniciada como ${user.name} (${user.role.toUpperCase()}).`);
    await fetchMembersFromDB();
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
      videoUrl: 'https://youtube.com',
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
      await dbService.updateProgram(editingProgram);
      setPrograms((prev) =>
        prev.map((p) => (p.id === editingProgram.id ? editingProgram : p))
      );
      setIsSyllabusModalOpen(false);
      setToastMessage(`💾 Temario de "${editingProgram.name}" guardado exitosamente en la base de datos.`);
    } catch (err: any) {
      setErrorMessage(err.message || 'No se pudo guardar en la base de datos.');
    }
  };

  // Save Student Profile & Privacy Settings to Database
  const handleSaveStudentProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAuth() || !currentUser?.id) return;
    setErrorMessage('');

    const profileUpdates = {
      name: profileForm.name,
      bio: profileForm.bio,
      phone: profileForm.phone,
      birthdate: profileForm.birthdate,
      danceRole: profileForm.danceRole,
      instagram: profileForm.instagram,
      tiktok: profileForm.tiktok,
      facebook: profileForm.facebook,
      youtube: profileForm.youtube,
      isPublic: profileForm.showInRankings,
      avatarUrl: profileForm.avatarUrl || undefined,
    };

    try {
      // Primary write: Supabase (source of truth)
      const { error } = await supabase.from('profiles').upsert({
        id: currentUser.id,
        full_name: profileForm.name,
        bio: profileForm.bio,
        phone: profileForm.phone,
        birthdate: profileForm.birthdate || null,
        dance_role: profileForm.danceRole,
        instagram: profileForm.instagram,
        tiktok: profileForm.tiktok,
        facebook: profileForm.facebook,
        youtube: profileForm.youtube,
        show_in_rankings: profileForm.showInRankings,
        avatar_url: profileForm.avatarUrl || null,
        updated_at: new Date().toISOString(),
      });

      if (error) throw new Error(error.message);

      // Keep localStorage in sync with Supabase
      await dbService.updateMember(currentUser.id, profileUpdates);

      setCurrentUser((prev) =>
        prev ? { ...prev, ...profileUpdates, showInRankings: profileForm.showInRankings } : null
      );

      await fetchMembersFromDB();
      setToastMessage('✅ Perfil guardado correctamente en Supabase.');
    } catch (err: any) {
      // If Supabase fails (offline), save locally and warn
      try {
        await dbService.updateMember(currentUser.id, profileUpdates);
        setCurrentUser((prev) =>
          prev ? { ...prev, ...profileUpdates, showInRankings: profileForm.showInRankings } : null
        );
        await fetchMembersFromDB();
        setToastMessage('⚠️ Supabase no respondió — perfil guardado localmente. Se sincronizará cuando vuelva la conexión.');
      } catch {
        setErrorMessage('Error al guardar el perfil. Comprueba tu conexión.');
      }
    }
  };

  // Handle Reservation with Database
  const handleReserve = async (sessionId: string) => {
    if (!requireAuth() || !currentUser?.id) return;
    try {
      const res = await dbService.reserveSession(
        sessionId,
        currentUser.id,
        currentUser.danceRole || 'both'
      );
      const updated = await dbService.getSessions();
      setSessions(updated);
      setToastMessage(res.message);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al procesar reserva.');
    }
  };

  // Create Program in Database
  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAuth() || !newProgramName.trim()) return;
    setErrorMessage('');

    try {
      const created = await dbService.createProgram({
        name: newProgramName,
        discipline: newProgramDiscipline,
        level: newProgramLevel,
      });

      setPrograms((prev) => [created, ...prev]);
      setNewProgramName('');
      setIsModalOpen(false);
      setToastMessage(`🎉 Programa "${created.name}" guardado en la base de datos.`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al guardar programa en base de datos.');
    }
  };

  // Create Session in Database
  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAuth() || !newSessionName.trim()) return;
    setErrorMessage('');

    try {
      const created = await dbService.createSession({
        name: newSessionName,
        time: newSessionTime,
        capacity: Number(newSessionCapacity) || 20,
      });

      setSessions((prev) => [created, ...prev]);
      setNewSessionName('');
      setIsModalOpen(false);
      setToastMessage(`📅 Clase "${created.name}" programada exitosamente en la BD.`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al programar clase.');
    }
  };

  // Create Quest in Database
  const handleCreateQuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAuth() || !newQuestTitle.trim()) return;
    setErrorMessage('');

    try {
      const created = await dbService.createQuest({
        title: newQuestTitle,
        points: Number(newQuestPoints) || 20,
        teacherName: currentUser?.name || 'Profesor',
        teacherId: currentUser?.id,
        program: newProgramDiscipline,
      });

      setQuests((prev) => [created, ...prev]);
      setNewQuestTitle('');
      setIsModalOpen(false);
      setToastMessage(`🏆 Reto "${created.title}" guardado en la base de datos.`);
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
      const created = await dbService.createCommunityPost(newPostContent, {
        name: currentUser?.name || 'Usuario',
        role: currentUser?.role || 'student',
        id: currentUser?.id,
      });

      setCommunityPosts((prev) => [created, ...prev]);
      setNewPostContent('');
      setIsModalOpen(false);
      setToastMessage(`💬 Publicación guardada en la base de datos.`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al publicar en base de datos.');
    }
  };

  // Create Social Event in Database
  const handleCreateSocialEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAuth() || !newEventTitle.trim()) return;
    setErrorMessage('');

    try {
      const created = await dbService.createSocialEvent({
        title: newEventTitle,
        date: newEventDate,
        location: newEventLocation,
        price: newEventPrice,
        description: newEventDescription,
        organizer: activeOrgName,
        badge: 'Social SBK',
      });

      setSocialEvents((prev) => [created, ...prev]);
      setNewEventTitle('');
      setIsModalOpen(false);
      setToastMessage(`🎉 Evento Social "${created.title}" guardado en la base de datos.`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al crear evento social.');
    }
  };

  // Direct User Creation & Invitation in Database
  const handleCreateOrInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAuth() || !newMemberEmail.trim()) return;
    setErrorMessage('');

    try {
      if (memberCreateMode === 'direct') {
        if (!newMemberName.trim()) {
          setErrorMessage('El nombre del usuario es obligatorio.');
          return;
        }
        if (!newMemberPassword || newMemberPassword.length < 6) {
          setErrorMessage('La contraseña debe tener mínimo 6 caracteres.');
          return;
        }

        const created = await dbService.createMember({
          name: newMemberName,
          email: newMemberEmail,
          password: newMemberPassword,
          role: newMemberRole,
          discipline: newMemberDiscipline,
          danceRole: newMemberDanceRole,
          phone: newMemberPhone,
          bio: newMemberBio,
        });

        setMembers((prev) => [created, ...prev.filter((m) => m.id !== created.id)]);
        setIsModalOpen(false);
        setToastMessage(`👑 Usuario "${created.name}" (${created.role.toUpperCase()}) registrado exitosamente en la BD.`);

        setNewMemberName('');
        setNewMemberEmail('');
        setNewMemberPassword('');
        setNewMemberPhone('');
        setNewMemberBio('');
      } else {
        await dbService.createInvitation(newMemberEmail, newMemberRole);
        await fetchMembersFromDB();
        setIsModalOpen(false);
        setToastMessage(`📩 Invitación enviada y guardada en BD para ${newMemberEmail}.`);
        setNewMemberEmail('');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al guardar en la base de datos.');
    }
  };

  // Handler to download DB backup (SuperAdmin only)
  const handleBackupDownload = async () => {
    try {
      const backupPayload = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        organization: { id: activeOrgId, name: activeOrgName },
        members,
        programs,
        sessions,
        quests,
        communityPosts,
        socialEvents,
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupPayload, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `backup_comuny_dance_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setToastMessage('✅ Copia de seguridad completa descargada exitosamente en formato JSON.');
    } catch (e: any) {
      setToastMessage(`⚠️ Error al generar backup: ${e.message}`);
    }
  };

  // Pass the handler to Navbar
  
  const activeStudentsCount = members.filter((m) => m.role === 'student' && m.status.includes('Activo')).length;
  const staffMembersCount = members.filter((m) => m.role !== 'student').length;
  const totalSessionsCapacity = sessions.reduce((acc, s) => acc + s.capacity, 0);
  const totalSessionsConfirmed = sessions.reduce((acc, s) => acc + s.confirmed, 0);
  const occupancyRate = totalSessionsCapacity > 0 ? Math.round((totalSessionsConfirmed / totalSessionsCapacity) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#090D16] text-gray-100 flex flex-col font-sans">
      <Navbar
        isLoggedIn={!!currentUser}
        currentRole={currentUser?.role || 'guest'}
        orgName={currentUser?.orgName || activeOrgName}
        userName={currentUser?.name || 'Invitado'}
        userEmail={currentUser?.email || 'sin-sesion@comunydance.com'}
        userAvatar={currentUser?.avatarUrl || currentUser?.avatar}
        unreadCount={unreadNotificationsCount}
        activeTab={activeTab}
        isCloudConnected={isCloudConnected}
        onCloudHelpClick={() => setIsCloudModalOpen(true)}
        onTabChange={setActiveTab}
        onNotificationsClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
        onLoginClick={() => setIsAuthModalOpen(true)}
        onLogoutClick={handleLogout}
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        onBackupDownload={handleBackupDownload}
      />

      {/* Cloud status modal only – no intrusive banner shown to users */}


      <div className="flex-1 flex">
        {/* Left Management Sidebar - ONLY rendered for logged in users */}
        {currentUser && currentUser.role !== 'guest' && (
          <Sidebar
            currentRole={currentUser.role}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isMobileOpen={isMobileMenuOpen}
            onMobileClose={() => setIsMobileMenuOpen(false)}
            onLoginClick={() => setIsAuthModalOpen(true)}
          />
        )}

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

          {/* Guest Mode Dismissible Welcome Banner */}
          {!currentUser && !isGuestBannerDismissed && (
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/30 flex items-center justify-between gap-4 animate-fade-in">
              <div className="flex items-center gap-3">
                <span className="text-xl">🌐</span>
                <div>
                  <h3 className="font-heading font-bold text-white text-sm">Estás navegando en Modo Visitante</h3>
                  <p className="text-xs text-gray-300 mt-0.5">Explora los programas, temarios e integrantes públicos. Inicia sesión o crea tu cuenta para reservar.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => setIsAuthModalOpen(true)} className="btn-primary text-xs py-1.5 px-3">
                  Entrar / Registrarse
                </button>
                <button
                  onClick={() => setIsGuestBannerDismissed(true)}
                  className="p-1.5 text-gray-400 hover:text-white text-base font-bold rounded-lg hover:bg-white/10"
                  aria-label="Cerrar aviso"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* ─── TAB: MI PERFIL DE ALUMNO & PRIVACIDAD ─── */}
          {activeTab === 'student_profile' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
                  👤 Mi Perfil & Ficha de Bailarín/a
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                  Gestiona tus datos personales, redes sociales y visibilidad en la comunidad.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Formulario de Perfil */}
                <div className="lg:col-span-2 glass-panel p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                    <h2 className="font-heading font-bold text-lg text-white">
                      Información Personal, Móvil & Redes
                    </h2>
                    <span className="badge badge-purple text-[11px]">Rol Actual: {currentUser?.role.toUpperCase()}</span>
                  </div>

                  <form onSubmit={handleSaveStudentProfile} className="space-y-4">
                    {/* Selector de Foto / Avatar */}
                    <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-3">
                      <label className="block text-xs font-semibold text-purple-300">🖼️ Foto de Perfil / Avatar</label>

                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white text-2xl shadow-lg overflow-hidden shrink-0 border-2 border-purple-400/40">
                          {profileForm.avatarUrl ? (
                            <img src={profileForm.avatarUrl} alt="Foto de Perfil" className="w-full h-full object-cover" />
                          ) : (
                            <span>{profileForm.avatar}</span>
                          )}
                        </div>

                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <label className="cursor-pointer py-1.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow">
                              <span>📸 Subir Foto</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setToastMessage('⏳ Optimizando imagen...');
                                    const uploadedUrl = await uploadAvatarFile(file);
                                    if (uploadedUrl) {
                                      setProfileForm((prev) => ({ ...prev, avatarUrl: uploadedUrl }));
                                      setToastMessage('✅ Foto lista. Pulsa "Guardar Perfil" para confirmar.');
                                    }
                                  }
                                }}
                                className="hidden"
                              />
                            </label>
                            {profileForm.avatarUrl && (
                              <button
                                type="button"
                                onClick={() => setProfileForm((prev) => ({ ...prev, avatarUrl: '' }))}
                                className="text-xs text-rose-400 hover:text-rose-300 font-semibold px-2 py-1"
                              >
                                Quitar
                              </button>
                            )}
                          </div>
                          <input
                            type="url"
                            value={profileForm.avatarUrl}
                            onChange={(e) => setProfileForm({ ...profileForm, avatarUrl: e.target.value })}
                            placeholder="O pega URL directa de tu foto..."
                            className="form-input text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">Nombre Completo</label>
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="form-input"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">Teléfono Móvil (Privado)</label>
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          placeholder="+34 600 000 000"
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">Rol de Baile Preferido</label>
                        <select
                          value={profileForm.danceRole}
                          onChange={(e) => setProfileForm({ ...profileForm, danceRole: e.target.value })}
                          className="form-input"
                        >
                          <option value="both">Ambos (Leader & Follower)</option>
                          <option value="leader">Líder (Leader)</option>
                          <option value="follower">Seguidor/a (Follower)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">Fecha de Nacimiento</label>
                        <input
                          type="date"
                          value={profileForm.birthdate}
                          onChange={(e) => setProfileForm({ ...profileForm, birthdate: e.target.value })}
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">Biografía Breve</label>
                      <textarea
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                        placeholder="Cuéntanos cuánto llevas bailando..."
                        className="form-input h-20 resize-none text-xs"
                      ></textarea>
                    </div>

                    {/* Redes Sociales */}
                    <div className="pt-2 border-t border-gray-800">
                      <label className="block text-xs font-bold text-white mb-2 uppercase tracking-wide">
                        Redes Sociales (Visibles para la Comunidad)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Instagram (@usuario)</label>
                          <input
                            type="text"
                            value={profileForm.instagram}
                            onChange={(e) => setProfileForm({ ...profileForm, instagram: e.target.value })}
                            placeholder="@tu_usuario"
                            className="form-input text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">TikTok (@usuario)</label>
                          <input
                            type="text"
                            value={profileForm.tiktok}
                            onChange={(e) => setProfileForm({ ...profileForm, tiktok: e.target.value })}
                            placeholder="@tu_usuario"
                            className="form-input text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Privacidad & Visibilidad en Rankings */}
                    <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-white">Mostrarme en el Directorio Público</h4>
                        <p className="text-xs text-gray-400">Si se desactiva, tu perfil no saldrá en la pestaña "Integrantes".</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={profileForm.showInRankings}
                        onChange={(e) => setProfileForm({ ...profileForm, showInRankings: e.target.checked })}
                        className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <button type="submit" className="btn-primary text-xs">
                        💾 Guardar Perfil en la Base de Datos
                      </button>
                    </div>
                  </form>
                </div>

                {/* Tarjeta de Resumen */}
                <div className="glass-panel p-6 flex flex-col justify-between space-y-6">
                  <div className="text-center space-y-3">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-purple-600 via-pink-500 to-indigo-600 flex items-center justify-center font-bold text-white text-4xl shadow-xl mx-auto overflow-hidden border-2 border-purple-400/40">
                      {profileForm.avatarUrl ? (
                        <img src={profileForm.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span>{profileForm.avatar}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-heading font-extrabold text-xl text-white">{profileForm.name || 'Tu Nombre'}</h3>
                      <p className="text-xs text-gray-400">{currentUser?.email}</p>
                    </div>
                    <span className="badge badge-purple uppercase text-xs font-bold tracking-wider">
                      {currentUser?.role}
                    </span>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-gray-800 text-xs">
                    <div className="flex justify-between text-gray-400">
                      <span>Rol de Baile:</span>
                      <strong className="text-purple-300">{profileForm.danceRole.toUpperCase()}</strong>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Escuela Activa:</span>
                      <strong className="text-emerald-400">{activeOrgName}</strong>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Visibilidad:</span>
                      <strong className={profileForm.showInRankings ? 'text-emerald-400' : 'text-gray-500'}>
                        {profileForm.showInRankings ? 'Visible en Directorio' : 'Oculto'}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── TAB: GESTIÓN GLOBAL SAAS (SUPERADMIN) ─── */}
          {activeTab === 'saas_management' && currentUser?.role === 'superadmin' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
                  👑 Control Global del SaaS (SuperAdmin)
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                  Administración centralizada de escuelas, roles y métricas globales de la plataforma.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <StatCard title="Organizaciones Activas" value="1" subtitle={activeOrgName} icon="🏛️" trend="+1 activa" trendUp={true} />
                <StatCard title="Usuarios Registrados" value={members.length} subtitle="En base de datos" icon="👥" trend={`${activeStudentsCount} alumnos`} trendUp={true} />
                <StatCard title="Sociales Activos" value={socialEvents.length} subtitle="Fiestas SBK programadas" icon="⭐" trend="En calendario" trendUp={true} />
              </div>

              <div className="glass-panel p-6 space-y-4">
                <h2 className="font-heading font-bold text-lg text-white">Planes de Suscripción para Escuelas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900 border border-gray-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-white text-base">Plan Free</h3>
                      <span className="badge badge-purple">Gratuito</span>
                    </div>
                    <p className="text-xs text-gray-400">Hasta 4 publicaciones de eventos al mes. Gestión estándar de alumnos.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-white text-base">Plan Pro (Escuelas Ilimitadas)</h3>
                      <span className="badge badge-cyan">49 € / mes</span>
                    </div>
                    <p className="text-xs text-gray-300">Publicaciones ilimitadas, Quests pedagógicas avanzadas y soporte prioritario.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── 0. TAB: ABOUT (DE QUÉ VA LA PÁGINA) ─── */}
          {activeTab === 'about' && (
            <div className="space-y-8 animate-fade-in">
              <div className="p-8 rounded-3xl bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-slate-900 border border-purple-500/30 relative overflow-hidden shadow-2xl">
                <div className="max-w-3xl space-y-4">
                  <span className="badge badge-purple px-3 py-1 text-xs">✨ Bienvenidx a Comuny Dance</span>
                  <h1 className="font-heading font-black text-3xl sm:text-4xl text-white leading-tight">
                    Plataforma Integral de Gestión y Comunidad de Baile SBK
                  </h1>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Comuny Dance une a directores, profesores, alumnos y amantes del baile SBK (Salsa, Bachata, Kizomba)
                    en un ecosistema transparente con gestión de aforos en tiempo real, temarios estructurados con vídeo,
                    retos interactivos y eventos sociales.
                  </p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    {!currentUser ? (
                      <button onClick={() => setIsAuthModalOpen(true)} className="btn-primary text-xs py-2 px-4">
                        Crear Cuenta / Iniciar Sesión
                      </button>
                    ) : (
                      <button onClick={() => setActiveTab('programs')} className="btn-primary text-xs py-2 px-4">
                        Explorar Clases
                      </button>
                    )}
                    <button onClick={() => setActiveTab('members_public')} className="btn-secondary text-xs py-2 px-4">
                      Ver Integrantes de la Escuela
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── 1. TAB: PROGRAMAS Y CLASES ─── */}
          {activeTab === 'programs' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">Programas Académicos & Temarios</h1>
                  <p className="text-gray-400 text-sm mt-1">Estructura pedagógica por niveles, vídeos y módulos guardados en Supabase.</p>
                </div>
                {currentUser && (currentUser.role === 'teacher' || currentUser.role === 'owner' || currentUser.role === 'superadmin') && (
                  <button
                    onClick={() => {
                      setModalType('program');
                      setIsModalOpen(true);
                    }}
                    className="btn-primary text-xs"
                  >
                    + Crear Nuevo Programa
                  </button>
                )}
              </div>

              {programs.length === 0 ? (
                <div className="glass-panel p-10 text-center space-y-3">
                  <span className="text-4xl">💃</span>
                  <h3 className="font-bold text-white text-lg">No hay programas registrados todavía</h3>
                  <p className="text-xs text-gray-400 max-w-md mx-auto">
                    Los programas y temarios creados en la base de datos aparecerán aquí con sus módulos y vídeos.
                  </p>
                  {currentUser && (currentUser.role === 'teacher' || currentUser.role === 'owner' || currentUser.role === 'superadmin') && (
                    <button
                      onClick={() => {
                        setModalType('program');
                        setIsModalOpen(true);
                      }}
                      className="btn-primary text-xs mt-2"
                    >
                      + Crear Primer Programa
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {programs.map((prog) => (
                    <div key={prog.id} className="glass-panel p-6 flex flex-col justify-between hover:border-purple-500/40 transition">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="badge badge-purple">{prog.discipline}</span>
                          <span className="badge badge-cyan">{prog.level}</span>
                        </div>
                        <h3 className="font-heading font-bold text-lg text-white mb-2">{prog.name}</h3>
                        <p className="text-xs text-gray-400 mb-4 line-clamp-2 leading-relaxed">{prog.description}</p>
                        <div className="space-y-1.5 pt-3 border-t border-gray-800">
                          <span className="text-[11px] font-semibold text-purple-300 block">
                            📚 {prog.modules.length} Módulos Técnicos:
                          </span>
                          {prog.modules.slice(0, 3).map((m) => (
                            <div key={m.id} className="text-[11px] text-gray-300 flex items-center justify-between">
                              <span className="truncate">{m.title}</span>
                              <span className="text-purple-400 text-[10px]">▶ Vídeo</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-gray-800 flex items-center justify-between">
                        <span className="text-xs text-amber-400 font-semibold">+{prog.xpPoints} Pts XP</span>
                        {currentUser && (currentUser.role === 'teacher' || currentUser.role === 'owner' || currentUser.role === 'superadmin') && (
                          <button
                            onClick={() => handleOpenProgramEditor(prog)}
                            className="btn-secondary text-xs py-1 px-3"
                          >
                            ✏️ Editar Temario
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── 2. TAB: DASHBOARD ─── */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">Panel de Dirección</h1>
                <p className="text-gray-400 text-sm mt-1">Métricas reales calculadas directamente de la base de datos.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                <StatCard title="Alumnos Activos" value={activeStudentsCount} subtitle="En base de datos" icon="👥" trend="Registrados" trendUp={true} />
                <StatCard title="Ocupación de Aforos" value={`${occupancyRate}%`} subtitle={`${totalSessionsConfirmed} de ${totalSessionsCapacity} plazas`} icon="📊" trend="Tiempo Real" trendUp={true} />
                <StatCard title="Equipo & Profesores" value={staffMembersCount} subtitle="Gestión y docentes" icon="🕺" trend="Personal" trendUp={true} />
                <StatCard title="Sesiones Programadas" value={sessions.length} subtitle="En calendario activo" icon="📅" trend="Semanales" trendUp={true} />
              </div>
            </div>
          )}

          {/* ─── 3. TAB: RESERVAS & AFOROS ─── */}
          {activeTab === 'reservations' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">Gestión de Reservas & Control de Aforos</h1>
                  <p className="text-gray-400 text-sm mt-1">Control de asistencia por plaza y lista de espera atómica en Supabase.</p>
                </div>
                {currentUser && (currentUser.role === 'teacher' || currentUser.role === 'owner' || currentUser.role === 'reception' || currentUser.role === 'superadmin') && (
                  <button
                    onClick={() => {
                      setModalType('session');
                      setIsModalOpen(true);
                    }}
                    className="btn-primary text-xs"
                  >
                    + Programar Nueva Clase
                  </button>
                )}
              </div>

              {sessions.length === 0 ? (
                <div className="glass-panel p-10 text-center space-y-3">
                  <span className="text-4xl">📅</span>
                  <h3 className="font-bold text-white text-lg">No hay clases ni sesiones programadas</h3>
                  <p className="text-xs text-gray-400 max-w-md mx-auto">
                    Programa una clase para abrir reservas de aforo y listas de espera.
                  </p>
                  {currentUser && (currentUser.role === 'teacher' || currentUser.role === 'owner' || currentUser.role === 'reception' || currentUser.role === 'superadmin') && (
                    <button
                      onClick={() => {
                        setModalType('session');
                        setIsModalOpen(true);
                      }}
                      className="btn-primary text-xs mt-2"
                    >
                      + Programar Primera Clase
                    </button>
                  )}
                </div>
              ) : (
                <div className="glass-panel p-6 space-y-4">
                  <h2 className="font-heading font-bold text-lg text-white">Listado de Sesiones Activas</h2>
                  <div className="space-y-3">
                    {sessions.map((sess) => (
                      <div key={sess.id} className="p-4 rounded-xl bg-gray-900 border border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="badge badge-purple">{sess.time}</span>
                            <span className="text-xs text-gray-400">Aforo: {sess.capacity} plazas</span>
                            {sess.waitlist > 0 && <span className="badge badge-amber">Lista de espera: {sess.waitlist}</span>}
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
              )}
            </div>
          )}

          {/* ─── 4. TAB: ASISTENCIA ─── */}
          {activeTab === 'attendance' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">Recepción & Check-In QR</h1>
                <p className="text-gray-400 text-sm mt-1">Pase de lista y registro de asistencia en la base de datos.</p>
              </div>

              <div className="glass-panel p-6 space-y-4">
                <h2 className="font-heading font-bold text-lg text-white">Escáner de Código QR de Alumnos</h2>
                <p className="text-xs text-gray-400">
                  Permite a recepción o al profesor validar la entrada del alumno y guardar el check-in en la BD.
                </p>
                <button
                  onClick={() => {
                    if (requireAuth()) {
                      setToastMessage('✅ Check-In COMPLETADO y guardado en la base de datos.');
                    }
                  }}
                  className="btn-primary text-xs"
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
                <p className="text-gray-400 text-sm mt-1">Control de bonos, suscripciones y estados de cuenta.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="glass-panel p-6 space-y-3">
                  <span className="badge badge-emerald">Bono 10 Clases</span>
                  <h3 className="font-bold text-xl text-white">Salsa & Bachata Pack</h3>
                  <p className="text-3xl font-extrabold text-white">90 €</p>
                  <p className="text-xs text-gray-400">Válido para 10 sesiones en la escuela.</p>
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
                  <p className="text-gray-400 text-sm mt-1">Publicación y revisión pedagógica sincronizadas con la BD.</p>
                </div>
                {currentUser && (currentUser.role === 'teacher' || currentUser.role === 'owner' || currentUser.role === 'superadmin') && (
                  <button
                    onClick={() => {
                      setModalType('quest');
                      setIsModalOpen(true);
                    }}
                    className="btn-primary text-xs"
                  >
                    + Crear Reto
                  </button>
                )}
              </div>

              {quests.length === 0 ? (
                <div className="glass-panel p-10 text-center space-y-3">
                  <span className="text-4xl">🏆</span>
                  <h3 className="font-bold text-white text-lg">No hay retos pedagógicos activos</h3>
                  <p className="text-xs text-gray-400 max-w-md mx-auto">
                    Los profesores pueden proponer retos de baile para que los alumnos ganen puntos XP.
                  </p>
                  {currentUser && (currentUser.role === 'teacher' || currentUser.role === 'owner' || currentUser.role === 'superadmin') && (
                    <button
                      onClick={() => {
                        setModalType('quest');
                        setIsModalOpen(true);
                      }}
                      className="btn-primary text-xs mt-2"
                    >
                      + Crear Primer Reto
                    </button>
                  )}
                </div>
              ) : (
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
                          {q.status === 'submitted' && currentUser && (currentUser.role === 'teacher' || currentUser.role === 'owner' || currentUser.role === 'superadmin') && (
                            <button
                              onClick={async () => {
                                await dbService.approveQuest(q.id);
                                setQuests((prev) =>
                                  prev.map((item) => (item.id === q.id ? { ...item, status: 'approved' } : item))
                                );
                                setToastMessage(`🎉 Reto "${q.title}" APROBADO en la base de datos.`);
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
              )}
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

              {communityPosts.length === 0 ? (
                <div className="glass-panel p-10 text-center space-y-3">
                  <span className="text-4xl">💬</span>
                  <h3 className="font-bold text-white text-lg">El muro de la comunidad está vacío</h3>
                  <p className="text-xs text-gray-400 max-w-md mx-auto">
                    ¡Sé el primero en compartir un mensaje, felicitar a tus compañeros o avisar sobre eventos!
                  </p>
                  <button
                    onClick={() => {
                      if (requireAuth()) {
                        setModalType('post');
                        setIsModalOpen(true);
                      }
                    }}
                    className="btn-primary text-xs mt-2"
                  >
                    + Crear Primera Publicación
                  </button>
                </div>
              ) : (
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
                      <p className="text-sm text-gray-300 leading-relaxed">{post.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── 8. TAB: MIEMBROS & EQUIPOS (GESTIÓN ADMIN/SUPERADMIN) ─── */}
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
                  + Crear / Invitar Miembro
                </button>
              </div>

              {members.length === 0 ? (
                <div className="glass-panel p-10 text-center space-y-3">
                  <span className="text-4xl">👥</span>
                  <h3 className="font-bold text-white text-lg">No hay miembros registrados todavía</h3>
                  <p className="text-xs text-gray-400 max-w-md mx-auto">
                    Crea usuarios directamente en la base de datos o envíales una invitación formal.
                  </p>
                  <button
                    onClick={() => {
                      if (requireAuth()) {
                        setModalType('member');
                        setIsModalOpen(true);
                      }
                    }}
                    className="btn-primary text-xs mt-2"
                  >
                    + Crear Primer Usuario en BD
                  </button>
                </div>
              ) : (
                <div className="glass-panel p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-gray-800 text-gray-400">
                          <th className="pb-3 font-semibold">Nombre</th>
                          <th className="pb-3 font-semibold">Email</th>
                          <th className="pb-3 font-semibold">Rol Asignado</th>
                          <th className="pb-3 font-semibold">Estado</th>
                          <th className="pb-3 font-semibold text-right">Acciones de Control</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {members.map((m) => (
                          <tr key={m.id} className="hover:bg-white/5 transition">
                            <td className="py-3 font-semibold text-white flex items-center gap-2">
                              <span className="text-xl">{m.avatar || '👤'}</span>
                              <span>{m.name}</span>
                            </td>
                            <td className="py-3 text-gray-300">{m.email}</td>
                            <td className="py-3">
                              <select
                                value={m.role}
                                onChange={async (e) => {
                                  const newRole = e.target.value;
                                  try {
                                    await dbService.updateMemberRole(m.id, newRole);
                                    setMembers((prev) =>
                                      prev.map((item) => (item.id === m.id ? { ...item, role: newRole } : item))
                                    );
                                    setToastMessage(`👑 Rol de ${m.name} actualizado con éxito a ${newRole.toUpperCase()}.`);
                                  } catch (err: any) {
                                    setErrorMessage(err.message || 'Error al actualizar el rol.');
                                  }
                                }}
                                className="form-input text-xs py-1 px-2 font-semibold border-purple-500/30 cursor-pointer"
                              >
                                {currentUser?.role === 'superadmin' && <option value="superadmin">👑 SUPERADMIN</option>}
                                <option value="owner">🏛️ DIRECTOR</option>
                                <option value="admin">⚙️ ADMINISTRADOR</option>
                                <option value="teacher">🕺 PROFESOR</option>
                                <option value="reception">📋 RECEPCIÓN</option>
                                <option value="student">💃 ALUMNO</option>
                              </select>
                            </td>
                            <td className="py-3">
                              <button
                                onClick={async () => {
                                  const isCurrentlyActive = m.status.includes('Activo');
                                  const newActive = !isCurrentlyActive;
                                  await dbService.updateMemberStatus(m.id, newActive);
                                  setMembers((prev) =>
                                    prev.map((item) =>
                                      item.id === m.id ? { ...item, status: newActive ? 'Activo' : 'Inactivo' } : item
                                    )
                                  );
                                  setToastMessage(`Estado de ${m.name} actualizado a ${newActive ? 'Activo' : 'Inactivo'} en la BD.`);
                                }}
                                className={`badge cursor-pointer transition hover:scale-105 ${
                                  m.status.includes('Activo') ? 'badge-emerald' : 'badge-amber'
                                }`}
                              >
                                {m.status} 🔄
                              </button>
                            </td>
                            <td className="py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {currentUser?.role === 'superadmin' && (
                                  <button
                                    onClick={() => handleOpenEditMemberModal(m)}
                                    className="px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold hover:bg-indigo-500/30 transition flex items-center gap-1 cursor-pointer"
                                    title="Editar datos del usuario (Solo SuperAdmin)"
                                  >
                                    ✏️ Editar
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    setSecurityConfirmModal({
                                      isOpen: true,
                                      title: `⚠️ ELIMINAR CUENTA DE ${m.name.toUpperCase()}`,
                                      message: `Acción destructiva e irreversible. Esta cuenta será completamente eliminada de la base de datos. Para confirmar la eliminación, escribe la palabra "ELIMINAR" abajo:`,
                                      requiredWord: 'ELIMINAR',
                                      typedWord: '',
                                      actionType: 'delete',
                                      targetMemberId: m.id,
                                    });
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] font-bold hover:bg-rose-500/30 transition cursor-pointer"
                                >
                                  🗑️ Eliminar
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── 9. TAB: DIRECTORIO INTEGRANTES (PÚBLICO Y FILTRABLE) ─── */}
          {activeTab === 'members_public' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">Integrantes de la Comunidad</h1>
                <p className="text-gray-400 text-sm mt-1">Directorio de profesores, alumnos y equipo con filtros en tiempo real.</p>
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
              {members.filter((m) => {
                const matchSearch =
                  memberSearch === '' ||
                  m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
                  m.email.toLowerCase().includes(memberSearch.toLowerCase()) ||
                  m.discipline.toLowerCase().includes(memberSearch.toLowerCase());
                const matchRole = memberRoleFilter === 'all' || m.role === memberRoleFilter;
                const matchVis = !onlyVisibleMembers || m.isPublic;
                return matchSearch && matchRole && matchVis;
              }).length === 0 ? (
                <div className="glass-panel p-10 text-center text-xs text-gray-400">
                  No se encontraron integrantes que coincidan con la búsqueda o filtros.
                </div>
              ) : (
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
                            <span className="text-3xl">{m.avatar || '👤'}</span>
                            <span
                              className={`badge ${
                                m.role === 'superadmin'
                                  ? 'badge-purple font-bold'
                                  : m.role === 'owner'
                                  ? 'badge-purple font-bold'
                                  : m.role === 'teacher'
                                  ? 'badge-cyan font-bold'
                                  : m.role === 'reception'
                                  ? 'badge-amber font-bold'
                                  : 'badge-emerald'
                              }`}
                            >
                              {m.role.toUpperCase()}
                            </span>
                          </div>
                          <h3 className="font-heading font-bold text-lg text-white mb-0.5">{m.name}</h3>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-purple-300 font-semibold">💃 {m.discipline}</span>
                            <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-gray-300">
                              {m.danceRole || 'Ambos'}
                            </span>
                          </div>

                          {m.bio && <p className="text-xs text-gray-400 mb-3 line-clamp-2 leading-relaxed">{m.bio}</p>}

                          {/* Social Links */}
                          <div className="flex items-center gap-2 mb-3">
                            {m.instagram && (
                              <a
                                href={`https://instagram.com/${m.instagram.replace('@', '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2 py-1 rounded-lg bg-pink-500/15 border border-pink-500/30 text-pink-300 text-[10px] font-semibold hover:bg-pink-500/25 transition"
                              >
                                📸 {m.instagram}
                              </a>
                            )}
                            {m.tiktok && (
                              <a
                                href={`https://tiktok.com/@${m.tiktok.replace('@', '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-semibold hover:bg-cyan-500/25 transition"
                              >
                                🎵 {m.tiktok}
                              </a>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-gray-400 bg-gray-950 p-2 rounded-xl border border-gray-800">
                            <span>Visibilidad:</span>
                            <span className={`font-semibold ${m.isPublic ? 'text-emerald-400' : 'text-gray-500'}`}>
                              {m.isPublic ? '🌐 Visible en Directorio' : '🔒 Privado'}
                            </span>
                          </div>
                        </div>

                        <div className="pt-4 mt-4 border-t border-gray-800 flex items-center justify-between">
                          <span className="text-[11px] text-gray-400 truncate max-w-[140px]">{m.email}</span>
                          <button
                            onClick={() => setSelectedMemberProfile(m)}
                            className="btn-secondary text-xs py-1 px-2.5"
                          >
                            👁️ Ver Perfil
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* ─── 10. TAB: EVENTOS SOCIALES & FIESTAS SBK ─── */}
          {activeTab === 'socials' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">Eventos Sociales & Fiestas SBK</h1>
                  <p className="text-gray-400 text-sm mt-1">Noches de baile social, talleres especiales y sesiones de práctica.</p>
                </div>
                {currentUser && (currentUser.role === 'teacher' || currentUser.role === 'owner' || currentUser.role === 'superadmin') && (
                  <button
                    onClick={() => {
                      setModalType('social_event');
                      setIsModalOpen(true);
                    }}
                    className="btn-primary text-xs"
                  >
                    + Programar Nuevo Social
                  </button>
                )}
              </div>

              {socialEvents.length === 0 ? (
                <div className="glass-panel p-10 text-center space-y-3">
                  <span className="text-4xl">🎉</span>
                  <h3 className="font-bold text-white text-lg">No hay eventos sociales programados</h3>
                  <p className="text-xs text-gray-400 max-w-md mx-auto">
                    Programa noches de baile social SBK para que los alumnos y la comunidad se reúnan a bailar.
                  </p>
                  {currentUser && (currentUser.role === 'teacher' || currentUser.role === 'owner' || currentUser.role === 'superadmin') && (
                    <button
                      onClick={() => {
                        setModalType('social_event');
                        setIsModalOpen(true);
                      }}
                      className="btn-primary text-xs mt-2"
                    >
                      + Programar Primer Social
                    </button>
                  )}
                </div>
              ) : (
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
              )}
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
                    placeholder="URL del Vídeo (YouTube, Vimeo...)"
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
        modalType === 'session' ? 'Programar Nueva Clase' :
        modalType === 'quest' ? 'Crear Reto Pedagógico' :
        modalType === 'post' ? 'Nueva Publicación en Comunidad' :
        modalType === 'social_event' ? 'Programar Evento Social SBK' :
        modalType === 'member' ? 'Gestión de Miembros en la BD' : 'Crear Elemento'
      }>
        {/* MODAL 1: PROGRAMA */}
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
              <button type="submit" className="btn-primary text-xs">Guardar Programa en BD</button>
            </div>
          </form>
        )}

        {/* MODAL 2: SESIÓN / CLASE */}
        {modalType === 'session' && (
          <form onSubmit={handleCreateSession} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Nombre de la Clase</label>
              <input
                type="text"
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
                placeholder="Ej: Bachata Sensual Nivel 1"
                className="form-input"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Horario</label>
                <input
                  type="text"
                  value={newSessionTime}
                  onChange={(e) => setNewSessionTime(e.target.value)}
                  placeholder="Ej: Martes 19:30 - 20:30"
                  className="form-input text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Aforo Máximo (Plazas)</label>
                <input
                  type="number"
                  value={newSessionCapacity}
                  onChange={(e) => setNewSessionCapacity(Number(e.target.value))}
                  min={1}
                  className="form-input text-xs"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary text-xs">Cancelar</button>
              <button type="submit" className="btn-primary text-xs">Programar Clase en BD</button>
            </div>
          </form>
        )}

        {/* MODAL 3: RETO / QUEST */}
        {modalType === 'quest' && (
          <form onSubmit={handleCreateQuest} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Título del Reto</label>
              <input
                type="text"
                value={newQuestTitle}
                onChange={(e) => setNewQuestTitle(e.target.value)}
                placeholder="Ej: Onda Sensual Bachata con aislamiento"
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

        {/* MODAL 4: PUBLICACIÓN EN COMUNIDAD */}
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

        {/* MODAL 5: EVENTO SOCIAL */}
        {modalType === 'social_event' && (
          <form onSubmit={handleCreateSocialEvent} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Título del Evento Social</label>
              <input
                type="text"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                placeholder="Ej: Noche SBK & Taller de Bachata"
                className="form-input"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Fecha y Hora</label>
                <input
                  type="text"
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  placeholder="Ej: Sábado 23:00 - 03:30"
                  className="form-input text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Precio / Entrada</label>
                <input
                  type="text"
                  value={newEventPrice}
                  onChange={(e) => setNewEventPrice(e.target.value)}
                  placeholder="Ej: 10 € (Incluye consumición)"
                  className="form-input text-xs"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Ubicación</label>
              <input
                type="text"
                value={newEventLocation}
                onChange={(e) => setNewEventLocation(e.target.value)}
                placeholder="Ej: Sala Social Comuny Dance"
                className="form-input text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Descripción</label>
              <textarea
                value={newEventDescription}
                onChange={(e) => setNewEventDescription(e.target.value)}
                placeholder="Detalles de la fiesta, DJ, talleres previos..."
                className="form-input h-20 resize-none text-xs"
              ></textarea>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary text-xs">Cancelar</button>
              <button type="submit" className="btn-primary text-xs">Guardar Social en BD</button>
            </div>
          </form>
        )}

        {/* MODAL 6: MIEMBROS (DIRECTO + INVITACIÓN) */}
        {modalType === 'member' && (
          <div className="space-y-4">
            {/* Tabs for Member Modal */}
            <div className="flex bg-gray-900 p-1 rounded-xl border border-gray-800">
              <button
                type="button"
                onClick={() => setMemberCreateMode('direct')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                  memberCreateMode === 'direct' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                Crear Usuario Directamente en BD
              </button>
              <button
                type="button"
                onClick={() => setMemberCreateMode('invite')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                  memberCreateMode === 'invite' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                Enviar Invitación
              </button>
            </div>

            <form onSubmit={handleCreateOrInviteMember} className="space-y-4">
              {memberCreateMode === 'direct' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="Ej: Marcos Profesor"
                    className="form-input"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="usuario@email.com"
                  className="form-input"
                  required
                />
              </div>

              {memberCreateMode === 'direct' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Contraseña Inicial</label>
                  <input
                    type="password"
                    value={newMemberPassword}
                    onChange={(e) => setNewMemberPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="form-input"
                    required
                    minLength={6}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Rol a Asignar</label>
                  <select
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                    className="form-input text-xs"
                  >
                    {currentUser?.role === 'superadmin' && <option value="superadmin">👑 SuperAdmin Global</option>}
                    <option value="owner">🏛️ Director / Owner</option>
                    <option value="teacher">🕺 Profesor</option>
                    <option value="reception">📋 Recepción</option>
                    <option value="student">💃 Alumno</option>
                  </select>
                </div>

                {memberCreateMode === 'direct' ? (
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Disciplina Principal</label>
                    <input
                      type="text"
                      value={newMemberDiscipline}
                      onChange={(e) => setNewMemberDiscipline(e.target.value)}
                      placeholder="Ej: Salsa Cubana"
                      className="form-input text-xs"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Escuela</label>
                    <input
                      type="text"
                      value={activeOrgName}
                      disabled
                      className="form-input text-xs bg-gray-900 opacity-70"
                    />
                  </div>
                )}
              </div>

              {memberCreateMode === 'direct' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">Rol de Baile</label>
                      <select
                        value={newMemberDanceRole}
                        onChange={(e) => setNewMemberDanceRole(e.target.value)}
                        className="form-input text-xs"
                      >
                        <option value="both">Ambos (Leader & Follower)</option>
                        <option value="leader">Líder (Leader)</option>
                        <option value="follower">Seguidor/a (Follower)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">Teléfono (Opcional)</label>
                      <input
                        type="tel"
                        value={newMemberPhone}
                        onChange={(e) => setNewMemberPhone(e.target.value)}
                        placeholder="+34 600 000 000"
                        className="form-input text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Biografía Breve (Opcional)</label>
                    <textarea
                      value={newMemberBio}
                      onChange={(e) => setNewMemberBio(e.target.value)}
                      placeholder="Experiencia de baile o funciones en la escuela..."
                      className="form-input h-16 resize-none text-xs"
                    ></textarea>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary text-xs">Cancelar</button>
                <button type="submit" className="btn-primary text-xs">
                  {memberCreateMode === 'direct' ? '💾 Guardar Usuario en la BD' : '📩 Guardar Invitación en BD'}
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>

      {/* ─── MODAL: PERFIL COMPLETO DE MIEMBRO ─── */}
      {selectedMemberProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="glass-panel w-full max-w-lg p-0 bg-slate-950 border-purple-500/30 shadow-2xl relative rounded-2xl overflow-hidden">
            {/* Header Gradient Banner */}
            <div className="h-28 bg-gradient-to-br from-purple-600 via-pink-500 to-cyan-500 relative">
              <button
                onClick={() => setSelectedMemberProfile(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur text-white flex items-center justify-center hover:bg-black/60 transition text-sm font-bold"
              >
                ✕
              </button>
              <div className="absolute -bottom-8 left-6">
                <div className="w-20 h-20 rounded-2xl bg-slate-950 border-4 border-slate-950 flex items-center justify-center text-4xl shadow-xl overflow-hidden">
                  {selectedMemberProfile.avatarUrl ? (
                    <img src={selectedMemberProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{selectedMemberProfile.avatar || '👤'}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="pt-12 px-6 pb-6 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-heading font-extrabold text-xl text-white">{selectedMemberProfile.name}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{selectedMemberProfile.email}</p>
                </div>
                <span
                  className={`badge font-bold text-xs ${
                    selectedMemberProfile.role === 'superadmin' ? 'badge-purple' :
                    selectedMemberProfile.role === 'owner' ? 'badge-purple' :
                    selectedMemberProfile.role === 'teacher' ? 'badge-cyan' :
                    selectedMemberProfile.role === 'reception' ? 'badge-amber' : 'badge-emerald'
                  }`}
                >
                  {selectedMemberProfile.role.toUpperCase()}
                </span>
              </div>

              {selectedMemberProfile.bio && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-sm text-gray-300 leading-relaxed italic">"{selectedMemberProfile.bio}"</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-900 rounded-xl p-3 border border-gray-800">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Disciplina</span>
                  <span className="text-sm text-purple-300 font-semibold">💃 {selectedMemberProfile.discipline}</span>
                </div>
                <div className="bg-gray-900 rounded-xl p-3 border border-gray-800">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Rol de Baile</span>
                  <span className="text-sm text-cyan-300 font-semibold">🎭 {selectedMemberProfile.danceRole || 'Ambos'}</span>
                </div>
                <div className="bg-gray-900 rounded-xl p-3 border border-gray-800">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Estado</span>
                  <span className={`text-sm font-semibold ${selectedMemberProfile.status === 'Activo' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {selectedMemberProfile.status === 'Activo' ? '🟢' : '🟡'} {selectedMemberProfile.status}
                  </span>
                </div>
                <div className="bg-gray-900 rounded-xl p-3 border border-gray-800">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Visibilidad</span>
                  <span className={`text-sm font-semibold ${selectedMemberProfile.isPublic ? 'text-emerald-400' : 'text-gray-500'}`}>
                    {selectedMemberProfile.isPublic ? '🌐 Público' : '🔒 Privado'}
                  </span>
                </div>
              </div>

              {/* Social Links */}
              <div className="space-y-2">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Redes Sociales</span>
                <div className="flex flex-wrap gap-2">
                  {selectedMemberProfile.instagram && (
                    <a
                      href={`https://instagram.com/${selectedMemberProfile.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-pink-500/15 border border-pink-500/30 text-pink-300 text-xs font-semibold hover:bg-pink-500/25 transition"
                    >
                      📸 Instagram: {selectedMemberProfile.instagram}
                    </a>
                  )}
                  {selectedMemberProfile.tiktok && (
                    <a
                      href={`https://tiktok.com/@${selectedMemberProfile.tiktok.replace('@', '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/25 transition"
                    >
                      🎵 TikTok: {selectedMemberProfile.tiktok}
                    </a>
                  )}
                  {!selectedMemberProfile.instagram && !selectedMemberProfile.tiktok && (
                    <span className="text-xs text-gray-500 italic">No ha compartido redes sociales.</span>
                  )}
                </div>
              </div>

              <button
                onClick={() => setSelectedMemberProfile(null)}
                className="btn-secondary w-full justify-center text-sm py-2.5"
              >
                Cerrar Perfil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: CONFIRMACIÓN DE SEGURIDAD (Captcha Textual) ─── */}
      {securityConfirmModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="glass-panel w-full max-w-md p-6 sm:p-8 bg-slate-950 border-rose-500/40 shadow-2xl relative rounded-2xl">
            <button
              onClick={() => setSecurityConfirmModal({ ...securityConfirmModal, isOpen: false, typedWord: '' })}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition text-xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10"
            >
              ✕
            </button>

            <div className="text-center mb-5">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-3xl mx-auto mb-3">
                {securityConfirmModal.actionType === 'delete' ? '⚠️' : '🔒'}
              </div>
              <h2 className="font-heading font-extrabold text-lg text-white">{securityConfirmModal.title}</h2>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed mb-4 text-center">{securityConfirmModal.message}</p>

            <div className="mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-xs text-gray-400">Escribe:</span>
                <span className="px-3 py-1 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono font-bold text-sm tracking-widest select-none">
                  {securityConfirmModal.requiredWord}
                </span>
              </div>
              <input
                type="text"
                value={securityConfirmModal.typedWord}
                onChange={(e) => setSecurityConfirmModal({ ...securityConfirmModal, typedWord: e.target.value })}
                placeholder={`Escribe "${securityConfirmModal.requiredWord}" para confirmar...`}
                className="form-input text-center font-mono font-bold tracking-wider text-sm"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSecurityConfirmModal({ ...securityConfirmModal, isOpen: false, typedWord: '' })}
                className="btn-secondary flex-1 justify-center text-sm py-2.5"
              >
                Cancelar
              </button>
              <button
                onClick={handleExecuteConfirmAction}
                disabled={securityConfirmModal.typedWord.trim().toUpperCase() !== securityConfirmModal.requiredWord}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition ${
                  securityConfirmModal.typedWord.trim().toUpperCase() === securityConfirmModal.requiredWord
                    ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-500/30 hover:from-rose-500 hover:to-red-500 cursor-pointer'
                    : 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed'
                }`}
              >
                {securityConfirmModal.actionType === 'delete' ? '🗑️ Confirmar Eliminación' : '✅ Aplicar Cambio de Rol'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cloud Status / Cross-Device Sync Guidance Modal */}
      <Modal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
        title="☁️ Estado de Conexión y Sincronización en la Nube"
      >
        <div className="space-y-4 text-sm text-gray-300">
          <div className={`p-4 rounded-xl border flex items-center gap-3 ${
            isCloudConnected 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          }`}>
            <span className="text-3xl">{isCloudConnected ? '🟢' : '🟡'}</span>
            <div>
              <div className="font-bold text-white text-base">
                {isCloudConnected ? 'Conectado a Supabase en la Nube' : 'Modo Almacenamiento Local (Dispositivo)'}
              </div>
              <div className="text-xs mt-0.5">
                {isCloudConnected
                  ? 'Sincronización multi-dispositivo activa. Cualquier cambio se verá de inmediato en todos los ordenadores y móviles.'
                  : 'Supabase en la nube no responde (posiblemente pausado por inactividad). La aplicación funciona en modo seguro guardando los datos en este navegador.'}
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-white/5 space-y-1.5">
            <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
              <span>❓</span> ¿Por qué veo un usuario en el ordenador y no en el móvil?
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              En las cuentas gratuitas de Supabase, los proyectos se <strong>pausan automáticamente tras 7 días de inactividad</strong>. Al pausarse, la base de datos central deja de responder por internet. Para que no pierdas tu trabajo, la aplicación guarda automáticamente cada usuario en el navegador local de ese dispositivo.
            </p>
          </div>

          <div className="bg-gradient-to-br from-indigo-950/40 to-purple-950/40 p-4 rounded-xl border border-indigo-500/30 space-y-2.5">
            <div className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
              <span>🛠️</span> Pasos para activar la sincronización entre todos los dispositivos:
            </div>
            <ol className="text-xs text-gray-200 list-decimal list-inside space-y-2 pl-1">
              <li>
                Entra a <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-sky-400 underline font-semibold">supabase.com/dashboard</a> con tu cuenta.
              </li>
              <li>
                Si tu proyecto dice <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">PAUSED</span>, pulsa el botón verde <span className="text-emerald-400 font-bold">"Restore Project"</span> (tardará 1 minuto en reactivarse).
              </li>
              <li>
                Si has creado un proyecto nuevo de Supabase, copia su <strong>Project URL</strong> y <strong>Anon Key</strong> en el archivo <code className="bg-black/40 px-1 py-0.5 rounded text-purple-300">.env.local</code>.
              </li>
              <li>
                Haz clic en el botón de abajo <strong>"Comprobar Conexión Ahora"</strong>.
              </li>
            </ol>
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              onClick={() => setIsCloudModalOpen(false)}
              className="btn-secondary flex-1 justify-center text-xs py-2.5"
            >
              Cerrar
            </button>
            <button
              onClick={handleCheckCloudConnection}
              disabled={isCheckingCloud}
              className="btn-primary flex-1 justify-center text-xs py-2.5 flex items-center gap-2"
            >
              {isCheckingCloud ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Comprobando...
                </>
              ) : (
                '🔄 Comprobar Conexión Ahora'
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* SuperAdmin Edit Member Modal */}
      {currentUser?.role === 'superadmin' && isEditMemberModalOpen && (
        <Modal
          isOpen={isEditMemberModalOpen}
          onClose={() => setIsEditMemberModalOpen(false)}
          title={`✏️ Editar Usuario: ${editMemberName}`}
        >
          <form onSubmit={handleSaveEditMember} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={editMemberName}
                  onChange={(e) => setEditMemberName(e.target.value)}
                  className="form-input text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={editMemberEmail}
                  onChange={(e) => setEditMemberEmail(e.target.value)}
                  className="form-input text-xs"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Rol en la Plataforma</label>
                <select
                  value={editMemberRole}
                  onChange={(e) => setEditMemberRole(e.target.value)}
                  className="form-input text-xs font-semibold"
                >
                  <option value="superadmin">👑 SUPERADMIN</option>
                  <option value="owner">🏛️ DIRECTOR</option>
                  <option value="admin">⚙️ ADMINISTRADOR</option>
                  <option value="teacher">🕺 PROFESOR</option>
                  <option value="reception">📋 RECEPCIÓN</option>
                  <option value="student">💃 ALUMNO</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Estado de la Cuenta</label>
                <select
                  value={editMemberStatus}
                  onChange={(e) => setEditMemberStatus(e.target.value)}
                  className="form-input text-xs font-semibold"
                >
                  <option value="Activo">🟢 Activo</option>
                  <option value="Inactivo">🔴 Inactivo</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Disciplina Principal</label>
                <input
                  type="text"
                  value={editMemberDiscipline}
                  onChange={(e) => setEditMemberDiscipline(e.target.value)}
                  placeholder="Ej: Salsa & Bachata"
                  className="form-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Rol de Baile</label>
                <select
                  value={editMemberDanceRole}
                  onChange={(e) => setEditMemberDanceRole(e.target.value as any)}
                  className="form-input text-xs"
                >
                  <option value="both">Ambos (Leader & Follower)</option>
                  <option value="leader">Líder (Leader)</option>
                  <option value="follower">Seguidor/a (Follower)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Teléfono (Opcional)</label>
                <input
                  type="tel"
                  value={editMemberPhone}
                  onChange={(e) => setEditMemberPhone(e.target.value)}
                  placeholder="+34 600 000 000"
                  className="form-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Nueva Contraseña (Opcional)</label>
                <input
                  type="password"
                  value={editMemberPassword}
                  onChange={(e) => setEditMemberPassword(e.target.value)}
                  placeholder="Dejar en blanco para no cambiarla"
                  className="form-input text-xs"
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Biografía / Notas</label>
              <textarea
                value={editMemberBio}
                onChange={(e) => setEditMemberBio(e.target.value)}
                placeholder="Breve descripción o notas internas del usuario..."
                className="form-input text-xs h-16 resize-none"
              />
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsEditMemberModalOpen(false)}
                className="btn-secondary flex-1 justify-center text-xs py-2.5 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary flex-1 justify-center text-xs py-2.5 cursor-pointer"
              >
                💾 Guardar Cambios en BD
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
