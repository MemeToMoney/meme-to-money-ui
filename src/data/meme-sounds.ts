// Meme Sound Library
// Hardcoded sound data - actual audio files to be added later

export interface MemeSound {
  id: string;
  name: string;
  emoji: string;
  duration: string; // display string e.g. "0:03"
  durationSeconds: number;
  category: 'trending' | 'funny' | 'dramatic' | 'music' | 'reactions';
}

const memeSounds: MemeSound[] = [
  // Trending
  {
    id: 'sad-violin',
    name: 'Sad Violin',
    emoji: '\uD83C\uDFBB',
    duration: '0:05',
    durationSeconds: 5,
    category: 'trending',
  },
  {
    id: 'emotional-damage',
    name: 'Emotional Damage',
    emoji: '\uD83D\uDCA5',
    duration: '0:03',
    durationSeconds: 3,
    category: 'trending',
  },
  {
    id: 'sigma-music',
    name: 'Sigma Music',
    emoji: '\uD83D\uDC3A',
    duration: '0:08',
    durationSeconds: 8,
    category: 'trending',
  },
  {
    id: 'among-us',
    name: 'Among Us',
    emoji: '\uD83D\uDE80',
    duration: '0:04',
    durationSeconds: 4,
    category: 'trending',
  },

  // Funny
  {
    id: 'indian-aunty-shouting',
    name: 'Indian Aunty Shouting',
    emoji: '\uD83D\uDCE2',
    duration: '0:04',
    durationSeconds: 4,
    category: 'funny',
  },
  {
    id: 'bruh-sound',
    name: 'Bruh Sound',
    emoji: '\uD83D\uDE10',
    duration: '0:02',
    durationSeconds: 2,
    category: 'funny',
  },
  {
    id: 'vine-boom',
    name: 'Vine Boom',
    emoji: '\uD83D\uDCA3',
    duration: '0:01',
    durationSeconds: 1,
    category: 'funny',
  },
  {
    id: 'windows-error',
    name: 'Windows Error',
    emoji: '\uD83D\uDCBB',
    duration: '0:02',
    durationSeconds: 2,
    category: 'funny',
  },

  // Dramatic
  {
    id: 'oh-no',
    name: 'Oh No',
    emoji: '\uD83D\uDE31',
    duration: '0:04',
    durationSeconds: 4,
    category: 'dramatic',
  },
  {
    id: 'gta-wasted',
    name: 'GTA Wasted',
    emoji: '\uD83D\uDC80',
    duration: '0:03',
    durationSeconds: 3,
    category: 'dramatic',
  },
  {
    id: 'dramatic-chipmunk',
    name: 'Dramatic Chipmunk',
    emoji: '\uD83D\uDC3F\uFE0F',
    duration: '0:03',
    durationSeconds: 3,
    category: 'dramatic',
  },
  {
    id: 'law-and-order',
    name: 'Law & Order',
    emoji: '\u2696\uFE0F',
    duration: '0:04',
    durationSeconds: 4,
    category: 'dramatic',
  },

  // Music
  {
    id: 'curb-your-enthusiasm',
    name: 'Curb Your Enthusiasm',
    emoji: '\uD83C\uDFB6',
    duration: '0:06',
    durationSeconds: 6,
    category: 'music',
  },
  {
    id: 'to-be-continued',
    name: 'To Be Continued',
    emoji: '\u27A1\uFE0F',
    duration: '0:05',
    durationSeconds: 5,
    category: 'music',
  },
  {
    id: 'coffin-dance',
    name: 'Coffin Dance',
    emoji: '\u26B0\uFE0F',
    duration: '0:07',
    durationSeconds: 7,
    category: 'music',
  },
  {
    id: 'run-meme-song',
    name: 'Run Meme Song',
    emoji: '\uD83C\uDFC3',
    duration: '0:05',
    durationSeconds: 5,
    category: 'music',
  },

  // Reactions
  {
    id: 'oof',
    name: 'Oof',
    emoji: '\uD83E\uDD15',
    duration: '0:01',
    durationSeconds: 1,
    category: 'reactions',
  },
  {
    id: 'wow',
    name: 'Wow',
    emoji: '\uD83E\uDD29',
    duration: '0:02',
    durationSeconds: 2,
    category: 'reactions',
  },
  {
    id: 'airhorn',
    name: 'Airhorn',
    emoji: '\uD83D\uDCEF',
    duration: '0:02',
    durationSeconds: 2,
    category: 'reactions',
  },
  {
    id: 'crickets',
    name: 'Crickets',
    emoji: '\uD83E\uDD97',
    duration: '0:03',
    durationSeconds: 3,
    category: 'reactions',
  },
];

export const soundCategories = [
  { key: 'trending' as const, label: 'Trending', emoji: '\uD83D\uDD25' },
  { key: 'funny' as const, label: 'Funny', emoji: '\uD83E\uDD23' },
  { key: 'dramatic' as const, label: 'Dramatic', emoji: '\uD83C\uDFAD' },
  { key: 'music' as const, label: 'Music', emoji: '\uD83C\uDFB5' },
  { key: 'reactions' as const, label: 'Reactions', emoji: '\uD83D\uDCAC' },
];

export default memeSounds;
