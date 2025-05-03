import type { Metadata } from "next";
import { Montserrat } from 'next/font/google'
import "./globals.css";
import Provider from "./provider";
import { cn } from "@heroui/react";

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
})

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "A leaderboard for event",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(montserrat.className,"min-h-[100dvh] w-screen")}
      >
        <Provider>
          {children}
        </Provider>
      </body>
    </html>
  );
}
