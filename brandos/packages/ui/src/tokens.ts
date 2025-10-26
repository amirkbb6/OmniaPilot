import { Plus_Jakarta_Sans, Clash_Display } from "next/font/google";

export const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

export const fontDisplay = Clash_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap"
});

export const brandRadius = {
  sm: "8px",
  md: "12px",
  lg: "20px"
};

export const brandShadows = {
  subtle: "0 10px 40px rgba(0,0,0,0.3)",
  focus: "0 0 0 2px rgba(155,135,245,0.4)"
};

export const brandSpacing = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "40px"
};
