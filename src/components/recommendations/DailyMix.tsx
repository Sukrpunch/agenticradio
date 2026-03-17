'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth, supabase } from '@/context/AuthContext';
import { usePlayer } from '@/context/PlayerContext';
import { Music, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Track {
  id: string;
  title: string;
  creator_id: string;
  cover_url?: string;
  genre?: string;
  play_count?: number;
}

interface Creator {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
}

export function DailyMix() {
  const { user } = useAuth();
  const { addToQueue } = usePlayer();
  const [recommendations, setRecommendations] = useState<Track[]>([]);
  const [creators, setCreators] = useState<Map<string, Creator>>(new Map());
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const fetchDailyMix = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const response = await fetch('/api/recommendations/daily-mix', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) return;
        const { recommendations: recs } = await response.json();
        setRecommendations(recs || []);

        // Fetch creators for recommendations
        if (recs && recs.length > 0) {
          const creatorIds = [...new Set(recs.map(r => r.creator_id))];
          const { data: creatorData } = await supabase
            .from('profiles')
            .select('id, username, display_name, avatar_url')
            .in('id', creatorIds);

          if (creatorData) {
            const creatorMap = new Map(creatorData.map(c => [c.id, c]));
            setCreators(creatorMap);
          }
        }
      } catch (error) {
        console.error('Failed to fetch daily mix:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDailyMix();
  }, [user]);

  const handlePlayAll = async () => {
    if (!user || recommendations.length === 0) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Add all recommendations to queue
      for (const track of recommendations) {
        addToQueue(track);
      }

      // Play first track
      if (recommendations.length > 0) {
        addToQueue(recommendations[0]);
      }
    } catch (error) {
      console.error('Failed to play all:', error);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 300;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (!user || loading) {
    return null;
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-lg p-8 text-center">
        <Music className="w-12 h-12 mx-auto text-gray-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Mason's Daily Mix</h3>
        <p className="text-gray-400">
          Listen to a few tracks and Mason will start curating your personalized mix.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Music className="w-6 h-6 text-violet-500" />
            Mason's Daily Mix
          </h2>
          <p className="text-sm text-gray-400">Curated for you · Updated daily</p>
        </div>
        <button
          onClick={handlePlayAll}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg font-medium transition-all duration-200 text-sm"
        >
          ▶ Play All
        </button>
      </div>

      {/* Scroll Container */}
      <div className="relative group">
        {/* Left arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-violet-600 hover:bg-violet-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable tracks */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
        >
          {recommendations.map(track => {
            const creator = creators.get(track.creator_id);
            return (
              <Link
                key={track.id}
                href={`/tracks/${track.id}`}
                className="flex-shrink-0 w-40 group/card cursor-pointer transition-transform duration-200 hover:scale-105"
              >
                <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg overflow-hidden hover:border-violet-500/50 transition-all duration-200">
                  {/* Cover */}
                  <div className="relative aspect-square bg-gradient-to-br from-violet-500/20 to-cyan-500/20 overflow-hidden">
                    {track.cover_url ? (
                      <img
                        src={track.cover_url}
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="w-8 h-8 text-gray-600" />
                      </div>
                    )}
                    {/* Play button overlay */}
                    <div className="absolute inset-0 bg-black/40 group-hover/card:bg-black/20 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all duration-200">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          addToQueue(track);
                        }}
                        className="p-3 bg-violet-600 hover:bg-violet-500 rounded-full transition-all duration-200"
                      >
                        ▶
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3 space-y-2">
                    <h3 className="font-semibold text-sm line-clamp-2">{track.title}</h3>
                    <p className="text-xs text-gray-400">
                      {creator?.display_name || creator?.username || 'Unknown'}
                    </p>
                    {track.genre && (
                      <p className="text-xs text-violet-400">{track.genre}</p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-violet-600 hover:bg-violet-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
