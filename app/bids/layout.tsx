import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { Link } from "@nextui-org/link";
import clsx from "clsx";

import { Providers } from "../providers";

import { siteConfig } from "@/config/bidderSite";
import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/bidderNavbar";



export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
   
          <div className="relative flex flex-col h-screen">
             <Navbar />              
            <main className="container mx-auto max-w-7xl pt-16 px-6 flex-grow">
              {children}
            </main> 
          </div>
     
  );
}
