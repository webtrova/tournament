import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import { SessionProvider } from "next-auth/react";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bergenfield Dominoes Tournament",
  description: "64-player dominoes tournament management system"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen bg-background antialiased`}
      >
        <SessionProvider>
          <Navbar />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
