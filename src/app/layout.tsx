import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Readex_Pro, Cairo } from "next/font/google";
import "./globals.css";

const ibmPlex = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex",
  display: "swap",
});

const readex = Readex_Pro({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-readex",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "منصة الشيخ الصابوني | الأرشيف والتراث العلمي الشامل",
  description: "المنصة الرقمية الرسمية لحفظ وإتاحة التراث العلمي والتفسيري لفضيلة العلامة الشيخ محمد علي الصابوني رحمه الله.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${ibmPlex.variable} ${readex.variable} ${cairo.variable}`}>
      <body className="min-h-screen bg-black text-white antialiased selection:bg-[#9EE4A9] selection:text-black">
        {children}
      </body>
    </html>
  );
}
