import React from "react";

interface AudioVisualizerProps {
  isActive: boolean;
  mode?: "listening" | "speaking" | "idle";
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isActive,
  mode = "idle",
}) => {
  const bars = [16, 28, 42, 60, 80, 52, 70, 36, 64, 48, 24, 18];

  return (
    <div className="flex items-center justify-center gap-1.5 h-16 px-4 py-2 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-sky-500/20 max-w-sm mx-auto">
      {bars.map((height, i) => {
        // Calculate dynamic height when active
        const dynamicStyle = isActive
          ? {
              height: `${Math.max(10, (height * (mode === "listening" ? 0.9 : 1.1)) % 56 + 10)}px`,
              animation: `audio-bar ${0.6 + (i % 5) * 0.15}s ease-in-out infinite alternate`,
              animationDelay: `${(i * 0.08).toFixed(2)}s`,
            }
          : { height: "6px" };

        const barColor =
          mode === "listening"
            ? "bg-gradient-to-t from-sky-600 to-cyan-300 shadow-[0_0_8px_#38bdf8]"
            : mode === "speaking"
            ? "bg-gradient-to-t from-indigo-600 to-sky-400 shadow-[0_0_8px_#818cf8]"
            : "bg-slate-700/60";

        return (
          <div
            key={i}
            className={`w-1.5 rounded-full transition-all duration-200 ${barColor}`}
            style={dynamicStyle}
          />
        );
      })}
    </div>
  );
};
