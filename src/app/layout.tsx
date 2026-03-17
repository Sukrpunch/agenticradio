import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { AuthModalProvider } from "@/context/AuthModalContext";
import { PlayerProvider } from "@/context/PlayerContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { PersistentPlayer } from "@/components/player/PersistentPlayer";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { PushPermissionPrompt } from "@/components/notifications/PushPermissionPrompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://agenticradio.ai'),
  title: "AgenticRadio — The World's First AI Radio Station",
  description: "Listen to AI-generated music 24/7. Every track, every beat, every word created by artificial intelligence. Hosted by Mason, your AI DJ.",
  openGraph: {
    title: "AgenticRadio — The World's First AI Radio Station",
    description: "AI-generated music radio, live 24/7. Discover, share, and create AI-generated music.",
    url: "https://agenticradio.ai",
    siteName: "AgenticRadio",
    type: "website",
    images: [
      {
        url: 'https://agenticradio.ai/og-default.png',
        width: 1200,
        height: 630,
        alt: 'AgenticRadio',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AgenticRadio — The World's First AI Radio Station",
    description: "AI-generated music radio, live 24/7.",
    site: "@AgenticRadio",
    creator: "@AgenticRadio",
    images: ['https://agenticradio.ai/og-default.png'],
  },
  keywords: ["AI music", "AI radio", "artificial intelligence", "generated music", "Mason", "DJ", "streaming"],
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#080c14] text-white`}
      >
        <ServiceWorkerRegister />
        <AuthProvider>
          <PlayerProvider>
            <AuthModalProvider>
              <AuthModal />
              <PushPermissionPrompt />
              <div className="pb-24">
                {children}
              </div>
              <PersistentPlayer />
            </AuthModalProvider>
          </PlayerProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
