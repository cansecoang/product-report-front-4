// Server Component - se ejecuta en el servidor
import "../globals.css";
import { ProductSelectorsWrapper } from "@/components/product-selectors-wrapper";
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
      {/* Header integrado que abarque toda la parte superior */}
      <ProductSelectorsWrapper 
        initialWorkPackages={workPackages}
      />
      
      {/* Contenido principal */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
