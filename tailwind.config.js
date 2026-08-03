/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts}'],
  theme: {
    extend: {
      colors: {
        ink: '#0a0a0a',
        surface: '#141412',
        line: '#2e2e2b',
        accent: '#FF5A2E',
        muted: '#9a9a95'
      },
      fontFamily: {
        heading: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        body: ['Jost', 'sans-serif']
      }
    }
  },
  plugins: []
};
