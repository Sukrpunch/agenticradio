'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MobileNav } from '@/components/MobileNav';
import { Footer } from '@/components/Footer';
import { useAuth, supabase } from '@/context/AuthContext';
import { LikeButton } from '@/components/LikeButton';
import { PersonalizedShelf } from '@/components/PersonalizedShelf';
import { DailyMix } from '@/components/recommendations/DailyMix';
import { TipButton } from '@/components/tips/TipButton';
import { VerifiedBadge } from '@/components/creators/VerifiedBadge';

interface Track {
  id: string;
  title: string;
  artist_handle: string;
  creator_id: string;
  duration_seconds: number;
  cover_art_url?: string;
  is_collab: boolean;
  is_remix: boolean;
  created_at: string;
  like_count?: number;
  tip_count?: number;
  creator?: {
    username: string;
    display_name: string;
    is_verified?: boolean;
  };
}

export default function BrowsePage() {
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [tab, setTab] = useState<'discover' | 'following'>('discover');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const itemsPerPage = 20;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchDiscoverTracks = async (pageNum: number) => {
    try {
      setLoading(true);
      const offset = (pageNum - 1) * itemsPerPage;
      
      const { data: tracksData, error } = await supabase
        .from('tracks')
        .select('*, creator:creator_id(username, display_name, is_verified)')
        .order('created_at', { ascending: false })
        .range(offset, offset + itemsPerPage - 1);

      if (error) {
        console.error('Error fetching tracks:', error);
        return;
      }

      if (pageNum === 1) {
        setTracks(tracksData || []);
      } else {
        setTracks(prev => [...prev, ...(tracksData || [])]);
      }

      setHasMore((tracksData?.length ?? 0) === itemsPerPage);
    } catch (error) {
      console.error('Failed to fetch tracks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowingTracks = async (pageNum: number) => {
    if (!user) {
      setTracks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const offset = (pageNum - 1) * itemsPerPage;

      // Get list of users current user is following
      const { data: following } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      const followingIds = following?.map(f => f.following_id) ?? [];

      if (followingIds.length === 0) {
        setTracks([]);
        setHasMore(false);
        setLoading(false);
        return;
      }

      // Get tracks from followed creators
      const { data: tracksData, error } = await supabase
        .from('tracks')
        .select('*, creator:creator_id(username, display_name, is_verified)')
        .in('creator_id', followingIds)
        .order('created_at', { ascending: false })
        .range(offset, offset + itemsPerPage - 1);

      if (error) {
        console.error('Error fetching following tracks:', error);
        return;
      }

      if (pageNum === 1) {
        setTracks(tracksData || []);
      } else {
        setTracks(prev => [...prev, ...(tracksData || [])]);
      }

      setHasMore((tracksData?.length ?? 0) === itemsPerPage);
    } catch (error) {
      console.error('Failed to fetch following tracks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setTracks([]);
    if (tab === 'discover') {
      fetchDiscoverTracks(1);
    } else {
      fetchFollowingTracks(1);
    }
  }, [tab, user]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    if (tab === 'discover') {
      fetchDiscoverTracks(nextPage);
    } else {
      fetchFollowingTracks(nextPage);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-white flex flex-col">
      <MobileNav isScrolled={isScrolled} />

      {/* Main Content */}
      <main className="flex-1 pt-24 px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-6">Browse Tracks</h1>
          </div>

          {/* Daily Mix - logged in users */}
          {user && (
            <div className="mb-12">
              <DailyMix />
            </div>
          )}

          {/* Tabs */}
          <div className="mb-8">
            <div className="flex gap-4 border-b border-[#1e2d45]">
              <button
                onClick={() => setTab('discover')}
                className={`px-6 py-3 font-medium transition-all ${
                  tab === 'discover'
                    ? 'text-[#7c3aed] border-b-2 border-[#7c3aed]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Discover
              </button>
              {user && (
                <button
                  onClick={() => setTab('following')}
                  className={`px-6 py-3 font-medium transition-all ${
                    tab === 'following'
                      ? 'text-[#7c3aed] border-b-2 border-[#7c3aed]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Following
                </button>
              )}
            </div>
          </div>

          {/* Personalized Shelf for Discover Tab */}
          {tab === 'discover' && <PersonalizedShelf />}

          {/* Empty State for Following */}
          {tab === 'following' && !loading && tracks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg mb-6">
                Follow some creators to see their tracks here
              </p>
              <Link
                href="/creators"
                className="inline-block px-6 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg font-medium transition-all duration-200"
              >
                Discover Creators
              </Link>
            </div>
          )}

          {/* Tracks Grid */}
          {tracks.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {tracks.map(track => (
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
                    <p className="text-sm text-gray-400 mb-3 flex items-center gap-2">
                      by {track.creator?.display_name || track.creator?.username || track.artist_handle}
                      <VerifiedBadge isVerified={track.creator?.is_verified} size="sm" />
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <span>
                          {track.duration_seconds ? `${Math.floor(track.duration_seconds / 60)}:${(track.duration_seconds % 60).toString().padStart(2, '0')}` : '—'}
                        </span>
                        {track.tip_count ? (
                          <span className="flex items-center gap-0.5">
                            💰 {track.tip_count}
                          </span>
                        ) : null}
                      </div>
                      <LikeButton trackId={track.id} initialLikes={track.like_count || 0} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Loading State */}
          {loading && tracks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">Loading...</p>
            </div>
          )}

          {/* Load More Button */}
          {hasMore && tracks.length > 0 && (
            <div className="text-center">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-8 py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-all duration-200"
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
