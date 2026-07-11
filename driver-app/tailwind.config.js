/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1e3a8a", // Navy Blue
        secondary: "#3b82f6", // Bright Blue
        accent: "#f59e0b", // Amber
        success: "#10b981", // Emerald
        danger: "#ef4444", // Red
        dark: "#0f172a", // Slate 900
      }
    },
  },
  plugins: [],
}
