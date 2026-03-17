'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, supabase } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';

interface Track {
  id: string;
  title: string;
  genre: string;
  play_count: number;
  like_count: number;
  comment_count: number;
  created_at: string;
  status: string;
  cover_url?: string;
}

interface Comment {
  id: string;
  user_id: string;
  body: string;
  created_at: string;
  track_id: string;
  profiles?: { username: string; avatar_url?: string; display_name: string };
  tracks?: { title: string; id: string };
}

interface Follower {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  const [tracks, setTracks] = useState<Track[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [deletingTrack, setDeletingTrack] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Redirect if not authenticated
  if (!loading && !user) {
    router.push('/sign-in');
    return null;
  }

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        // Load user's tracks
        const { data: tracksData, error: tracksError } = await supabase
          .from('tracks')
          .select('*')
          .eq('creator_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (tracksError) throw tracksError;
        setTracks(tracksData || []);

        // Load comments on user's tracks
        const { data: commentsData, error: commentsError } = await supabase
          .from('comments')
          .select('*, profiles:user_id(username, avatar_url, display_name), tracks:track_id(title, id)')
          .in('track_id', (tracksData || []).map(t => t.id))
          .order('created_at', { ascending: false })
          .limit(5);

        if (commentsError) throw commentsError;
        setComments(commentsData || []);

        // Load recent followers
        const { data: followersData, error: followersError } = await supabase
          .from('follows')
          .select('follower_id, profiles!follower_id(id, username, display_name, avatar_url)')
          .eq('following_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (followersError) throw followersError;
        // Flatten the structure
        const flatFollowers = (followersData || []).map(f => ({
          id: f.follower_id,
          ...(f.profiles as any)
        }));
        setFollowers(flatFollowers);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [user]);

  const handleDeleteTrack = async (trackId: string) => {
    if (!user) return;

    try {
      setDeletingTrack(trackId);
      
      // Get track info to delete files
      const { data: track } = await supabase
        .from('tracks')
        .select('audio_url, cover_url')
        .eq('id', trackId)
        .single();

      // Delete from storage if needed
      // (This would require implementing file deletion logic)

      // Delete from database
      await supabase.from('tracks').delete().eq('id', trackId);
      
      setTracks(tracks.filter(t => t.id !== trackId));
      setConfirmDelete(null);
    } catch (error) {
      console.error('Error deleting track:', error);
    } finally {
      setDeletingTrack(null);
    }
  };

  const totalPlays = tracks.reduce((sum, t) => sum + (t.play_count || 0), 0);

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center text-white">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <Link
            href="/upload"
            className="bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white font-bold px-6 py-2 rounded-lg transition"
          >
            + Upload Track
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
            <p className="text-gray-400 text-sm mb-1">Total Plays</p>
            <p className="text-3xl font-bold">{totalPlays.toLocaleString()}</p>
          </div>
          <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
            <p className="text-gray-400 text-sm mb-1">Followers</p>
            <p className="text-3xl font-bold">{profile?.follower_count || 0}</p>
          </div>
          <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
            <p className="text-gray-400 text-sm mb-1">Tracks Uploaded</p>
            <p className="text-3xl font-bold">{tracks.length}</p>
          </div>
          <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
            <p className="text-gray-400 text-sm mb-1">$AGNT Balance</p>
            <p className="text-3xl font-bold">${(profile?.agnt_balance || 0).toLocaleString()}</p>
          </div>
        </div>

        {/* Recent Tracks */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Recent Tracks</h2>
          {tracks.length === 0 ? (
            <div className="bg-zinc-800 rounded-lg p-8 text-center border border-zinc-700">
              <p className="text-gray-400 mb-4">No tracks uploaded yet</p>
              <Link
                href="/upload"
                className="text-violet-400 hover:text-violet-300 font-medium"
              >
                Upload your first track
              </Link>
            </div>
          ) : (
            <div className="bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-700 bg-zinc-900/50">
                    <th className="text-left p-4">Title</th>
                    <th className="text-left p-4">Genre</th>
                    <th className="text-right p-4">Plays</th>
                    <th className="text-right p-4">Likes</th>
                    <th className="text-right p-4">Comments</th>
                    <th className="text-left p-4">Date</th>
                    <th className="text-center p-4">Status</th>
                    <th className="text-right p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tracks.map((track) => (
                    <tr key={track.id} className="border-b border-zinc-700 hover:bg-zinc-700/30">
                      <td className="p-4 font-medium">{track.title}</td>
                      <td className="p-4 text-sm text-gray-400">{track.genre}</td>
                      <td className="p-4 text-right">{(track.play_count || 0).toLocaleString()}</td>
                      <td className="p-4 text-right">{(track.like_count || 0).toLocaleString()}</td>
                      <td className="p-4 text-right">{track.comment_count || 0}</td>
                      <td className="p-4 text-sm text-gray-400">
                        {new Date(track.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                          track.status === 'published'
                            ? 'bg-green-900/50 text-green-300'
                            : 'bg-yellow-900/50 text-yellow-300'
                        }`}>
                          {track.status.charAt(0).toUpperCase() + track.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <Link
                          href={`/dashboard/tracks/${track.id}/edit`}
                          className="text-violet-400 hover:text-violet-300 text-sm font-medium"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => setConfirmDelete(track.id)}
                          className="text-red-400 hover:text-red-300 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Comments */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Recent Comments</h2>
            {comments.length === 0 ? (
              <div className="bg-zinc-800 rounded-lg p-6 text-center border border-zinc-700">
                <p className="text-gray-400">No comments yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                    <div className="flex gap-3 mb-2">
                      {(comment.profiles as any)?.avatar_url && (
                        <Image
                          src={(comment.profiles as any).avatar_url}
                          alt={(comment.profiles as any)?.username}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {(comment.profiles as any)?.display_name || 'Anonymous'}
                        </p>
                        <p className="text-xs text-gray-400">
                          @{(comment.profiles as any)?.username || 'unknown'}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm mb-2">{comment.body}</p>
                    <Link
                      href={`/tracks/${comment.track_id}`}
                      className="text-xs text-violet-400 hover:text-violet-300"
                    >
                      On "{(comment.tracks as any)?.title}"
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Followers */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Recent Followers</h2>
            {followers.length === 0 ? (
              <div className="bg-zinc-800 rounded-lg p-6 text-center border border-zinc-700">
                <p className="text-gray-400">No followers yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {followers.map((follower) => (
                  <div key={follower.id} className="bg-zinc-800 rounded-lg p-4 border border-zinc-700 flex items-center justify-between">
                    <div className="flex gap-3 items-center">
                      {follower.avatar_url && (
                        <Image
                          src={follower.avatar_url}
                          alt={follower.username}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full"
                        />
                      )}
                      <div>
                        <p className="font-medium">{follower.display_name}</p>
                        <p className="text-sm text-gray-400">@{follower.username}</p>
                      </div>
                    </div>
                    <Link
                      href={`/creators/${follower.username}`}
                      className="text-violet-400 hover:text-violet-300 text-sm font-medium"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 rounded-lg max-w-sm w-full p-6 border border-zinc-700">
            <h3 className="text-xl font-bold mb-2">Delete Track?</h3>
            <p className="text-gray-400 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-2 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTrack(confirmDelete)}
                disabled={deletingTrack === confirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold py-2 rounded-lg transition"
              >
                {deletingTrack === confirmDelete ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
