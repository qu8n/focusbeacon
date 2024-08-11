import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "selector",
  plugins: [require("@tailwindcss/typography")],
  theme: {
    extend: {
      colors: {
        "custom-0": "#876A5C", // brown
        "custom-0.5": "#BEABA5", // light brown
        "custom-1": "#E2B352", // yellow
        "custom-2": "#DB813E", // orange
        "custom-3": "#9d6348", // red-orange
        "custom-4": "#4D7E61", // green
        "custom-5": "#c84b50", // red
      },
      animation: {
        marquee: "marquee var(--duration) linear infinite",
        "marquee-vertical": "marquee-vertical var(--duration) linear infinite",
        accordionOpen: "accordionOpen 150ms cubic-bezier(0.87, 0, 0.13, 1)",
        accordionClose: "accordionClose 150ms cubic-bezier(0.87, 0, 0.13, 1)",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(calc(-100% - var(--gap)))" },
        },
        "marquee-vertical": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(calc(-100% - var(--gap)))" },
        },
        accordionOpen: {
          from: { height: "0px" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        accordionClose: {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: { height: "0px" },
        },
      },
    },
  },
}

export default config
