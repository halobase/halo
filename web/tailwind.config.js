/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  plugins: [require("./src/lib/tailwind")],
  safelist: [
    "btn-info", "btn-warn", "btn-error", "btn-alpha",
    "menu-sm", "menu-lg",
    "card-info", "card-warn", "card-error",
    "text-info-400", "text-warn-400", "text-error-400",
  ]
};
