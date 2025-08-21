"use client"

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { ProductSelectors } from "@/components/product-selectors";
import { ProductDetailModal } from "@/components/product-detail-modal";
import AddProductModal from "@/components/add-product-modal";
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

interface ProductHeaderProps {
  initialWorkPackages: WorkPackage[];
}

export function ProductHeader({ initialWorkPackages }: ProductHeaderProps) {
  const [selectedProduct, setSelectedProduct] = useState<ProductInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);

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
      const response = await fetch(`/api/product-full-details?productId=${productId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedProduct(data);
      }
    } catch (error) {
      console.error('Error fetching product info:', error);
    }
  };

  const handleProductAdded = () => {
    // Refresh or handle product addition
    console.log('Product added, refreshing...');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No Date';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <>
      <PageHeader title="Products">
        {/* Lado izquierdo: Dropdowns + Add Product */}
        <div className="flex items-center gap-4">
          <ProductSelectors 
            initialWorkPackages={initialWorkPackages}
            onWorkPackageChange={handleWorkPackageChange}
            onProductChange={handleProductChange}
          />
          
          {/* Botón Add Product en el lugar correcto */}
          <Button 
            onClick={() => setIsAddProductModalOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1.5"
            size="sm"
          >
            + Add Product
          </Button>
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
      </PageHeader>

      {/* Modals */}
      {selectedProduct && (
        <ProductDetailModal 
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onProductAdded={handleProductAdded}
      />
    </>
  );
}
