"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import AddProductModal from "@/components/add-product-modal";

export function GlobalNavbar() {
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);

  const handleProductAdded = () => {
    // Refresh the page or update the application state
    window.location.reload();
  };

  return (
    <>
      {/* Global Navbar */}
      <div className="bg-background border-b px-6 py-3">
        <div className="flex items-center justify-between w-full">
          {/* Lado izquierdo: Platform + Add Product + Enterprise */}
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-medium text-foreground">Platform</h1>
            
            {/* Botón Add Product */}
            <Button 
              onClick={() => setIsAddProductModalOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1.5"
              size="sm"
            >
              + Add Product
            </Button>
            
            <h1 className="text-lg font-medium text-foreground">Enterprise</h1>
          </div>

          {/* Lado derecho: Información adicional si es necesario */}
          <div className="flex items-center gap-4">
            {/* Aquí se puede agregar información adicional global */}
          </div>
        </div>
      </div>

      {/* Modal de Add Product */}
      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onProductAdded={handleProductAdded}
      />
    </>
  );
}
