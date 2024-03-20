/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'elysgreen': '#0F503C',//'#083425',
        'elysgold': '#6d6f42', //'#AE8D4A'
        'buttongreen': '#053527', //#031a15',
        'buttongreen-100': '#0a2f27',
        'bggreen': '#8DC7BA',//'#e3eee8',
        'bordergold': '#1a4934'
      },
      spacing: {
        'top-neg-5': '-5px'
      },
      fontFamily: {
        'kallisto-bold': ['KallistoBold'], 
        'kallisto-light': ['KallistoLight'], 
        'kallisto-medium': ['KallistoMedium'],
        'orbitron-bold': ['OrbitronBold'],
        'poppins-bold': ['PoppinsBold'],
        'poppins-regular': ['PoppinsRegular'],
        'normal' : ['PoppinsRegular'],
        'bold' : ['PoppinsBold'],
      },
    },
  },
  plugins: [],
}

