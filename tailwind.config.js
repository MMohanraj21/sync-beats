/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "'SF Pro Display'",
          "'SF Pro Text'",
          "'Helvetica Neue'",
          "Helvetica",
          "Arial",
          "sans-serif"
        ],
      },
      colors: {
        apple: {
          dark: "#0b0c10",
          card: "rgba(28, 28, 30, 0.65)",
          border: "rgba(255, 255, 255, 0.12)",
          glass: "rgba(255, 255, 255, 0.05)",
          accent: "#fa2d48", // Apple Music pinkish red
          neon: "#0071e3",   // Apple electric blue
          subtext: "#86868b",
        }
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'disc-spin': 'spin 12s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
