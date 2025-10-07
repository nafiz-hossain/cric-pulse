/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Ensure all color variants are available
      },
    },
  },
  plugins: [],
  safelist: [
    // Add commonly used classes to safelist
    'bg-blue-600',
    'bg-green-600', 
    'bg-red-600',
    'bg-gray-600',
    'bg-yellow-600',
    'hover:bg-blue-700',
    'hover:bg-green-700',
    'hover:bg-red-700',
    'hover:bg-gray-700',
  ],
}