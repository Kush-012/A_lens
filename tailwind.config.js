/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      colors: {
        bg:      "#F8FAFC",
        surface: "#FFFFFF",
        primary: { DEFAULT: "#111827", light: "#374151", dark: "#000000" },
        accent:  { DEFAULT: "#EF4444", light: "#F87171" },
        secondary: "#374151",
        success:   "#22C55E",
        warning:   "#F59E0B",
        error:     "#EF4444",
        border:    "#E5E7EB",
        text: {
          primary:   "#111827",
          secondary: "#6B7280",
          muted:     "#9CA3AF",
          faint:     "#D1D5DB",
        },
      },
      boxShadow: {
        card:       "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
        "card-hover":"0 4px 24px rgba(17,24,39,0.10), 0 1px 3px rgba(0,0,0,0.06)",
        input:      "0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
        "input-focus":"0 0 0 3px rgba(17,24,39,0.12), 0 2px 12px rgba(0,0,0,0.08)",
        nav:        "0 1px 0 #E5E7EB, 0 2px 8px rgba(0,0,0,0.04)",
        panel:      "-2px 0 16px rgba(0,0,0,0.06)",
        glow:       "0 0 20px rgba(17,24,39,0.15)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      animation: {
        "fade-in":    "fadeIn 0.35s ease-out",
        "slide-up":   "slideUp 0.4s ease-out",
        "slide-right":"slideInRight 0.35s ease-out",
        pulse2:       "pulse2 2s cubic-bezier(0.4,0,0.6,1) infinite",
        shimmer:      "shimmer 2s infinite",
        float:        "float 4s ease-in-out infinite",
      },
      keyframes: {
        fadeIn:       { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp:      { from: { opacity: "0", transform: "translateY(16px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        slideInRight: { from: { opacity: "0", transform: "translateX(20px)" }, to: { opacity: "1", transform: "translateX(0)" } },
        pulse2:       { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.4" } },
        shimmer:      { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        float:        { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } },
      },
    },
  },
  plugins: [],
};
