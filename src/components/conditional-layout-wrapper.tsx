"use client"

import { usePathname } from "next/navigation";
import { ProductMatrixProvider } from "@/contexts/ProductMatrixContext";
import { ConditionalDynamicHeader } from "@/components/conditional-dynamic-header";
import { ProductInfoBar } from "@/components/product-info-bar";
import { useEffect, useState } from "react";

interface WorkPackage {
  id: string;
  name: string;
  description?: string;
}

interface ApiWorkPackage {
  workpackage_id: number;
  workpackage_name: string;
  workpackage_description?: string;
}

interface ConditionalLayoutWrapperProps {
  children: React.ReactNode;
}

export function ConditionalLayoutWrapper({ children }: ConditionalLayoutWrapperProps) {
  const pathname = usePathname();
  const isProductRoute = pathname === '/product';
  const isProductSubroute = pathname.startsWith('/product') && pathname !== '/product';
  const [workPackages, setWorkPackages] = useState<WorkPackage[]>([]);
  
  useEffect(() => {
    if (isProductRoute) {
      // Cargar workPackages usando API call en lugar de direct DB access
      fetch('/api/work-packages')
        .then(res => res.json())
        .then(data => {
          // Convertir formato de API a formato esperado
          const formattedWorkPackages = (data.workpackages || []).map((wp: ApiWorkPackage) => ({
            id: wp.workpackage_id.toString(),
            name: wp.workpackage_name,
            description: wp.workpackage_description
          }));
          setWorkPackages(formattedWorkPackages);
        })
        .catch(console.error);
    }
  }, [isProductRoute]);

  if (isProductRoute) {
    return (
      <ProductMatrixProvider>
        <ConditionalDynamicHeader workPackages={workPackages} />
        <div className="flex-1 overflow-auto relative">
          <div className="min-h-full">
            {children}
          </div>
        </div>
      </ProductMatrixProvider>
    );
  }

  return (
    <>
      <ConditionalDynamicHeader />
      {/* Mostrar ProductInfoBar solo en subrutas de /product cuando hay un productId */}
      {isProductSubroute && <ProductInfoBar />}
      <div className="flex-1 overflow-auto relative">
        <div className="min-h-full">
          {children}
        </div>
      </div>
    </>
  );
}