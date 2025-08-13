/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'whatsapp-green': '#25D366',
        'whatsapp-light-green': '#DCF8C6',
        'whatsapp-dark': '#075E54',
        'whatsapp-teal': '#128C7E',
        'whatsapp-blue': '#34B7F1',
        'whatsapp-bg': '#EFEAE2',
        'whatsapp-chat-bg': '#E5DDD5',
      },
    },
  },
  plugins: [],
}