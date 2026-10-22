import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        integral: {
          // Midnight Blue scale (Integral core)
          midnight: {
            50: '#f7f7f8',
            100: '#f2f3f5',
            200: '#cdcfd6',
            300: '#9ba0ad',
            400: '#697084',
            500: '#37415b',
            600: '#051132',
            700: '#040e28',
            800: '#030a1e',
            900: '#020714',
            1000: '#01030a',
          },
          // Copper scale (Integral signature orange accent)
          copper: {
            50: '#fdf8f4',
            100: '#faefe6',
            200: '#f5dfce',
            300: '#ecbf9c',
            400: '#e29f6c',
            500: '#d97f3b',
            600: '#cf5f09', // primary brand copper
            700: '#9c4d11',
            800: '#6a3710',
            900: '#3e1f07',
          },
          // Grey scale
          grey: {
            50: '#fafafa',
            100: '#f4f4f4',
            200: '#d2d2d3',
            300: '#a4a6a6',
            400: '#77797a',
            500: '#494d4d',
            600: '#1c2021',
            700: '#161a1a',
            800: '#111314',
            900: '#0b0d0d',
          }
        }
      }
    },
  },
  plugins: [],
};
export default config;
