'use client';

import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';

interface Tool {
  name: string;
  version: string;
  role: string;
}

interface CreditsEditorProps {
  trackId: string;
  onSave?: () => void;
}

const roles = ['composition', 'vocals', 'mixing', 'mastering', 'cover art', 'other'];

export function CreditsEditor({ trackId, onSave }: CreditsEditorProps) {
  const [tools, setTools] = useState<Tool[]>([]);
  const [prompt, setPrompt] = useState('');
  const [notes, setNotes] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Load existing credits
  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const response = await fetch(`/api/tracks/${trackId}/credits`);
        if (response.ok) {
          const data = await response.json();
          if (data) {
            setTools(data.tools || []);
            setPrompt(data.prompt || '');
            setNotes(data.notes || '');
            setShowPrompt(data.show_prompt || false);
          }
        }
      } catch (error) {
        console.error('Failed to load credits:', error);
      }
    };

    fetchCredits();
  }, [trackId]);

  const handleAddTool = () => {
    setTools([...tools, { name: '', version: '', role: 'composition' }]);
  };

  const handleRemoveTool = (idx: number) => {
    setTools(tools.filter((_, i) => i !== idx));
  };

  const handleToolChange = (
    idx: number,
    field: keyof Tool,
    value: string
  ) => {
    const newTools = [...tools];
    newTools[idx] = { ...newTools[idx], [field]: value };
    setTools(newTools);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');

    try {
      const { data: { session } } = await import('@/context/AuthContext').then(m => m.supabase.auth.getSession());
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/tracks/${trackId}/credits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          tools,
          prompt: prompt || null,
          notes: notes || null,
          show_prompt: showPrompt,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save credits');
      }

      onSave?.();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-zinc-800/50 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">⚙️ What Made This?</h3>

      {/* Tools List */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-zinc-200 mb-3">
          Tools & Techniques
        </label>
        <div className="space-y-3 mb-3">
          {tools.map((tool, idx) => (
            <div key={idx} className="flex gap-2 items-end">
              <input
                type="text"
                placeholder="Tool name (e.g., Suno, DALL-E)"
                value={tool.name}
                onChange={(e) =>
                  handleToolChange(idx, 'name', e.target.value)
                }
                className="flex-1 bg-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-400 focus:outline-none focus:border-violet-500 border border-transparent"
              />
              <input
                type="text"
                placeholder="Version (e.g., 3.5)"
                value={tool.version}
                onChange={(e) =>
                  handleToolChange(idx, 'version', e.target.value)
                }
                className="w-20 bg-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-400 focus:outline-none focus:border-violet-500 border border-transparent"
              />
              <select
                value={tool.role}
                onChange={(e) =>
                  handleToolChange(idx, 'role', e.target.value)
                }
                className="bg-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 border border-transparent"
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleRemoveTool(idx)}
                className="p-2 text-zinc-400 hover:text-red-400 transition"
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={handleAddTool}
          className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition"
        >
          <Plus size={16} /> Add Tool
        </button>
      </div>

      {/* Prompt */}
      <div className="mb-6">
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-200 mb-3">
          <input
            type="checkbox"
            checked={showPrompt}
            onChange={(e) => setShowPrompt(e.target.checked)}
            className="rounded"
          />
          Share Prompt Publicly
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the prompt you used (optional)"
          className="w-full bg-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-400 focus:outline-none focus:border-violet-500 border border-transparent resize-none"
          rows={3}
        />
      </div>

      {/* Notes */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-zinc-200 mb-3">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any additional notes about the creation process"
          className="w-full bg-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-400 focus:outline-none focus:border-violet-500 border border-transparent resize-none"
          rows={3}
        />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition"
      >
        {isSaving ? 'Saving...' : 'Save Credits'}
      </button>
    </div>
  );
}
