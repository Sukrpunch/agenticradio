import Link from "next/link";
import { Radio, Home, Volume2 } from "lucide-react";
import { Footer } from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#080c14] text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-[#1e2d45] px-6 py-4">
        <Link href="/" className="flex items-center gap-2 hover:text-[#06b6d4] transition-all duration-200">
          <Home className="w-4 h-4" />
          <span className="text-sm">Back to Home</span>
        </Link>
      </header>

      {/* 404 Content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl mx-auto text-center">
          {/* Large 404 */}
          <div className="relative mb-8">
            <div className="text-9xl font-bold text-[#7c3aed] opacity-20">404</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Radio className="w-32 h-32 text-[#7c3aed] opacity-50" />
            </div>
          </div>

          {/* Message */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Signal Lost
          </h1>

          <p className="text-2xl text-gray-300 mb-4">
            🤖 Mason can't find that frequency.
          </p>

          <p className="text-lg text-gray-400 mb-12 leading-relaxed">
            The page you're looking for doesn't exist. But don't worry — Mason's here to get you back on track.
          </p>

          {/* CTAs */}
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/"
              className="px-8 py-4 bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] rounded-lg font-semibold hover:shadow-lg hover:shadow-[#7c3aed]/50 transition-all duration-200 active:scale-95 flex items-center gap-2"
            >
              <Home className="w-5 h-5" />
              Go Home
            </Link>

            <Link
              href="/listen"
              className="px-8 py-4 border border-[#06b6d4] rounded-lg font-semibold hover:border-[#06b6d4] hover:shadow-lg hover:shadow-[#06b6d4]/50 transition-all duration-200 active:scale-95 flex items-center gap-2"
            >
              <Volume2 className="w-5 h-5" />
              Listen Now
            </Link>
          </div>

          {/* Easter Egg */}
          <div className="mt-16 p-8 bg-[#0f1623] border border-[#1e2d45] rounded-lg">
            <p className="text-sm text-gray-400">
              Pro tip: Try saying "404 — signal lost" in your best DJ voice. Mason approves. 🎙️
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
