import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx,js,jsx}",
    "./src/components/**/*.{ts,tsx,js,jsx}",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        black: "#000000",
        white: "#ffffff",
        soft: "#eaeaea",
      },
      fontFamily: {
        heading: ["var(--font-playfair)", "serif"],
        body: ["var(--font-be-vietnam)", "Inter", "sans-serif"],
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(.2,.8,.2,1)'
      },
      transitionDuration: {
        250: '250ms',
      },
      
    },
  },
  plugins: [],
};

export default config;
