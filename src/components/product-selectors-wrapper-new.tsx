"use client"

import { useState } from "react";
import { ProductSelectors } from "@/components/product-selectors";
import { ProductDetailModal } from "@/components/product-detail-modal";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

// Interfaces
interface WorkPackage {
  id: string;
  name: string;
  description?: string;
}

interface ProductSelectorsWrapperProps {
  initialWorkPackages: WorkPackage[];
}

export function ProductSelectorsWrapper({ initialWorkPackages }: ProductSelectorsWrapperProps) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleWorkPackageChange = (workPackageId: string | null) => {
    console.log('Work Package selected:', workPackageId);
    // Reset product selection when work package changes
    setSelectedProductId(null);
    setSelectedProduct(null);
  };

  const handleProductChange = (productId: string | null) => {
    console.log('Product selected:', productId);
    setSelectedProductId(productId);
    
    // Fetch product info when selected
    if (productId) {
      fetchProductInfo(productId);
    } else {
      setSelectedProduct(null);
    }
  };

  const fetchProductInfo = async (productId: string) => {
    try {
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div>
      {/* Barra superior como en el mockup */}
      <div className="bg-background border-b px-6 py-4">
        <div className="flex items-center justify-between w-full">
          {/* Lado izquierdo: Sidebar trigger + Products + dropdowns */}
          <div className="flex items-center gap-6">
            {/* Sidebar trigger (icono rojo en el mockup) */}
            <SidebarTrigger className="text-red-500" />
            
            {/* Título Products */}
            <h1 className="text-lg font-medium text-foreground">Products</h1>
            
            {/* Dropdowns */}
            <div className="flex items-center gap-4">
              <ProductSelectors 
                initialWorkPackages={initialWorkPackages}
                onWorkPackageChange={handleWorkPackageChange}
                onProductChange={handleProductChange}
              />
            </div>
          </div>

          {/* Lado derecho: Información del producto + organización + botón */}
          <div className="flex items-center gap-6">
            {selectedProduct && (
              <>
                {/* Delivery Date */}
                <div className="text-sm font-medium">
                  [{formatDate(selectedProduct.deliveryDate)}]
                </div>
                
                {/* Country Name */}
                <div className="text-sm font-medium">
                  [{selectedProduct.country?.toUpperCase() || 'NO COUNTRY'}]
                </div>
                
                {/* Organization Responsible */}
                <div className="text-sm font-medium">
                  [{selectedProduct.primaryOrganization?.toUpperCase() || 'NO ORGANIZATION'} RESPONSABLE]
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

      {/* Modal */}
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
