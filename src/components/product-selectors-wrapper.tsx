"use client"

import { useState } from "react";
import { ProductSelectors } from "@/components/product-selectors";
import { ProductDetailModal } from "@/components/product-detail-modal";
import { Button } from "@/components/ui/button";

// Interfaces
interface WorkPackage {
  id: string;
  name: string;
  description?: string;
}

interface ProductInfo {
  id: string;
  name: string;
  objective?: string;
  deliverable?: string;
  deliveryDate?: string;
  workPackageId: string;
  workPackageName?: string;
  primaryOrganization?: string;
  country?: string;
}

interface ProductSelectorsWrapperProps {
  initialWorkPackages: WorkPackage[];
}

export function ProductSelectorsWrapper({ initialWorkPackages }: ProductSelectorsWrapperProps) {
  const [selectedProduct, setSelectedProduct] = useState<ProductInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleWorkPackageChange = (workPackageId: string | null) => {
    console.log('Work Package selected:', workPackageId);
    // Reset product selection when work package changes
    setSelectedProduct(null);
  };

  const handleProductChange = (productId: string | null) => {
    console.log('Product selected:', productId);
    
    // Store in localStorage for other components to use
    if (productId) {
      localStorage.setItem('selectedProductId', productId);
      fetchProductInfo(productId);
    } else {
      localStorage.removeItem('selectedProductId');
      setSelectedProduct(null);
    }
  };

  const fetchProductInfo = async (productId: string) => {
    try {
      // Guardar el producto seleccionado en localStorage para que otras páginas lo puedan usar
      localStorage.setItem('selectedProductId', productId);
      
      const response = await fetch(`/api/product-full-details?productId=${productId}`);
      const data = await response.json();
      if (data.product) {
        setSelectedProduct(data.product);
      }
    } catch (error) {
      console.error('Error fetching product info:', error);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div>
      {/* Barra superior con dos niveles como en el mockup */}
      <div className="bg-background border-b px-6 py-3">
        {/* PRIMER NIVEL: Products + Organización responsable */}
        <div className="flex items-center justify-between w-full mb-3">
          {/* Lado izquierdo: Products */}
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-medium text-foreground">Products</h1>
          </div>

          {/* Lado derecho: Organización responsable */}
          <div className="flex items-center">
            {selectedProduct && (
              <div className="text-lg font-medium text-foreground">
                {selectedProduct.primaryOrganization || 'No Organization'}
              </div>
            )}
          </div>
        </div>

        {/* SEGUNDO NIVEL: Dropdowns + Delivery Date + Country + Botón */}
        <div className="flex items-center justify-between w-full">
          {/* Lado izquierdo: Dropdowns */}
          <div className="flex items-center gap-4">
            <ProductSelectors 
              initialWorkPackages={initialWorkPackages}
              onWorkPackageChange={handleWorkPackageChange}
              onProductChange={handleProductChange}
            />
          </div>

          {/* Lado derecho: Delivery Date + Country + Botón */}
          <div className="flex items-center gap-6">
            {selectedProduct && (
              <>
                {/* Delivery Date */}
                <div className="text-sm font-medium text-foreground">
                  {formatDate(selectedProduct.deliveryDate)}
                </div>
                
                {/* Country Name */}
                <div className="text-sm font-medium text-foreground flex items-center gap-1">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="14" 
                    height="14" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  {selectedProduct.country || 'No Country'}
                </div>
              </>
            )}
            
            {/* View Details Button */}
            {selectedProduct && (
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                View Details
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedProduct && (
        <ProductDetailModal 
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
