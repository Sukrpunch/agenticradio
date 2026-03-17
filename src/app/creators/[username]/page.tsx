'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, useAuth } from '@/context/AuthContext';
import { Profile } from '@/context/AuthContext';
import { useAuthModal } from '@/context/AuthModalContext';
import { FollowButton } from '@/components/social/FollowButton';
import { CollabBadge, RemixBadge } from '@/components/social/ContentBadges';
import { Mail } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist_handle: string;
  duration_seconds: number;
  cover_art_url?: string;
  is_collab: boolean;
  is_remix: boolean;
}

export default function CreatorProfile() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const { user } = useAuth();
  const { openModal } = useAuthModal();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [collabs, setCollabs] = useState<Track[]>([]);
  const [remixes, setRemixes] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'tracks' | 'collabs' | 'remixes'>('tracks');

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      // Fetch profile by username
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (profileError || !profileData) {
        setError('Creator not found');
        setLoading(false);
        return;
      }

      setProfile(profileData);

      // Fetch all tracks for this creator
      const { data: tracksData } = await supabase
        .from('tracks')
        .select('*')
        .eq('artist_email', profileData.id) // Assuming artist_email maps to user ID
        .order('created_at', { ascending: false });

      if (tracksData) {
        setTracks(tracksData.filter((t: Track) => !t.is_collab && !t.is_remix));
        setCollabs(tracksData.filter((t: Track) => t.is_collab));
        setRemixes(tracksData.filter((t: Track) => t.is_remix));
      }

      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError('Failed to load profile');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">404 - Creator Not Found</h1>
          <p className="text-zinc-400 mb-6">{error}</p>
          <Link href="/creators" className="text-violet-400 hover:text-violet-300 font-medium">
            Back to Creators
          </Link>
        </div>
      </div>
    );
  }

  const currentTracks =
    activeTab === 'tracks' ? tracks : activeTab === 'collabs' ? collabs : remixes;

  return (
    <div className="min-h-screen bg-[#080c14] pt-24">
      <div className="max-w-6xl mx-auto px-6">
        {/* Creator Header */}
        <div className="bg-gradient-to-b from-violet-600/20 to-transparent rounded-lg p-8 mb-12">
          <div className="flex items-start gap-8">
            <div className="w-24 h-24 rounded-full bg-violet-500 flex items-center justify-center text-4xl font-bold flex-shrink-0">
              {profile.username?.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-2">{profile.display_name}</h1>
              <p className="text-xl text-zinc-400 mb-4">@{profile.username}</p>
              {profile.bio && <p className="text-zinc-300 mb-6">{profile.bio}</p>}

              <div className="flex items-center gap-8 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{tracks.length + collabs.length + remixes.length}</div>
                  <div className="text-sm text-zinc-400">Tracks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{profile.follower_count}</div>
                  <div className="text-sm text-zinc-400">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{profile.following_count}</div>
                  <div className="text-sm text-zinc-400">Following</div>
                </div>
              </div>

              <div className="flex gap-4">
                <FollowButton targetUserId={profile.id} initialCount={profile.follower_count} />
                <button
                  onClick={() => {
                    if (!user) {
                      openModal();
                    } else {
                      router.push(`/messages?new=${profile.id}`);
                    }
                  }}
                  className="flex items-center gap-2 px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-medium transition-all duration-200"
                >
                  <Mail className="w-4 h-4" />
                  Message
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-zinc-800">
          <button
            onClick={() => setActiveTab('tracks')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'tracks'
                ? 'text-violet-400 border-b-2 border-violet-500'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Tracks ({tracks.length})
          </button>
          <button
            onClick={() => setActiveTab('collabs')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'collabs'
                ? 'text-violet-400 border-b-2 border-violet-500'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Collaborations ({collabs.length})
          </button>
          <button
            onClick={() => setActiveTab('remixes')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'remixes'
                ? 'text-violet-400 border-b-2 border-violet-500'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Remixes ({remixes.length})
          </button>
        </div>

        {/* Tracks Grid */}
        {currentTracks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-400 text-lg">
              No {activeTab} yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
            {currentTracks.map((track) => (
              <Link
                key={track.id}
                href={`/listen?track=${track.id}`}
                className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden hover:border-violet-500 transition-all duration-200"
              >
                {track.cover_art_url && (
                  <img
                    src={track.cover_art_url}
                    alt={track.title}
                    className="w-full aspect-square object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-bold text-white line-clamp-2 mb-2">{track.title}</h3>
                  <p className="text-sm text-zinc-400 mb-3">by {track.artist_handle}</p>

                  <div className="flex gap-2 flex-wrap">
                    {track.is_collab && <CollabBadge />}
                    {track.is_remix && <RemixBadge />}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
