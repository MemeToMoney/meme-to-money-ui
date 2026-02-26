// Filter presets for Meme Cam
// Each preset maps to CSS filter values applied to the canvas image

export interface FilterPreset {
  name: string;
  label: string;
  css: string; // CSS filter string
  // Konva-compatible filter config
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
}

const filterPresets: FilterPreset[] = [
  {
    name: 'none',
    label: 'Normal',
    css: 'none',
    brightness: 0,
    contrast: 0,
    saturation: 0,
    hue: 0,
  },
  {
    name: 'vintage',
    label: 'Vintage',
    css: 'sepia(0.4) contrast(1.1) brightness(1.05) saturate(0.8)',
    brightness: 0.05,
    contrast: 10,
    saturation: -0.2,
    hue: 30,
  },
  {
    name: 'dramatic',
    label: 'Dramatic',
    css: 'contrast(1.4) brightness(0.95) saturate(1.2)',
    brightness: -0.05,
    contrast: 40,
    saturation: 0.2,
    hue: 0,
  },
  {
    name: 'bw',
    label: 'B&W',
    css: 'grayscale(1) contrast(1.1)',
    brightness: 0,
    contrast: 10,
    saturation: -1,
    hue: 0,
  },
  {
    name: 'warm',
    label: 'Warm',
    css: 'sepia(0.2) saturate(1.3) brightness(1.05)',
    brightness: 0.05,
    contrast: 0,
    saturation: 0.3,
    hue: 20,
  },
  {
    name: 'cool',
    label: 'Cool',
    css: 'saturate(0.9) brightness(1.05) hue-rotate(200deg)',
    brightness: 0.05,
    contrast: 0,
    saturation: -0.1,
    hue: 200,
  },
  {
    name: 'pop',
    label: 'Pop',
    css: 'contrast(1.3) saturate(1.5) brightness(1.1)',
    brightness: 0.1,
    contrast: 30,
    saturation: 0.5,
    hue: 0,
  },
  {
    name: 'faded',
    label: 'Faded',
    css: 'contrast(0.9) brightness(1.1) saturate(0.7)',
    brightness: 0.1,
    contrast: -10,
    saturation: -0.3,
    hue: 0,
  },
  {
    name: 'neon',
    label: 'Neon',
    css: 'contrast(1.2) saturate(1.8) brightness(1.1) hue-rotate(320deg)',
    brightness: 0.1,
    contrast: 20,
    saturation: 0.8,
    hue: 320,
  },
  {
    name: 'meme',
    label: 'Meme',
    css: 'contrast(1.5) brightness(1.1) saturate(1.4)',
    brightness: 0.1,
    contrast: 50,
    saturation: 0.4,
    hue: 0,
  },
];

export default filterPresets;
