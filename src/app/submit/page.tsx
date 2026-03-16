"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Upload, CheckCircle } from "lucide-react";
import { MobileNav } from "@/components/MobileNav";
import { Footer } from "@/components/Footer";

export default function SubmitPage() {
  const [step, setStep] = useState(1);
  const [isScrolled, setIsScrolled] = useState(false);
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

    if (step === 1) {
      setStep(2);
      return;
    }

    if (step === 2) {
      setIsSubmitting(true);
      try {
        const submitFormData = new FormData();
        submitFormData.append("trackName", formData.trackName);
        submitFormData.append("artistName", formData.artistName);
        submitFormData.append("aiTool", formData.aiTool);
        submitFormData.append("genre", formData.genre);
        submitFormData.append("email", formData.email);
        if (file) submitFormData.append("file", file);
        if (coverArt) submitFormData.append("coverArt", coverArt);

        const response = await fetch("https://formspree.io/f/xvgkqnwz", {
          method: "POST",
          body: submitFormData,
        });

        if (response.ok) {
          setSuccess(true);
          setStep(3);
        }
      } catch (error) {
        console.error("Submission error:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleReset = () => {
    setStep(1);
    setSuccess(false);
    setFormData({
      trackName: "",
      artistName: "",
      aiTool: "aiva",
      genre: "synthwave",
      email: "",
    });
    setFile(null);
    setCoverArt(null);
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-white flex flex-col">
      <MobileNav isScrolled={isScrolled} />

      {step === 3 && success ? (
        <div className="flex-1 flex items-center justify-center px-6 pt-20">
          <div className="max-w-2xl mx-auto text-center">
            <CheckCircle className="w-24 h-24 text-[#06b6d4] mx-auto mb-8 animate-bounce" />
            <h1 className="text-5xl md:text-6xl font-bold mb-4">🎉 Success!</h1>
            <p className="text-2xl text-gray-300 mb-6">Track submitted! Mason will review it.</p>
            <p className="text-lg text-gray-400 mb-12">
              We'll get back to you at <span className="text-[#06b6d4]">{formData.email}</span> with the status.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/channels"
                className="px-8 py-3 bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] rounded-lg font-semibold hover:shadow-lg hover:shadow-[#7c3aed]/50 transition-all duration-200 active:scale-95"
              >
                Browse Channels
              </Link>
              <button
                onClick={handleReset}
                className="px-8 py-3 border border-[#06b6d4] rounded-lg font-semibold hover:border-[#06b6d4] hover:shadow-lg hover:shadow-[#06b6d4]/50 transition-all duration-200 active:scale-95"
              >
                Submit Another
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <div className="flex-1 max-w-2xl mx-auto px-6 py-20 w-full">
            {/* Progress Bar */}
            <div className="mb-16">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-gray-400">Step {step} of 2</span>
                <div className="flex gap-1">
                  {[1, 2].map((s) => (
                    <div
                      key={s}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        s <= step ? "w-8 bg-gradient-to-r from-[#7c3aed] to-[#06b6d4]" : "w-2 bg-[#1e2d45]"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-12">
              <h1 className="text-5xl font-bold mb-4">
                {step === 1 ? "📝 Track Information" : "📦 Upload Files"}
              </h1>
              <p className="text-xl text-gray-300">
                {step === 1
                  ? "Tell us about your AI-generated track."
                  : "Upload your audio file and optional cover art."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Step 1: Track Info */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                  <div>
                    <label className="block text-sm font-medium mb-2">Track Name *</label>
                    <input
                      type="text"
                      name="trackName"
                      value={formData.trackName}
                      onChange={handleChange}
                      required
                      placeholder="e.g., Neon Dreams"
                      className="w-full bg-[#0f1623] border border-[#1e2d45] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 transition-all duration-200"
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
                      className="w-full bg-[#0f1623] border border-[#1e2d45] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 transition-all duration-200"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">AI Tool Used *</label>
                      <select
                        name="aiTool"
                        value={formData.aiTool}
                        onChange={handleChange}
                        className="w-full bg-[#0f1623] border border-[#1e2d45] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 transition-all duration-200"
                      >
                        <option value="aiva">AIVA</option>
                        <option value="amper">Amper Music</option>
                        <option value="suno">Suno</option>
                        <option value="udio">Udio</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Genre *</label>
                      <select
                        name="genre"
                        value={formData.genre}
                        onChange={handleChange}
                        className="w-full bg-[#0f1623] border border-[#1e2d45] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 transition-all duration-200"
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
                      className="w-full bg-[#0f1623] border border-[#1e2d45] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 transition-all duration-200"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: File Upload */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                  <div>
                    <label className="block text-sm font-medium mb-4">Audio File (.mp3, .wav) *</label>
                    <label className="flex items-center justify-center w-full px-6 py-12 border-2 border-dashed border-[#1e2d45] rounded-lg hover:border-[#7c3aed] cursor-pointer transition-all duration-200">
                      <div className="flex flex-col items-center">
                        <Upload className="w-12 h-12 text-gray-400 mb-2" />
                        <span className="text-gray-300 font-medium">
                          {file ? file.name : "Click to upload or drag and drop"}
                        </span>
                        <span className="text-gray-500 text-sm mt-1">MP3 or WAV</span>
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
                    <label className="flex items-center justify-center w-full px-6 py-12 border-2 border-dashed border-[#1e2d45] rounded-lg hover:border-[#7c3aed] cursor-pointer transition-all duration-200">
                      <div className="flex flex-col items-center">
                        <Upload className="w-12 h-12 text-gray-400 mb-2" />
                        <span className="text-gray-300 font-medium">
                          {coverArt ? coverArt.name : "Click to upload or drag and drop"}
                        </span>
                        <span className="text-gray-500 text-sm mt-1">JPG, PNG, or GIF</span>
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
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                {step === 2 && (
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 px-8 py-4 border border-[#1e2d45] rounded-lg font-semibold hover:border-[#7c3aed]/50 transition-all duration-200 active:scale-95"
                  >
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 px-8 py-4 bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] rounded-lg font-semibold hover:shadow-lg hover:shadow-[#7c3aed]/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 ${
                    step === 1 ? "w-full" : ""
                  }`}
                >
                  {step === 1 ? "Next Step →" : isSubmitting ? "Submitting..." : "Submit Track"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
