// Meme template configs
// Each template defines a background style and text positions
// Templates are rendered client-side as canvas drawings

export interface MemeTemplate {
  id: string;
  name: string;
  category: 'classic' | 'reaction' | 'format' | 'blank';
  // Background: either a gradient or a layout description
  bgGradient: string; // CSS gradient
  bgColor: string;
  // Text area configurations
  textAreas: {
    id: string;
    label: string;
    defaultText: string;
    position: 'top' | 'bottom' | 'top-left' | 'top-right' | 'center';
    yPercent: number; // % from top
  }[];
  // Layout hints
  splitLayout?: boolean; // For "two panel" memes
  aspectRatio?: string; // default 1:1
}

const memeTemplates: MemeTemplate[] = [
  // Classic meme formats
  {
    id: 'classic-top-bottom',
    name: 'Classic Meme',
    category: 'classic',
    bgGradient: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
    bgColor: '#1a1a2e',
    textAreas: [
      { id: 'top', label: 'Top Text', defaultText: 'WHEN YOU...', position: 'top', yPercent: 5 },
      { id: 'bottom', label: 'Bottom Text', defaultText: 'BUT THEN...', position: 'bottom', yPercent: 85 },
    ],
  },
  {
    id: 'nobody-meme',
    name: 'Nobody:',
    category: 'classic',
    bgGradient: 'linear-gradient(180deg, #ffffff 0%, #f0f0f0 100%)',
    bgColor: '#ffffff',
    textAreas: [
      { id: 'top', label: 'Nobody', defaultText: 'Nobody:', position: 'top', yPercent: 10 },
      { id: 'bottom', label: 'Me', defaultText: 'Me:', position: 'bottom', yPercent: 60 },
    ],
  },
  {
    id: 'pov-meme',
    name: 'POV:',
    category: 'classic',
    bgGradient: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
    bgColor: '#0f0c29',
    textAreas: [
      { id: 'top', label: 'POV Text', defaultText: 'POV: You just...', position: 'top', yPercent: 8 },
      { id: 'bottom', label: 'Caption', defaultText: '', position: 'bottom', yPercent: 85 },
    ],
  },

  // Reaction formats
  {
    id: 'expectation-reality',
    name: 'Expectation vs Reality',
    category: 'format',
    bgGradient: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
    bgColor: '#667eea',
    textAreas: [
      { id: 'top', label: 'Expectation', defaultText: 'Expectation', position: 'top', yPercent: 5 },
      { id: 'bottom', label: 'Reality', defaultText: 'Reality', position: 'bottom', yPercent: 55 },
    ],
    splitLayout: true,
  },
  {
    id: 'me-vs',
    name: 'Me vs. Also Me',
    category: 'format',
    bgGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    bgColor: '#f093fb',
    textAreas: [
      { id: 'top', label: 'Me', defaultText: 'Me:', position: 'top', yPercent: 5 },
      { id: 'bottom', label: 'Also Me', defaultText: 'Also Me:', position: 'bottom', yPercent: 55 },
    ],
    splitLayout: true,
  },
  {
    id: 'brain-expand',
    name: 'Expanding Brain',
    category: 'format',
    bgGradient: 'linear-gradient(180deg, #2d1b69 0%, #11998e 50%, #38ef7d 100%)',
    bgColor: '#2d1b69',
    textAreas: [
      { id: 'top', label: 'Small brain', defaultText: 'Using Google', position: 'top', yPercent: 5 },
      { id: 'bottom', label: 'Big brain', defaultText: 'Asking ChatGPT', position: 'bottom', yPercent: 75 },
    ],
  },

  // Reaction
  {
    id: 'that-face-when',
    name: 'That Face When',
    category: 'reaction',
    bgGradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    bgColor: '#ffecd2',
    textAreas: [
      { id: 'top', label: 'Caption', defaultText: 'That face when...', position: 'top', yPercent: 5 },
      { id: 'bottom', label: 'Reaction', defaultText: '', position: 'bottom', yPercent: 85 },
    ],
  },
  {
    id: 'when-you',
    name: 'When You...',
    category: 'reaction',
    bgGradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    bgColor: '#a18cd1',
    textAreas: [
      { id: 'top', label: 'Setup', defaultText: 'When you finally...', position: 'top', yPercent: 5 },
      { id: 'bottom', label: 'Punchline', defaultText: 'But then...', position: 'bottom', yPercent: 85 },
    ],
  },
  {
    id: 'starter-pack',
    name: 'Starter Pack',
    category: 'format',
    bgGradient: 'linear-gradient(180deg, #fafafa 0%, #e0e0e0 100%)',
    bgColor: '#fafafa',
    textAreas: [
      { id: 'top', label: 'Title', defaultText: 'The ___ Starter Pack', position: 'top', yPercent: 5 },
      { id: 'bottom', label: 'Subtitle', defaultText: '', position: 'bottom', yPercent: 85 },
    ],
  },

  // Popular meme formats
  {
    id: 'drake-format',
    name: 'Drake Format',
    category: 'format',
    bgGradient: 'linear-gradient(180deg, #FFD89B 0%, #FFD89B 50%, #19547B 50%, #19547B 100%)',
    bgColor: '#FFD89B',
    textAreas: [
      { id: 'top', label: 'Nah', defaultText: 'Nah...', position: 'top', yPercent: 15 },
      { id: 'bottom', label: 'Yeah', defaultText: 'Yeah!', position: 'bottom', yPercent: 65 },
    ],
    splitLayout: true,
  },
  {
    id: 'distracted-bf',
    name: 'Distracted BF',
    category: 'format',
    bgGradient: 'linear-gradient(135deg, #e74c3c 0%, #f39c12 50%, #3498db 100%)',
    bgColor: '#e74c3c',
    textAreas: [
      { id: 'top', label: 'The temptation', defaultText: 'New shiny thing', position: 'top', yPercent: 5 },
      { id: 'bottom', label: 'What you should be doing', defaultText: 'My responsibilities', position: 'bottom', yPercent: 85 },
    ],
  },
  {
    id: 'galaxy-brain',
    name: 'Galaxy Brain',
    category: 'format',
    bgGradient: 'linear-gradient(180deg, #141E30 0%, #243B55 30%, #6B46C1 60%, #E040FB 100%)',
    bgColor: '#141E30',
    textAreas: [
      { id: 'top', label: 'Normal idea', defaultText: 'Normal idea', position: 'top', yPercent: 5 },
      { id: 'bottom', label: 'Galaxy brain idea', defaultText: 'GALAXY BRAIN', position: 'bottom', yPercent: 75 },
    ],
  },
  {
    id: 'this-is-fine',
    name: 'This Is Fine',
    category: 'reaction',
    bgGradient: 'linear-gradient(180deg, #FF8A00 0%, #FF4500 50%, #CC0000 100%)',
    bgColor: '#FF8A00',
    textAreas: [
      { id: 'top', label: 'Situation', defaultText: 'Everything is falling apart', position: 'top', yPercent: 5 },
      { id: 'bottom', label: 'Response', defaultText: 'This is fine.', position: 'bottom', yPercent: 80 },
    ],
  },
  {
    id: 'change-my-mind',
    name: 'Change My Mind',
    category: 'format',
    bgGradient: 'linear-gradient(180deg, #87CEEB 0%, #87CEEB 60%, #228B22 60%, #228B22 100%)',
    bgColor: '#87CEEB',
    textAreas: [
      { id: 'top', label: 'Hot take', defaultText: 'Hot take goes here', position: 'top', yPercent: 30 },
      { id: 'bottom', label: 'Challenge', defaultText: 'Change my mind', position: 'bottom', yPercent: 80 },
    ],
  },
  {
    id: 'two-buttons',
    name: 'Two Buttons',
    category: 'format',
    bgGradient: 'linear-gradient(180deg, #FF6B6B 0%, #FF6B6B 50%, #4ECDC4 50%, #4ECDC4 100%)',
    bgColor: '#FF6B6B',
    textAreas: [
      { id: 'top', label: 'Option A', defaultText: 'Option A', position: 'top', yPercent: 15 },
      { id: 'bottom', label: 'Option B', defaultText: 'Option B', position: 'bottom', yPercent: 65 },
    ],
    splitLayout: true,
  },
  {
    id: 'is-this',
    name: 'Is This a...?',
    category: 'reaction',
    bgGradient: 'linear-gradient(135deg, #c2e59c 0%, #64b3f4 100%)',
    bgColor: '#c2e59c',
    textAreas: [
      { id: 'top', label: 'Object', defaultText: '*gestures at thing*', position: 'top', yPercent: 5 },
      { id: 'bottom', label: 'Question', defaultText: 'Is this a pigeon?', position: 'bottom', yPercent: 85 },
    ],
  },
  {
    id: 'uno-reverse',
    name: 'Uno Reverse',
    category: 'reaction',
    bgGradient: 'linear-gradient(135deg, #FF0000 0%, #FFD700 50%, #FF0000 100%)',
    bgColor: '#FF0000',
    textAreas: [
      { id: 'top', label: 'Attack', defaultText: 'When they try to...', position: 'top', yPercent: 5 },
      { id: 'bottom', label: 'Reverse', defaultText: 'UNO REVERSE', position: 'bottom', yPercent: 80 },
    ],
  },

  // Indian / Desi
  {
    id: 'indian-parents-reaction',
    name: 'Indian Parents Reaction',
    category: 'reaction',
    bgGradient: 'linear-gradient(180deg, #FF9933 0%, #FF9933 50%, #138808 50%, #138808 100%)',
    bgColor: '#FF9933',
    textAreas: [
      { id: 'top', label: 'What you did', defaultText: 'Me: Gets 98%', position: 'top', yPercent: 15 },
      { id: 'bottom', label: 'Parents reaction', defaultText: 'Parents: Where is the other 2%?', position: 'bottom', yPercent: 65 },
    ],
    splitLayout: true,
  },

  // Blank templates
  {
    id: 'blank-dark',
    name: 'Dark Blank',
    category: 'blank',
    bgGradient: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 100%)',
    bgColor: '#0f0f0f',
    textAreas: [
      { id: 'top', label: 'Top Text', defaultText: '', position: 'top', yPercent: 10 },
      { id: 'bottom', label: 'Bottom Text', defaultText: '', position: 'bottom', yPercent: 80 },
    ],
  },
  {
    id: 'blank-gradient',
    name: 'Gradient',
    category: 'blank',
    bgGradient: 'linear-gradient(135deg, #6B46C1 0%, #9333EA 50%, #EC4899 100%)',
    bgColor: '#6B46C1',
    textAreas: [
      { id: 'top', label: 'Top Text', defaultText: '', position: 'top', yPercent: 10 },
      { id: 'bottom', label: 'Bottom Text', defaultText: '', position: 'bottom', yPercent: 80 },
    ],
  },
  {
    id: 'blank-sunset',
    name: 'Sunset',
    category: 'blank',
    bgGradient: 'linear-gradient(180deg, #FF512F 0%, #F09819 50%, #DD2476 100%)',
    bgColor: '#FF512F',
    textAreas: [
      { id: 'top', label: 'Top Text', defaultText: '', position: 'top', yPercent: 10 },
      { id: 'bottom', label: 'Bottom Text', defaultText: '', position: 'bottom', yPercent: 80 },
    ],
  },
  {
    id: 'blank-ocean',
    name: 'Ocean',
    category: 'blank',
    bgGradient: 'linear-gradient(180deg, #2193b0 0%, #6dd5ed 100%)',
    bgColor: '#2193b0',
    textAreas: [
      { id: 'top', label: 'Top Text', defaultText: '', position: 'top', yPercent: 10 },
      { id: 'bottom', label: 'Bottom Text', defaultText: '', position: 'bottom', yPercent: 80 },
    ],
  },
];

export default memeTemplates;
