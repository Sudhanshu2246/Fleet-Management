/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bg: '#101211',
        sidebar: '#141815',
        surface: '#1B211D',
        'surface-elevated': '#222923',
        'surface-hover': '#29312A',
        lime: {
          DEFAULT: '#B7F34A',
          hover: '#C8FF64',
          subtle: '#2B3A1A',
        },
        border: '#303830',
        'border-strong': '#414B41',
      }
    },
  },
  plugins: [],
}
