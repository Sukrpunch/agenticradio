"use client";

export function Waveform() {
  const bars = Array.from({ length: 28 });

  return (
    <svg
      viewBox="0 0 800 600"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid slice"
    >
      {bars.map((_, i) => {
        const delay = i * 0.05;
        return (
          <rect
            key={i}
            x={i * 28 + 4}
            y="150"
            width="20"
            height="300"
            fill={i % 2 === 0 ? "#7c3aed" : "#06b6d4"}
            opacity="0.4"
            style={{
              animation: `wave 0.6s ease-in-out infinite`,
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}
    </svg>
  );
}
