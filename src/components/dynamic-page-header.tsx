"use client"

import { SidebarTrigger } from "@/components/ui/sidebar";
import { useHeader } from "@/contexts/HeaderContext";

export function DynamicPageHeader() {
  const { title, icon: Icon, actions } = useHeader();

  return (
    <div className="bg-background border-b px-4 py-3 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-6 w-6 text-blue-600" />}
            <h1 className="text-lg font-medium text-foreground">{title}</h1>
          </div>
        </div>
        
        {/* Actions/controls específicos de cada página */}
        {actions && (
          <div className="flex items-center gap-4">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
