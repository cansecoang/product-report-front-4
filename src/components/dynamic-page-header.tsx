"use client"

import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useHeader } from "@/contexts/HeaderContext";
import { usePathname } from "next/navigation";
import AddProductModal from "@/components/add-product-modal-new";

export function DynamicPageHeader() {
  const { title, icon: Icon, actions } = useHeader();
  const pathname = usePathname();
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  
  // Mostrar botón Add Product solo en rutas de productos
  const showAddProduct = pathname.startsWith('/product');

  const handleProductAdded = () => {
    // Aquí puedes agregar lógica para refrescar la lista de productos
    // Por ahora solo cerramos el modal
    setIsAddProductModalOpen(false);
    // Recargar la página para mostrar el nuevo producto
    window.location.reload();
  };

  return (
    <div className="bg-background border-b px-4 py-3 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-medium text-foreground">{title}</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Actions/controls específicos de cada página */}
          {actions && actions}
          
          {/* Botón Add Product en rutas de productos */}
          {showAddProduct && (
            <Button 
              variant="default" 
              size="sm" 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => setIsAddProductModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          )}
        </div>
      </div>

      {/* Modal para agregar producto */}
      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onProductAdded={handleProductAdded}
      />
    </div>
  );
}
