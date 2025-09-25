"use client"

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Target, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  Filter,
  Package2,
  Eye,
  BarChart3,
  MapPin
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProductDetailsModal } from "@/components/product-details-modal";

// 🎯 NEW UX-FOCUSED INTERFACES
interface Output {
  outputNumber: string;
  name: string;
}

interface WorkPackage {
  workpackage_id: number;
  workpackage_name: string;
}

interface IndicatorMetric {
  indicator_code: string;
  indicator_name: string;
  total_tasks: number;
  completed_tasks: number;
  completion_percentage: number;
  overdue_tasks: number;
}

interface TaskStatusMetric {
  status_name: string;
  count: number;
  percentage: number;
}

interface ApiResponseData {
  indicatorMetrics: IndicatorMetric[];
  taskStatusMetrics: TaskStatusMetric[];
}

interface IndicatorPerformance {
  indicator_id: number;
  indicator_code: string;
  indicator_name: string;
  indicator_description: string;
  assigned_products_count: number;
  assigned_products: {
    product_id: number;
    product_name: string;
    country_name: string;
    workpackage_name: string;
  }[];
  total_tasks: number;
  completed_tasks: number;
  completion_percentage: number;
  overdue_tasks: number;
  status_distribution: { status_name: string; count: number; percentage: number }[];
  trend: 'up' | 'down' | 'stable';
  performance_rating: 'excellent' | 'good' | 'warning' | 'critical';
}

interface OutputData {
  output_number: string;
  indicators: IndicatorPerformance[];
  summary: {
    total_indicators: number;
    avg_completion: number;
    total_tasks: number;
    completed_tasks: number;
    overdue_tasks: number;
  };
}

// 🎯 Helper function to safely convert percentage values
function safePercentage(value: number | string | undefined): number {
  if (typeof value === 'number') return value;
  return parseFloat(value || '0');
}

export default function IndicatorsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="text-muted-foreground">Cargando indicadores...</div></div>}>
      <IndicatorsContent />
    </Suspense>
  );
}

// 🎯 UX-FOCUSED COMPONENT: Circular progress indicator
function CircularProgress({ value, size = 80 }: { value: number; size?: number }) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  const getColor = (val: number) => {
    if (val >= 90) return '#22c55e'; // green-500
    if (val >= 75) return '#3b82f6'; // blue-500
    if (val >= 50) return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor(value)}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-gray-900">{value.toFixed(0)}%</span>
      </div>
    </div>
  );
}

