import { School, Profile, Discipline, Group, LevelTree, Submission, Quest, Reward, FlashProp, RhythmPointsLedger, Redemption } from '@/types/database';

export const INITIAL_PROFILES: Profile[] = [
  {
    id: 'admin-super',
    full_name: 'SuperAdmin Master',
    email: 'admin@dance.com',
    role: 'admin',
    membership_status: 'active',
    is_paying: false,
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
    phone: '+34 600 000 001',
    bio: 'Administrador principal del sistema APP MASTER.',
  },
];

export const INITIAL_SCHOOLS: School[] = [
  {
    id: 'school-victorys',
    teacher_id: 'teacher-adrian',
    name: 'Victorys Palma',
    city: 'Palma de Mallorca',
    has_social_engine: true,
    venue_name: 'Victorys Club Palma',
    is_rankings_public: true,
    levels_count: 5,
    xp_per_level: 100,
    rhythm_conversion_rate: 50,
    membership_fee_monthly: 50,
    points_name: 'Puntos de Ritmo',
    level_names: [
      'Nivel 1: Iniciación Básica',
      'Nivel 2: Básico Intermedio',
      'Nivel 3: Intermedio A',
      'Nivel 4: Avanzado Pro',
      'Nivel 5: Master Victorys',
    ],
    active_event_qr: {
      id: 'eqr-1',
      title: 'Social Viernes Neón Victorys Palma',
      code: 'VICTORYS-NEON-2026',
      points: 75,
      valid_until: new Date(Date.now() + 86400000 * 3).toISOString(),
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'school-bcn',
    teacher_id: 'teacher-adrian',
    name: 'Barcelona BCN Academy',
    city: 'Barcelona',
    has_social_engine: false,
    venue_name: 'BCN Dance Studio',
    is_rankings_public: false,
    levels_count: 4,
    xp_per_level: 120,
    rhythm_conversion_rate: 25,
    membership_fee_monthly: 60,
    points_name: 'Puntos BCN',
    level_names: [
      'Level 1: Novice',
      'Level 2: Intermediate',
      'Level 3: Advanced',
      'Level 4: Master',
    ],
  },
];

export const INITIAL_CLASSES = [
  {
    id: 'class-1',
    school_id: 'school-victorys',
    teacher_id: 'teacher-adrian',
    name: 'Salsa en Línea Nivel 2 (Avanzado)',
    discipline: 'Salsa en Línea',
    schedule: 'Martes y Jueves 20:00h',
    location: 'Victorys Sala A',
    student_count: 14,
  },
  {
    id: 'class-2',
    school_id: 'school-victorys',
    teacher_id: 'teacher-adrian',
    name: 'Bachata Sensual Inicial / Intermedio',
    discipline: 'Bachata Sensual',
    schedule: 'Miércoles 21:00h',
    location: 'Victorys Sala B',
    student_count: 18,
  },
];

export const INITIAL_DISCIPLINES: Discipline[] = [
  {
    id: 'disc-salsa-linea',
    name: 'Salsa en Línea (On1 / Crossbody)',
    style_tag: 'Salsa L.A. Style On1',
    description: 'Programa técnico centrado en la conducción precisa, giros limpios, la línea de baile y la expresión musical.',
    target_audience: 'Nivel Iniciación a Avanzado',
    recommended_bpm: '180 - 210 BPM',
    resource_links: ['https://salsa-rhythm-app.com'],
  },
  {
    id: 'disc-bachata-sensual',
    name: 'Bachata Sensual & Moderna',
    style_tag: 'Sensual Cadence & Waves',
    description: 'Programa enfocado en disociación de torso, ondas corporales, cambré seguro y conexión de pareja respetuosa.',
    target_audience: 'Nivel Básico a Pro',
    recommended_bpm: '120 - 140 BPM',
    resource_links: ['https://youtube.com/playlist?list=bachata-waves-tutorial'],
  },
  {
    id: 'disc-salsa-cubana',
    name: 'Salsa Cubana & Rueda de Casino',
    style_tag: 'Cuban Flow & Rueda',
    description: 'Sabor caribeño, trabajo circular de pareja, dinamismo y figuras colectivas de Rueda de Casino.',
    target_audience: 'Todos los niveles',
    recommended_bpm: '190 - 220 BPM',
  },
];

export const INITIAL_GROUPS: Group[] = [
  {
    id: 'group-victorys-inter',
    school_id: 'school-victorys',
    discipline_id: 'disc-salsa-linea',
    name: 'Grupo Pro-Victorys Jueves',
    schedule_info: 'Jueves 21:00h - Victorys Palma',
  },
  {
    id: 'group-bcn-inter',
    school_id: 'school-bcn',
    discipline_id: 'disc-bachata-sensual',
    name: 'Bachata Sensual Barcelona',
    schedule_info: 'Martes 20:00h - BCN Studio',
  },
];

export const INITIAL_LEVEL_TREES: LevelTree[] = [
  {
    id: 'lt-salsa-1',
    school_id: 'school-victorys',
    discipline_id: 'disc-salsa-linea',
    level_name: 'Nivel 1: Iniciación Básica y Fundamentos',
    level_order: 1,
    sections: [
      {
        id: 'sec-salsa-1-basicos',
        title: 'Pasos Básicos (Solo)',
        items: [
          {
            id: 'node-101',
            title: 'Pasos Básicos & Transferencia de Peso',
            description: 'Demuestra el peso del cuerpo en 1-2-3 y 5-6-7 sin levantar talones excesivamente.',
            required_xp: 50,
            unlocked: true,
            completed: true,
          },
          {
            id: 'node-102',
            title: 'Paso Lateral y Abierto (Suzy Q)',
            description: 'Cruces laterales limpios con disociación de hombros.',
            required_xp: 60,
            unlocked: true,
            completed: true,
          },
        ],
      },
      {
        id: 'sec-salsa-1-pareja',
        title: 'Trabajo en Pareja',
        items: [
          {
            id: 'node-103',
            title: 'Cross Body Lead (Pase de la Dama)',
            description: 'Apertura limpia en tiempo 2 con tracción suave de escápula en tiempo 5.',
            required_xp: 150,
            unlocked: true,
            completed: false,
          },
          {
            id: 'node-104',
            title: 'Giro Derecha de la Chica (Right Turn)',
            description: 'Preparación en 1 y pivotaje controlado en tiempo 3.',
            required_xp: 200,
            unlocked: false,
            completed: false,
          },
        ],
      },
    ],
    nodes: [
      {
        id: 'node-101',
        title: 'Pasos Básicos & Transferencia de Peso',
        description: 'Demuestra el peso del cuerpo en 1-2-3 y 5-6-7 sin levantar talones excesivamente.',
        required_xp: 50,
        unlocked: true,
        completed: true,
      },
      {
        id: 'node-102',
        title: 'Paso Lateral y Abierto (Suzy Q)',
        description: 'Cruces laterales limpios con disociación de hombros.',
        required_xp: 60,
        unlocked: true,
        completed: true,
      },
      {
        id: 'node-103',
        title: 'Cross Body Lead (Pase de la Dama)',
        description: 'Apertura limpia en tiempo 2 con tracción suave de escápula en tiempo 5.',
        required_xp: 150,
        unlocked: true,
        completed: false,
      },
      {
        id: 'node-104',
        title: 'Giro Derecha de la Chica (Right Turn)',
        description: 'Preparación en 1 y pivotaje controlado en tiempo 3.',
        required_xp: 200,
        unlocked: false,
        completed: false,
      },
    ],
  },
  {
    id: 'lt-bachata-1',
    school_id: 'school-victorys',
    discipline_id: 'disc-bachata-sensual',
    level_name: 'Nivel 1: Ondulaciones & Aislamiento',
    level_order: 1,
    sections: [
      {
        id: 'sec-bachata-1-cuerpo',
        title: 'Movimiento Corporal & Ondas',
        items: [
          {
            id: 'node-201',
            title: 'Onda Torácica a Cadera',
            description: 'Aislamiento de la caja torácica descendiendo fluidamente al tiempo 4.',
            required_xp: 75,
            unlocked: true,
            completed: true,
          },
        ],
      },
      {
        id: 'sec-bachata-1-pareja',
        title: 'En Pareja & Guiado Sensual',
        items: [
          {
            id: 'node-202',
            title: 'Cambré con Control Cervical (Giro Chica)',
            description: 'Guiado desde el omóplato garantizando soporte total a la follower.',
            required_xp: 150,
            unlocked: true,
            completed: false,
          },
        ],
      },
    ],
    nodes: [
      {
        id: 'node-201',
        title: 'Onda Torácica a Cadera',
        description: 'Aislamiento de la caja torácica descendiendo fluidamente al tiempo 4.',
        required_xp: 75,
        unlocked: true,
        completed: true,
      },
      {
        id: 'node-202',
        title: 'Cambré con Control Cervical (Giro Chica)',
        description: 'Guiado desde el omóplato garantizando soporte total a la follower.',
        required_xp: 150,
        unlocked: true,
        completed: false,
      },
    ],
  },
];

export const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-1',
    student_id: 'student-osqui',
    node_id: 'node-103',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    status: 'pending',
    xp_awarded: 0,
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    student_name: 'Osqui Fernández',
    node_title: 'Cross Body Lead (Pase de la Dama)',
  },
  {
    id: 'sub-2',
    student_id: 'student-laura',
    node_id: 'node-202',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    status: 'pending',
    xp_awarded: 0,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    student_name: 'Laura Martinez',
    node_title: 'Cambré con Control Cervical',
  },
  {
    id: 'sub-3',
    student_id: 'student-carlos',
    node_id: 'node-101',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    status: 'approved',
    xp_awarded: 50,
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    student_name: 'Carlos Ruiz',
    node_title: 'Pasos Básicos & Transferencia de Peso',
  },
];

