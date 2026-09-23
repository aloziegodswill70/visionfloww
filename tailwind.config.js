/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      colors: {
        clinic: {
          dark: "#0f172a",
          navy: "#111827",
          blue: "#0284c7",
          sky: "#e0f2fe",
          soft: "#f8fafc",
          ash: "#f1f5f9",
          green: "#16a34a",
          whatsapp: "#25D366",
        },
      },

      boxShadow: {
        soft: "0 10px 30px rgba(15, 23, 42, 0.08)",
      },

      borderRadius: {
        card: "1.25rem",
      },
    },
  },

  plugins: [],
};

module.exports = config;