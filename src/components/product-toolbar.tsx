"use client"

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ProductSelectors } from "@/components/product-selectors";
import { ProductDetailModal } from "@/components/product-detail-modal";
import AddProductModal from "@/components/add-product-modal";
import AddTaskModal from "@/components/add-task-modal";
import { Button } from "@/components/ui/button";

// Interfaces para relaciones
interface ResponsibleAssignment {
  user_id: number;
  role_label: string;
  is_primary: boolean;
  position: number;
}

interface OrganizationAssignment {
  organization_id: number;
  relation_type: string;
  position: number;
}

interface DistributorOther {
  display_name: string;
  contact: string;
}

// Tipo para el producto en edición
interface EditingProduct {
  product_id: number;
  product_name: string;
  product_objective: string;
  deliverable: string;
  delivery_date: string;
  methodology_description: string;
  gender_specific_actions: string;
  next_steps: string;
  workpackage_id: string;
  workinggroup_id?: string; // Agregar working group
  product_owner_id: string;
  country_id: string;
  output_number: string;
  // Relaciones
  responsibles?: ResponsibleAssignment[];
  organizations?: OrganizationAssignment[];
  indicators?: number[];
  distributorOrgs?: number[];
  distributorUsers?: number[];
  distributorOthers?: DistributorOther[];
}

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
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const [selectedProduct, setSelectedProduct] = useState<ProductInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingProductData, setEditingProductData] = useState<EditingProduct | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Para forzar refresh de dropdowns

  // Inicializar con productId de la URL si existe
  useEffect(() => {
    const urlProductId = searchParams.get('productId');
    if (urlProductId) {
      console.log('🔗 ProductToolbar: ProductId encontrado en URL:', urlProductId);
      localStorage.setItem('selectedProductId', urlProductId);
      fetchProductInfo(urlProductId);
    } else {
      // Limpiar localStorage si no hay productId en URL
      localStorage.removeItem('selectedProductId');
      setSelectedProduct(null);
    }
  }, [searchParams]);

  const handleWorkPackageChange = (workPackageId: string | null) => {
    console.log('Work Package selected:', workPackageId);
    
    const params = new URLSearchParams(searchParams);
    
    if (workPackageId) {
      // 🎯 URL-FIRST: Actualizar workPackageId en URL
      params.set('workPackageId', workPackageId);
      // Reset output y product cuando cambia work package
      params.delete('outputNumber');
      params.delete('productId');
    } else {
      // Remover todos los parámetros relacionados
      params.delete('workPackageId');
      params.delete('outputNumber');
      params.delete('productId');
    }
    
    // Actualizar URL
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.push(newUrl);
    
    // Reset product selection when work package changes
    setSelectedProduct(null);
  };

  const handleOutputChange = (outputNumber: string | null) => {
    console.log('Output selected:', outputNumber);
    
    const params = new URLSearchParams(searchParams);
    
    if (outputNumber) {
      // 🎯 URL-FIRST: Actualizar outputNumber en URL
      params.set('outputNumber', outputNumber);
      // Reset product cuando cambia output
      params.delete('productId');
    } else {
      // Remover output y product
      params.delete('outputNumber');
      params.delete('productId');
    }
    
    // Actualizar URL
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.push(newUrl);
    
    // Reset product selection when output changes
    setSelectedProduct(null);
  };

  const handleProductChange = (productId: string | null) => {
    console.log('🔄 Product selected, updating URL:', productId);
    
    if (productId) {
      // 🎯 URL-FIRST: Actualizar la URL (esto es la fuente de verdad)
      const params = new URLSearchParams(searchParams);
      params.set('productId', productId);
      router.push(`${pathname}?${params.toString()}`);
      
      // También mantener localStorage para compatibilidad
      localStorage.setItem('selectedProductId', productId);
      
      // Dispatch custom event para componentes legacy
      window.dispatchEvent(new CustomEvent('productChanged', { 
        detail: { productId } 
      }));
      
      fetchProductInfo(productId);
    } else {
      // Remover productId de la URL
      const params = new URLSearchParams(searchParams);
      params.delete('productId');
      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.push(newUrl);
      
      localStorage.removeItem('selectedProductId');
      window.dispatchEvent(new CustomEvent('productChanged', { 
        detail: { productId: null } 
      }));
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
    // Refrescar la lista de productos
    setRefreshTrigger(prev => prev + 1);
  };

  const handleProductUpdated = () => {
    // Manejar actualización de producto
    console.log('Product updated, refreshing...');
    // Refrescar los datos del producto seleccionado si existe
    if (selectedProduct?.id) {
      fetchProductInfo(selectedProduct.id);
    }
    // Refrescar la lista de productos
    setRefreshTrigger(prev => prev + 1);
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

  const handleEditProduct = async () => {
    if (!selectedProduct) return;
    
    try {
      console.log('Getting full product data for editing...');
      
      // Usar el mismo endpoint que el modal de detalle para obtener TODOS los datos
      const response = await fetch(`/api/product-full-details?productId=${selectedProduct.id}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Full product data received:', data);
        
        const productData = data.product;
        
        // Convertir al formato EditingProduct usando TODOS los datos disponibles
        const editingData: EditingProduct = {
          product_id: parseInt(productData.id),
          product_name: productData.name || '',
          product_objective: productData.objective || '',
          deliverable: productData.deliverable || '',
          delivery_date: productData.deliveryDate || '',
          methodology_description: productData.methodologyDescription || '',
          gender_specific_actions: productData.genderSpecificActions || '',
          next_steps: productData.nextSteps || '',
          workpackage_id: productData.workPackageId?.toString() || '',
          workinggroup_id: productData.workingGroupId?.toString() || '', // Mapear working group
          product_owner_id: productData.primaryOrganizationId?.toString() || '', // Mapear organización primaria
          country_id: productData.countryId?.toString() || '', // Mapear país
          output_number: productData.outputNumber || '',
          responsibles: data.responsibles || [],
          organizations: data.organizations || [],
          indicators: data.indicators?.map((ind: { indicator_id: number }) => ind.indicator_id) || [],
          distributorOrgs: data.distributors?.organizations?.map((org: { organization_id: number }) => org.organization_id) || [],
          distributorUsers: data.distributors?.users?.map((user: { user_id: number }) => user.user_id) || [],
          distributorOthers: data.distributors?.others || []
        };

        console.log('Converted editing data:', editingData);
        
        setEditingProductData(editingData);
        setIsModalOpen(false); // Cerrar modal de detalle
        setIsEditProductModalOpen(true); // Abrir modal de edición
      } else {
        console.error('Error fetching product data for editing');
      }
    } catch (error) {
      console.error('Error preparing product data for editing:', error);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No Date';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleDeleteProduct = () => {
    if (!selectedProduct) return;
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteProduct = async () => {
    if (!selectedProduct) return;
    
    setIsDeleting(true);
    try {
      console.log(`🗑️ Eliminando producto ${selectedProduct.id}...`);
      
      const response = await fetch(`/api/delete-product?productId=${selectedProduct.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Producto eliminado:', data);
        
        // Limpiar selección actual
        setSelectedProduct(null);
        localStorage.removeItem('selectedProductId');
        
        // Cerrar modal de confirmación
        setIsDeleteConfirmOpen(false);
        
        // Refrescar la lista de productos incrementando el trigger
        setRefreshTrigger(prev => prev + 1);
        
        alert(`Producto "${data.details?.productName}" eliminado correctamente`);
        
      } else {
        const errorData = await response.json();
        console.error('Error eliminando producto:', errorData);
        alert(`Error eliminando producto: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error eliminando producto:', error);
      alert('Error eliminando producto');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Product-specific toolbar below the main header */}
      <div data-component="ProductToolbar" className="bg-background/95 backdrop-blur-sm border-b shadow-sm">
        {/* Main toolbar row */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between w-full">
            {/* Lado izquierdo: Dropdowns solamente */}
            <div className="flex items-center gap-4">
              <ProductSelectors 
                initialWorkPackages={initialWorkPackages}
                onWorkPackageChange={handleWorkPackageChange}
                onOutputChange={handleOutputChange}
                onProductChange={handleProductChange}
                refreshTrigger={refreshTrigger}
              />
            </div>

            {/* Lado derecho: Action Buttons solamente */}
            <div className="flex items-center gap-2">
              {/* Botón Add Product */}
              <Button 
                onClick={() => setIsAddProductModalOpen(true)}
                variant="outline"
                className="border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 text-sm px-3 py-1.5"
                size="sm"
              >
                + Add Product
              </Button>

              {/* Botón Add Task */}
              <Button 
                onClick={handleAddTaskClick}
                variant="outline"
                className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 text-sm px-3 py-1.5"
                size="sm"
              >
                + Add Task
              </Button>
            </div>
          </div>
        </div>

        {/* Product Details Bar - Solo se muestra cuando hay un producto seleccionado */}
        {selectedProduct && (
          <div className="border-t bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/30 dark:to-green-950/30 px-4 py-3 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between w-full">
              {/* Lado izquierdo: Información del producto */}
              <div className="flex items-center gap-6">
                {/* Delivery Date */}
                <div className="flex items-center gap-2">
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
                    className="text-blue-600"
                  >
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                    <line x1="16" x2="16" y1="2" y2="6"/>
                    <line x1="8" x2="8" y1="2" y2="6"/>
                    <line x1="3" x2="21" y1="10" y2="10"/>
                  </svg>
                  <div className="text-sm">
                    <span className="text-xs text-muted-foreground block">Delivery Date</span>
                    <span className="font-medium text-foreground">{formatDate(selectedProduct.deliveryDate)}</span>
                  </div>
                </div>
                
                {/* Country Name */}
                <div className="flex items-center gap-2">
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
                    className="text-green-600"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <div className="text-sm">
                    <span className="text-xs text-muted-foreground block">Country</span>
                    <span className="font-medium text-foreground">{selectedProduct.country || 'No Country'}</span>
                  </div>
                </div>

                {/* Product Owner */}
                <div className="flex items-center gap-2">
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
                    className="text-purple-600"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="m22 11-3-3m0 0-3 3m3-3v8"/>
                  </svg>
                  <div className="text-sm">
                    <span className="text-xs text-muted-foreground block">Product Owner</span>
                    <span className="font-medium text-foreground">{selectedProduct.primaryOrganization || 'No Owner'}</span>
                  </div>
                </div>
              </div>

              {/* Lado derecho: View Details Button */}
              <Button 
                onClick={() => setIsModalOpen(true)}
                variant="outline"
                className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 text-sm px-4 py-2"
                size="sm"
              >
                View Details
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedProduct && (
        <ProductDetailModal 
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
        />
      )}

      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onProductAdded={handleProductAdded}
      />

      {/* Modal de edición */}
      <AddProductModal
        isOpen={isEditProductModalOpen}
        onClose={() => setIsEditProductModalOpen(false)}
        onProductAdded={handleProductAdded}
        onProductUpdated={handleProductUpdated}
        editingProduct={editingProductData || undefined}
        mode="edit"
      />

      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={closeAddTaskModal}
        productId={selectedProduct?.id?.toString() || null}
        onTaskAdded={handleTaskAdded}
      />

      {/* Modal de confirmación de eliminación */}
      {isDeleteConfirmOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsDeleteConfirmOpen(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-background rounded-lg border shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-red-700 mb-4">
              ⚠️ Confirmar Eliminación
            </h3>
            
            <div className="mb-6">
              <p className="text-foreground mb-2">
                ¿Estás seguro de que quieres eliminar el producto:
              </p>
              <p className="font-semibold bg-muted p-2 rounded">
                &ldquo;{selectedProduct.name}&rdquo;
              </p>
              <div className="mt-3 text-sm text-red-600">
                <p>⚠️ Esta acción eliminará:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>El producto y toda su información</li>
                  <li>Todas las tareas relacionadas</li>
                  <li>Todas las relaciones (responsables, organizaciones, indicadores, distribuidores)</li>
                </ul>
                <p className="mt-2 font-semibold">Esta acción NO se puede deshacer.</p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsDeleteConfirmOpen(false)}
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button
                variant="outline"
                onClick={confirmDeleteProduct}
                className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
                disabled={isDeleting}
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar Definitivamente'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