export const INITIAL_FLASH_PROPS: FlashProp[] = [
  { id: 'fp-1', teacher_id: 'teacher-adrian', title: 'Eje Impecable', default_xp: 15 },
  { id: 'fp-2', teacher_id: 'teacher-adrian', title: 'Conexión Orgánica', default_xp: 20 },
  { id: 'fp-3', teacher_id: 'teacher-adrian', title: 'Musicalidad Brutal', default_xp: 25 },
  { id: 'fp-4', teacher_id: 'teacher-adrian', title: 'Marco Firme', default_xp: 15 },
  { id: 'fp-5', teacher_id: 'teacher-adrian', title: 'Energía en Pista', default_xp: 10 },
];

export const INITIAL_QUESTS: Quest[] = [
  {
    id: 'quest-1',
    school_id: 'school-victorys',
    discipline_id: 'disc-salsa-linea',
    creator_type: 'teacher',
    title: 'Desafío Combo Salsa Nivel 1',
    description: 'Grabar combo de Salsa en Línea y enviar al Inbox Zero.',
    reward_points: 100,
    reward_type: 'rhythm_points',
    badge_icon: '🕺',
    completed: false,
    is_active: true,
  },
  {
    id: 'quest-2',
    school_id: 'school-victorys',
    creator_type: 'school',
    title: 'Racha 4 Sociales Victorys (Copa Gratis)',
    description: 'Asiste 4 semanas seguidas a los sociales de la escuela y haz Check-In GPS.',
    reward_points: 250,
    reward_type: 'school_reward',
    reward_text: '🍹 Copa gratis en barra la próxima vez',
    badge_icon: '🍹',
    completed: false,
    is_active: true,
  },
  {
    id: 'quest-3',
    school_id: 'school-victorys',
    discipline_id: 'disc-bachata-sensual',
    creator_type: 'teacher',
    title: 'Maestría Asíncrona Bachata',
    description: 'Sube 2 vídeos de feedback esta semana antes del domingo.',
    reward_points: 80,
    reward_type: 'rhythm_points',
    badge_icon: '📹',
    completed: false,
    is_active: true,
  },
];

