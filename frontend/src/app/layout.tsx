import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NotificationsProvider } from "@/context/NotificationsContext";
import { AuthProvider } from "@/auth/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Student Dropout Risk Dashboard",
  description:
    "Professional analytics console to monitor student engagement, attendance, and dropout risk using big data and machine learning.",
};

import CinematicBackground from "@/components/CinematicBackground";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-white`}
      >
        <CinematicBackground />
        <AuthProvider>
          <NotificationsProvider>
            {children}
          </NotificationsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
