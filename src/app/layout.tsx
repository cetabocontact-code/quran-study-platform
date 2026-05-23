import type { Metadata } from "next";
import { Amiri_Quran, Cairo } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const amiri = Amiri_Quran({
  weight: "400",
  variable: "--font-amiri",
  subsets: ["arabic"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  title: "منصة دراسة القرآن الكريم | Qur'an Internal Study Platform",
  description: "A computational exploration system for the Qur'an.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${amiri.variable} ${cairo.variable} h-full antialiased dark`}>
      <body className="min-h-full flex font-cairo bg-background text-foreground selection:bg-teal-900 selection:text-teal-50">
        <Sidebar />
        <main className="flex-1 transition-all duration-300 md:mr-64 min-h-screen">
          <div className="p-8 md:p-12 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
