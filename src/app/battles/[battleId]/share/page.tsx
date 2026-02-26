import { Metadata } from 'next';
import BattleShareClient from './BattleShareClient';

// Content service URL for server-side fetch
const CONTENT_SERVICE_URL = process.env.NEXT_PUBLIC_CONTENT_SERVICE_URL
  || (process.env.NEXT_PUBLIC_API_ENV === 'production' || process.env.NODE_ENV === 'production'
    ? 'https://www.upgradestacks.com'
    : 'http://localhost:8081');

interface BattleData {
  id: string;
  theme: string;
  status: string;
  creator1Handle: string;
  creator2Handle?: string;
  creator1Votes: number;
  creator2Votes: number;
}

async function fetchBattle(battleId: string): Promise<BattleData | null> {
  try {
    const res = await fetch(`${CONTENT_SERVICE_URL}/api/battles/${battleId}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    // The API wraps the data in { status, message, data }
    return json.data || json;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ battleId: string }>;
}): Promise<Metadata> {
  const { battleId } = await params;
  const battle = await fetchBattle(battleId);

  if (!battle) {
    return {
      title: 'Meme Battle | MemeToMoney',
      description: 'Check out this meme battle on MemeToMoney!',
    };
  }

  const totalVotes = battle.creator1Votes + battle.creator2Votes;
  const description = battle.status === 'COMPLETED'
    ? `Battle completed! ${totalVotes} votes cast. ${battle.creator1Handle || 'Challenger'} vs ${battle.creator2Handle || 'Opponent'}`
    : `Vote now! ${battle.creator1Handle || 'Challenger'} vs ${battle.creator2Handle || 'Opponent'} - ${totalVotes} votes so far`;

  return {
    title: `Meme Battle: ${battle.theme} | MemeToMoney`,
    description,
    openGraph: {
      title: `Meme Battle: ${battle.theme}`,
      description,
      type: 'website',
      siteName: 'MemeToMoney',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Meme Battle: ${battle.theme}`,
      description,
    },
  };
}

export default async function BattleSharePage({
  params,
}: {
  params: Promise<{ battleId: string }>;
}) {
  const { battleId } = await params;
  return <BattleShareClient battleId={battleId} />;
}
