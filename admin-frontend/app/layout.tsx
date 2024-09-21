"use client"

import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";
import Sidebar from "@/components/Sidebar";
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className={`flex`}>
            <div className="justify-start mr-[40px] h-full">
              <Sidebar />
            </div>
            <div className="flex flex-col h-[100vh] w-[75%] overflow-scroll rounded-xl ">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
