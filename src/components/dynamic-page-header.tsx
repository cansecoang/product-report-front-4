"use client"

import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { 
  Target, 
  Filter,
  Package2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mapeo de rutas a títulos
const routeTitles: Record<string, string> = {
  "/": "Dashboard",
  "/analytics": "Analytics", 
  "/product": "Products",
  "/product/list": "Products",
  "/product/gantt": "Products", 
  "/product/metrics": "Products",
  "/indicators": "Indicadores de Rendimiento",
  "/settings": "Configuración",
  "/settings/organizations": "Configuración",
  "/settings/statuses": "Configuración",
  "/settings/phases": "Configuración"
};

// Interfaces para los filtros
interface Output {
  outputNumber: string;
  name: string;
}

interface WorkPackage {
  workpackage_id: number;
  workpackage_name: string;
}

export function DynamicPageHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Estados para los filtros (solo para la página de indicadores)
  const [selectedOutput, setSelectedOutput] = useState<string | null>(null);
  const [selectedWorkPackage, setSelectedWorkPackage] = useState<string | null>(null);
  const [outputs, setOutputs] = useState<Output[]>([]);
  const [workPackages, setWorkPackages] = useState<WorkPackage[]>([]);
  
  // Verificar si estamos en la página de indicadores
  const isIndicatorsPage = pathname === '/indicators';
  
  // Obtener el título basado en la ruta actual
  const getTitle = () => {
    // Buscar coincidencia exacta primero
    if (routeTitles[pathname]) {
      return routeTitles[pathname];
    }
    
    // Buscar coincidencia por prefijo para rutas anidadas
    for (const route in routeTitles) {
      if (pathname.startsWith(route) && route !== "/") {
        return routeTitles[route];
      }
    }
    
    // Fallback
    return "Dashboard";
  };

  // Leer parámetros de la URL cuando estamos en indicadores
  useEffect(() => {
    if (!isIndicatorsPage) return;
    
    const urlOutput = searchParams.get('output');
    const urlWorkPackage = searchParams.get('workPackage');
    
    setSelectedOutput(urlOutput);
    setSelectedWorkPackage(urlWorkPackage);
  }, [searchParams, isIndicatorsPage]);

  // Cargar datos cuando estamos en indicadores
  useEffect(() => {
    if (!isIndicatorsPage) return;
    
    const fetchOutputs = async () => {
      try {
        const response = await fetch('/api/outputs');
        const data = await response.json();
        setOutputs(data.outputs || []);
      } catch (error) {
        console.error('❌ Error fetching outputs:', error);
      }
    };

    const fetchWorkPackages = async () => {
      try {
        const response = await fetch('/api/work-packages');
        const data = await response.json();
        setWorkPackages(data.workpackages || []);
      } catch (error) {
        console.error('❌ Error fetching work packages:', error);
      }
    };

    fetchOutputs();
    fetchWorkPackages();
  }, [isIndicatorsPage]);

  // Función para actualizar URL
  const updateURL = useCallback((output: string | null, workPackage: string | null) => {
    if (!isIndicatorsPage) return;
    
    const params = new URLSearchParams();
    
    if (output && output !== 'all') {
      params.set('output', output);
    }
    
    if (workPackage && workPackage !== 'all') {
      params.set('workPackage', workPackage);
    }
    
    const newURL = `/indicators${params.toString() ? '?' + params.toString() : ''}`;
    router.push(newURL);
  }, [router, isIndicatorsPage]);

  // Handlers para cambios de filtros
  const handleOutputChange = useCallback((outputId: string | null) => {
    setSelectedOutput(outputId);
    updateURL(outputId, selectedWorkPackage);
  }, [selectedWorkPackage, updateURL]);

  const handleWorkPackageChange = useCallback((workPackageId: string | null) => {
    setSelectedWorkPackage(workPackageId);
    updateURL(selectedOutput, workPackageId);
  }, [selectedOutput, updateURL]);

  return (
    <div className="bg-background border-b px-4 py-3 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div className="flex items-center gap-2">
            {isIndicatorsPage && <Target className="h-6 w-6 text-blue-600" />}
            <h1 className="text-lg font-medium text-foreground">{getTitle()}</h1>
          </div>
        </div>
        
        {/* Filtros solo para la página de indicadores */}
        {isIndicatorsPage && (
          <div className="flex items-center gap-4">
            {/* Filtro principal: Output */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={selectedOutput || ''} onValueChange={handleOutputChange}>
                <SelectTrigger className="w-48 border-2 border-blue-200 focus:border-blue-500">
                  <SelectValue placeholder="Seleccionar Output" />
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

            {/* Filtro opcional: Work Package */}
            <div className="flex items-center gap-2 opacity-75">
              <Package2 className="h-4 w-4 text-gray-400" />
              <Select value={selectedWorkPackage || ''} onValueChange={handleWorkPackageChange}>
                <SelectTrigger className="w-48 border border-gray-300">
                  <SelectValue placeholder="Filtrar por WP (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Work Packages</SelectItem>
                  {workPackages.map((wp) => (
                    <SelectItem key={wp.workpackage_id} value={wp.workpackage_id.toString()}>
                      {wp.workpackage_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
