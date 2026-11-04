export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'zombie' | 'tycoon' | 'general';
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
}

export interface PlayerProgression {
  playerName: string;
  hasChosenName?: boolean;
  xp: number;
  level: number;
  title: string;
  totalQuestionsAnswered: number;
  zombiesKilled: number;
  cratesOpened: number;
  wavesCleared: number;
  bossesDefeated: number;
  tycoonEarnings: number;
  lastSavedAt: string;
  achievements: Achievement[];
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  title: string;
  level: number;
  xp: number;
  badges: number;
  isCurrentPlayer: boolean;
  country: string;
}

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_strike',
    title: 'First Active Strike',
    description: 'Answer your first active voice question correctly.',
    icon: '🎯',
    category: 'general',
    unlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'zombie_slayer_master',
    title: 'Zombie Slayer Master',
    description: 'Eliminate 50 passive zombies in the Project Zomboid survival zone.',
    icon: '🧟',
    category: 'zombie',
    unlocked: false,
    progress: 0,
    maxProgress: 50
  },
  {
    id: 'crate_scavenger',
    title: 'Zomboid Crate Scavenger',
    description: 'Pick up 5 zombie dropped buff crates and crack their grammar locks.',
    icon: '📦',
    category: 'zombie',
    unlocked: false,
    progress: 0,
    maxProgress: 5
  },
  {
    id: 'boss_slayer_5',
    title: 'Golem Demolisher',
    description: 'Conquer Wave 5 and defeat the mighty Passive Golem Boss.',
    icon: '🗿',
    category: 'zombie',
    unlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'boss_slayer_7',
    title: 'Abomination Purger',
    description: 'Survive Wave 7 and shatter the Bureaucratic Abomination.',
    icon: '💀',
    category: 'zombie',
    unlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'wave_10_victory',
    title: 'Apocalypse Savior',
    description: 'Defeat the Wave 10 Arch-Titan Overlord and achieve total Victory!',
    icon: '👑',
    category: 'zombie',
    unlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'classroom_mogul',
    title: 'Grammar Academy Mogul',
    description: 'Amass over $2,500 in classroom tuition funds.',
    icon: '🏫',
    category: 'tycoon',
    unlocked: false,
    progress: 0,
    maxProgress: 2500
  },
  {
    id: 'active_virtuoso',
    title: '100 Active Sentences Master',
    description: 'Master 15 active voice sentence challenges across games.',
    icon: '✍️',
    category: 'general',
    unlocked: false,
    progress: 0,
    maxProgress: 15
  },
  {
    id: 'verb_hunter',
    title: 'Dynamic Verb Hunter',
    description: 'Replace weak "to be" participles with dynamic verbs.',
    icon: '🔥',
    category: 'general',
    unlocked: false,
    progress: 0,
    maxProgress: 5
  }
];

const LEVEL_TITLES = [
  'Grammar Novice',
  'Actor Detective',
  'Dynamic Verb Striker',
  'Clarity Enforcer',
  'Active Commander',
  'Precision Wordsmith',
  'Passive Voice Exterminator',
  'Master Grammarian'
];

export const getLevelFromXp = (xp: number): { level: number; title: string; currentLevelXp: number; nextLevelXp: number; progressPercent: number } => {
  const xpPerLevel = 250;
  const level = Math.min(8, Math.floor(xp / xpPerLevel) + 1);
  const currentLevelXp = xp % xpPerLevel;
  const nextLevelXp = xpPerLevel;
  const progressPercent = Math.min(100, Math.floor((currentLevelXp / nextLevelXp) * 100));
  const title = LEVEL_TITLES[level - 1] || 'Grandmaster Grammarian';
  return { level, title, currentLevelXp, nextLevelXp, progressPercent };
};

const STORAGE_KEY = 'ava_player_progression_v4';

export const loadProgression = (): PlayerProgression => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const mergedAchievements = DEFAULT_ACHIEVEMENTS.map(def => {
        const existing = parsed.achievements?.find((a: Achievement) => a.id === def.id);
        return existing || def;
      });
      const hasChosen = typeof parsed.hasChosenName === 'boolean' 
        ? parsed.hasChosenName 
        : (Boolean(parsed.playerName) && parsed.playerName !== 'Player (You)');
      return {
        ...parsed,
        playerName: parsed.playerName || '',
        hasChosenName: hasChosen,
        lastSavedAt: parsed.lastSavedAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        wavesCleared: parsed.wavesCleared || 0,
        bossesDefeated: parsed.bossesDefeated || 0,
        achievements: mergedAchievements
      };
    }
  } catch {}

  return {
    playerName: '',
    hasChosenName: false,
    xp: 0,
    level: 1,
    title: LEVEL_TITLES[0],
    totalQuestionsAnswered: 0,
    zombiesKilled: 0,
    cratesOpened: 0,
    wavesCleared: 0,
    bossesDefeated: 0,
    tycoonEarnings: 0,
    lastSavedAt: 'Just now',
    achievements: DEFAULT_ACHIEVEMENTS
  };
};

export const saveProgression = (data: PlayerProgression) => {
  try {
    const toSave = {
      ...data,
      lastSavedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {}
};

// Global Community Leaderboard Database
const COMMUNITY_PLAYERS = [
  { name: 'Elena Vance', title: 'Master Grammarian', xp: 2450, badges: 9, country: 'US' },
  { name: 'Marcus Wright', title: 'Passive Exterminator', xp: 1980, badges: 8, country: 'UK' },
  { name: 'Dr. Sofia Chen', title: 'Active Commander', xp: 1650, badges: 6, country: 'CA' },
  { name: 'Liam O\'Connor', title: 'Precision Wordsmith', xp: 1420, badges: 5, country: 'IE' },
  { name: 'Aria Tanaka', title: 'Dynamic Verb Striker', xp: 1180, badges: 5, country: 'JP' },
  { name: 'Lucas Rossi', title: 'Actor Detective', xp: 950, badges: 4, country: 'IT' },
  { name: 'Maya Dupont', title: 'Actor Detective', xp: 780, badges: 3, country: 'FR' },
  { name: 'Noah Schmidt', title: 'Grammar Novice', xp: 520, badges: 2, country: 'DE' },
  { name: 'Chloe Kim', title: 'Grammar Novice', xp: 340, badges: 1, country: 'KR' }
];

export const getGlobalLeaderboard = (player: PlayerProgression): LeaderboardEntry[] => {
  const playerLevelInfo = getLevelFromXp(player.xp);
  const playerBadges = player.achievements.filter(a => a.unlocked).length;

  const allEntries = [
    ...COMMUNITY_PLAYERS.map(p => {
      const info = getLevelFromXp(p.xp);
      return {
        name: p.name,
        title: p.title,
        level: info.level,
        xp: p.xp,
        badges: p.badges,
        isCurrentPlayer: false,
        country: p.country
      };
    }),
    {
      name: player.playerName || 'Player (You)',
      title: playerLevelInfo.title,
      level: playerLevelInfo.level,
      xp: player.xp,
      badges: playerBadges,
      isCurrentPlayer: true,
      country: 'YOU'
    }
  ];

  allEntries.sort((a, b) => b.xp - a.xp);

  return allEntries.map((entry, index) => ({
    ...entry,
    rank: index + 1
  }));
};
