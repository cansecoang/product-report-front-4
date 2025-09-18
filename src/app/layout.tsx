import type { Metadata } from "next";
import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar"
import { DynamicPageHeader } from "@/components/dynamic-page-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Suspense } from "react";

// Import fonts conditionally to avoid build failures in restricted environments
interface FontConfig {
  variable: string;
  className?: string;
}

let montserrat: FontConfig = { variable: "--font-montserrat" };
let geistMono: FontConfig = { variable: "--font-geist-mono" };

try {
  // Only load Google Fonts if network access is available
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Montserrat, Geist_Mono } = require("next/font/google");
  
  montserrat = Montserrat({
    variable: "--font-montserrat",
    subsets: ["latin"],
    display: "swap",
    weight: ["300", "400", "500", "600", "700"],
  });

  geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
  });
} catch {
  console.warn("Google Fonts not available, using system fonts");
}

export const metadata: Metadata = {
  title: "BioFincas - Dashboard de Biodiversidad",
  description: "Plataforma integral para monitoreo de biodiversidad y sostenibilidad agrícola",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} ${geistMono.variable} antialiased h-screen overflow-hidden`}
      >
        <SidebarProvider>
          <Suspense fallback={<div className="w-64 h-full bg-gray-100 border-r">Cargando...</div>}>
            <AppSidebar />
          </Suspense>
          <SidebarInset className="flex flex-col h-screen">
            {/* Dynamic Page Header - shows sidebar toggle + current section - FIXED */}
            <DynamicPageHeader />
            
            {/* Main Content - SCROLLABLE */}
            <div className="flex-1 overflow-auto">
              <div className="min-h-full">
                {children}
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}