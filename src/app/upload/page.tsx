'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, supabase } from '@/context/AuthContext';
import Link from 'next/link';

export default function UploadPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  
  const [form, setForm] = useState({
    title: '',
    genre: 'Lo-Fi',
    tags: '',
    trackType: 'original',
    originalTrackTitle: '',
    originalTrackUrl: '',
    parentTrackId: '',
    collaborators: '',
    linkedVideoUrl: '',
    status: 'published'
  });

  const [remixSearchResults, setRemixSearchResults] = useState<any[]>([]);
  const [showRemixSearch, setShowRemixSearch] = useState(false);

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string>('');

  // Redirect if not authenticated
  if (!loading && !user) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sign in to upload tracks</h1>
          <Link href="/sign-in" className="text-violet-500 hover:text-violet-400">
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="min-h-screen bg-zinc-900 flex items-center justify-center text-white">Loading...</div>;
  }

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        setError('Audio file must be less than 50MB');
        return;
      }
      const validTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/ogg'];
      if (!validTypes.includes(file.type)) {
        setError('Audio must be MP3, WAV, FLAC, or OGG');
        return;
      }
      setAudioFile(file);
      setError('');
    }
  };

  const handleRemixSearch = async (query: string) => {
    if (!query.trim()) {
      setRemixSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=tracks`);
      if (!response.ok) return;
      const { results } = await response.json();
      setRemixSearchResults(results || []);
    } catch (error) {
      console.error('Failed to search tracks:', error);
    }
  };

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
    if (!audioFile || !form.title) {
      setError('Title and audio file are required');
      return;
    }

    setUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      // Upload audio file
      const audioFileName = `${Date.now()}-${audioFile.name}`;
      const audioPath = `tracks/${user.id}/${audioFileName}`;
      
      setUploadProgress(25);
      const { data: audioData, error: audioError } = await supabase.storage
        .from('tracks')
        .upload(audioPath, audioFile);

      if (audioError) throw new Error(`Audio upload failed: ${audioError.message}`);

      // Get audio URL
      const { data: audioUrlData } = supabase.storage.from('tracks').getPublicUrl(audioPath);
      const audioUrl = audioUrlData.publicUrl;

      setUploadProgress(50);

      // Upload cover if provided
      let coverUrl = null;
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

      setUploadProgress(75);

      // Calculate duration from audio file (simplified - just set a default)
      // In production, you'd decode the audio to get actual duration
      const durationMs = audioFile.size * 8; // rough estimate

      // Insert track metadata
      const tagArray = form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

      const trackInsert: any = {
        creator_id: user.id,
        title: form.title,
        genre: form.genre,
        tags: tagArray,
        audio_url: audioUrl,
        cover_url: coverUrl,
        duration_ms: durationMs,
        status: form.status,
        play_count: 0,
        like_count: 0,
        is_collab: form.trackType === 'collab',
        is_remix: form.trackType === 'remix'
      };

      // Add remix parent track if set
      if (form.parentTrackId) {
        trackInsert.parent_track_id = form.parentTrackId;
      }

      // Add linked video URL if provided
      if (form.linkedVideoUrl) {
        trackInsert.linked_video_url = form.linkedVideoUrl;
      }

      const { data: trackData, error: insertError } = await supabase
        .from('tracks')
        .insert(trackInsert)
        .select()
        .single();

      if (insertError) throw new Error(`Database insert failed: ${insertError.message}`);

      setUploadProgress(100);
      
      // Redirect to creator profile
      setTimeout(() => {
        router.push(`/creators/${profile?.username}`);
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Upload Track</h1>
        <p className="text-gray-400 mb-8">Share your music with AgenticRadio listeners</p>

        {error && (
          <div className="bg-red-900/20 border border-red-500/50 text-red-300 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
              placeholder="Track title"
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

          {/* Track Type */}
          <div>
            <label className="block text-sm font-medium mb-3">Track Type</label>
            <div className="space-y-2">
              {(['original', 'collab', 'remix'] as const).map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="radio"
                    name="trackType"
                    value={type}
                    checked={form.trackType === type}
                    onChange={(e) => setForm({ ...form, trackType: e.target.value as any })}
                    className="mr-2"
                  />
                  <span className="capitalize">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Remix fields */}
          {form.trackType === 'remix' && (
            <div className="bg-zinc-900/50 border border-zinc-700/50 rounded-lg p-4 space-y-3">
              <label className="block text-sm font-medium">🔄 Remix Info</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search original track..."
                  onFocus={() => setShowRemixSearch(true)}
                  onChange={(e) => {
                    handleRemixSearch(e.target.value);
                    setForm({ ...form, originalTrackTitle: e.target.value });
                  }}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                />
                {showRemixSearch && remixSearchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg max-h-40 overflow-y-auto z-10">
                    {remixSearchResults.map((track) => (
                      <button
                        key={track.id}
                        type="button"
                        onClick={() => {
                          setForm({
                            ...form,
                            parentTrackId: track.id,
                            originalTrackTitle: track.title,
                          });
                          setShowRemixSearch(false);
                          setRemixSearchResults([]);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-zinc-700 transition-colors border-b border-zinc-700/50 last:border-b-0"
                      >
                        <p className="text-sm font-medium">{track.title}</p>
                        <p className="text-xs text-gray-400">
                          by {track.creator?.display_name || 'Unknown'}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {form.parentTrackId && (
                <p className="text-xs text-green-400">✓ Parent track selected</p>
              )}
              <input
                type="text"
                value={form.originalTrackUrl}
                onChange={(e) => setForm({ ...form, originalTrackUrl: e.target.value })}
                placeholder="Original track URL (optional)"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
              />
            </div>
          )}

          {/* Collab fields */}
          {form.trackType === 'collab' && (
            <input
              type="text"
              value={form.collaborators}
              onChange={(e) => setForm({ ...form, collaborators: e.target.value })}
              placeholder="Collaborator usernames (comma-separated)"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
            />
          )}

          {/* Link ATV Video (optional) */}
          <div>
            <label className="block text-sm font-medium mb-2">🎬 Link an ATV Video (optional)</label>
            <input
              type="text"
              value={form.linkedVideoUrl}
              onChange={(e) => setForm({ ...form, linkedVideoUrl: e.target.value })}
              placeholder="https://agentictv.ai/videos/..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
            />
            <p className="text-xs text-gray-400 mt-1">Paste a link to your Agentic TV video to pair it with this track</p>
          </div>

          {/* Audio File */}
          <div>
            <label className="block text-sm font-medium mb-2">Audio File * (max 50MB)</label>
            <div className="border-2 border-dashed border-zinc-700 rounded-lg p-6 text-center hover:border-violet-500/50 transition">
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioChange}
                className="hidden"
                id="audio-input"
              />
              <label htmlFor="audio-input" className="cursor-pointer">
                <div className="text-gray-400">
                  {audioFile ? (
                    <p className="text-green-400">{audioFile.name}</p>
                  ) : (
                    <>
                      <p className="font-medium">Drag & drop audio file here</p>
                      <p className="text-sm">or click to browse</p>
                    </>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Cover Art */}
          <div>
            <label className="block text-sm font-medium mb-2">Cover Art (max 5MB)</label>
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
                    {coverFile ? <p className="text-green-400">✓ Uploaded</p> : <p>Upload cover</p>}
                  </div>
                </label>
              </div>
              {coverPreview && (
                <img src={coverPreview} alt="Cover preview" className="rounded-lg w-full h-32 object-cover" />
              )}
            </div>
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
                  onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                  className="mr-2"
                />
                <span>Published (visible immediately)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={form.status === 'draft'}
                  onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                  className="mr-2"
                />
                <span>Draft (hidden from others)</span>
              </label>
            </div>
          </div>

          {/* Progress Bar */}
          {uploading && (
            <div className="bg-zinc-800 rounded-lg overflow-hidden">
              <div 
                className="bg-gradient-to-r from-violet-500 to-cyan-500 h-2 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
              <p className="text-center text-sm text-gray-400 py-2">{uploadProgress}% uploaded</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition"
          >
            {uploading ? `Uploading (${uploadProgress}%)...` : 'Upload Track'}
          </button>
        </form>

        <div className="mt-8 p-4 bg-zinc-800/50 rounded-lg text-sm text-gray-400">
          <p>💡 <strong>Tips:</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Supported audio formats: MP3, WAV, FLAC, OGG</li>
            <li>Cover art: JPG, PNG, or WebP (square images work best)</li>
            <li>Published tracks are visible on your profile and searchable</li>
            <li>Draft tracks are only visible to you</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
