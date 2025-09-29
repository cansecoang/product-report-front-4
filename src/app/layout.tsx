import type { Metadata } from "next";
import { Montserrat, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar"
import { ConditionalLayoutWrapper } from "@/components/conditional-layout-wrapper"
import { FloatingTaskButton } from "@/components/floating-task-button"
import { ClientHeaderProvider } from "@/components/client-header-provider"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

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
        <ClientHeaderProvider>
          <SidebarProvider defaultOpen={false}>
            <AppSidebar />
            <SidebarInset className="flex flex-col h-screen">
              {/* Dynamic Page Header - shows sidebar toggle + current section - FIXED */}
              <ConditionalLayoutWrapper>
                {children}
              </ConditionalLayoutWrapper>
              
              {/* Floating Task Button - FIXED position */}
              <FloatingTaskButton />
            </SidebarInset>
          </SidebarProvider>
        </ClientHeaderProvider>
      </body>
    </html>
  );
}