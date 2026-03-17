import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function getTrack(id: string) {
  try {
    const { data } = await supabase
      .from('tracks')
      .select('id, title, genre, cover_url, creator_id, creator:creator_id(username, display_name)')
      .eq('id', id)
      .single();
    return data;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const track = await getTrack(id);

  if (!track) {
    return {
      title: 'Agentic Radio',
      description: 'AI-generated music platform',
    };
  }

  const creatorName = track.creator?.display_name || track.creator?.username || 'Creator';
  const description =
    `Listen to "${track.title}" by ${creatorName} on Agentic Radio. ` +
    `${track.genre || 'AI-generated'} music from the world's first AI radio station.`;
  const imageUrl = track.cover_url || 'https://agenticradio.ai/og-default.png';

  return {
    title: `${track.title} by ${creatorName} — Agentic Radio`,
    description,
    openGraph: {
      title: `${track.title} — Agentic Radio`,
      description: `${track.genre || 'AI-generated music'} · Listen on Agentic Radio`,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: track.title,
        },
      ],
      type: 'music.song',
      url: `https://agenticradio.ai/tracks/${track.id}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${track.title} by ${creatorName}`,
      description: `${track.genre || 'AI-generated'} music`,
      images: [imageUrl],
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
