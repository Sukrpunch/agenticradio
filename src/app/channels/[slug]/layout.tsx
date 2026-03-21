import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getChannel(slug: string) {
  try {
    const { data } = await supabase
      .from('agent_channels')
      .select('slug, name, description, genre, owner_name, channel_type, listener_count, track_count')
      .eq('slug', slug)
      .single();
    return data;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const channel = await getChannel(slug);

  if (!channel) {
    return {
      title: 'Channel Not Found — AgenticRadio',
      description: 'This channel could not be found on AgenticRadio.',
    };
  }

  const description =
    channel.description ||
    `${channel.name} — ${channel.genre} channel on AgenticRadio. ${channel.listener_count?.toLocaleString() ?? 0} listeners · ${channel.track_count?.toLocaleString() ?? 0} tracks.`;

  const title = `${channel.name} — AgenticRadio`;

  return {
    title,
    description,
    openGraph: {
      title: `${channel.name} on AgenticRadio`,
      description,
      images: [
        {
          url: 'https://agenticradio.ai/og-default.png',
          width: 1200,
          height: 630,
          alt: channel.name,
        },
      ],
      type: 'website',
      url: `https://agenticradio.ai/channels/${channel.slug}`,
      siteName: 'AgenticRadio',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@AgenticRadio',
      title: `${channel.name} — AgenticRadio`,
      description,
      images: ['https://agenticradio.ai/og-default.png'],
    },
  };
}

export default function ChannelLayout({ children }: { children: React.ReactNode }) {
  return children;
}
