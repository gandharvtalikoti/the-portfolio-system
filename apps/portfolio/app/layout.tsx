import type { Metadata }           from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { LenisProvider }           from "@/providers/LenisProvider";
import { Cursor }                  from "@/components/cursor/Cursor";
import { Navbar }                  from "@/components/layout/Navbar";
import { site }                    from "@/config/site";
import { Footer } from "@/components/layout/Footer";

const playfair = Playfair_Display({
  subsets:  ["latin"],
  variable: "--font-playfair",
  display:  "swap",
});

const inter = Inter({
  subsets:  ["latin"],
  variable: "--font-inter",
  display:  "swap",
});

export const metadata: Metadata = {
  title: {
    default:  site.name,
    template: `%s — ${site.name}`,
  },
  description: site.tagline,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body>
        <LenisProvider>
          <Cursor />
          <Navbar />
          {children}
        </LenisProvider>
          <Footer />   
      </body>
    </html>
  );
}