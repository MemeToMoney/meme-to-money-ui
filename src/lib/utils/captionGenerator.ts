/**
 * AI Meme Caption Generator
 *
 * A smart local caption generation system with pre-built caption templates
 * organized by common meme themes. Uses keyword matching to find relevant
 * categories and returns random caption suggestions.
 */

interface CaptionCategory {
  name: string;
  keywords: string[];
  captions: string[];
}

const CAPTION_CATEGORIES: CaptionCategory[] = [
  {
    name: 'Office / Work',
    keywords: ['office', 'work', 'boss', 'meeting', 'salary', 'job', 'corporate', 'manager', 'coworker', 'colleague', 'email', 'deadline', 'monday', 'friday', 'weekend', 'promotion', 'appraisal', 'hr', 'zoom', 'teams', 'wfh', 'remote', 'intern', 'client', 'presentation'],
    captions: [
      "When the boss says 'quick call' and it's been 2 hours",
      "Me pretending to understand the meeting while my brain is on lunch break",
      "Salary vs expenses be like: David vs Goliath but David loses",
      "When you accidentally reply-all to the entire company",
      "Monday motivation? More like Monday hibernation",
      "That face when the 'optional' meeting becomes mandatory",
      "POV: You're pretending to type while the boss walks by",
      "When the intern asks a question everyone was afraid to ask",
      "My face when they schedule a meeting to plan another meeting",
      "When HR says 'we're like a family here' -- red flag detected",
      "Friday 4:59 PM energy vs Monday 9:01 AM energy",
      "When the WiFi drops during your 'camera on' meeting",
      "Me googling how to do my job while on a call about my job",
      "When they say 'competitive salary' but won't tell you the number",
      "The client: 'One small change.' The change:",
      "When your leave gets approved but guilt hits harder than vacation vibes",
      "WFH day 1: Productive king. WFH day 47: Couch gremlin",
      "When you hear 'Let's circle back' for the 5th time today",
    ],
  },
  {
    name: 'Indian Parents',
    keywords: ['indian', 'parents', 'mom', 'dad', 'mother', 'father', 'mummy', 'papa', 'desi', 'aunty', 'uncle', 'family', 'relative', 'sharma', 'beta', 'padhai', 'marks', 'result', 'rishta', 'marriage', 'wedding', 'arrange'],
    captions: [
      "Mom when I say I'm full vs when guests come over",
      "Parents seeing my career choice: 'Yeh kya hai beta?'",
      "When dad finds out the AC has been running all day",
      "Indian parents: 'We won't get angry, just tell us the truth.' The truth:",
      "Sharma ji ka beta vs Me -- the eternal battle",
      "When relatives ask 'Beta, result kaisa aya?'",
      "Mom's slipper accuracy > any guided missile system",
      "When you come home at 10:01 PM instead of 10:00 PM",
      "Indian parents discovering my screen time report",
      "Dad: 'Paison pe paise uda rahe ho' Me: bought a Rs 20 ice cream",
      "When mom says 'Kuch nahi chahiye' but you better bring something",
      "Indian parents at a wedding: scouting rishtas for you since you were 12",
      "When you finally tell your parents about your girlfriend/boyfriend",
      "POV: Mom calling you by your full name -- you know it's serious",
      "Aunty: 'Kitne marks aaye?' Me: starts sweating in 3...2...1",
      "Dad's WhatsApp forwards vs Actual news accuracy",
      "When mom makes you carry 47 bags from the car in one trip",
      "Indian parents: 'We'll support whatever you do.' Engineering it is then.",
    ],
  },
  {
    name: 'Relationships',
    keywords: ['relationship', 'boyfriend', 'girlfriend', 'bae', 'crush', 'love', 'date', 'dating', 'breakup', 'ex', 'couple', 'valentine', 'heart', 'single', 'friend', 'bestie', 'bro', 'friendzone', 'situationship', 'toxic'],
    captions: [
      "When they say 'we need to talk' -- instant cardiac arrest",
      "Me vs my anxiety when they take 5 min to reply",
      "When bae says 'nothing is wrong' but everything is clearly wrong",
      "Single life: nobody to share fries with, but also nobody stealing them",
      "When your crush likes your post from 3 weeks ago -- THEY WERE STALKING",
      "My love language is sending memes at 3 AM",
      "When they say 'I'm fine' but the period at the end says otherwise",
      "POV: You're composing a 500-word text then deleting it and sending 'ok'",
      "Couples on Instagram vs Couples in real life",
      "When your best friend starts dating and forgets you exist",
      "That feeling when the 'seen' notification appears but no reply comes",
      "Me explaining to my friends why this time it's different (narrator: it wasn't)",
      "When you accidentally like their photo from 2019",
      "Roses are red, violets are blue, I have 5 tabs open looking at your profile and I still play it cool",
      "When they say 'you're like a brother/sister to me' -- friendzone achieved",
      "Situationship energy: we're not together but don't you dare talk to anyone else",
    ],
  },
  {
    name: 'Tech / Engineering',
    keywords: ['code', 'coding', 'programming', 'developer', 'software', 'engineer', 'bug', 'deploy', 'git', 'stack', 'overflow', 'production', 'server', 'api', 'frontend', 'backend', 'debug', 'error', 'compile', 'python', 'javascript', 'java', 'react', 'tech', 'computer', 'laptop', 'hack', 'ai', 'chatgpt'],
    captions: [
      "When the code works on first try -- impossible, what did I miss?",
      "Git blame showing my name on every broken line",
      "When production goes down on a Friday evening",
      "Stack Overflow copy-paste engineers, where you at?",
      "It works on my machine -- the universal developer excuse",
      "'Just one more feature' -- famous last words before deadline",
      "When you fix one bug and 3 new ones appear",
      "Me: writes 10 lines of code. Debug: takes 10 hours.",
      "When the junior pushes directly to main",
      "POV: Reading your own code from 6 months ago",
      "Closing 47 Stack Overflow tabs after the bug is fixed",
      "When ChatGPT writes better code than you -- existential crisis mode",
      "The code works but nobody knows why. DON'T. TOUCH. IT.",
      "Deployment at 5 PM on Friday -- what could go wrong?",
      "When the client says 'It should be simple' -- narrator: it was not simple",
      "Rubber duck debugging actually working -- the duck is the real MVP",
      "Me: I'll just quickly check this error. 4 hours later...",
      "When you mass-comment your code and call it 'documentation'",
    ],
  },
  {
    name: 'College / Student',
    keywords: ['college', 'student', 'university', 'exam', 'assignment', 'homework', 'study', 'class', 'lecture', 'professor', 'teacher', 'school', 'hostel', 'canteen', 'attendance', 'semester', 'backlog', 'topper', 'notes', 'library', 'viva', 'placement'],
    captions: [
      "Assignment due tomorrow, started today -- speedrun mode activated",
      "Me in the last bench vs Me when attendance is being taken",
      "Attendance below 75% -- the real horror story of every semester",
      "When the professor says 'This won't come in the exam' -- it definitely will",
      "Night before exam: suddenly becomes the most productive human alive",
      "When the topper says 'Bro I haven't studied at all' -- biggest lie ever told",
      "Group project: 1 person does everything, 4 people add their names",
      "POV: Opening the question paper and nothing looks familiar",
      "Hostel food vs Home food -- the gap is astronomical",
      "When you realize the syllabus is 10 chapters and you've done 0.5",
      "Me during online class: camera off, mic muted, soul departed",
      "The canteen tea keeping the entire college alive since forever",
      "When placement season starts and reality hits harder than any exam",
      "Professor: 'Any questions?' The class: dead silence. Everyone: confused.",
      "Submitting assignments at 11:59 PM -- living life on the edge",
      "When your friend who bunks every class gets better marks than you",
    ],
  },
  {
    name: 'Gym / Fitness',
    keywords: ['gym', 'fitness', 'workout', 'exercise', 'muscle', 'protein', 'diet', 'weight', 'body', 'bench', 'squat', 'deadlift', 'cardio', 'gains', 'bulk', 'cut', 'leg', 'arm', 'chest', 'abs', 'running', 'yoga'],
    captions: [
      "Day 1 vs Day 365 -- same body, different gym selfie angles",
      "When someone's on your machine at the gym for the last 45 minutes",
      "Skipping leg day again because 'legs are already strong from walking'",
      "My gym membership crying in the corner while I eat pizza",
      "Protein shake at 6 AM hits different when you're still half asleep",
      "When you see your gym crush and suddenly lift 20kg more",
      "New Year resolution: Day 1 at gym. Day 4: What gym?",
      "That one guy who grunts louder than a lion on every rep",
      "Me: I'll just do a light workout. Also me: can't move for 3 days",
      "When the mirror at home says no gains but gym mirror says Greek god",
      "Cardio? I thought you said car-key-o. Anyway, I'm driving.",
      "Post-workout selfie game strong, actual workout -- questionable",
      "When your gym buddy cancels and now you have to self-motivate",
      "Diet starts Monday (said every Monday for the last 3 years)",
      "The walk from the car to the gym door is the hardest part",
      "When someone asks how much you bench and you panic-calculate in your head",
    ],
  },
  {
    name: 'Food',
    keywords: ['food', 'eat', 'eating', 'hungry', 'biryani', 'pizza', 'burger', 'maggi', 'chai', 'tea', 'coffee', 'cook', 'cooking', 'kitchen', 'restaurant', 'order', 'zomato', 'swiggy', 'diet', 'dessert', 'chocolate', 'snack', 'lunch', 'dinner', 'breakfast'],
    captions: [
      "Diet starts Monday (every single week since 2019)",
      "When the biryani arrives -- all problems temporarily solved",
      "Maggi at 2 AM hits different, no explanation needed",
      "Me: I'll eat healthy today. Also me: orders butter chicken at midnight",
      "When someone says 'I'm not hungry' then eats half your plate",
      "Chai is not just a drink, it's a lifestyle and an emotion",
      "POV: Checking Zomato/Swiggy for 30 minutes then cooking Maggi anyway",
      "The audacity of restaurants charging extra for cheese",
      "When mom asks what you want for dinner and everything sounds perfect",
      "Me looking at food pics at midnight knowing full well I can't eat",
      "When the delivery guy calls and you sprint to the door like Usain Bolt",
      "One does not simply eat just one slice of pizza",
      "When you're on a diet and someone brings cake to the office",
      "The fridge at 3 AM: the only loyal relationship in my life",
      "When you finish your food and your friend hasn't started yet",
      "Cooking for yourself: MasterChef. Cooking for guests: panic attack.",
    ],
  },
  {
    name: 'General / Trending',
    keywords: ['general', 'trending', 'viral', 'meme', 'mood', 'vibe', 'relatable', 'life', 'reality', 'truth', 'actually', 'literally', 'money', 'sleep', 'morning', 'night', 'people', 'nobody', 'everyone', 'society'],
    captions: [
      "Nobody: ... Absolutely nobody: ... Me at 3 AM:",
      "POV: You're pretending to have your life together",
      "Tell me you're broke without telling me you're broke",
      "Me explaining to myself why I need this unnecessary purchase",
      "That one brain cell working overtime to keep me functional",
      "When you set 15 alarms and still wake up late",
      "Me: I should sleep early tonight. Clock: 3:47 AM. Me: still scrolling.",
      "My bank account and my wishlist are in two different tax brackets",
      "When you finally do something productive and need everyone to know",
      "Expectation vs Reality -- the story of my entire life",
      "That moment when you realize tomorrow is Monday again",
      "Me pretending to be shocked by something I already knew",
      "When you accidentally open the front camera -- jumpscare of the year",
      "The 'I'll do it later' energy is unmatched and undefeated",
      "When the WiFi goes down and you have to interact with your family",
      "My plans vs The universe's plans for me",
      "When your phone is at 1% and the charger is across the room",
      "Introvert energy: cancelling plans is my cardio",
    ],
  },
  {
    name: 'Money / Finance',
    keywords: ['money', 'broke', 'salary', 'rich', 'poor', 'bank', 'emi', 'loan', 'invest', 'stock', 'market', 'crypto', 'bitcoin', 'save', 'savings', 'expense', 'budget', 'tax', 'upi', 'paytm', 'gpay'],
    captions: [
      "My salary visiting my account for 0.3 seconds before EMIs eat it",
      "Me: I'll save money this month. Day 1: orders on Zomato twice",
      "When you check your bank balance and it checks you right back",
      "Salary day vs Day 5 after salary -- two completely different people",
      "My savings account: exists. Online sales: I'm about to end this man's career",
      "When someone splits the bill equally but you only had water",
      "POV: You're calculating if you can afford that thing (you can't)",
      "Budget for the month: made. Budget by day 3: destroyed.",
      "When someone asks to borrow money you don't have",
      "Me promising myself no unnecessary spending. Also me: adds to cart",
      "That mini heart attack when you see your credit card statement",
      "UPI made spending money way too easy and I'm a victim",
      "When the ATM says 'insufficient balance' in public -- the betrayal",
      "Financial planning: the art of worrying about money you don't have yet",
    ],
  },
  {
    name: 'Cricket / Sports',
    keywords: ['cricket', 'ipl', 'match', 'sport', 'football', 'goal', 'team', 'player', 'captain', 'wicket', 'six', 'boundary', 'kohli', 'dhoni', 'rcb', 'csk', 'mi', 'world cup', 'stadium'],
    captions: [
      "RCB fans every season: 'Ee sala cup namde' (this time for real though)",
      "When Dhoni walks in at number 7 and everyone suddenly believes",
      "IPL season: productivity drops, heart rate spikes",
      "That one friend who becomes a cricket expert every World Cup",
      "When your team needs 36 off 6 balls and you still have hope",
      "POV: Explaining cricket to someone who's never watched it",
      "When the umpire gives a wrong decision -- TV remote in danger",
      "Gully cricket rules > International cricket rules",
      "When your fantasy team scores less than the actual worst player",
      "That uncle who claims he could've played for India if he 'wanted to'",
      "Match day outfit vs Regular day -- it's giving superfan",
      "When the last over has more drama than any Netflix series",
    ],
  },
  {
    name: 'Social Media',
    keywords: ['instagram', 'insta', 'reels', 'tiktok', 'youtube', 'twitter', 'x', 'social', 'media', 'followers', 'likes', 'viral', 'post', 'story', 'content', 'creator', 'influencer', 'notification', 'scroll', 'feed', 'algorithm'],
    captions: [
      "Me: I'll just check Instagram for 5 minutes. 3 hours later...",
      "When your reel gets 10 views and 8 of them are you",
      "The algorithm: shows you exactly what you were just talking about",
      "When you post a fire selfie and get 3 likes (thanks mom, dad, and me)",
      "POV: You're stalking someone's profile and accidentally like a 2-year-old photo",
      "Content creator life: 2 hours of work for a 15-second video",
      "When someone unfollows you and you know exactly who it was",
      "My screen time report coming in like a personal attack every week",
      "Posting 'just woke up' selfie that took 47 attempts and 3 filters",
      "When the Wi-Fi is slow and you can't even doom-scroll in peace",
      "That notification sound giving more dopamine than actual achievements",
      "Me crafting the perfect caption for 45 minutes vs the photo taking 2 seconds",
    ],
  },
  {
    name: 'Gaming',
    keywords: ['game', 'gaming', 'gamer', 'pubg', 'bgmi', 'valorant', 'minecraft', 'fortnite', 'pc', 'console', 'playstation', 'xbox', 'controller', 'noob', 'pro', 'lag', 'fps', 'headshot', 'clutch', 'respawn'],
    captions: [
      "When you clutch a 1v4 and nobody was watching",
      "Lag: the real enemy in every online game",
      "'One more game' -- the biggest lie in gaming history",
      "When the noob on your team gets the final kill",
      "My aim in practice mode vs my aim in ranked -- two different people",
      "When mom says 'pause your online game' -- if only she knew",
      "That rage quit moment where the controller almost flies out the window",
      "POV: You're explaining to your parents why gaming is a career now",
      "When the server goes down right as you're about to win",
      "Sleeping at 3 AM because 'one more game' turned into ten more games",
      "My K/D ratio is best described as 'we don't talk about it'",
      "When your squad goes to sleep and you keep playing solo like a warrior",
    ],
  },
];

