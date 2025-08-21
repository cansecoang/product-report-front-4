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
    <div className="flex h-screen flex-col">
      {/* Product-specific toolbar (no header, just functionality) */}
      <ProductToolbar 
        initialWorkPackages={workPackages}
      />
      
      {/* Contenido principal */}
      <div className="flex-1 px-6 py-4 overflow-auto">
        {children}
      </div>
    </div>
  );
}
