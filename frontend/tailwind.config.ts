import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        greenText: "rgb(0 194 120 / var(--tw-bg-opacity))",
        accentBlue: "rgb(76 148 255 / var(--tw-bg-opacity))",
        backcolor: "rgb(14 15 20 / var(--tw-bg-opacity))",
      },
    },
  },
  plugins: [],
};
export default config;
