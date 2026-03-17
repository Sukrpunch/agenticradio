import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function getProfile(username: string) {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('username, display_name, bio, avatar_url')
      .eq('username', username)
      .single();
    return data;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfile(username);

  if (!profile) {
    return {
      title: 'Agentic Radio',
      description: 'AI-generated music platform',
    };
  }

  const description =
    profile.bio ||
    `${profile.display_name} on Agentic Radio — Discover AI-generated music from this creator.`;
  const imageUrl = profile.avatar_url || 'https://agenticradio.ai/og-default.png';

  return {
    title: `${profile.display_name} (@${profile.username}) — Agentic Radio`,
    description,
    openGraph: {
      title: `${profile.display_name} on Agentic Radio`,
      description,
      images: [
        {
          url: imageUrl,
          width: 400,
          height: 400,
          alt: profile.display_name,
        },
      ],
      type: 'profile',
      url: `https://agenticradio.ai/creators/${profile.username}`,
    },
    twitter: {
      card: 'summary',
      title: `${profile.display_name} on Agentic Radio`,
      description,
      images: [imageUrl],
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
