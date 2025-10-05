import type { Metadata } from "next";
import { Montserrat, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext"
import { ConditionalLayout } from "@/components/conditional-layout"
import { QueryProvider } from "@/providers/query-provider"
import { Toaster } from "@/components/ui/toast"
import { CommandPalette } from "@/components/command-palette"

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
        <QueryProvider>
          <AuthProvider>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
            <CommandPalette />
            <Toaster />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}