/**
 * Generate caption suggestions based on a user-provided context string.
 * Uses keyword matching to find relevant categories, then returns
 * random captions from those categories.
 *
 * @param context - Description of the meme context (e.g., "office meeting", "Indian parents")
 * @param count - Number of captions to return (default 6)
 * @returns Array of caption strings
 */
export function generateCaptions(context: string, count: number = 6): string[] {
  const contextLower = context.toLowerCase().trim();

  if (!contextLower) {
    return getRandomCaptions(CAPTION_CATEGORIES, count);
  }

  const contextWords = contextLower.split(/\s+/);

  // Score each category by keyword matches
  const scored: { category: CaptionCategory; score: number }[] = CAPTION_CATEGORIES.map((category) => {
    let score = 0;

    for (const word of contextWords) {
      if (word.length < 2) continue;

      for (const keyword of category.keywords) {
        if (keyword === word) {
          score += 3; // Exact match
        } else if (keyword.includes(word) || word.includes(keyword)) {
          score += 1; // Partial match
        }
      }

      // Also check category name
      if (category.name.toLowerCase().includes(word)) {
        score += 2;
      }
    }

    // Also do a fuzzy match against caption text for relevance
    for (const caption of category.captions) {
      const captionLower = caption.toLowerCase();
      for (const word of contextWords) {
        if (word.length >= 3 && captionLower.includes(word)) {
          score += 0.5;
        }
      }
    }

    return { category, score };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Get matching categories (score > 0), or fallback to general
  const matchedCategories = scored.filter((s) => s.score > 0);

  if (matchedCategories.length === 0) {
    // No matches: return from general/trending
    const general = CAPTION_CATEGORIES.find((c) => c.name.includes('General'));
    return shuffleArray(general?.captions || []).slice(0, count);
  }

  // Collect captions from top matched categories, weighted by score
  const pool: string[] = [];
  const topCategories = matchedCategories.slice(0, 3);

  for (const { category } of topCategories) {
    pool.push(...category.captions);
  }

  // Shuffle and return unique captions
  return shuffleArray([...new Set(pool)]).slice(0, count);
}

/**
 * Get all available caption category names for display.
 */
export function getCaptionCategories(): string[] {
  return CAPTION_CATEGORIES.map((c) => c.name);
}

/**
 * Get random captions from all categories.
 */
function getRandomCaptions(categories: CaptionCategory[], count: number): string[] {
  const all: string[] = [];
  for (const cat of categories) {
    all.push(...cat.captions);
  }
  return shuffleArray(all).slice(0, count);
}

/**
 * Fisher-Yates shuffle.
 */
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default generateCaptions;
