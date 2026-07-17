/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0B1615",
          900: "#0F1B1A",
          800: "#16262A",
          700: "#1D3230",
          600: "#28403C",
        },
        vault: {
          gold: "#C9A227",
          goldLight: "#E4C558",
          emerald: "#1F7A5C",
          emeraldLight: "#2FA57B",
          alert: "#C1443D",
        },
        parchment: {
          100: "#EAF2F0",
          300: "#C4D2CD",
          500: "#8FA39D",
        },
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      backgroundImage: {
        "ledger-lines":
          "repeating-linear-gradient(to bottom, transparent, transparent 27px, rgba(201,162,39,0.06) 28px)",
      },
      keyframes: {
  float: {
    "0%, 100%": { transform: "translateY(0px)" },
    "50%": { transform: "translateY(-12px)" },
  },
  glowPulse: {
    "0%, 100%": { opacity: 0.5 },
    "50%": { opacity: 0.9 },
  },
},
animation: {
  float: "float 6s ease-in-out infinite",
  glowPulse: "glowPulse 4s ease-in-out infinite",
},
    },
  },
  plugins: [],
};