export const INITIAL_QUEST_SUBMISSIONS = [
  {
    id: 'qsub-1',
    quest_id: 'quest-1',
    student_id: 'student-laura',
    student_name: 'Laura Martinez',
    quest_title: 'Desafío Social Victorys',
    reward_points: 100,
    status: 'pending' as const,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

export const INITIAL_REWARDS: Reward[] = [
  {
    id: 'rew-1',
    school_id: 'school-victorys',
    title: 'Chupito de Bienvenida en Barra',
    cost_points: 150,
    badge_icon: '🥂',
  },
  {
    id: 'rew-2',
    school_id: 'school-victorys',
    title: 'Copa / Mixto Gratis Victorys',
    cost_points: 400,
    badge_icon: '🍹',
  },
  {
    id: 'rew-3',
    school_id: 'school-victorys',
    title: 'Entrada VIP + Guardarropa Gratuito',
    cost_points: 300,
    badge_icon: '🎫',
  },
  {
    id: 'rew-4',
    school_id: 'school-victorys',
    title: 'Pase Gratuito a Masterclass Intensiva',
    cost_points: 800,
    badge_icon: '👑',
  },
];

export const INITIAL_REDEMPTIONS: Redemption[] = [
  {
    id: 'red-1',
    reward_id: 'rew-1',
    student_id: 'student-osqui',
    status: 'claimed',
    created_at: new Date().toISOString(),
    reward_title: 'Chupito de Bienvenida en Barra',
    cost_points: 150,
  },
];
