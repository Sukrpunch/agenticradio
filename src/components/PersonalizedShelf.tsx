'use client';
import { useEffect, useState } from 'react';
import { useAuth, supabase } from '@/context/AuthContext';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  creator?: {
    username: string;
    display_name: string;
  };
  cover_art_url?: string;
  like_count?: number;
}

interface ShelfItem {
  query: string;
  tracks: Track[];
}

export function PersonalizedShelf() {
  const { user } = useAuth();
  const [shelves, setShelves] = useState<ShelfItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchPersonalizedShelves = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      // Get recent search queries
      const response = await fetch('/api/search-history', {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });

      if (!response.ok) {
        setLoading(false);
        return;
      }

      const queries = await response.json();
      if (queries.length === 0) {
        setLoading(false);
        return;
      }

      // Get top 2 most recent searches
      const topQueries = queries.slice(0, 2);
      const newShelves: ShelfItem[] = [];

      // For each query, fetch matching tracks
      for (const query of topQueries) {
        const { data: tracks } = await supabase
          .from('tracks')
          .select('*, creator:creator_id(username, display_name)')
          .or(`title.ilike.%${query}%,genre.ilike.%${query}%`)
          .eq('status', 'published')
          .limit(3);

        if (tracks && tracks.length > 0) {
          newShelves.push({
            query,
            tracks: tracks as any,
          });
        }
      }

      setShelves(newShelves);
      setLoading(false);
    };

    fetchPersonalizedShelves();
  }, [user]);

  if (loading || shelves.length === 0) {
    return null;
  }

  return (
    <div className="mb-12 space-y-8">
      {shelves.map((shelf) => (
        <div key={shelf.query}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Based on your search for "{shelf.query}"</h2>
            <Link
              href={`/search?q=${encodeURIComponent(shelf.query)}`}
              className="flex items-center gap-1 text-violet-400 hover:text-violet-300 transition"
            >
              See all <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shelf.tracks.map((track) => (
              <Link
                key={track.id}
                href={`/listen?track=${track.id}`}
                className="bg-[#0f1623] border border-[#1e2d45] rounded-lg overflow-hidden hover:border-[#7c3aed]/50 hover:shadow-lg hover:shadow-[#7c3aed]/10 transition-all duration-200"
              >
                {track.cover_art_url && (
                  <img
                    src={track.cover_art_url}
                    alt={track.title}
                    className="w-full aspect-square object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-bold text-white line-clamp-2 mb-2">
                    {track.title}
                  </h3>
                  <p className="text-sm text-gray-400">
                    by {track.creator?.display_name || track.creator?.username || 'Unknown'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
