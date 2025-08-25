// Server Component - se ejecuta en el servidor
import "../globals.css";
import { ProductToolbar } from "@/components/product-toolbar";
import { getWorkPackages } from '@/lib/data-access';

export default async function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 🚀 Consulta directa a la base de datos en el servidor
  const workPackages = await getWorkPackages();
  
  return (
    <div className="flex flex-col h-full">
      {/* Product-specific toolbar (FIXED) */}
      <div className="sticky top-0 z-30 bg-background border-b">
          <ProductToolbar 
            initialWorkPackages={workPackages}
          />
        
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
