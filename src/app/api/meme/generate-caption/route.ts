import { NextRequest, NextResponse } from 'next/server';

// Offline fallback captions
import memeCaptions from '@/data/meme-captions.json';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

type CaptionCategory = keyof typeof memeCaptions;

function getOfflineCaptions(theme: string): string[] {
  // Try to match theme to a category
  const themeLC = theme.toLowerCase();
  const categoryMap: Record<string, CaptionCategory> = {
    funny: 'funny',
    humor: 'funny',
    lol: 'funny',
    laugh: 'funny',
    sarcastic: 'sarcastic',
    sarcasm: 'sarcastic',
    ironic: 'sarcastic',
    wholesome: 'wholesome',
    sweet: 'wholesome',
    kind: 'wholesome',
    love: 'wholesome',
    cute: 'wholesome',
    relatable: 'relatable',
    life: 'relatable',
    mood: 'relatable',
    everyday: 'relatable',
    savage: 'savage',
    roast: 'savage',
    burn: 'savage',
    boss: 'savage',
    confidence: 'savage',
    motivational: 'motivational',
    motivation: 'motivational',
    inspire: 'motivational',
    hustle: 'motivational',
    grind: 'motivational',
    success: 'motivational',
    cringe: 'cringe',
    awkward: 'cringe',
    reaction: 'reaction',
    face: 'reaction',
    when: 'reaction',
    expression: 'reaction',
  };

  // Find matching category
  let matchedCategory: CaptionCategory | null = null;
  for (const [keyword, category] of Object.entries(categoryMap)) {
    if (themeLC.includes(keyword)) {
      matchedCategory = category;
      break;
    }
  }

  // If no match, pick a random category
  const categories = Object.keys(memeCaptions) as CaptionCategory[];
  const category = matchedCategory || categories[Math.floor(Math.random() * categories.length)];
  const pool = memeCaptions[category];

  // Shuffle and pick 5
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const theme = body.theme || 'funny meme';

    // Try Gemini AI first if API key is available
    if (GEMINI_API_KEY) {
      try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

        const prompt = `Generate exactly 5 short, viral meme captions (each under 15 words) for the theme: "${theme}".
Make them funny, shareable, and Gen-Z friendly. Mix styles: some with "When..." format, some relatable, some savage.
Return ONLY a JSON array of 5 strings, no other text. Example: ["caption 1", "caption 2", "caption 3", "caption 4", "caption 5"]`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();

        // Parse JSON from response - handle potential markdown code blocks
        let cleanText = text;
        if (cleanText.startsWith('```')) {
          cleanText = cleanText.replace(/```(?:json)?\n?/g, '').trim();
        }

        const captions = JSON.parse(cleanText);
        if (Array.isArray(captions) && captions.length >= 3) {
          return NextResponse.json({
            captions: captions.slice(0, 5),
            source: 'ai',
          });
        }
      } catch (aiError) {
        console.warn('Gemini AI failed, falling back to offline captions:', aiError);
      }
    }

    // Fallback to offline captions
    const captions = getOfflineCaptions(theme);
    return NextResponse.json({
      captions,
      source: 'offline',
    });
  } catch (error) {
    console.error('Caption generation error:', error);
    // Ultimate fallback
    return NextResponse.json({
      captions: getOfflineCaptions('funny'),
      source: 'offline',
    });
  }
}
