import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "./BottomNav";
import TopNav from "./TopNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EasySafar",
  description: "Book your next trip with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 pb-20`}>
        {/* Our new smart Top Navigation */}
        <TopNav />
        
        {/* The main page content */}
        {children}
        
        {/* The mobile Bottom Navigation */}
        <BottomNav />
      </body>
    </html>
  );
}