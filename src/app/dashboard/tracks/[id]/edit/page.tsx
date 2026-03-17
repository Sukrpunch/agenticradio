'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth, supabase } from '@/context/AuthContext';
import { CreditsEditor } from '@/components/tracks/CreditsEditor';

interface Track {
  id: string;
  title: string;
  genre: string;
  tags?: string[];
  status: string;
  cover_url?: string;
  creator_id: string;
}

export default function EditTrackPage() {
  const router = useRouter();
  const params = useParams() as unknown as { id: string };
  const trackId = params.id as string;
  const { user, loading } = useAuth();

  const [track, setTrack] = useState<Track | null>(null);
  const [form, setForm] = useState({
    title: '',
    genre: 'Lo-Fi',
    tags: '',
    status: 'published'
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [loadingTrack, setLoadingTrack] = useState(true);

  // Redirect if not authenticated
  if (!loading && !user) {
    router.push('/sign-in');
    return null;
  }

  useEffect(() => {
    if (!user || !trackId) return;

    const loadTrack = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('tracks')
          .select('*')
          .eq('id', trackId)
          .single();

        if (fetchError) throw fetchError;
        if (!data) {
          setError('Track not found');
          return;
        }

        // Check if user owns this track
        if (data.creator_id !== user.id) {
          setError('You do not have permission to edit this track');
          return;
        }

        setTrack(data);
        setForm({
          title: data.title,
          genre: data.genre,
          tags: data.tags?.join(', ') || '',
          status: data.status
        });

        if (data.cover_url) {
          setCoverPreview(data.cover_url);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load track');
      } finally {
        setLoadingTrack(false);
      }
    };

    loadTrack();
  }, [user, trackId]);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Cover art must be less than 5MB');
        return;
      }
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Cover must be JPG, PNG, or WebP');
        return;
      }
      setCoverFile(file);
      const reader = new FileReader();
      reader.onload = (evt) => setCoverPreview(evt.target?.result as string);
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!track || !user) return;

    setSaving(true);
    setError('');

    try {
      let coverUrl = track.cover_url;

      // Upload new cover if provided
      if (coverFile) {
        const coverFileName = `${Date.now()}-${coverFile.name}`;
        const coverPath = `covers/${user.id}/${coverFileName}`;

        const { error: coverError } = await supabase.storage
          .from('covers')
          .upload(coverPath, coverFile);

        if (coverError) throw new Error(`Cover upload failed: ${coverError.message}`);

        const { data: coverUrlData } = supabase.storage.from('covers').getPublicUrl(coverPath);
        coverUrl = coverUrlData.publicUrl;
      }

      // Parse tags
      const tagArray = form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

      // Update track
      const { error: updateError } = await supabase
        .from('tracks')
        .update({
          title: form.title,
          genre: form.genre,
          tags: tagArray,
          status: form.status,
          cover_url: coverUrl
        })
        .eq('id', track.id);

      if (updateError) throw updateError;

      // Redirect back to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to save track');
      setSaving(false);
    }
  };

  if (loading || loadingTrack) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (error && !track) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-violet-400 hover:text-violet-300"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!track) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Edit Track</h1>
        <p className="text-gray-400 mb-8">Update track metadata</p>

        {error && (
          <div className="bg-red-900/20 border border-red-500/50 text-red-300 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Genre */}
          <div>
            <label className="block text-sm font-medium mb-2">Genre</label>
            <select
              value={form.genre}
              onChange={(e) => setForm({ ...form, genre: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-violet-500"
            >
              <option>Lo-Fi</option>
              <option>Electronic</option>
              <option>Ambient</option>
              <option>Hip-Hop</option>
              <option>Experimental</option>
              <option>Cinematic</option>
              <option>Other</option>
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
              placeholder="comma, separated, tags"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-3">Status</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="status"
                  value="published"
                  checked={form.status === 'published'}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="mr-2"
                />
                <span>Published</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={form.status === 'draft'}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="mr-2"
                />
                <span>Draft</span>
              </label>
            </div>
          </div>

          {/* Cover Art */}
          <div>
            <label className="block text-sm font-medium mb-2">Cover Art (optional)</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="border-2 border-dashed border-zinc-700 rounded-lg p-4 text-center hover:border-violet-500/50 transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="hidden"
                  id="cover-input"
                />
                <label htmlFor="cover-input" className="cursor-pointer block">
                  <div className="text-gray-400 text-sm">
                    <p>Update cover</p>
                  </div>
                </label>
              </div>
              {coverPreview && (
                <img src={coverPreview} alt="Cover preview" className="rounded-lg w-full h-32 object-cover" />
              )}
            </div>
          </div>

          {/* Note */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
            <p className="text-sm text-gray-400">
              ℹ️ <strong>Note:</strong> Audio file cannot be re-uploaded. If you need to change the audio, please delete this track and upload a new one.
            </p>
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-3 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Credits Editor */}
        {track && (
          <div className="mt-8">
            <CreditsEditor trackId={track.id} />
          </div>
        )}
      </div>
    </div>
  );
}
