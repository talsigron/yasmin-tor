import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";

const rubik = Rubik({
  subsets: ["latin", "hebrew"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "יסמין תור - מערכת ניהול תורים לעסקים",
  description:
    "קביעת תורים, ניהול לקוחות, תשלומים ועוד - הכל במקום אחד. בלי אפליקציה, בלי התקנה.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={rubik.className}>
      <body className="min-h-screen bg-[#FAFAF9] text-[#1A1A1A] antialiased">
        {children}
      </body>
    </html>
  );
}
