import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://agenticradio.ai';

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/browse`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/charts`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/trending`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/challenges`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/activity`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/stations`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/prompts`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/shows`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/breakdown`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ];

  try {
    // Fetch all published tracks
    const { data: tracks } = await supabase
      .from('tracks')
      .select('id, updated_at')
      .eq('status', 'published')
      .limit(1000);

    const trackRoutes: MetadataRoute.Sitemap = (tracks || []).map((track: any) => ({
      url: `${baseUrl}/tracks/${track.id}`,
      lastModified: new Date(track.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    // Fetch all creator profiles
    const { data: creators } = await supabase
      .from('profiles')
      .select('username, updated_at')
      .limit(1000);

    const creatorRoutes: MetadataRoute.Sitemap = (creators || []).map((creator: any) => ({
      url: `${baseUrl}/creators/${creator.username}`,
      lastModified: new Date(creator.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    // Fetch playlists
    const { data: playlists } = await supabase
      .from('playlists')
      .select('id, updated_at')
      .eq('is_public', true)
      .limit(500);

    const playlistRoutes: MetadataRoute.Sitemap = (playlists || []).map((playlist: any) => ({
      url: `${baseUrl}/playlists/${playlist.id}`,
      lastModified: new Date(playlist.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    return [...staticRoutes, ...trackRoutes, ...creatorRoutes, ...playlistRoutes];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return staticRoutes;
  }
}
