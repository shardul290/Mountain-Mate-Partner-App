/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        mountain: {
          50: "#EEF8F3",
          100: "#D8EFE1",
          200: "#B3DEC4",
          300: "#82C79F",
          400: "#56AA7A",
          500: "#2E7D5A",
          600: "#215F44",
          700: "#184533",
          800: "#112F23",
          900: "#0B1C15"
        },
        sky: {
          50: "#EEF8FF",
          100: "#D9EEFF",
          200: "#B4DEFF",
          300: "#82C6FF",
          400: "#4CA8FF",
          500: "#1987F0",
          600: "#0D69C2",
          700: "#0D4F92",
          800: "#103560",
          900: "#0B223E"
        },
        premium: {
          black: "#09110E",
          ink: "#101816",
          sand: "#F4F6F3"
        }
      }
    }
  },
  plugins: []
};
