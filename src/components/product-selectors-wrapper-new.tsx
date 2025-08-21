"use client"

import { useState } from "react";
import { ProductSelectors } from "@/components/product-selectors";
import { ProductDetailModal } from "@/components/product-detail-modal";
import AddProductModal from "@/components/add-product-modal";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

// Interfaces
interface WorkPackage {
  id: string;
  name: string;
  description?: string;
}

interface Product {
  id: string;
  name: string;
  objective?: string;
  deliverable?: string;
  deliveryDate?: string;
  outputNumber?: string;
  methodologyDescription?: string;
  genderSpecificActions?: string;
  nextSteps?: string;
  workPackageId: string;
  workPackageName?: string;
  primaryOrganization?: string | {
    organization_name: string;
    organization_description?: string;
  };
  country?: string;
}

interface ProductSelectorsWrapperProps {
  initialWorkPackages: WorkPackage[];
}

export function ProductSelectorsWrapper({ initialWorkPackages }: ProductSelectorsWrapperProps) {
  const [, setSelectedProductId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);

  const handleWorkPackageChange = (workPackageId: string | null) => {
    console.log('Work Package selected:', workPackageId);
    // Reset product selection when work package changes
    setSelectedProductId(null);
    setSelectedProduct(null);
  };

  const handleProductChange = (productId: string | null) => {
    console.log('Product selected:', productId);
    setSelectedProductId(productId);
    
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
      const response = await fetch(`/api/product-full-details?productId=${productId}`);
      const data = await response.json();
      if (data.product) {
        setSelectedProduct(data.product);
      }
    } catch (error) {
      console.error('Error fetching product info:', error);
    }
  };

  const handleProductAdded = () => {
    // Refresh the page or update the products list
    window.location.reload();
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
            
            {/* Título Platform */}
            <h1 className="text-lg font-medium text-foreground">Platform</h1>
            
            {/* Botón Add Product */}
            <Button 
              onClick={() => setIsAddProductModalOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1.5"
              size="sm"
            >
              + Add Product
            </Button>
            
            {/* Enterprise Label */}
            <h1 className="text-lg font-medium text-foreground">Enterprise</h1>
            
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
                  [{typeof selectedProduct.primaryOrganization === 'string' 
                    ? selectedProduct.primaryOrganization?.toUpperCase() 
                    : selectedProduct.primaryOrganization?.organization_name?.toUpperCase() || 'NO ORGANIZATION'} RESPONSABLE]
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
          product={{
            ...selectedProduct,
            primaryOrganization: typeof selectedProduct.primaryOrganization === 'string' 
              ? selectedProduct.primaryOrganization 
              : selectedProduct.primaryOrganization?.organization_name || undefined
          }}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onProductAdded={handleProductAdded}
      />
    </div>
  );
}
