import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function getPlaylist(id: string) {
  try {
    const { data } = await supabase
      .from('playlists')
      .select('id, name, description, cover_image_url, creator_id, creator:creator_id(display_name, username)')
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
  const playlist = await getPlaylist(id);

  if (!playlist) {
    return {
      title: 'Agentic Radio',
      description: 'AI-generated music platform',
    };
  }

  const description =
    playlist.description ||
    `Playlist curated on Agentic Radio. Discover AI-generated music.`;
  const imageUrl = playlist.cover_image_url || 'https://agenticradio.ai/og-default.png';

  return {
    title: `${playlist.name} — Agentic Radio`,
    description,
    openGraph: {
      title: `${playlist.name} — Agentic Radio`,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: playlist.name,
        },
      ],
      type: 'music.playlist',
      url: `https://agenticradio.ai/playlists/${playlist.id}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${playlist.name} — Agentic Radio`,
      description,
      images: [imageUrl],
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
