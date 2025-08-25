import type { Metadata } from "next";
import { Montserrat, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar"
import { DynamicPageHeader } from "@/components/dynamic-page-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Suspense } from "react";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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