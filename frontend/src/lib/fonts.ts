import {
  Cormorant_Garamond,
  DM_Sans,
  DM_Serif_Display,
} from "next/font/google";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

// One class string exposing all three font variables; used by the app root and Storybook.
export const fontVariables = `${dmSans.variable} ${dmSerifDisplay.variable} ${cormorantGaramond.variable}`;
