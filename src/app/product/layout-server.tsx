import { getWorkPackages } from '@/lib/data-access';
import { ProductSelectors } from "@/components/product-selectors";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

// Este es un Server Component - se ejecuta en el servidor
export default async function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Consultas directas a la base de datos en el servidor
  const workPackages = await getWorkPackages();
  
  return (
    <div>
      <div className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 overflow-auto">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          {/* Pasar los datos directamente al componente cliente */}
          <ProductSelectors 
            initialWorkPackages={workPackages}
            onWorkPackageChange={(id) => console.log('Work Package selected:', id)}
            onProductChange={(id) => console.log('Product selected:', id)}
          />
        </div>
      </div>

      {children}
    </div>
  );
}
