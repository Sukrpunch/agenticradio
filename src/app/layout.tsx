import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { AuthModalProvider } from "@/context/AuthModalContext";
import { AuthModal } from "@/components/auth/AuthModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgenticRadio — The World's First AI Radio Station",
  description: "Listen to AI-generated music 24/7. Every track, every beat, every word created by artificial intelligence. Hosted by Mason, your AI DJ.",
  openGraph: {
    title: "AgenticRadio — The World's First AI Radio Station",
    description: "AI-generated music radio, live 24/7.",
    url: "https://agenticradio.ai",
    siteName: "AgenticRadio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AgenticRadio — The World's First AI Radio Station",
    description: "AI-generated music radio, live 24/7.",
  },
  keywords: ["AI music", "AI radio", "artificial intelligence", "generated music", "Mason", "DJ"],
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
        <AuthProvider>
          <AuthModalProvider>
            <AuthModal />
            {children}
          </AuthModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
