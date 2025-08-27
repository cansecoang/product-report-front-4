"use client"

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Output {
  value: string;
  label: string;
}

interface Indicator {
  indicator_id: number;
  indicator_code: string;
  indicator_name: string;
  indicator_description: string;
  output_number: string;
}

interface IndicatorsHeaderProps {
  onOutputChange?: (outputId: string | null) => void;
  onIndicatorChange?: (indicatorId: string | null) => void;
  selectedOutput?: string | null;
  selectedIndicator?: string | null;
}

export function IndicatorsHeader({ 
  onOutputChange, 
  onIndicatorChange, 
  selectedOutput: parentSelectedOutput, 
  selectedIndicator: parentSelectedIndicator 
}: IndicatorsHeaderProps) {
  const [outputs, setOutputs] = useState<Output[]>([]);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [selectedOutput, setSelectedOutput] = useState<string | null>(parentSelectedOutput || null);
  const [selectedIndicator, setSelectedIndicator] = useState<string | null>(parentSelectedIndicator || null);
  const [isLoadingOutputs, setIsLoadingOutputs] = useState(false);
  const [isLoadingIndicators, setIsLoadingIndicators] = useState(false);

  // Sincronizar con props del padre
  useEffect(() => {
    setSelectedOutput(parentSelectedOutput || null);
  }, [parentSelectedOutput]);

  useEffect(() => {
    setSelectedIndicator(parentSelectedIndicator || null);
  }, [parentSelectedIndicator]);

  // Cargar outputs al montar el componente
  useEffect(() => {
    fetchOutputs();
  }, []);

  // Cargar indicadores si hay un output seleccionado al inicio
  useEffect(() => {
    if (selectedOutput && selectedOutput !== "all") {
      fetchIndicators(selectedOutput);
    } else if (selectedOutput === "all") {
      fetchAllIndicators();
    }
  }, [selectedOutput]);

  const fetchOutputs = async () => {
    setIsLoadingOutputs(true);
    try {
      const response = await fetch('/api/outputs');
      const data = await response.json();
      setOutputs(data.outputs || []);
    } catch (error) {
      console.error('Error fetching outputs:', error);
    } finally {
      setIsLoadingOutputs(false);
    }
  };

  const fetchIndicators = async (outputId: string) => {
    setIsLoadingIndicators(true);
    try {
      const response = await fetch(`/api/indicators?output=${outputId}`);
      const data = await response.json();
      setIndicators(data.indicators || []);
    } catch (error) {
      console.error('Error fetching indicators:', error);
    } finally {
      setIsLoadingIndicators(false);
    }
  };

  const handleOutputChange = (value: string) => {
    console.log('🔄 Header: handleOutputChange called with:', value);
    setSelectedOutput(value);
    setSelectedIndicator(null); // Reset indicator selection
    setIndicators([]); // Clear indicators
    
    // Llamar el callback para actualizar la URL
    console.log('📞 Header: Calling onOutputChange with:', value);
    onOutputChange?.(value);
    
    // Cargar indicadores para mostrar en el dropdown
    if (value && value !== "all") {
      fetchIndicators(value);
    } else {
      // If "all" is selected, fetch all indicators
      fetchAllIndicators();
    }
  };

  const fetchAllIndicators = async () => {
    setIsLoadingIndicators(true);
    try {
      const response = await fetch('/api/indicators');
      const data = await response.json();
      setIndicators(data.indicators || []);
    } catch (error) {
      console.error('Error fetching all indicators:', error);
    } finally {
      setIsLoadingIndicators(false);
    }
  };

  const handleIndicatorChange = (value: string) => {
    console.log('🔄 Header: handleIndicatorChange called with:', value);
    setSelectedIndicator(value);
    
    // Llamar el callback para actualizar la URL
    console.log('📞 Header: Calling onIndicatorChange with:', value);
    onIndicatorChange?.(value);
  };

  // Obtener información del indicador seleccionado
  const selectedIndicatorInfo = indicators.find(
    ind => ind.indicator_code === selectedIndicator
  );

  return (
    <div className="bg-background border-b px-6 py-3">
      

      {/* SEGUNDO NIVEL: Dropdowns de Output e Indicator */}
      <div className="flex items-center justify-between w-full">
        {/* Lado izquierdo: Dropdowns */}
        <div className="flex items-center gap-4">
          {/* Dropdown de Outputs */}
          <div className="flex flex-col gap-1">
            <Select
              value={selectedOutput || ""}
              onValueChange={handleOutputChange}
              disabled={isLoadingOutputs}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={isLoadingOutputs ? "Loading outputs..." : "Select output"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Outputs</SelectItem>
                {outputs.map((output) => (
                  <SelectItem key={output.value} value={output.value}>
                    {output.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dropdown de Indicators */}
          <div className="flex flex-col gap-1">
            <Select
              value={selectedIndicator || ""}
              onValueChange={handleIndicatorChange}
              disabled={isLoadingIndicators || !selectedOutput}
            >
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder={
                  isLoadingIndicators ? "Loading indicators..." :
                  !selectedOutput ? "Select an output first" :
                  "Select indicator"
                } />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Indicators</SelectItem>
                {indicators.map((indicator) => (
                  <SelectItem key={indicator.indicator_id} value={indicator.indicator_code}>
                    {indicator.indicator_code} - {indicator.indicator_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Lado derecho: Información adicional */}
        <div className="flex items-center gap-6">
          {selectedIndicatorInfo && (
            <>
              {/* Output Number */}
              <div className="text-sm font-medium text-foreground">
                Output {selectedIndicatorInfo.output_number}
              </div>
              
              {/* Descripción del indicador */}
              <div className="text-sm text-muted-foreground max-w-[300px] truncate">
                {selectedIndicatorInfo.indicator_description}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
