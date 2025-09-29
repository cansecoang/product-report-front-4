"use client"

import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useHeader } from "@/contexts/HeaderContext";
import { usePathname } from "next/navigation";
import AddProductModal from "@/components/add-product-modal-new";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProductMatrix } from "@/contexts/ProductMatrixContext";


interface WorkPackage {
  id: string;
  name: string;
  description?: string;
}

interface DynamicPageHeaderProps {
  workPackages?: WorkPackage[];
}

export function DynamicPageHeader({ workPackages = [] }: DynamicPageHeaderProps) {
  const { title, actions } = useHeader();
  const pathname = usePathname();
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  
  // Mostrar botón Add Product solo en subrutas de productos (NO en /product raíz)
  const showAddProduct = pathname.startsWith('/product') && pathname !== '/product';
  
  // Mostrar dropdowns solo en la ruta /product (no en subrutas)
  const showMatrixFilters = pathname === '/product';

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
          {/* Controles de matriz SOLO para la ruta /product */}
          {showMatrixFilters && <MatrixFiltersInline workPackages={workPackages} />}
          
          {/* Controles para otras rutas (NO /product) */}
          {!showMatrixFilters && (
            <>
              {/* Actions/controls específicos de cada página */}
              {actions && actions}
              
              {/* Botón Add Product en otras rutas de productos (no en /product) */}
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
            </>
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

// Componente para los filtros de la matriz inline en el header
function MatrixFiltersInline({ workPackages }: { workPackages: WorkPackage[] }) {
  const {
    selectedWorkPackage,
    selectedOutput,
    selectedCountry,
    outputs,
    countries,
    isLoadingOutputs,
    isLoadingCountries,
    handleWorkPackageChange,
    handleOutputChange,
    handleCountryChange,
  } = useProductMatrix();

  return (
    <div className="flex items-center gap-2">
      {/* Output Dropdown - Ahora primero */}
      <div className="flex items-center gap-1">
        <label className="text-xs font-medium text-gray-600 whitespace-nowrap">Output:</label>
        <Select
          value={selectedOutput || "all"}
          onValueChange={handleOutputChange}
          disabled={isLoadingOutputs}
        >
          <SelectTrigger className="w-[120px] h-9">
            <SelectValue 
              placeholder={
                isLoadingOutputs 
                  ? "Loading..." 
                  : "All Outputs"
              } 
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Outputs</SelectItem>
            {outputs.map((output) => (
              <SelectItem key={output.outputNumber} value={output.outputNumber}>
                {output.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* WorkPackage Dropdown - Ahora segundo */}
      <div className="flex items-center gap-1">
        <label className="text-xs font-medium text-gray-600 whitespace-nowrap">WP:</label>
        <Select
          value={selectedWorkPackage || "all"}
          onValueChange={handleWorkPackageChange}
        >
          <SelectTrigger className="w-[120px] h-9">
            <SelectValue placeholder="All WPs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All WPs</SelectItem>
            {workPackages.map((wp) => (
              <SelectItem key={wp.id} value={wp.id}>
                {wp.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Country Dropdown (Optional) */}
      <div className="flex items-center gap-1">
        <label className="text-xs font-medium text-gray-600 whitespace-nowrap">Country:</label>
        <Select
          value={selectedCountry || "all"}
          onValueChange={handleCountryChange}
          disabled={isLoadingCountries || countries.length === 0}
        >
          <SelectTrigger className="w-[120px] h-9">
            <SelectValue placeholder="All Countries" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            {countries.map((country) => (
              <SelectItem key={country.id} value={country.id.toString()}>
                {country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
