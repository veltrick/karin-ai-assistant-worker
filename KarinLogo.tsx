import React from "react";

interface KarinLogoProps {
  size?: number;
  glow?: boolean;
  pulsing?: boolean;
}

export const KarinLogo: React.FC<KarinLogoProps> = ({
  size = 72,
  glow = true,
  pulsing = false,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center ${
        pulsing ? "animate-pulse" : ""
      }`}
      style={{ width: size, height: size }}
    >
      {/* Outer ambient glow */}
      {glow && (
        <div
          className="absolute inset-0 rounded-3xl bg-sky-500/25 blur-xl transition-all duration-500"
          style={{ transform: "scale(1.2)" }}
        />
      )}

      {/* Main SVG Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 drop-shadow-[0_0_12px_rgba(56,189,248,0.65)]"
      >
        <defs>
          <linearGradient id="karinNavyGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0B132B" />
            <stop offset="0.6" stopColor="#070B19" />
            <stop offset="1" stopColor="#02040A" />
          </linearGradient>

          <linearGradient id="karinBorderGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38BDF8" />
            <stop offset="0.5" stopColor="#0284C7" />
            <stop offset="1" stopColor="#0C4A6E" />
          </linearGradient>

          <linearGradient id="karinKGrad" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38BDF8" />
            <stop offset="0.5" stopColor="#0EA5E9" />
            <stop offset="1" stopColor="#67E8F9" />
          </linearGradient>

          <radialGradient id="karinOrbGlow" cx="50" cy="50" r="45" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#0EA5E9" stopOpacity="0.3" />
            <stop offset="0.8" stopColor="#0369A1" stopOpacity="0.05" />
            <stop offset="1" stopColor="#02040A" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Squircle base */}
        <rect
          x="4"
          y="4"
          width="92"
          height="92"
          rx="24"
          fill="url(#karinNavyGrad)"
          stroke="url(#karinBorderGrad)"
          strokeWidth="2.5"
        />

        {/* Ambient radial inner glow */}
        <rect x="4" y="4" width="92" height="92" rx="24" fill="url(#karinOrbGlow)" />

        {/* Tech grid crosshairs */}
        <circle cx="50" cy="50" r="34" stroke="#38BDF8" strokeWidth="0.8" strokeOpacity="0.25" strokeDasharray="3 4" />
        <line x1="12" y1="50" x2="20" y2="50" stroke="#38BDF8" strokeWidth="1.5" strokeOpacity="0.6" />
        <line x1="80" y1="50" x2="88" y2="50" stroke="#38BDF8" strokeWidth="1.5" strokeOpacity="0.6" />
        <line x1="50" y1="12" x2="50" y2="20" stroke="#38BDF8" strokeWidth="1.5" strokeOpacity="0.6" />
        <line x1="50" y1="80" x2="50" y2="88" stroke="#38BDF8" strokeWidth="1.5" strokeOpacity="0.6" />

        {/* Distinctive Modern Capital "K" */}
        {/* Left Vertical Spine */}
        <path
          d="M33 24V76"
          stroke="url(#karinKGrad)"
          strokeWidth="9"
          strokeLinecap="round"
        />

        {/* Upper Diagonal Arm */}
        <path
          d="M36 51L65 25"
          stroke="url(#karinKGrad)"
          strokeWidth="8.5"
          strokeLinecap="round"
        />

        {/* Lower Diagonal Leg */}
        <path
          d="M48 45L69 76"
          stroke="url(#karinKGrad)"
          strokeWidth="8.5"
          strokeLinecap="round"
        />

        {/* Futuristic Dot Accent */}
        <circle cx="70" cy="25" r="3" fill="#38BDF8" />
        <circle cx="33" cy="24" r="2.5" fill="#E0F2FE" />
      </svg>
    </div>
  );
};
