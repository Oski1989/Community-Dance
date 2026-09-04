import { School, Profile, Discipline, Group, LevelTree, Submission, Quest, Reward, FlashProp, RhythmPointsLedger, Redemption, DanceClass, QuestSubmission } from '@/types/database';

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
    teacher_id: 'admin-super',
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
  },
];

export const INITIAL_CLASSES: DanceClass[] = [];
export const INITIAL_DISCIPLINES: Discipline[] = [];
export const INITIAL_GROUPS: Group[] = [];
export const INITIAL_LEVEL_TREES: LevelTree[] = [];
export const INITIAL_SUBMISSIONS: Submission[] = [];
export const INITIAL_FLASH_PROPS: FlashProp[] = [];
export const INITIAL_QUESTS: Quest[] = [];
export const INITIAL_QUEST_SUBMISSIONS: QuestSubmission[] = [];
export const INITIAL_REWARDS: Reward[] = [];
export const INITIAL_REDEMPTIONS: Redemption[] = [];
