/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#FBF7EF",
        "paper-line": "#E7DDC9",
        ink: "#26293B",
        "ink-soft": "#565A72",
        brass: "#B8863B",
        sage: "#5C7A5E",
        "sage-deep": "#3F5940",
        brick: "#AC4B36",
        "brick-deep": "#8A3A28",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "18px",
      },
      boxShadow: {
        card: "0 2px 0 rgba(38,41,59,0.06), 0 12px 30px -12px rgba(38,41,59,0.18)",
      },
    },
  },
  plugins: [],
};
