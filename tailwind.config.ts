import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/flowbite-react/**/*.js",
  ],
  safelist: [
    "border-lavender",
    "text-purple",
    "bg-purple/5",
    "border-glitter",
    "text-royalBlue",
    "bg-royalBlue/5",
    "border-almond",
    "text-tangelo",
    "bg-tangelo/5",
    "border-wolf",
    "text-charcoal",
    "bg-charcoal/5",
    "border-platinum",
    "text-cadmium",
    "bg-cadmium/5",
    "text-smokyBlack",
    "bg-smokyBlack/5",
    "bg-candyRed",
    "bg-harvestGold",
    "bg-gold",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
      colors: {
        primary: "#29A38B",
        secondary: "#33CCAD",
        whiteSmoke: "#EEF0F1",
        snow: "#FAFAFA",
        liver: "#525252",
        smokyBlack: "#0A0A0A",
        ghostWhite: "#F5F5F5",
        platinum: "#E6E6E6",
        kellyGreen: "#0AC20A",
        davyGray: "#4D4D4D",
        pineGreen: "#1F7A68",
        stateGreen: "#145245",
        aqua: "#5CD6BD",
        jungleGreen: "#29A38A",
        paleBlue: "#AEEADE",
        azure: "#3D87F5",
        celeste: "#D6F5EE",
        trollyGray: "#7A7E85",
        carminePink: "#F53D3D",
        royalBlue: "#0D69F2",
        munsell: "#F3F4F7",
        charcoal: "#3D495C",
        lavender: "#EDCFFC",
        glitter: "#CFE1FC",
        purple: "#B83DF5",
        tangelo: "#F2590D",
        wolf: "#E0E4EB",
        almond: "#FCDECF",
        cadmium: "#056124",
        mistyRose: "#FCE3E3",
        ivory: "#E3FCEB",
        dustyGray: "#999999",
        regentGrey: "#94989E",
        lightGray: "#EFEFEF",
        intenseRed: "#E40C0C",
        paleGreen: "#ADEBDE",
        candyRed: "#F22B0D",
        harvestGold: "#FF8000",
        gold: "#FFD633",
      },
      spacing: {
        "1.5": "0.375rem", // 6px
        "3.75": "0.938rem", // 15px
        "4.5": "1.125rem", //18px
        "7.5": "1.875rem", // 30px
        "8.5": "2.125rem", // 34px
        "10.5": "2.625rem", // 42px
        "11.25": "2.813rem", // 45px
        "13": "3.25rem", // 52px
        "25": "6.25rem", // 100px
        "50": "12.5rem", // 200px
        "70": "17.5rem", //280px
        "75": "18.75rem", // 300px
        "76.5": "19.125rem", // 306px
        "87.5": "21.875rem", // 350px
        "90.75": "22.6875rem", //363px
        "95": "23.75rem", //380px
        "100": "25rem", // 400px
        "105": "26.25rem", //420px
        "112.5": "28.125rem", //450px
        "125": "31.25rem", // 500px
        "128.5": "32.125rem", // 514px
        "135": "33.75rem", //540px
        "137.5": "34.375rem", //550px
        "150": "37.5rem", // 600px
        "157.5": "39.375rem", // 630px
        "325": "81.25rem", // 1300px
        "11/50": "22%",
        "12/25": "48%",
        "9/10": "90%",
      },
      fontSize: {
        md: "0.938rem", // 15px
        "3.5xl": "2rem", // 32px
      },
      width: {
        "22": "5.5rem", // 88px
      },
      minWidth: {
        "22": "5.5rem", // 88px
      },
      boxShadow: {
        medium: "0px 0px 16px 0px rgba(178, 178, 178, 0.20)",
        soft: "0px 0px 8px 0px #66666633",
      },
      screens: {
        xl: "1400px",
      },
    },
  },
  plugins: [require("flowbite-react")],
};
export default config;
