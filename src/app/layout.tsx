import "./globals.css";
import type { Metadata } from "next";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "Vivana | Discover Real Portugal",
  description: "Connecting tourists and locals in Lisbon for authentic experiences.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-stone-800 font-sans">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-65XG2K8L45"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-65XG2K8L45');
          `}
        </Script>
        <Navbar />
        <main className="pt-24">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
