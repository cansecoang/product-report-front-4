"use client"

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useHeader } from '../hooks/useHeader';


interface WorkPackage {
  id: string;
  name: string;
  description?: string;
}

interface ConditionalProductHeaderProps {
  workPackages: WorkPackage[];
}

export function ConditionalProductHeader({ workPackages }: ConditionalProductHeaderProps) {
  const { setHeaderConfig } = useHeader();
  const pathname = usePathname();

  useEffect(() => {
    // Solo mostrar filtros en subrutas, no en /product principal
    const isSubroute = pathname !== '/product';
    
    setHeaderConfig({
      title: "Products",
      actions: isSubroute ? <ProductFilters /> : undefined
    });
  }, [setHeaderConfig, workPackages, pathname]);

  return null; // Este componente no renderiza nada, solo configura el header
}
