"use client";

import { useState, useEffect } from "react";
import { Search, Copy, TrendingUp, Filter } from "lucide-react";
import { MobileNav } from "@/components/MobileNav";
import { Footer } from "@/components/Footer";

interface Prompt {
  id: string;
  prompt: string;
  tool: string;
  tool_version?: string;
  genre?: string;
  tags?: string[];
  use_count: number;
  profiles?: { username: string };
  created_at: string;
}

const TOOLS = ["Suno", "Udio", "AIVA", "Other"];
const GENRES = ["lo-fi", "synthwave", "ambient", "hip-hop", "dnb", "techno", "jazz", "classical", "pop"];

export default function PromptsPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    window.addEventListener("scroll", () => {
      setIsScrolled(window.scrollY > 0);
    });
  }, []);

  useEffect(() => {
    fetchPrompts();
  }, [search, selectedTool, selectedGenre, page]);

  const fetchPrompts = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });

      if (search) params.append("q", search);
      if (selectedTool) params.append("tool", selectedTool);
      if (selectedGenre) params.append("genre", selectedGenre);

      const res = await fetch(`/api/prompts?${params}`);
      const data = await res.json();

      setPrompts(data.prompts || []);
      setTotalPages(data.pages || 1);
    } catch (error) {
      console.error("Failed to fetch prompts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (promptText: string, id: string) => {
    navigator.clipboard.writeText(promptText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUsePrompt = async (id: string) => {
    try {
      const res = await fetch(`/api/prompts/${id}`, { method: "POST" });
      if (res.ok) {
        // Refresh prompts to update use_count
        fetchPrompts();
      }
    } catch (error) {
      console.error("Failed to use prompt:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14]">
      <MobileNav isScrolled={isScrolled} />
      <div className="pt-20 pb-12">
        {/* Header */}
        <section className="max-w-7xl mx-auto px-6 mb-12">
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="text-[#7c3aed]">📝 Prompt</span>
              <br />
              <span className="text-white">Archive</span>
            </h1>
            <p className="text-xl text-gray-400">
              The collective knowledge of AI music creation
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search prompts..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-[#1e2d45] border border-[#2a3a55] text-white placeholder-gray-400 focus:outline-none focus:border-[#7c3aed] transition-colors"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="mb-12 space-y-4">
            {/* Tool Filter */}
            <div>
              <label className="text-sm text-gray-400 block mb-3">Filter by Tool</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setSelectedTool(null);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedTool === null
                      ? "bg-[#7c3aed] text-white"
                      : "bg-[#1e2d45] text-gray-300 hover:bg-[#2a3a55]"
                  }`}
                >
                  All
                </button>
                {TOOLS.map((tool) => (
                  <button
                    key={tool}
                    onClick={() => {
                      setSelectedTool(selectedTool === tool ? null : tool);
                      setPage(1);
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      selectedTool === tool
                        ? "bg-[#7c3aed] text-white"
                        : "bg-[#1e2d45] text-gray-300 hover:bg-[#2a3a55]"
                    }`}
                  >
                    {tool}
                  </button>
                ))}
              </div>
            </div>

            {/* Genre Filter */}
            <div>
              <label className="text-sm text-gray-400 block mb-3">Filter by Genre</label>
              <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
                {GENRES.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => {
                      setSelectedGenre(selectedGenre === genre ? null : genre);
                      setPage(1);
                    }}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedGenre === genre
                        ? "bg-[#7c3aed] text-white"
                        : "bg-[#1e2d45] text-gray-300 hover:bg-[#2a3a55]"
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Prompts Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-400">Loading prompts...</p>
            </div>
          ) : prompts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No prompts found. Be the first to share!</p>
            </div>
          ) : (
            <div className="space-y-4 mb-12">
              {prompts.map((prompt) => (
                <div
                  key={prompt.id}
                  className="rounded-lg border border-[#1e2d45] bg-[#0f1623] p-6 hover:border-[#7c3aed] transition-all duration-200"
                >
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-[#7c3aed]">
                          {prompt.tool}
                        </span>
                        {prompt.tool_version && (
                          <span className="text-xs text-gray-400">
                            v{prompt.tool_version}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <TrendingUp className="w-4 h-4" />
                        <span>Used {prompt.use_count} times</span>
                      </div>
                    </div>

                    <p className="text-white text-lg leading-relaxed mb-4 italic">
                      &quot;{prompt.prompt}&quot;
                    </p>

                    {/* Genre and Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {prompt.genre && (
                        <span className="px-3 py-1 rounded-full bg-[#7c3aed]/20 text-[#7c3aed] text-xs font-semibold">
                          {prompt.genre}
                        </span>
                      )}
                      {prompt.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-full bg-[#06b6d4]/20 text-[#06b6d4] text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Creator Info */}
                    {prompt.profiles && (
                      <p className="text-xs text-gray-400 mb-4">
                        by <span className="text-[#7c3aed]">@{prompt.profiles.username}</span>
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUsePrompt(prompt.id)}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] hover:from-[#6d2dd4] hover:to-[#0597b0] text-white rounded-lg font-semibold transition-all duration-200"
                    >
                      Use This Prompt →
                    </button>
                    <button
                      onClick={() => handleCopy(prompt.prompt, prompt.id)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                        copiedId === prompt.id
                          ? "bg-green-600 text-white"
                          : "bg-[#1e2d45] text-gray-300 hover:bg-[#2a3a55]"
                      }`}
                    >
                      <Copy className="w-4 h-4" />
                      {copiedId === prompt.id ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg bg-[#1e2d45] text-gray-300 hover:bg-[#2a3a55] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Previous
              </button>
              <span className="text-gray-400">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg bg-[#1e2d45] text-gray-300 hover:bg-[#2a3a55] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Next
              </button>
            </div>
          )}
        </section>
      </div>
      <Footer />
    </div>
  );
}
