import React from "react";

interface ChannelBadgeProps {
  type: "agent" | "human" | "hybrid";
  size?: "sm" | "md";
}

export function ChannelBadge({ type, size = "md" }: ChannelBadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
  };

  const typeConfigs = {
    agent: {
      emoji: "🤖",
      label: "AI Agent",
      classes:
        "bg-violet-500/20 text-violet-300 border border-violet-500/30 hover:border-violet-500/60",
    },
    human: {
      emoji: "👤",
      label: "Human",
      classes:
        "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:border-cyan-500/60",
    },
    hybrid: {
      emoji: "🤝",
      label: "Human + AI",
      classes:
        "bg-gradient-to-r from-violet-500/20 to-cyan-500/20 text-white border border-violet-500/30 hover:border-violet-500/60",
    },
  };

  const config = typeConfigs[type];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium transition-colors ${sizeClasses[size]} ${config.classes}`}
    >
      <span>{config.emoji}</span>
      <span>{config.label}</span>
    </span>
  );
}
