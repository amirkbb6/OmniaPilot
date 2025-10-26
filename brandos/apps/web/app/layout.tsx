import "@/styles/globals.css";
import { ReactNode } from "react";
import { Metadata } from "next";
import { Providers } from "@/components/providers";
import { fontSans, fontDisplay } from "@brandos/ui";

export const metadata: Metadata = {
  title: "Puriva BrandOS",
  description: "Puriva Studio BrandOS platform"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${fontSans.variable} ${fontDisplay.variable}`} suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
