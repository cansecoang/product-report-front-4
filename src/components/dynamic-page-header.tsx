"use client"

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";

// Mapeo de rutas a títulos
const routeTitles: Record<string, string> = {
  "/": "Dashboard",
  "/analytics": "Analytics", 
  "/product": "Products",
  "/product/list": "Products",
  "/product/gantt": "Products", 
  "/product/metrics": "Products",
  "/indicators": "Indicadores",
  "/indicators/metrics": "Indicadores",
  "/settings": "Configuración",
  "/settings/organizations": "Configuración",
  "/settings/statuses": "Configuración",
  "/settings/phases": "Configuración"
};

export function DynamicPageHeader() {
  const pathname = usePathname();
  
  // Obtener el título basado en la ruta actual
  const getTitle = () => {
    // Buscar coincidencia exacta primero
    if (routeTitles[pathname]) {
      return routeTitles[pathname];
    }
    
    // Buscar coincidencia por prefijo para rutas anidadas
    for (const route in routeTitles) {
      if (pathname.startsWith(route) && route !== "/") {
        return routeTitles[route];
      }
    }
    
    // Fallback
    return "Dashboard";
  };

  return (
    <div className="bg-background border-b px-2 py-2">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <h1 className="text-lg font-medium text-foreground">{getTitle()}</h1>
      </div>
    </div>
  );
}
