"use client";

import { useState } from "react";
import Link from "next/link";
import { Upload } from "lucide-react";

export default function SubmitPage() {
  const [formData, setFormData] = useState({
    trackName: "",
    artistName: "",
    aiTool: "aiva",
    genre: "synthwave",
    email: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [coverArt, setCoverArt] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleCoverArtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setCoverArt(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create FormData for multipart submission
      const submitFormData = new FormData();
      submitFormData.append("trackName", formData.trackName);
      submitFormData.append("artistName", formData.artistName);
      submitFormData.append("aiTool", formData.aiTool);
      submitFormData.append("genre", formData.genre);
      submitFormData.append("email", formData.email);
      if (file) submitFormData.append("file", file);
      if (coverArt) submitFormData.append("coverArt", coverArt);

      // Submit to Formspree endpoint
      const response = await fetch("https://formspree.io/f/xvgkqnwz", {
        method: "POST",
        body: submitFormData,
      });

      if (response.ok) {
        setSuccess(true);
        setFormData({ trackName: "", artistName: "", aiTool: "aiva", genre: "synthwave", email: "" });
        setFile(null);
        setCoverArt(null);
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-white">
      {/* Header */}
      <header className="border-b border-[#1e2d45] px-6 py-4">
        <Link href="/" className="flex items-center gap-2 hover:text-[#06b6d4] transition">
          <span className="text-sm">← Back to Home</span>
        </Link>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-20">
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4">Submit Your Track</h1>
          <p className="text-xl text-gray-300">
            Share your AI-generated music with AgenticRadio listeners worldwide.
          </p>
        </div>

        {success && (
          <div className="mb-8 bg-[#0f1623] border border-[#06b6d4] rounded-lg p-4 text-[#06b6d4]">
            ✓ Track submitted successfully! We'll review it and get back to you soon.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Track Information */}
          <div className="bg-[#0f1623] border border-[#1e2d45] rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">Track Information</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Track Name *</label>
                <input
                  type="text"
                  name="trackName"
                  value={formData.trackName}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Neon Dreams"
                  className="w-full bg-[#080c14] border border-[#1e2d45] rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#7c3aed]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Your Name/Handle *</label>
                <input
                  type="text"
                  name="artistName"
                  value={formData.artistName}
                  onChange={handleChange}
                  required
                  placeholder="Your name or artist handle"
                  className="w-full bg-[#080c14] border border-[#1e2d45] rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#7c3aed]"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">AI Tool Used *</label>
                  <select
                    name="aiTool"
                    value={formData.aiTool}
                    onChange={handleChange}
                    className="w-full bg-[#080c14] border border-[#1e2d45] rounded px-4 py-2 text-white focus:outline-none focus:border-[#7c3aed]"
                  >
                    <option value="aiva">AIVA</option>
                    <option value="amper">Amper Music</option>
                    <option value="jukebox">Jukebox</option>
                    <option value="dadabots">Dadabots</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Genre *</label>
                  <select
                    name="genre"
                    value={formData.genre}
                    onChange={handleChange}
                    className="w-full bg-[#080c14] border border-[#1e2d45] rounded px-4 py-2 text-white focus:outline-none focus:border-[#7c3aed]"
                  >
                    <option value="synthwave">Synthwave</option>
                    <option value="lofi">Lo-Fi</option>
                    <option value="ambient">Ambient</option>
                    <option value="dnb">Drum & Bass</option>
                    <option value="techno">Techno</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your@email.com"
                  className="w-full bg-[#080c14] border border-[#1e2d45] rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#7c3aed]"
                />
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="bg-[#0f1623] border border-[#1e2d45] rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">Upload Files</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-4">Audio File (.mp3, .wav) *</label>
                <label className="flex items-center justify-center w-full px-6 py-12 border-2 border-dashed border-[#1e2d45] rounded-lg hover:border-[#7c3aed] cursor-pointer transition">
                  <div className="flex flex-col items-center">
                    <Upload className="w-12 h-12 text-gray-400 mb-2" />
                    <span className="text-gray-300">
                      {file ? file.name : "Click to upload or drag and drop"}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept=".mp3,.wav"
                    onChange={handleFileChange}
                    required
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-4">Cover Art (Optional)</label>
                <label className="flex items-center justify-center w-full px-6 py-12 border-2 border-dashed border-[#1e2d45] rounded-lg hover:border-[#7c3aed] cursor-pointer transition">
                  <div className="flex flex-col items-center">
                    <Upload className="w-12 h-12 text-gray-400 mb-2" />
                    <span className="text-gray-300">
                      {coverArt ? coverArt.name : "Click to upload or drag and drop"}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept=".jpg,.png,.gif"
                    onChange={handleCoverArtChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-8 py-4 bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] rounded-lg font-semibold text-lg hover:shadow-lg hover:shadow-[#7c3aed]/50 transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : "Submit Track"}
          </button>
        </form>
      </div>
    </div>
  );
}