// 🎯 UX-FOCUSED COMPONENT: Performance indicator with semantic colors
function PerformanceIndicator({ value }: { value: number }) {
  const getColorAndIcon = (val: number) => {
    if (val >= 90) return { color: 'text-green-600 bg-green-50', icon: CheckCircle, label: 'Excelente' };
    if (val >= 75) return { color: 'text-blue-600 bg-blue-50', icon: TrendingUp, label: 'Bueno' };
    if (val >= 50) return { color: 'text-orange-600 bg-orange-50', icon: Clock, label: 'Atención' };
    return { color: 'text-red-600 bg-red-50', icon: AlertCircle, label: 'Crítico' };
  };

  const { color, icon: Icon, label } = getColorAndIcon(value);

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${color}`}>
      <Icon className="h-4 w-4" />
      <div className="flex flex-col">
        <span className="text-sm font-semibold">{value.toFixed(1)}%</span>
        <span className="text-xs opacity-75">{label}</span>
      </div>
    </div>
  );
}

// 🎯 UX-FOCUSED COMPONENT: Indicator detail modal
function IndicatorDetailModal({ 
  indicator, 
  onProductClick 
}: { 
  indicator: IndicatorPerformance;
  onProductClick: (productId: number) => void;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02] border-2 hover:border-blue-300">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {indicator.indicator_code}
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 mt-1">
                  {indicator.indicator_name}
                </CardDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Package2 className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {indicator.assigned_products_count} producto{indicator.assigned_products_count !== 1 ? 's' : ''} asignado{indicator.assigned_products_count !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <Badge 
                variant={indicator.performance_rating === 'excellent' ? 'default' : 
                        indicator.performance_rating === 'good' ? 'secondary' :
                        indicator.performance_rating === 'warning' ? 'outline' : 'destructive'}
                className="ml-2"
              >
                {indicator.performance_rating === 'excellent' ? 'Excelente' :
                 indicator.performance_rating === 'good' ? 'Bueno' :
                 indicator.performance_rating === 'warning' ? 'Atención' : 'Crítico'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Circular Progress */}
            <div className="flex items-center justify-center mb-4">
              <CircularProgress value={indicator.completion_percentage} size={100} />
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">{indicator.total_tasks}</div>
                <div className="text-xs text-gray-500">Total Tareas</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">{indicator.completed_tasks}</div>
                <div className="text-xs text-gray-500">Completadas</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-red-600">{indicator.overdue_tasks}</div>
                <div className="text-xs text-gray-500">Vencidas</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Target className="h-6 w-6 text-blue-600" />
            {indicator.indicator_code} - {indicator.indicator_name}
          </DialogTitle>
          <DialogDescription className="text-base">
            {indicator.indicator_description || 'Sin descripción disponible'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 mt-6">
          {/* Performance Overview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Resumen de Rendimiento
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <CircularProgress value={indicator.completion_percentage} size={80} />
                <div className="text-sm font-medium text-gray-700 mt-2">Progreso General</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-gray-900">{indicator.total_tasks}</div>
                <div className="text-sm text-gray-600">Total Tareas</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-600">{indicator.completed_tasks}</div>
                <div className="text-sm text-gray-600">Completadas</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-red-600">{indicator.overdue_tasks}</div>
                <div className="text-sm text-gray-600">Vencidas</div>
              </div>
            </div>
          </div>

          {/* Status Distribution */}
          {indicator.status_distribution && indicator.status_distribution.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Distribución de Estados
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {indicator.status_distribution.map((status, index) => (
                  <div key={index} className="bg-white border rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-700">{status.status_name}</span>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">{status.count}</div>
                        <div className="text-sm text-gray-500">{safePercentage(status.percentage).toFixed(1)}%</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${safePercentage(status.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assigned Products */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Package2 className="h-5 w-5 text-blue-600" />
              Productos Asignados ({indicator.assigned_products_count})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {indicator.assigned_products.map((product, index) => (
                <div 
                  key={index} 
                  className="bg-white border rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
                  onClick={() => onProductClick(product.product_id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">
                        {product.product_name}
                      </div>
                      <div className="text-xs text-gray-500 mb-2">
                        ID: {product.product_id}
                      </div>
                    </div>
                    <Eye className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-gray-500" />
                      <span className="text-xs text-gray-600">{product.country_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package2 className="h-3 w-3 text-gray-500" />
                      <span className="text-xs text-gray-600">{product.workpackage_name}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-2 border-t border-gray-100">
                    <div className="text-xs text-gray-500 group-hover:text-blue-600 transition-colors">
                      Ver detalles →
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function IndicatorsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 🎯 URL-FIRST: Estados desde URL - Simplificado para UX centrada en outputs
  const [selectedOutput, setSelectedOutput] = useState<string | null>(null);
  const [selectedWorkPackage, setSelectedWorkPackage] = useState<string | null>(null);
  
  // 🎯 Estado de datos
  const [outputData, setOutputData] = useState<OutputData | null>(null);
  const [outputs, setOutputs] = useState<Output[]>([]);
  const [workPackages, setWorkPackages] = useState<WorkPackage[]>([]);
  const [loading, setLoading] = useState(false);
  
  // 🎯 Estado para modal de detalles del producto
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);

  // 🎯 Función para manejar click en producto
  const handleProductClick = (productId: number) => {
    setSelectedProductId(productId.toString());
    setShowProductModal(true);
  };

  // 🎯 URL-FIRST: Leer parámetros de la URL
  useEffect(() => {
    const urlOutput = searchParams.get('output');
    const urlWorkPackage = searchParams.get('workPackage');
    
    console.log('🔗 URL params received:', { urlOutput, urlWorkPackage });
    
    setSelectedOutput(urlOutput);
    setSelectedWorkPackage(urlWorkPackage);
  }, [searchParams]);

  // 🎯 Cargar outputs y work packages al inicializar
  useEffect(() => {
    fetchOutputs();
    fetchWorkPackages();
  }, []);

  // 🎯 URL-FIRST: Actualizar URL cuando cambian los estados
  const updateURL = useCallback((output: string | null, workPackage: string | null) => {
    const params = new URLSearchParams();
    
    if (output && output !== 'all') {
      params.set('output', output);
    }
    
    if (workPackage && workPackage !== 'all') {
      params.set('workPackage', workPackage);
    }
    
    const newURL = `/indicators${params.toString() ? '?' + params.toString() : ''}`;
    console.log('🔗 Updating URL to:', newURL);
    router.push(newURL);
  }, [router]);

  // 🎯 Handler para cambio de output (filtro principal)
  const handleOutputChange = useCallback((outputId: string | null) => {
    console.log('🔄 Output changed to:', outputId);
    setSelectedOutput(outputId);
    updateURL(outputId, selectedWorkPackage);
  }, [selectedWorkPackage, updateURL]);

  // 🎯 Handler para cambio de work package (filtro opcional)
  const handleWorkPackageChange = useCallback((workPackageId: string | null) => {
    console.log('🔄 Work Package changed to:', workPackageId);
    setSelectedWorkPackage(workPackageId);
    updateURL(selectedOutput, workPackageId);
  }, [selectedOutput, updateURL]);

  // 🎯 Fetch outputs
  const fetchOutputs = async () => {
    try {
      const response = await fetch('/api/outputs');
      const data = await response.json();
      setOutputs(data.outputs || []);
    } catch (error) {
      console.error('❌ Error fetching outputs:', error);
    }
  };

  // 🎯 Fetch work packages
  const fetchWorkPackages = async () => {
    try {
      const response = await fetch('/api/work-packages');
      const data = await response.json();
      setWorkPackages(data.workpackages || []);
    } catch (error) {
      console.error('❌ Error fetching work packages:', error);
    }
  };

  // 🎯 Fetch data cuando hay un output seleccionado
  useEffect(() => {
    if (!selectedOutput) {
      console.log('⏸️ No output selected, showing overview');
      setOutputData(null);
      return;
    }

    const fetchOutputData = async () => {
      console.log('📊 Fetching data for output:', selectedOutput, 'workPackage:', selectedWorkPackage);
      setLoading(true);
      
      try {
        const params = new URLSearchParams();
        params.append('output', selectedOutput);
        if (selectedWorkPackage && selectedWorkPackage !== 'all') {
          params.append('workPackage', selectedWorkPackage);
        }

        const response = await fetch(`/api/output-performance?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: OutputData = await response.json();
        console.log('📊 Output data received:', data);
        
        setOutputData(data);
      } catch (error) {
        console.error('❌ Error fetching output data:', error);
        setOutputData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOutputData();
  }, [selectedOutput, selectedWorkPackage]);

  // 🎯 RENDER: Nueva estructura UX centrada en outputs
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con filtros principales */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Target className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">Indicadores de Rendimiento</h1>
              </div>
            </div>
            
            {/* Filtros UX-optimizados */}
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
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedOutput ? (
          // 🎯 ESTADO INICIAL: Prompt para seleccionar output
          <div className="text-center py-12">
            <div className="mx-auto max-w-md">
              <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Selecciona un Output para ver sus Indicadores
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Los outputs organizan los indicadores por objetivos principales. 
                Puedes filtrar opcionalmente por Work Package para un análisis más específico.
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {outputs.map((output) => (
                  <Button
                    key={output.outputNumber}
                    variant="outline"
                    className="p-4 h-auto text-left hover:border-blue-500 hover:bg-blue-50"
                    onClick={() => handleOutputChange(output.outputNumber)}
                  >
                    <div>
                      <div className="font-medium text-gray-900">{output.name}</div>
                      <div className="text-xs text-gray-500 mt-1">Ver indicadores</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : loading ? (
          // 🎯 ESTADO DE CARGA
          <div className="text-center py-12">
            <Activity className="mx-auto h-8 w-8 text-blue-500 animate-spin mb-4" />
            <div className="text-lg font-medium text-gray-900">Cargando indicadores...</div>
          </div>
        ) : outputData ? (
          // 🎯 VISTA PRINCIPAL: Indicadores del output seleccionado
          <div className="space-y-6">
            {/* Header del output seleccionado */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Output {outputData.output_number}
                  </h2>
                  <p className="text-gray-600">
                    Rendimiento de {outputData.summary.total_indicators} indicadores
                    {selectedWorkPackage && selectedWorkPackage !== 'all' && (
                      <span className="ml-2 text-sm">
                        • Filtrado por: {workPackages.find(wp => wp.workpackage_id.toString() === selectedWorkPackage)?.workpackage_name}
                      </span>
                    )}
                  </p>
                </div>
                <PerformanceIndicator value={outputData.summary.avg_completion} />
              </div>

              {/* Métricas resumen */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{outputData.summary.total_indicators}</div>
                  <div className="text-sm text-blue-700">Indicadores</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{outputData.summary.completed_tasks}</div>
                  <div className="text-sm text-green-700">Tareas Completadas</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-600">{outputData.summary.total_tasks}</div>
                  <div className="text-sm text-gray-700">Total Tareas</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{outputData.summary.overdue_tasks}</div>
                  <div className="text-sm text-red-700">Tareas Vencidas</div>
                </div>
              </div>
            </div>

            {/* Grid de indicadores */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {outputData.indicators.map((indicator, index) => (
                <IndicatorDetailModal key={index} indicator={indicator} onProductClick={handleProductClick} />
              ))}
            </div>

            {outputData.indicators.length === 0 && (
              <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                <Eye className="mx-auto h-8 w-8 text-gray-400 mb-4" />
                <div className="text-lg font-medium text-gray-900 mb-2">
                  No hay indicadores disponibles
                </div>
                <p className="text-sm text-gray-500">
                  No se encontraron indicadores para este output
                  {selectedWorkPackage && selectedWorkPackage !== 'all' && ' y work package'}.
                </p>
              </div>
            )}
          </div>
        ) : (
          // 🎯 ESTADO DE ERROR
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-4" />
            <div className="text-lg font-medium text-gray-900 mb-2">Error al cargar datos</div>
            <p className="text-sm text-gray-500">
              No se pudieron cargar los indicadores. Intenta nuevamente.
            </p>
          </div>
        )}
      </div>

      {/* Modal de detalles del producto */}
      <ProductDetailsModal
        isOpen={showProductModal}
        onClose={() => {
          setShowProductModal(false);
          setSelectedProductId(null);
        }}
        productId={selectedProductId}
      />
    </div>
  );
}