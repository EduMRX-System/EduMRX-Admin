import type { Metadata, Viewport } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import Provider from "@/components/Provider";

import "bootstrap-icons/font/bootstrap-icons.css";

import "leaflet/dist/leaflet.css";
import ThemeInitializer from "@/components/ThemeInitializer";
import LanguageInitializer from "@/components/LanguageInitializer";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#4F46E5",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "EduMRX — O'quv Markazlar uchun Aqlli CRM Tizimi | edumrx.uz",
  description:
    "EduMRX — o'quv markazlar, IT akademiyalar va til markazlari uchun to'liq CRM platformasi. O'quvchilar, davomat, to'lovlar, o'qituvchilar va tahlilni bitta tizimda boshqaring. Ro'yxatdan o'tishsiz boshqaruv — faqat natija.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EduMRX Admin",
  },
  keywords: [
    "o'quv markaz CRM",
    "talaba boshqaruvi",
    "davomat tizimi",
    "to'lov tizimi",
    "EduX",
    "IELTS markaz",
    "IT akademiya",
    "til markazi",
    "guruh boshqaruvi",
    "edumrx.uz",
  ],
  metadataBase: new URL("https://edumrx.uz"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "EduX — O'quv Markazlar uchun Aqlli CRM",
    description:
      "Davomat, to'lovlar, o'quvchilar va tahlil — hammasi bitta platformada. edumrx.uz",
    type: "website",
    url: "https://edumrx.uz",
  },
  twitter: {
    card: "summary_large_image",
    title: "Edu — O'quv Markazlar uchun Aqlli CRM",
    description:
      "Davomat, to'lovlar, o'quvchilar va tahlil — hammasi bitta platformada.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <ThemeInitializer />
        <LanguageInitializer />
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}