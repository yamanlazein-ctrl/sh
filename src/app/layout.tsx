import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "منصة الشيخ الصابوني | الأرشيف والتراث العلمي الشامل",
  description: "المنصة الرقمية الرسمية لحفظ وإتاحة التراث العلمي والتفسيري لفضيلة العلامة الشيخ محمد علي الصابوني رحمه الله.",
};

export const viewport: Viewport = {
  themeColor: "#0a0806",
};

/* الخطوط تُحمَّل من Google Fonts في المتصفح (وليس وقت البناء) — React 19 يرفعها تلقائياً إلى <head> */
const FONTS_HREF =
  "https://fonts.googleapis.com/css2?" +
  [
    "family=Amiri:wght@400;700",
    "family=Cairo:wght@600;700;800;900",
    "family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700",
    "family=Readex+Pro:wght@300;400;500;600;700",
  ].join("&") +
  "&display=swap";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={FONTS_HREF} />
      </head>
      <body className="min-h-screen bg-ink text-ivory antialiased selection:bg-gold selection:text-ink">
        {children}
      </body>
    </html>
  );
}
