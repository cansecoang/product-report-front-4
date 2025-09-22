"use client"

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
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
  description?: string;
}

interface Product {
  id: string;
  name: string;
  workPackageId: string;
  outputNumber: string;
  objective?: string;
}

interface ProductSelectorsProps {
  initialWorkPackages: WorkPackage[];
  onWorkPackageChange?: (workPackageId: string | null) => void;
  onOutputChange?: (outputNumber: string | null) => void;
  onProductChange?: (productId: string | null) => void;
  refreshTrigger?: number;
}

export function ProductSelectors({ 
  initialWorkPackages,
  onWorkPackageChange, 
  onOutputChange,
  onProductChange,
  refreshTrigger
}: ProductSelectorsProps) {
  const searchParams = useSearchParams();
  
  // Estados
  const [selectedWorkPackage, setSelectedWorkPackage] = useState<string | null>(null);
  const [selectedOutput, setSelectedOutput] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [outputs, setOutputs] = useState<Output[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingOutputs, setIsLoadingOutputs] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // 🎯 URL-FIRST: Leer parámetros de URL
  const urlWorkPackageId = searchParams.get('workPackageId');
  const urlOutputNumber = searchParams.get('outputNumber');
  const urlProductId = searchParams.get('productId');

  // Función para cargar outputs
  const fetchOutputs = useCallback(async () => {
    console.log('🔄 Fetching outputs...');
    setIsLoadingOutputs(true);
    try {
      const response = await fetch('/api/outputs');
      if (!response.ok) {
        throw new Error('Failed to fetch outputs');
      }
      const data = await response.json();
      console.log('✅ Outputs fetched:', data.outputs);
      console.log('📊 Total outputs loaded:', data.outputs?.length || 0);
      setOutputs(data.outputs || []);
    } catch (error) {
      console.error('❌ Error fetching outputs:', error);
      setOutputs([]);
    } finally {
      setIsLoadingOutputs(false);
    }
  }, []);

  // Función para cargar productos
  const fetchProducts = useCallback(async (workPackageId: string, outputNumber: string) => {
    console.log('🔄 Fetching products for:', { workPackageId, outputNumber });
    setIsLoadingProducts(true);
    try {
      const params = new URLSearchParams({
        workPackageId,
        outputNumber
      });
      const response = await fetch(`/api/products-server?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      console.log('✅ Products fetched:', data);
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      setProducts([]);
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  // 🎯 AUTO-POBLACIÓN: Buscar y auto-poblar WorkPackage y Output para un producto específico
  const autoPopulateFromProduct = useCallback(async (productId: string) => {
    console.log('🔍 Auto-poblando dropdowns para producto:', productId);
    try {
      const response = await fetch(`/api/product-full-details?productId=${productId}`);
      if (!response.ok) return;
      
      const data = await response.json();
      const product = data.product;
      
      if (product) {
        console.log('📝 Producto encontrado:', {
          workPackageId: product.workPackageId,
          outputNumber: product.outputNumber
        });
        
        // Auto-poblar WorkPackage si no está seleccionado
        if (product.workPackageId && product.workPackageId !== selectedWorkPackage) {
          console.log('🔄 Auto-seleccionando WorkPackage:', product.workPackageId);
          setSelectedWorkPackage(product.workPackageId);
          onWorkPackageChange?.(product.workPackageId);
        }
        
        // Auto-poblar Output si no está seleccionado
        if (product.outputNumber && product.outputNumber !== selectedOutput) {
          console.log('🔄 Auto-seleccionando Output:', product.outputNumber);
          setSelectedOutput(product.outputNumber);
          onOutputChange?.(product.outputNumber);
        }
      }
    } catch (error) {
      console.error('❌ Error auto-poblando dropdowns:', error);
    }
  }, [selectedWorkPackage, selectedOutput, onWorkPackageChange, onOutputChange]);

  // Cargar outputs al inicio
  useEffect(() => {
    console.log('🔄 ProductSelectors mounted, loading outputs...');
    fetchOutputs();
  }, [fetchOutputs]);

  // 🎯 URL-FIRST: Efecto 1 - Inicializar WorkPackage desde URL
  useEffect(() => {
    if (urlWorkPackageId && urlWorkPackageId !== selectedWorkPackage) {
      console.log('🌐 Inicializando WorkPackage desde URL:', urlWorkPackageId);
      setSelectedWorkPackage(urlWorkPackageId);
    }
  }, [urlWorkPackageId, selectedWorkPackage]);

  // 🎯 URL-FIRST: Efecto 2 - Inicializar Output desde URL (después de cargar outputs)
  useEffect(() => {
    if (urlOutputNumber && outputs.length > 0 && urlOutputNumber !== selectedOutput) {
      console.log('🌐 Inicializando Output desde URL:', urlOutputNumber);
      setSelectedOutput(urlOutputNumber);
      
      // Si también hay workPackage seleccionado, cargar productos
      if (selectedWorkPackage) {
        fetchProducts(selectedWorkPackage, urlOutputNumber);
      }
    }
  }, [urlOutputNumber, outputs, selectedOutput, selectedWorkPackage, fetchProducts]);

  // 🎯 URL-FIRST: Efecto 3 - Inicializar Product desde URL (después de cargar products) + AUTO-POBLACIÓN
  useEffect(() => {
    if (urlProductId && products.length > 0 && urlProductId !== selectedProduct) {
      console.log('🌐 Inicializando Product desde URL:', urlProductId);
      setSelectedProduct(urlProductId);
      
      // 🎯 AUTO-POBLACIÓN: Si no tenemos workPackage/output, buscarlos para este producto
      if (!selectedWorkPackage || !selectedOutput) {
        console.log('🔍 Auto-poblando dropdowns para producto desde URL');
        autoPopulateFromProduct(urlProductId);
      }
    }
  }, [urlProductId, products, selectedProduct, selectedWorkPackage, selectedOutput, autoPopulateFromProduct]);

  // Efecto para cargar productos cuando cambian workPackage y output
  useEffect(() => {
    if (selectedWorkPackage && selectedOutput) {
      fetchProducts(selectedWorkPackage, selectedOutput);
    }
  }, [selectedWorkPackage, selectedOutput, fetchProducts]);

  // Refrescar cuando cambie refreshTrigger
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      if (selectedWorkPackage && selectedOutput) {
        fetchProducts(selectedWorkPackage, selectedOutput);
      }
    }
  }, [refreshTrigger, selectedWorkPackage, selectedOutput, fetchProducts]);

  // Handlers
  const handleWorkPackageChange = (value: string) => {
    console.log('🔄 WorkPackage selected:', value);
    setSelectedWorkPackage(value);
    setSelectedOutput(null);
    setSelectedProduct(null);
    setProducts([]);
    
    // Notificar al padre
    onWorkPackageChange?.(value);
    onOutputChange?.(null);
    onProductChange?.(null);
  };

  const handleOutputChange = (value: string) => {
    console.log('🔄 Output selected:', value);
    setSelectedOutput(value);
    setSelectedProduct(null);
    setProducts([]);
    
    // Cargar productos filtrados
    if (selectedWorkPackage) {
      fetchProducts(selectedWorkPackage, value);
    }
    
    // Notificar al padre
    onOutputChange?.(value);
    onProductChange?.(null);
  };

  const handleProductChange = (value: string) => {
    console.log('🔄 Product selected:', value);
    setSelectedProduct(value);
    
    // Notificar al padre
    onProductChange?.(value);
  };

  return (
    <div className="flex flex-wrap gap-4 items-center">
      {/* 1. Work Package Selector */}
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Work Package</label>
        <Select
          value={selectedWorkPackage || ""}
          onValueChange={handleWorkPackageChange}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Work Package" />
          </SelectTrigger>
          <SelectContent>
            {initialWorkPackages
              .filter((wp, index, self) => self.findIndex(w => w.id === wp.id) === index) // Filtrar duplicados
              .filter(wp => wp.id && wp.name) // Filtrar elementos vacíos
              .map((wp) => (
                <SelectItem key={wp.id} value={wp.id}>
                  {wp.name}
                </SelectItem>
              ))
            }
          </SelectContent>
        </Select>
      </div>

      {/* 2. Output Selector */}
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Output</label>
        <Select
          value={selectedOutput || ""}
          onValueChange={handleOutputChange}
          disabled={isLoadingOutputs || outputs.length === 0}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue 
              placeholder={
                isLoadingOutputs 
                  ? "Loading..." 
                  : outputs.length === 0 
                    ? "No outputs" 
                    : "Select Output"
              } 
            />
          </SelectTrigger>
          <SelectContent>
            {outputs
              .filter((output, index, self) => self.findIndex(o => o.outputNumber === output.outputNumber) === index) // Filtrar duplicados
              .filter(output => output.outputNumber && output.name) // Filtrar elementos vacíos
              .map((output) => (
                <SelectItem key={output.outputNumber} value={output.outputNumber}>
                  {output.name}
                </SelectItem>
              ))
            }
          </SelectContent>
        </Select>
      </div>

      {/* 3. Product Selector */}
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">Product</label>
        <Select
          value={selectedProduct || ""}
          onValueChange={handleProductChange}
          disabled={!selectedWorkPackage || !selectedOutput || isLoadingProducts}
        >
          <SelectTrigger className="w-[250px]">
            <SelectValue 
              placeholder={
                !selectedWorkPackage || !selectedOutput
                  ? "Select WorkPackage & Output first"
                  : isLoadingProducts 
                    ? "Loading products..." 
                    : products.length === 0 
                      ? "No products found" 
                      : "Select Product"
              } 
            />
          </SelectTrigger>
          <SelectContent>
            {products
              .filter((product, index, self) => self.findIndex(p => p.id === product.id) === index) // Filtrar duplicados
              .filter(product => product.id && product.name) // Filtrar elementos vacíos
              .map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))
            }
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}