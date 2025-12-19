import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../lib/design-system/ThemeProvider";
import { ToastProvider } from "../components/glass/ToastContainer";
import { ErrorBoundary } from "../components/glass/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Colmi Ring Dashboard - Real-time Health Monitoring",
  description: "Monitor your Colmi R02/R09 smart ring health metrics in real-time. Track heart rate, SpO2, steps, battery, and accelerometer data directly in your browser using Web Bluetooth.",
  keywords: ["Colmi", "R02", "R09", "smart ring", "health monitoring", "Web Bluetooth", "heart rate", "SpO2", "step tracking"],
  authors: [{ name: "Colmi Ring Dashboard Contributors" }],
  openGraph: {
    title: "Colmi Ring Dashboard",
    description: "Real-time health monitoring dashboard for Colmi smart rings",
    type: "website",
  },
};

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
        <ThemeProvider>
          <ToastProvider>
            <ErrorBoundary>
              <a href="#main-content" className="skip-link">
                Skip to main content
              </a>
              <div id="main-content">
                {children}
              </div>
            </ErrorBoundary>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
