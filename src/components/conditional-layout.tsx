'use client';

import { usePathname } from 'next/navigation';
import { AppSidebar } from "@/components/app-sidebar";
import { ConditionalLayoutWrapper } from "@/components/conditional-layout-wrapper";
import { FloatingTaskButton } from "@/components/floating-task-button";
import { ClientHeaderProvider } from "@/components/client-header-provider";
import { AuthGuard } from "@/components/auth-guard";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // Si estamos en la página de login, mostrar solo el contenido sin sidebar ni headers
  if (pathname === '/login') {
    return <>{children}</>;
  }
  
  // Para todas las demás rutas, mostrar el layout completo con protección
  return (
    <AuthGuard>
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
    </AuthGuard>
  );
}