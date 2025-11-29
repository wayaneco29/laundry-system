import type { Metadata } from "next";
import Script from "next/script";
import { Montserrat } from "next/font/google";

import PrelineScriptWrapper from "./components/PrelineScriptWrapper";
import { ToastProvider } from "./providers/toast-provider";

import "./date-picker.css";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  preload: true,
  display: "swap",
  style: ["normal", "italic"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Easy Laba - Laundry Shop",
  description: "Easy Laba laundry shop management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable}  antialiased`}>
        <ToastProvider />
        {children}
        <PrelineScriptWrapper />
        <Script
          src="./node_modules/lodash/lodash.min.js"
          strategy="afterInteractive"
        />
        <Script
          src="./node_modules/vanilla-calendar-pro/index.js"
          strategy="afterInteractive"
        />
        <Script
          src="./assets/vendor/preline/dist/preline.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
