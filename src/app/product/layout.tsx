// Server Component - se ejecuta en el servidor
import "../globals.css";
import { ProductHeaderSetup } from "@/components/product-header-setup";
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
      {/* Setup del header dinámico para todas las rutas de productos */}
      <ProductHeaderSetup workPackages={workPackages} />
      
      {/* Contenido principal (SCROLLABLE por defecto, pero el Gantt manejará su propio overflow) */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 min-h-full">
          {children}
        </div>
      </div>
    </div>
  );
}
