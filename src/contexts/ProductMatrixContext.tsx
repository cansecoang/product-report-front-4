"use client"

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';

// Formato de DB (snake_case)
interface OutputDB {
  output_id: number;
  output_number: string;
  output_name: string;
}

// Formato para frontend (camelCase)
interface Output {
  outputNumber: string;
  name: string;
}

interface Country {
  id: number;
  name: string;
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

interface Product {
  id: number;
  name: string;
  workPackageId: number;
  outputNumber: number;
  deliveryDate?: string;
  productOwnerName?: string;
}

interface MatrixData {
  indicators: Indicator[];
  countries: Country[];
  matrix: (Country | MatrixCell)[][];
  totalProducts: number;
}

interface ProductMatrixContextType {
  // Estados de selección
  selectedWorkPackage: string | null;
  selectedOutput: string | null;
  selectedCountry: string | null;
  
  // Datos
  outputs: Output[];
  countries: Country[];
  matrixData: MatrixData | null;
  
  // Estados de loading
  isLoadingOutputs: boolean;
  isLoadingCountries: boolean;
  isLoadingMatrix: boolean;
  
  // Handlers
  handleWorkPackageChange: (value: string) => void;
  handleOutputChange: (value: string) => void;
  handleCountryChange: (value: string) => void;
  
  // Funciones de fetch
  fetchOutputs: () => Promise<void>;
  fetchCountries: () => Promise<void>;
  fetchMatrix: (workPackageId: string, outputNumber: string, countryId?: string) => Promise<void>;
}

const ProductMatrixContext = createContext<ProductMatrixContextType | undefined>(undefined);

export function ProductMatrixProvider({ children }: { children: ReactNode }) {
  // Estados - inicializar con "all" por defecto
  const [selectedWorkPackage, setSelectedWorkPackage] = useState<string | null>("all");
  const [selectedOutput, setSelectedOutput] = useState<string | null>("all");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const [outputs, setOutputs] = useState<Output[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [matrixData, setMatrixData] = useState<MatrixData | null>(null);
  
  const [isLoadingOutputs, setIsLoadingOutputs] = useState(false);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [isLoadingMatrix, setIsLoadingMatrix] = useState(false);

  // Cargar outputs
  const fetchOutputs = useCallback(async () => {
    setIsLoadingOutputs(true);
    try {
      const response = await fetch('/api/outputs');
      if (!response.ok) throw new Error('Failed to fetch outputs');
      const data = await response.json();
      
      // Transformar de formato DB a formato camelCase
      const transformedOutputs = (data.outputs || []).map((output: OutputDB) => ({
        outputNumber: output.output_number,
        name: output.output_name
      }));
      
      setOutputs(transformedOutputs);
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

  // Cargar matriz inicial con todos los productos (solo una vez)
  useEffect(() => {
    if (outputs.length > 0 && countries.length > 0 && !isInitialized) {
      // Cargar todos los productos por defecto
      console.log('🚀 Initial matrix load with all products');
      fetchMatrix('all', 'all');
      setIsInitialized(true);
    }
  }, [outputs.length, countries.length, isInitialized, fetchMatrix]);

  // Handlers
  const handleWorkPackageChange = useCallback((value: string) => {
    setSelectedWorkPackage(value);
    setMatrixData(null);
    
    // Usar los valores para fetchMatrix
    const wpValue = value;
    const outputValue = selectedOutput || 'all';
    
    console.log('🔄 WP Change - Fetching matrix with:', { wpValue, outputValue, country: selectedCountry });
    fetchMatrix(wpValue, outputValue, selectedCountry || undefined);
  }, [selectedOutput, selectedCountry, fetchMatrix]);

  const handleOutputChange = useCallback((value: string) => {
    setSelectedOutput(value);
    setMatrixData(null);
    
    // Usar los valores para fetchMatrix
    const wpValue = selectedWorkPackage || 'all';
    const outputValue = value;
    
    console.log('🔄 Output Change - Fetching matrix with:', { wpValue, outputValue, country: selectedCountry });
    fetchMatrix(wpValue, outputValue, selectedCountry || undefined);
  }, [selectedWorkPackage, selectedCountry, fetchMatrix]);

  const handleCountryChange = useCallback((value: string) => {
    setSelectedCountry(value === 'all' ? null : value);
    
    const wpValue = selectedWorkPackage || 'all';
    const outputValue = selectedOutput || 'all';
    const countryValue = value === 'all' ? undefined : value;
    
    console.log('🔄 Country Change - Fetching matrix with:', { wpValue, outputValue, country: countryValue });
    fetchMatrix(wpValue, outputValue, countryValue);
  }, [selectedWorkPackage, selectedOutput, fetchMatrix]);

  const value = {
    selectedWorkPackage,
    selectedOutput,
    selectedCountry,
    outputs,
    countries,
    matrixData,
    isLoadingOutputs,
    isLoadingCountries,
    isLoadingMatrix,
    handleWorkPackageChange,
    handleOutputChange,
    handleCountryChange,
    fetchOutputs,
    fetchCountries,
    fetchMatrix,
  };

  return (
    <ProductMatrixContext.Provider value={value}>
      {children}
    </ProductMatrixContext.Provider>
  );
}

export function useProductMatrix() {
  const context = useContext(ProductMatrixContext);
  if (context === undefined) {
    throw new Error('useProductMatrix must be used within a ProductMatrixProvider');
  }
  return context;
}