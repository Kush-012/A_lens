// components/layout/Logo.jsx
// Alpha Lens brand logo — light theme SVG + wordmark.
// "Alpha" in #111827 (black), "Lens" in #EF4444 (red accent).

export function LogoIcon({ size = 36 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="al-bg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#111827" />
          <stop offset="1" stopColor="#374151" />
        </linearGradient>
        <linearGradient id="al-red" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#EF4444" />
          <stop offset="1" stopColor="#F87171" />
        </linearGradient>
      </defs>

      {/* Background circle */}
      <circle cx="20" cy="20" r="20" fill="url(#al-bg)" />

      {/* Lens circle (search/magnify metaphor) */}
      <circle cx="18" cy="18" r="8" fill="none" stroke="white" strokeWidth="2.5" opacity="0.9" />
      {/* Lens handle */}
      <line x1="24" y1="24" x2="30" y2="30" stroke="url(#al-red)" strokeWidth="3" strokeLinecap="round" />

      {/* Alpha "A" triangle inside lens */}
      <polyline
        points="14,23 18,13 22,23"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.9"
      />
      <line x1="15.5" y1="20" x2="20.5" y2="20" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
    </svg>
  );
}

export function LogoWordmark({ className = "" }) {
  return (
    <span className={`font-bold tracking-tight select-none ${className}`} style={{ fontSize: "inherit" }}>
      <span style={{ color: "#111827" }}>Alpha</span>
      <span style={{ color: "#EF4444" }}>Lens</span>
    </span>
  );
}

export default LogoIcon;
