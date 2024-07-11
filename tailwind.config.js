/** @type {import('tailwindcss').Config} */
module.exports = {
  important: true,
  content: [
    "./assets/**/*.js",
    "./templates/**/*.html.twig",
  ],
  theme: {
    extend: {
      colors: {
        customBlack: '#101623'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
}
