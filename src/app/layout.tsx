import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "منصة الشيخ الصابوني | الأرشيف والتراث العلمي الشامل",
  description: "المنصة الرقمية الرسمية لحفظ وإتاحة التراث العلمي والتفسيري لفضيلة العلامة الشيخ محمد علي الصابوني رحمه الله.",
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

/* خطوط ثمانية (Thmanyah Sans / Serif Display / Serif Text) تُحمَّل من CDN في المتصفح
   ملاحظة الترخيص: الخط مجاني للاستخدام الشخصي — للنشر الرسمي راجع font.thmanyah.com/licenses */
const FONTS_HREF = "https://cdn.jsdelivr.net/npm/@dawod/thmanyah-font-web/index.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link rel="stylesheet" href={FONTS_HREF} />
      </head>
      <body className="min-h-screen bg-ink text-ivory antialiased selection:bg-gold selection:text-ink">
        {children}
      </body>
    </html>
  );
}
