"use client";

import { useState, useEffect } from "react";

interface LikeButtonProps {
  trackId: string;
  initialLikes: number;
  initialLiked?: boolean;
}

export function LikeButton({
  trackId,
  initialLikes,
  initialLiked = false,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likes, setLikes] = useState(initialLikes);
  const [isLoading, setIsLoading] = useState(false);
  const [fingerprint, setFingerprint] = useState<string>("");

  useEffect(() => {
    // Generate or retrieve browser fingerprint
    const stored = localStorage.getItem("fjb_fp");
    if (stored) {
      setFingerprint(stored);
    } else {
      const newFp = crypto.randomUUID();
      localStorage.setItem("fjb_fp", newFp);
      setFingerprint(newFp);
    }
  }, []);

  const handleLikeClick = async () => {
    if (!fingerprint || isLoading) return;

    setIsLoading(true);
    const action = liked ? "unlike" : "like";
    const optimisticLikes = action === "like" ? likes + 1 : Math.max(0, likes - 1);

    // Optimistic update
    setLiked(!liked);
    setLikes(optimisticLikes);

    try {
      const response = await fetch(`/api/tracks/${trackId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fingerprint,
          action,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update like");
      }

      const data = await response.json();
      setLiked(data.liked);
      setLikes(data.likes);
    } catch (error) {
      console.error("Error updating like:", error);
      // Revert on error
      setLiked(liked);
      setLikes(likes);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLikeClick}
      disabled={isLoading || !fingerprint}
      className={`flex items-center gap-1.5 text-sm font-medium transition-colors duration-200 ${
        liked
          ? "text-red-500"
          : "text-gray-400 hover:text-red-400"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      aria-label={liked ? "Unlike track" : "Like track"}
    >
      <span className={liked ? "text-lg" : "text-lg opacity-70"}>
        {liked ? "♥" : "♡"}
      </span>
      <span>{likes}</span>
    </button>
  );
}
