'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAuthModal } from '@/context/AuthModalContext';
import { supabase } from '@/context/AuthContext';

interface FollowButtonProps {
  targetUserId: string;
  initialCount?: number;
}

export function FollowButton({ targetUserId, initialCount = 0 }: FollowButtonProps) {
  const { user, profile } = useAuth();
  const { openModal } = useAuthModal();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  // Check if current user follows on mount
  useEffect(() => {
    if (!user || !profile) return;

    const checkFollow = async () => {
      const { data } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .single();

      setIsFollowing(!!data);
    };

    checkFollow();
  }, [user, profile, targetUserId]);

  const toggleFollow = async () => {
    if (!user) {
      openModal();
      return;
    }

    if (user.id === targetUserId) {
      return; // Can't follow yourself
    }

    setLoading(true);

    try {
      if (isFollowing) {
        // Unfollow
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);
        setIsFollowing(false);
        setFollowerCount(Math.max(0, followerCount - 1));
      } else {
        // Follow
        await supabase.from('follows').insert({
          follower_id: user.id,
          following_id: targetUserId,
        });
        setIsFollowing(true);
        setFollowerCount(followerCount + 1);
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    } finally {
      setLoading(false);
    }
  };

  const isOwnProfile = user?.id === targetUserId;

  if (isOwnProfile) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleFollow}
        disabled={loading}
        className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
          isFollowing
            ? 'bg-violet-600/50 hover:bg-violet-600 text-white border border-violet-500'
            : 'bg-transparent hover:bg-violet-600/20 text-violet-400 border border-violet-500/50 hover:border-violet-500'
        } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {loading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
      </button>
      <span className="text-sm text-zinc-400">{followerCount} followers</span>
    </div>
  );
}
