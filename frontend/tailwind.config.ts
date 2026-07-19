import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        spark: {
          pink: "var(--color-spark-pink)",
          purple: "var(--color-spark-purple)",
          cyan: "var(--color-spark-cyan)",
          blue: "#0066ff",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-slow": "float 8s ease-in-out infinite",
        "float-fast": "float 4s ease-in-out infinite",
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "fade-in-up": "fadeInUp 0.6s ease-out forwards",
        "fade-in-down": "fadeInDown 0.6s ease-out forwards",
        "fade-in-left": "fadeInLeft 0.6s ease-out forwards",
        "fade-in-right": "fadeInRight 0.6s ease-out forwards",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        "aurora": "aurora 8s ease-in-out infinite alternate",
        "aurora-2": "aurora2 10s ease-in-out infinite alternate",
        "spin-slow": "spin 20s linear infinite",
        "spin-slower": "spin 30s linear infinite",
        "bounce-gentle": "bounceGentle 2s ease-in-out infinite",
        "slide-up": "slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "scale-in": "scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "shimmer": "shimmer 2s linear infinite",
        "gradient-xy": "gradientXY 15s ease infinite",
        "morph": "morph 8s ease-in-out infinite",
        "text-reveal": "textReveal 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeInDown: {
          from: { opacity: "0", transform: "translateY(-30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeInLeft: {
          from: { opacity: "0", transform: "translateX(-30px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        fadeInRight: {
          from: { opacity: "0", transform: "translateX(30px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },
        aurora: {
          "0%": { transform: "translateX(-50%) translateY(-50%) rotate(0deg) scale(1)" },
          "50%": { transform: "translateX(50%) translateY(30%) rotate(180deg) scale(1.2)" },
          "100%": { transform: "translateX(-30%) translateY(-20%) rotate(360deg) scale(0.9)" },
        },
        aurora2: {
          "0%": { transform: "translateX(50%) translateY(50%) rotate(0deg) scale(1.1)" },
          "50%": { transform: "translateX(-40%) translateY(-30%) rotate(-180deg) scale(0.8)" },
          "100%": { transform: "translateX(30%) translateY(40%) rotate(-360deg) scale(1.3)" },
        },
        bounceGentle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(60px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.9)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        gradientXY: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        morph: {
          "0%, 100%": { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" },
          "50%": { borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%" },
        },
        textReveal: {
          from: { opacity: "0", transform: "translateY(40px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      backgroundImage: {
        "gradient-spark": "linear-gradient(135deg, #ff007f 0%, #7a00cc 100%)",
        "gradient-aurora": "linear-gradient(135deg, rgba(255,0,127,0.15) 0%, rgba(122,0,204,0.15) 33%, rgba(0,216,255,0.15) 66%, rgba(0,102,255,0.15) 100%)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      boxShadow: {
        glow: "0 0 20px rgba(255, 0, 127, 0.15)",
        "glow-lg": "0 0 40px rgba(255, 0, 127, 0.25)",
        "glow-xl": "0 0 60px rgba(255, 0, 127, 0.35)",
        "glow-cyan": "0 0 20px rgba(0, 216, 255, 0.15)",
        "glow-purple": "0 0 20px rgba(122, 0, 204, 0.15)",
        card: "0 4px 24px rgba(0, 0, 0, 0.2)",
        "card-lg": "0 8px 48px rgba(0, 0, 0, 0.3)",
        "card-xl": "0 16px 64px rgba(0, 0, 0, 0.4)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
export default config;
