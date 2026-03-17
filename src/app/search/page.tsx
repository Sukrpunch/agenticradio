'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase, useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';

interface SearchTrack {
  id: string;
  title: string;
  genre: string;
  play_count: number;
  like_count: number;
  cover_url?: string;
  is_collab: boolean;
  is_remix: boolean;
  creator_id: string;
  profiles?: { username: string; display_name: string; avatar_url?: string };
}

interface SearchCreator {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  follower_count: number;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const { user } = useAuth();

  const [tab, setTab] = useState<'tracks' | 'creators'>('tracks');
  const [tracks, setTracks] = useState<SearchTrack[]>([]);
  const [creators, setCreators] = useState<SearchCreator[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Fetch recent searches
  useEffect(() => {
    if (!user) return;
    const fetchRecentSearches = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const response = await fetch('/api/search-history', {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });
      if (response.ok) {
        const queries = await response.json();
        setRecentSearches(queries);
      }
    };
    fetchRecentSearches();
  }, [user]);

  // Save search to history when query changes
  useEffect(() => {
    if (!q.trim() || !user) return;
    const saveSearch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      await fetch('/api/search-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ query: q }),
      });
    };
    const timer = setTimeout(saveSearch, 500); // Debounce
    return () => clearTimeout(timer);
  }, [q, user]);

  useEffect(() => {
    if (!q.trim()) {
      setTracks([]);
      setCreators([]);
      return;
    }

    const search = async () => {
      setLoading(true);

      try {
        if (tab === 'tracks') {
          const { data, error } = await supabase
            .from('tracks')
            .select('*, profiles(username, display_name, avatar_url)')
            .or(`title.ilike.%${q}%,genre.ilike.%${q}%`)
            .eq('status', 'published')
            .order('play_count', { ascending: false })
            .limit(20);

          if (error) throw error;
          setTracks((data || []) as SearchTrack[]);
        } else {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .or(`username.ilike.%${q}%,display_name.ilike.%${q}%`)
            .order('follower_count', { ascending: false })
            .limit(20);

          if (error) throw error;
          setCreators((data || []) as SearchCreator[]);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [q, tab]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            {q ? `Search Results for "${q}"` : 'Search'}
          </h1>
          {q && (
            <p className="text-gray-400">
              {tab === 'tracks' ? `${tracks.length} tracks` : `${creators.length} creators`} found
            </p>
          )}
        </div>

        {/* Tabs */}
        {q && (
          <div className="flex gap-4 mb-8 border-b border-zinc-700">
            <button
              onClick={() => setTab('tracks')}
              className={`pb-3 font-medium border-b-2 transition ${
                tab === 'tracks'
                  ? 'border-violet-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Tracks
            </button>
            <button
              onClick={() => setTab('creators')}
              className={`pb-3 font-medium border-b-2 transition ${
                tab === 'creators'
                  ? 'border-violet-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Creators
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-400">Searching...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && q && (
          <>
            {tab === 'tracks' && tracks.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No tracks found for "{q}"</p>
              </div>
            )}
            {tab === 'creators' && creators.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No creators found for "{q}"</p>
              </div>
            )}
          </>
        )}

        {/* Tracks Results */}
        {tab === 'tracks' && !loading && tracks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tracks.map((track) => (
              <Link
                key={track.id}
                href={`/tracks/${track.id}`}
                className="group bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700 hover:border-violet-500/50 transition"
              >
                {/* Cover */}
                {track.cover_url && (
                  <div className="relative w-full pt-[100%]">
                    <Image
                      src={track.cover_url}
                      alt={track.title}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                )}
                {!track.cover_url && (
                  <div className="w-full aspect-square bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center">
                    <span className="text-4xl">🎵</span>
                  </div>
                )}

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-bold text-lg group-hover:text-violet-400 transition line-clamp-2 mb-2">
                    {track.title}
                  </h3>

                  {/* Creator */}
                  <p className="text-sm text-gray-400 mb-3">
                    By {(track.profiles as any)?.display_name || 'Unknown'}
                  </p>

                  {/* Genre & Badges */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="text-xs bg-zinc-700 px-2 py-1 rounded">
                      {track.genre}
                    </span>
                    {track.is_collab && (
                      <span className="text-xs bg-cyan-900/50 text-cyan-300 px-2 py-1 rounded">
                        Collab
                      </span>
                    )}
                    {track.is_remix && (
                      <span className="text-xs bg-orange-900/50 text-orange-300 px-2 py-1 rounded">
                        Remix
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>▶️ {(track.play_count || 0).toLocaleString()}</span>
                    <span>❤️ {(track.like_count || 0).toLocaleString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Creators Results */}
        {tab === 'creators' && !loading && creators.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creators.map((creator) => (
              <Link
                key={creator.id}
                href={`/creators/${creator.username}`}
                className="group bg-zinc-800 rounded-lg border border-zinc-700 hover:border-violet-500/50 transition p-6 text-center"
              >
                {/* Avatar */}
                {creator.avatar_url && (
                  <div className="mb-4 flex justify-center">
                    <Image
                      src={creator.avatar_url}
                      alt={creator.username}
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  </div>
                )}
                {!creator.avatar_url && (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center mx-auto mb-4 text-3xl">
                    👤
                  </div>
                )}

                {/* Name */}
                <h3 className="font-bold text-lg group-hover:text-violet-400 transition mb-1">
                  {creator.display_name}
                </h3>
                <p className="text-sm text-gray-400 mb-4">@{creator.username}</p>

                {/* Followers */}
                <div className="bg-zinc-700/50 rounded px-3 py-2 inline-block text-sm">
                  👥 {(creator.follower_count || 0).toLocaleString()} followers
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* No search query */}
        {!q && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-8">Enter a search term to find tracks or creators</p>
            {recentSearches.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-left">Recent Searches</h2>
                <div className="flex flex-wrap gap-2 justify-start">
                  {recentSearches.map((query) => (
                    <Link
                      key={query}
                      href={`/search?q=${encodeURIComponent(query)}`}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-full text-sm transition"
                    >
                      {query}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-900 flex items-center justify-center text-white">Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
