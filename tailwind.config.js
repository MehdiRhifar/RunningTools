/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        'xs': '0.75rem',     // 12px
        'sm': '0.875rem',    // 14px
        'base': '1.225rem',  // 18px (votre préférence)
        'lg': '1.25rem',     // 20px
        'xl': '1.375rem',    // 22px (vos labels)
        '2xl': '1.5rem',     // 24px
        '3xl': '1.875rem',   // 30px
      },

    },
  },
  plugins: [

  ],
}

