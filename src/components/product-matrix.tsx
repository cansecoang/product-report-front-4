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
import { ProductDetailModal } from "@/components/product-detail-modal";

interface WorkPackage {
  id: string;
  name: string;
  description?: string;
}

interface Output {
  outputNumber: string;
  name: string;
}

interface Country {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  workPackageId: number;
  outputNumber: number;
}

interface Indicator {
  id: number;
  code: string;
  name: string;
  outputNumber: number;
}

interface MatrixCell {
  indicator: Indicator;
  country: Country;
  products: Product[];
}

interface MatrixData {
  indicators: Indicator[];
  countries: Country[];
  matrix: (Country | MatrixCell)[][];
  totalProducts: number;
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

interface ProductMatrixProps {
  workPackages: WorkPackage[];
}

export function ProductMatrix({ workPackages }: ProductMatrixProps) {
  const searchParams = useSearchParams();
  
  // Estados
  const [selectedWorkPackage, setSelectedWorkPackage] = useState<string | null>(null);
  const [selectedOutput, setSelectedOutput] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  
  const [outputs, setOutputs] = useState<Output[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [matrixData, setMatrixData] = useState<MatrixData | null>(null);
  
  const [isLoadingOutputs, setIsLoadingOutputs] = useState(false);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [isLoadingMatrix, setIsLoadingMatrix] = useState(false);

  // Estados para el modal de detalles del producto
  const [selectedProductForModal, setSelectedProductForModal] = useState<ProductInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cargar outputs
  const fetchOutputs = useCallback(async () => {
    setIsLoadingOutputs(true);
    try {
      const response = await fetch('/api/outputs');
      if (!response.ok) throw new Error('Failed to fetch outputs');
      const data = await response.json();
      setOutputs(data.outputs || []);
    } catch (error) {
      console.error('Error fetching outputs:', error);
      setOutputs([]);
    } finally {
      setIsLoadingOutputs(false);
    }
  }, []);

  // Cargar países
  const fetchCountries = useCallback(async () => {
    setIsLoadingCountries(true);
    try {
      const response = await fetch('/api/countries');
      if (!response.ok) throw new Error('Failed to fetch countries');
      const data = await response.json();
      setCountries(data.countries || []);
    } catch (error) {
      console.error('Error fetching countries:', error);
      setCountries([]);
    } finally {
      setIsLoadingCountries(false);
    }
  }, []);

  // Cargar matriz de productos
  const fetchMatrix = useCallback(async (workPackageId: string, outputNumber: string, countryId?: string) => {
    setIsLoadingMatrix(true);
    try {
      const params = new URLSearchParams({
        workPackageId,
        outputNumber
      });
      if (countryId) params.set('countryId', countryId);
      
      const response = await fetch(`/api/products-matrix?${params}`);
      if (!response.ok) throw new Error('Failed to fetch matrix');
      const data = await response.json();
      setMatrixData(data);
    } catch (error) {
      console.error('Error fetching matrix:', error);
      setMatrixData(null);
    } finally {
      setIsLoadingMatrix(false);
    }
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    fetchOutputs();
    fetchCountries();
  }, [fetchOutputs, fetchCountries]);

  // Handlers
  const handleWorkPackageChange = (value: string) => {
    setSelectedWorkPackage(value);
    setMatrixData(null);
    if (selectedOutput) {
      fetchMatrix(value, selectedOutput, selectedCountry || undefined);
    }
  };

  const handleOutputChange = (value: string) => {
    setSelectedOutput(value);
    setMatrixData(null);
    if (selectedWorkPackage) {
      fetchMatrix(selectedWorkPackage, value, selectedCountry || undefined);
    }
  };

  const handleCountryChange = (value: string) => {
    setSelectedCountry(value === 'all' ? null : value);
    if (selectedWorkPackage && selectedOutput) {
      fetchMatrix(selectedWorkPackage, selectedOutput, value === 'all' ? undefined : value);
    }
  };

  // Handler para abrir modal de detalles del producto
  const handleProductClick = async (productId: number) => {
    try {
      const response = await fetch(`/api/product-full-details?productId=${productId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedProductForModal(data.product);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Products Matrix</h1>
       
      </div>

      {/* Dropdowns */}
      <div className="flex flex-wrap gap-4 p-4 bg-white rounded-lg border">
        {/* WorkPackage Dropdown */}
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
              {workPackages.map((wp) => (
                <SelectItem key={wp.id} value={wp.id}>
                  {wp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Output Dropdown */}
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
              {outputs.map((output) => (
                <SelectItem key={output.outputNumber} value={output.outputNumber}>
                  {output.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Country Dropdown (Optional) */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Country (Optional)</label>
          <Select
            value={selectedCountry || "all"}
            onValueChange={handleCountryChange}
            disabled={isLoadingCountries || countries.length === 0}
          >
            <SelectTrigger className="w-[200px]">
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

      {/* Matrix Table */}
      {isLoadingMatrix && (
        <div className="flex justify-center items-center py-8">
          <div className="text-lg text-gray-600">Loading matrix...</div>
        </div>
      )}

      {matrixData && !isLoadingMatrix && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">
                    Country
                  </th>
                  {matrixData.indicators.map((indicator) => (
                    <th key={indicator.id} className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b min-w-[200px]">
                      <div>
                        <div className="font-semibold">{indicator.code}</div>
                        <div className="text-xs text-gray-600 font-normal">
                          {indicator.name}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrixData.matrix.map((row, rowIndex) => {
                  const country = row[0] as Country;
                  const cells = row.slice(1) as MatrixCell[];
                  
                  return (
                    <tr key={`country-${country.id}-${rowIndex}`} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900 border-b bg-gray-25">
                        {country.name}
                      </td>
                      {cells.map((cell, cellIndex) => (
                        <td key={`cell-${country.id}-${cell.indicator.id}-${cellIndex}`} className="px-4 py-3 border-b align-top">
                          {cell.products.length > 0 ? (
                            <div className="space-y-2">
                              {cell.products.map((product) => (
                                <div 
                                  key={`product-${product.id}-${country.id}-${cell.indicator.id}`} 
                                  className="p-2 bg-blue-50 rounded text-sm cursor-pointer hover:bg-blue-100 hover:shadow-sm transition-all duration-200"
                                  onClick={() => handleProductClick(product.id)}
                                >
                                  <div className="font-medium text-blue-900">
                                    {product.name}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-gray-400 text-sm italic">
                              No products
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Summary */}
          <div className="px-4 py-3 bg-gray-50 border-t">
            <div className="text-sm text-gray-600">
              Total products: {matrixData.totalProducts}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedWorkPackage || !selectedOutput ? (
        <div className="text-center py-8 text-gray-500">
          <p>Please select Work Package and Output to view the matrix</p>
        </div>
      ) : !matrixData && !isLoadingMatrix ? (
        <div className="text-center py-8 text-gray-500">
          <p>No data available for the selected criteria</p>
        </div>
      ) : null}

      {/* Product Detail Modal */}
      {selectedProductForModal && (
        <ProductDetailModal 
          product={selectedProductForModal}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProductForModal(null);
          }}
          onEdit={() => {
            // No implementamos edición desde la matriz por ahora
            console.log('Edit from matrix not implemented');
          }}
          onDelete={() => {
            // No implementamos eliminación desde la matriz por ahora
            console.log('Delete from matrix not implemented');
          }}
        />
      )}
    </div>
  );
}