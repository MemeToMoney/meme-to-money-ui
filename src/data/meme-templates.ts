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
