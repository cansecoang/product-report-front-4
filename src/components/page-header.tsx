"use client"

import { SidebarTrigger } from "@/components/ui/sidebar";

interface PageHeaderProps {
  title: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <div className="bg-background border-b px-6 py-3">
      {/* PRIMER NIVEL: Sidebar trigger + Título */}
      <div className="flex items-center justify-between w-full mb-3">
        {/* Lado izquierdo: Sidebar trigger + Título */}
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <h1 className="text-lg font-medium text-foreground">{title}</h1>
        </div>
      </div>

      {/* SEGUNDO NIVEL: Contenido adicional personalizable */}
      {children && (
        <div className="flex items-center justify-between w-full">
          {children}
        </div>
      )}
    </div>
  );
}
