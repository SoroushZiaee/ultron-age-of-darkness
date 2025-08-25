import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "Intelligent Hub - Service Management Platform",
  description: "Centralized hub for managing and accessing intelligent services including AI-powered blog generation, analytics, and more.",
  keywords: ["services", "AI", "automation", "hub", "platform", "intelligent"],
  authors: [{ name: "Intelligent Services Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">
        <Navigation />
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="bg-white border-t border-gray-200 py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-gray-600">
              <p className="text-sm">
                © 2025 Intelligent Hub. Built with Next.js and powered by AI.
              </p>
              <p className="text-xs mt-2">
                Manage and discover intelligent services in one centralized platform.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}