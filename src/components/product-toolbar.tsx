"use client"

import { useState, useEffect } from "react";
import { ProductSelectors } from "@/components/product-selectors";
import { ProductDetailModal } from "@/components/product-detail-modal";
import AddProductModal from "@/components/add-product-modal";
import AddTaskModal from "@/components/add-task-modal";
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

interface ProductToolbarProps {
  initialWorkPackages: WorkPackage[];
}

export function ProductToolbar({ initialWorkPackages }: ProductToolbarProps) {
  // 🔍 IDENTIFICADOR TEMPORAL - ELIMINAR DESPUÉS  
  console.log('🔧 ProductToolbar component loaded');
  
  const [selectedProduct, setSelectedProduct] = useState<ProductInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  // Limpiar localStorage al inicializar para que no haya productos pre-seleccionados
  useEffect(() => {
    localStorage.removeItem('selectedProductId');
    setSelectedProduct(null);
  }, []);

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
        setSelectedProduct(data.product);
      }
    } catch (error) {
      console.error('Error fetching product info:', error);
    }
  };

  const handleProductAdded = () => {
    // Refresh or handle product addition
    console.log('Product added, refreshing...');
  };

  const handleAddTaskClick = () => {
    setIsAddTaskModalOpen(true);
  };

  const closeAddTaskModal = () => {
    setIsAddTaskModalOpen(false);
  };

  const handleTaskAdded = () => {
    // Refresh or handle task addition
    console.log('Task added, refreshing...');
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
      {/* Product-specific toolbar below the main header */}
      <div data-component="ProductToolbar" className="bg-background border-b px-3 py-3">
        <div className="flex items-center justify-between w-full">
          {/* Lado izquierdo: Dropdowns solamente */}
          <div className="flex items-center gap-4">
            <ProductSelectors 
              initialWorkPackages={initialWorkPackages}
              onWorkPackageChange={handleWorkPackageChange}
              onProductChange={handleProductChange}
            />
          </div>

          {/* Lado derecho: Delivery Date + Country + Add Product + Add Task */}
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
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Botón Add Product */}
              <Button 
                onClick={() => setIsAddProductModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1.5"
                size="sm"
              >
                + Add Product
              </Button>

              {/* Botón Add Task */}
              <Button 
                onClick={handleAddTaskClick}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5"
                size="sm"
              >
                + Add Task
              </Button>
            </div>

            {/* View Details Button */}
            {selectedProduct && (
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="bg-gray-600 hover:bg-gray-700 text-white"
              >
                Details
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

      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onProductAdded={handleProductAdded}
      />

      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={closeAddTaskModal}
        productId={selectedProduct?.id?.toString() || null}
        onTaskAdded={handleTaskAdded}
      />
    </>
  );
}
