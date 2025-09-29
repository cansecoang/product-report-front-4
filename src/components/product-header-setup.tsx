"use client"

import { useEffect } from 'react';
import { useHeader } from '@/contexts/HeaderContext';
import { Package } from 'lucide-react';
import { ProductFilters } from '@/components/product-filters';

interface WorkPackage {
  id: string;
  name: string;
  description?: string;
}

interface ProductHeaderSetupProps {
  workPackages: WorkPackage[];
}

export function ProductHeaderSetup({ workPackages }: ProductHeaderSetupProps) {
  const { setHeaderConfig } = useHeader();

  useEffect(() => {
    setHeaderConfig({
      title: "Products",
      actions: <ProductFilters initialWorkPackages={workPackages} />
    });
  }, [setHeaderConfig, workPackages]);

  return null; // Este componente no renderiza nada, solo configura el header
}