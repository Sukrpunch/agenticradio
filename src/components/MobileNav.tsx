"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

interface MobileNavProps {
  isScrolled: boolean;
}

export function MobileNav({ isScrolled }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#080c14]/95 backdrop-blur border-b border-[#1e2d45]"
          : "bg-transparent"
      }`}
    >
      {/* Desktop Navigation */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold tracking-tighter">
          <span className="text-[#7c3aed]">Agentic</span>
          <span className="text-white">Radio</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-8">
          <a href="/#how-it-works" className="hover:text-[#06b6d4] transition-all duration-200">
            How It Works
          </a>
          <Link
            href="/request"
            className="hover:text-[#06b6d4] transition-all duration-200"
          >
            Request Line
          </Link>
          <Link
            href="/channels"
            className="hover:text-[#06b6d4] transition-all duration-200"
          >
            Channels
          </Link>
          <Link
            href="/developers"
            className="hover:text-[#06b6d4] transition-all duration-200"
          >
            Developers
          </Link>
          <Link
            href="/listen"
            className="hover:text-[#7c3aed] transition-all duration-200"
          >
            Listen
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 hover:text-[#06b6d4] transition-all duration-200"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 top-16 z-40 md:hidden animate-in fade-in">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[#080c14]/98"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu Content */}
          <div className="relative bg-[#080c14]/98 backdrop-blur border-b border-[#1e2d45] p-6 animate-in slide-in-from-top">
            <div className="space-y-4 max-w-7xl mx-auto">
              <a
                href="/#how-it-works"
                className="block py-3 px-4 rounded-lg hover:bg-[#0f1623] transition-all duration-200 text-lg font-medium"
                onClick={() => setIsOpen(false)}
              >
                How It Works
              </a>
              <Link
                href="/request"
                className="block py-3 px-4 rounded-lg hover:bg-[#0f1623] transition-all duration-200 text-lg font-medium"
                onClick={() => setIsOpen(false)}
              >
                Request Line
              </Link>
              <Link
                href="/channels"
                className="block py-3 px-4 rounded-lg hover:bg-[#0f1623] transition-all duration-200 text-lg font-medium"
                onClick={() => setIsOpen(false)}
              >
                Channels
              </Link>
              <Link
                href="/developers"
                className="block py-3 px-4 rounded-lg hover:bg-[#0f1623] transition-all duration-200 text-lg font-medium"
                onClick={() => setIsOpen(false)}
              >
                Developers
              </Link>
              <Link
                href="/submit"
                className="block py-3 px-4 rounded-lg hover:bg-[#0f1623] transition-all duration-200 text-lg font-medium"
                onClick={() => setIsOpen(false)}
              >
                Submit Track
              </Link>
              <Link
                href="/listen"
                className="block py-3 px-4 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] text-white font-semibold transition-all duration-200"
                onClick={() => setIsOpen(false)}
              >
                Listen Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
