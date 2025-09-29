// Server Component - se ejecuta en el servidor
import "../globals.css";
import { ProductToolbar } from "@/components/product-toolbar";
import { ProductHeaderSetup } from "@/components/product-header-setup";
import { getWorkPackages } from '@/lib/data-access';
import { Suspense } from "react";

export default async function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 🚀 Consulta directa a la base de datos en el servidor
  const workPackages = await getWorkPackages();
  
  return (
    <div className="flex flex-col h-full">
      {/* Setup del header dinámico para todas las rutas de productos */}
      <ProductHeaderSetup workPackages={workPackages} />
      
      {/* Product-specific toolbar (FIXED) */}
      <div className="sticky top-0 z-30 bg-background border-b">
          <Suspense fallback={<div className="h-16 bg-gray-100 border-b">Cargando toolbar...</div>}>
            <ProductToolbar 
              initialWorkPackages={workPackages}
            />
          </Suspense>
        
      </div>
      
      {/* Contenido principal (SCROLLABLE por defecto, pero el Gantt manejará su propio overflow) */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 min-h-full">
          {children}
        </div>
      </div>
    </div>
  );
}
