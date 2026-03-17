// Weekly Meme Challenge data

export interface WeeklyChallenge {
  theme: string;
  description: string;
  prizePool: string;
  endDate: Date;
  hashTag: string;
  weekNumber: number;
}

const CHALLENGE_THEMES = [
  {
    theme: 'Indian Parents',
    description: 'Create the funniest meme about Indian parents and their iconic dialogues!',
    hashTag: 'indian-parents',
  },
  {
    theme: 'Office Life',
    description: 'Capture the chaos of corporate life in a meme that every employee relates to!',
    hashTag: 'office-life',
  },
  {
    theme: 'Monday Motivation',
    description: 'Monday blues? Turn your pain into the most relatable Monday meme!',
    hashTag: 'monday-motivation',
  },
  {
    theme: 'Weekend Vibes',
    description: 'Show us your best weekend meme - plans vs reality!',
    hashTag: 'weekend-vibes',
  },
  {
    theme: 'Startup Struggles',
    description: 'Founders, developers, interns - share your startup hustle memes!',
    hashTag: 'startup-struggles',
  },
  {
    theme: 'College Days',
    description: 'Attendance, canteen, last-bench vibes - relive college through memes!',
    hashTag: 'college-days',
  },
  {
    theme: 'Gym Fails',
    description: 'Leg day? Skip day? Share your gym humor with the world!',
    hashTag: 'gym-fails',
  },
  {
    theme: 'Food Cravings',
    description: 'Biryani, momos, chai - make us laugh with your food memes!',
    hashTag: 'food-cravings',
  },
  {
    theme: 'Dating Life',
    description: 'Swipe right on this challenge! Best dating meme wins big!',
    hashTag: 'dating-life',
  },
  {
    theme: 'Festival Season',
    description: 'Diwali, Holi, Eid or Christmas - celebrate with the funniest festival meme!',
    hashTag: 'festival-season',
  },
  {
    theme: 'Tech Memes',
    description: 'Bugs, deployments, Stack Overflow - tech humor at its finest!',
    hashTag: 'tech-memes',
  },
  {
    theme: 'Cricket Fever',
    description: 'IPL, World Cup, gully cricket - hit a sixer with your cricket meme!',
    hashTag: 'cricket-fever',
  },
];

/**
 * Get the ISO week number for a given date
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Get the end of the current week (Sunday 11:59 PM IST)
 */
function getWeekEndDate(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const daysUntilSunday = day === 0 ? 0 : 7 - day;
  d.setDate(d.getDate() + daysUntilSunday);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Get the current week's challenge based on date
 */
export function getChallengeOfTheWeek(date: Date = new Date()): WeeklyChallenge {
  const weekNum = getWeekNumber(date);
  const themeIndex = weekNum % CHALLENGE_THEMES.length;
  const theme = CHALLENGE_THEMES[themeIndex];

  return {
    theme: theme.theme,
    description: theme.description,
    prizePool: '2000',
    endDate: getWeekEndDate(date),
    hashTag: theme.hashTag,
    weekNumber: weekNum,
  };
}

/**
 * Get past challenges (last N weeks)
 */
export function getPastChallenges(count: number = 4): WeeklyChallenge[] {
  const now = new Date();
  const challenges: WeeklyChallenge[] = [];

  for (let i = 1; i <= count; i++) {
    const pastDate = new Date(now);
    pastDate.setDate(pastDate.getDate() - i * 7);
    challenges.push(getChallengeOfTheWeek(pastDate));
  }

  return challenges;
}

/**
 * Local meme categories for upload and feed filtering
 */
export const MEME_CATEGORIES = [
  { label: 'Delhi Metro', hashtag: 'delhi-metro' },
  { label: 'Bangalore Traffic', hashtag: 'bangalore-traffic' },
  { label: 'Mumbai Local', hashtag: 'mumbai-local' },
  { label: 'Startup Life', hashtag: 'startup-life' },
  { label: 'Office Memes', hashtag: 'office-memes' },
  { label: 'Indian Parents', hashtag: 'indian-parents' },
  { label: 'Cricket', hashtag: 'cricket' },
  { label: 'Bollywood', hashtag: 'bollywood' },
  { label: 'Engineering', hashtag: 'engineering' },
  { label: 'College Life', hashtag: 'college-life' },
  { label: 'Gym Life', hashtag: 'gym-life' },
  { label: 'Food', hashtag: 'food' },
];

/**
 * Feed filter categories (shorter labels for the horizontal bar)
 */
export const FEED_FILTER_CATEGORIES = [
  { label: 'All', hashtag: '' },
  { label: 'Delhi', hashtag: 'delhi-metro' },
  { label: 'Bangalore', hashtag: 'bangalore-traffic' },
  { label: 'Mumbai', hashtag: 'mumbai-local' },
  { label: 'Startup', hashtag: 'startup-life' },
  { label: 'Office', hashtag: 'office-memes' },
  { label: 'Parents', hashtag: 'indian-parents' },
  { label: 'Cricket', hashtag: 'cricket' },
  { label: 'Bollywood', hashtag: 'bollywood' },
  { label: 'Engineering', hashtag: 'engineering' },
];
