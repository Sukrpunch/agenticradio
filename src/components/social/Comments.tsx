'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAuthModal } from '@/context/AuthModalContext';
import { supabase } from '@/context/AuthContext';
import { Trash2 } from 'lucide-react';

interface Comment {
  id: string;
  user_id: string;
  body: string;
  timestamp_ms?: number;
  parent_id?: string;
  created_at: string;
  profile?: {
    username: string;
    avatar_url?: string;
  };
}

interface CommentsProps {
  trackId: string;
  currentTimeMs?: number;
}

export function Comments({ trackId, currentTimeMs }: CommentsProps) {
  const { user, profile } = useAuth();
  const { openModal } = useAuthModal();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentBody, setNewCommentBody] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const COMMENTS_PER_PAGE = 20;

  useEffect(() => {
    fetchComments();
  }, [trackId]);

  const fetchComments = async (newOffset = 0) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*, profile:user_id(username, avatar_url)')
        .eq('track_id', trackId)
        .is('parent_id', null) // Only top-level comments
        .order('created_at', { ascending: true })
        .range(newOffset, newOffset + COMMENTS_PER_PAGE - 1);

      if (error) throw error;

      if (newOffset === 0) {
        setComments(data || []);
      } else {
        setComments((prev) => [...prev, ...(data || [])]);
      }

      setHasMore((data?.length || 0) === COMMENTS_PER_PAGE);
      setOffset(newOffset + COMMENTS_PER_PAGE);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      openModal();
      return;
    }

    if (!newCommentBody.trim()) return;

    setSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          track_id: trackId,
          user_id: user.id,
          body: newCommentBody.trim(),
          timestamp_ms: currentTimeMs,
          parent_id: replyingTo,
        })
        .select('*, profile:user_id(username, avatar_url)')
        .single();

      if (error) throw error;

      // Optimistically add comment to UI
      if (data) {
        if (replyingTo) {
          // Handle reply insertion (not shown at top level for now)
        } else {
          setComments((prev) => [...prev, data]);
        }
      }

      setNewCommentBody('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;

    try {
      await supabase.from('comments').delete().eq('id', commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const created = new Date(date);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return created.toLocaleDateString();
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-8">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-4">Comments</h3>

        {/* Comment Form */}
        {user ? (
          <form onSubmit={handleSubmitComment} className="mb-6">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
              {replyingTo && (
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Replying to comment</span>
                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    className="text-xs text-zinc-500 hover:text-zinc-300"
                  >
                    Cancel
                  </button>
                </div>
              )}
              <textarea
                ref={textAreaRef}
                value={newCommentBody}
                onChange={(e) => setNewCommentBody(e.target.value)}
                placeholder="Add a comment..."
                maxLength={500}
                className="w-full bg-transparent text-white placeholder-zinc-500 focus:outline-none resize-none"
                rows={3}
              />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-zinc-500">
                  {newCommentBody.length}/500
                </span>
                <button
                  type="submit"
                  disabled={submitting || !newCommentBody.trim()}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-700 text-white rounded font-medium text-sm transition"
                >
                  {submitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 mb-6 text-center">
            <p className="text-zinc-400">
              <button
                onClick={openModal}
                className="text-violet-400 hover:text-violet-300 font-medium"
              >
                Sign in
              </button>
              {' '}to comment
            </p>
          </div>
        )}

        {/* Comments List */}
        {loading ? (
          <div className="text-center py-8 text-zinc-500">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">No comments yet. Be the first!</div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {comment.profile?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-white text-sm">
                        @{comment.profile?.username}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {formatRelativeTime(comment.created_at)}
                      </span>
                      {comment.timestamp_ms !== null && comment.timestamp_ms !== undefined && (
                        <span className="text-xs bg-zinc-800/50 px-2 py-0.5 rounded text-zinc-300">
                          {formatTime(comment.timestamp_ms)}
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-300 text-sm mt-2 break-words">{comment.body}</p>
                  </div>
                  {user?.id === comment.user_id && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="p-1 text-zinc-500 hover:text-red-400 transition flex-shrink-0"
                      title="Delete comment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {user && (
                  <button
                    onClick={() => setReplyingTo(comment.id)}
                    className="mt-3 text-xs text-violet-400 hover:text-violet-300 font-medium"
                  >
                    Reply
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && !loading && (
          <button
            onClick={() => fetchComments(offset)}
            className="w-full mt-6 py-2 text-zinc-400 hover:text-white text-sm font-medium transition"
          >
            Load more comments
          </button>
        )}
      </div>
    </div>
  );
}
