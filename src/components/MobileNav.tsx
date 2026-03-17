"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, LogOut, Mail } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import { NotificationBell } from "@/components/notifications/NotificationBell";

interface MobileNavProps {
  isScrolled: boolean;
}

export function MobileNav({ isScrolled }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const { openModal } = useAuthModal();

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
        <div className="hidden md:flex gap-8 items-center">
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
            href="/creators"
            className="hover:text-[#06b6d4] transition-all duration-200"
          >
            For Creators
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

          {/* Notifications & Messages (logged in only) */}
          {user && (
            <div className="flex items-center gap-4">
              <NotificationBell />
              <Link href="/messages" className="p-2 hover:text-[#06b6d4] transition-all duration-200">
                <Mail className="w-5 h-5" />
              </Link>
            </div>
          )}

          {/* Auth Section */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 hover:bg-zinc-700 rounded-lg transition-all duration-200"
              >
                <div className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center text-xs font-bold">
                  {profile?.username?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm">{profile?.username}</span>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg z-50">
                  <Link
                    href={`/creators/${profile?.username}`}
                    className="block px-4 py-2 hover:bg-zinc-800 rounded-t-lg"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={async () => {
                      await signOut();
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-zinc-800 rounded-b-lg flex items-center gap-2 text-red-400 hover:text-red-300"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={openModal}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-all duration-200"
            >
              Sign In
            </button>
          )}
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
                href="/creators"
                className="block py-3 px-4 rounded-lg hover:bg-[#0f1623] transition-all duration-200 text-lg font-medium"
                onClick={() => setIsOpen(false)}
              >
                For Creators
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

              {/* Mobile Auth Section */}
              {user ? (
                <>
                  <Link
                    href={`/creators/${profile?.username}`}
                    className="block py-3 px-4 rounded-lg hover:bg-[#0f1623] transition-all duration-200 text-lg font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={async () => {
                      await signOut();
                      setIsOpen(false);
                    }}
                    className="w-full text-left py-3 px-4 rounded-lg hover:bg-[#0f1623] transition-all duration-200 text-lg font-medium text-red-400 flex items-center gap-2"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    openModal();
                    setIsOpen(false);
                  }}
                  className="block w-full py-3 px-4 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-semibold text-lg transition-all duration-200"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
