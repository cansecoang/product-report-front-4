"use client"

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { 
  Package,
  Target,
  Layers
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Interfaces
interface WorkPackage {
  id: string;
  name: string;
  description?: string;
}

interface Output {
  outputNumber: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  workPackageId: string;
}

interface ProductFiltersProps {
  initialWorkPackages: WorkPackage[];
}

export function ProductFilters({ initialWorkPackages }: ProductFiltersProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  // Estados para los filtros
  const [selectedWorkPackage, setSelectedWorkPackage] = useState<string | null>(null);
  const [selectedOutput, setSelectedOutput] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  
  // Estados para las opciones
  const [workPackages] = useState<WorkPackage[]>(initialWorkPackages);
  const [outputs, setOutputs] = useState<Output[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingOutputs, setLoadingOutputs] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Leer parámetros de la URL
  useEffect(() => {
    const urlWorkPackage = searchParams.get('workPackageId');
    const urlOutput = searchParams.get('outputNumber');
    const urlProduct = searchParams.get('productId');
    
    setSelectedWorkPackage(urlWorkPackage);
    setSelectedOutput(urlOutput);
    setSelectedProduct(urlProduct);
  }, [searchParams]);

  // Función para actualizar URL
  const updateURL = useCallback((workPackageId: string | null, outputNumber: string | null, productId: string | null) => {
    const params = new URLSearchParams();
    
    if (workPackageId) params.set('workPackageId', workPackageId);
    if (outputNumber) params.set('outputNumber', outputNumber);
    if (productId) params.set('productId', productId);
    
    const newURL = `${pathname}${params.toString() ? '?' + params.toString() : ''}`;
    router.push(newURL);
  }, [router, pathname]);

  // Cargar outputs cuando cambia work package
  useEffect(() => {
    if (selectedWorkPackage) {
      setLoadingOutputs(true);
      fetch(`/api/outputs?workPackageId=${selectedWorkPackage}`)
        .then(response => response.json())
        .then(data => {
          setOutputs(data.outputs || []);
          setLoadingOutputs(false);
        })
        .catch(error => {
          console.error('❌ Error fetching outputs:', error);
          setLoadingOutputs(false);
        });
    } else {
      setOutputs([]);
    }
  }, [selectedWorkPackage]);

  // Cargar todos los productos inicialmente
  useEffect(() => {
    console.log('🔄 Loading initial products...');
    setLoadingProducts(true);
    fetch('/api/products-server')
      .then(response => response.json())
      .then(data => {
        console.log('✅ Initial products loaded:', data?.length || 0, data);
        setProducts(data || []);
        setLoadingProducts(false);
      })
      .catch(error => {
        console.error('❌ Error fetching initial products:', error);
        setLoadingProducts(false);
      });
  }, []);

  // Cargar productos cuando cambia work package u output
  useEffect(() => {
    if (selectedWorkPackage || selectedOutput) {
      setLoadingProducts(true);
      const params = new URLSearchParams();
      if (selectedWorkPackage && selectedWorkPackage !== 'all') params.append('workPackageId', selectedWorkPackage);
      if (selectedOutput && selectedOutput !== 'all') params.append('outputNumber', selectedOutput);
      
      fetch(`/api/products-server?${params.toString()}`)
        .then(response => response.json())
        .then(data => {
          setProducts(data || []);
          setLoadingProducts(false);
        })
        .catch(error => {
          console.error('❌ Error fetching products:', error);
          setLoadingProducts(false);
        });
    }
  }, [selectedWorkPackage, selectedOutput]);

  // Handlers para cambios de filtros
  const handleWorkPackageChange = useCallback((workPackageId: string | null) => {
    setSelectedWorkPackage(workPackageId);
    setSelectedOutput(null); // Reset output when work package changes
    setSelectedProduct(null); // Reset product when work package changes
    updateURL(workPackageId, null, null);
  }, [updateURL]);

  const handleOutputChange = useCallback((outputNumber: string | null) => {
    setSelectedOutput(outputNumber);
    setSelectedProduct(null); // Reset product when output changes
    updateURL(selectedWorkPackage, outputNumber, null);
  }, [selectedWorkPackage, updateURL]);

  const handleProductChange = useCallback((productId: string | null) => {
    setSelectedProduct(productId);
    updateURL(selectedWorkPackage, selectedOutput, productId);
  }, [selectedWorkPackage, selectedOutput, updateURL]);

  return (
    <>
      {/* Filtro de Work Package */}
      <div className="flex items-center gap-2">
        <Package className="h-4 w-4 text-gray-500" />
        <Select value={selectedWorkPackage || 'all'} onValueChange={handleWorkPackageChange}>
          <SelectTrigger className="w-48 border-2 border-blue-200 focus:border-blue-500">
            <SelectValue placeholder="Seleccionar Work Package" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los Work Packages</SelectItem>
            {workPackages.map((wp) => (
              <SelectItem key={wp.id} value={wp.id}>
                {wp.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filtro de Output */}
      <div className="flex items-center gap-2 opacity-75">
        <Target className="h-4 w-4 text-gray-400" />
        <Select 
          value={selectedOutput || 'all'} 
          onValueChange={handleOutputChange}
          disabled={!selectedWorkPackage || loadingOutputs}
        >
          <SelectTrigger className="w-48 border border-gray-300">
            <SelectValue placeholder={loadingOutputs ? "Cargando..." : "Filtrar por Output (opcional)"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los Outputs</SelectItem>
            {outputs.map((output) => (
              <SelectItem key={output.outputNumber} value={output.outputNumber}>
                {output.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filtro de Producto */}
      <div className="flex items-center gap-2 opacity-75">
        <Layers className="h-4 w-4 text-gray-400" />
        <Select 
          value={selectedProduct || 'all'} 
          onValueChange={handleProductChange}
          disabled={loadingProducts}
        >
          <SelectTrigger className="w-48 border border-gray-300">
            <SelectValue placeholder={loadingProducts ? "Cargando..." : "Seleccionar Producto (opcional)"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los Productos</SelectItem>
            {products.map((product) => {
              console.log('📋 Rendering product:', product.name);
              return (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}