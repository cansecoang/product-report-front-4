"use client"

import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Interfaces actualizadas para tu estructura real
interface WorkPackage {
  id: string;
  name: string;
  description?: string;
}

interface Product {
  id: string;
  name: string;
  workPackageId: string;
  objective?: string;
}

interface ProductSelectorsProps {
  initialWorkPackages: WorkPackage[];
  onWorkPackageChange?: (workPackageId: string | null) => void;
  onProductChange?: (productId: string | null) => void;
  refreshTrigger?: number; // Para forzar refresh cuando se elimina un producto
}

export function ProductSelectors({ 
  initialWorkPackages,
  onWorkPackageChange, 
  onProductChange,
  refreshTrigger
}: ProductSelectorsProps) {
  const [selectedWorkPackage, setSelectedWorkPackage] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Refrescar productos cuando cambie refreshTrigger
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0 && selectedWorkPackage) {
      fetchProducts(selectedWorkPackage);
    }
  }, [refreshTrigger, selectedWorkPackage]);

  const fetchProducts = async (workPackageId: string) => {
    setIsLoadingProducts(true);
    try {
      // Usamos Server Action para obtener productos
      const response = await fetch(`/api/products-server?workPackageId=${workPackageId}`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleWorkPackageChange = (value: string) => {
    setSelectedWorkPackage(value);
    setSelectedProduct(null);
    setProducts([]);
    onWorkPackageChange?.(value);
    onProductChange?.(null);
    
    // Fetch products para el work package seleccionado
    fetchProducts(value);
  };

  const handleProductChange = (value: string) => {
    setSelectedProduct(value);
    onProductChange?.(value);
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col gap-1">
        <Select
          value={selectedWorkPackage || ""}
          onValueChange={handleWorkPackageChange}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select work package" />
          </SelectTrigger>
          <SelectContent>
            {initialWorkPackages.map((workPackage) => (
              <SelectItem key={workPackage.id} value={workPackage.id}>
                {workPackage.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <Select
          value={selectedProduct || ""}
          onValueChange={handleProductChange}
          disabled={!selectedWorkPackage || isLoadingProducts}
        >
          <SelectTrigger className="w-[300px]">
            <SelectValue 
              placeholder={
                !selectedWorkPackage 
                  ? "Select work package first"
                  : isLoadingProducts 
                    ? "Loading..."
                    : "Select product"
              } 
            />
          </SelectTrigger>
          <SelectContent>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
