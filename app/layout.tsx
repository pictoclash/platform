import type { Metadata } from "next";
import { Geist, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "./components/header";
import { PictoFooter } from "@/components/picto";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "PICTOCLASH - Art Trading Game",
  description: "An open-source art trading game where artists create artwork featuring characters from opposing teams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=array@400,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${ibmPlexMono.variable} antialiased min-h-screen bg-[#c5c5c5]`}
      >
        <Header />
        <main className="min-h-[calc(100vh-200px)]">{children}</main>
        <PictoFooter />
      </body>
    </html>
  );
}
