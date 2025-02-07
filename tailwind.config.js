/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        firework: {
          "0%": { transform: "translate(0, 0)" },
          "100%": {
            transform:
              "translate(var(--tw-translate-x), var(--tw-translate-y))",
          },
        },
        spark: {
          "0%": { transform: "scale(0) rotate(0deg)", opacity: 1 },
          "100%": { transform: "scale(1) rotate(180deg)", opacity: 0 },
        },
        confetti: {
          "0%": { transform: "translateY(0) rotate(0deg)", opacity: 1 },
          "100%": { transform: "translateY(100vh) rotate(720deg)", opacity: 0 },
        },
        "winner-modal": {
          "0%": { transform: "scale(0) rotate(-10deg)", opacity: 0 },
          "50%": { transform: "scale(1.1) rotate(5deg)", opacity: 1 },
          "100%": { transform: "scale(1) rotate(0deg)", opacity: 1 },
        },
        "winner-text": {
          "0%": { transform: "translateY(20px)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
        "button-pop": {
          "0%": { transform: "scale(0.9)" },
          "50%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        firework: "firework 1s ease-out forwards",
        spark: "spark 0.5s ease-out forwards",
        confetti: "confetti 3s ease-out infinite",
        "winner-modal": "winner-modal 0.5s ease-out forwards",
        "winner-text": "winner-text 0.5s ease-out forwards 0.5s",
        "button-pop": "button-pop 0.3s ease-out",
      },
    },
  },
  plugins: [],
};
