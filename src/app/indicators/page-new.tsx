"use client"

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from 'next/navigation';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { 
  Target, 
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  BarChart3,
  Filter,
  Package2,
  Users,
  Calendar,
  Eye
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

// 🎯 NEW UX-FOCUSED INTERFACES
interface Output {
  outputNumber: string;
  name: string;
}

interface WorkPackage {
  workpackage_id: number;
  workpackage_name: string;
}

interface IndicatorPerformance {
  indicator_code: string;
  indicator_name: string;
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

export default function IndicatorsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="text-muted-foreground">Cargando indicadores...</div></div>}>
      <IndicatorsContent />
    </Suspense>
  );
}

// 🎯 UX-FOCUSED COMPONENT: Performance indicator with semantic colors
function PerformanceIndicator({ value, type }: { value: number; type: 'completion' | 'adherence' }) {
  const getColorAndIcon = (val: number, indicatorType: string) => {
    if (val >= 90) return { color: 'text-green-600 bg-green-50', icon: CheckCircle, label: 'Excelente' };
    if (val >= 75) return { color: 'text-blue-600 bg-blue-50', icon: TrendingUp, label: 'Bueno' };
    if (val >= 50) return { color: 'text-orange-600 bg-orange-50', icon: Clock, label: 'Atención' };
    return { color: 'text-red-600 bg-red-50', icon: AlertCircle, label: 'Crítico' };
  };

  const { color, icon: Icon, label } = getColorAndIcon(value, type);

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

// 🎯 UX-FOCUSED COMPONENT: Indicator card with clear performance metrics
function IndicatorCard({ indicator }: { indicator: IndicatorPerformance }) {
  const progressColor = indicator.completion_percentage >= 75 ? 'bg-green-500' : 
                       indicator.completion_percentage >= 50 ? 'bg-orange-500' : 'bg-red-500';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900">
              {indicator.indicator_code}
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 mt-1">
              {indicator.indicator_name}
            </CardDescription>
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
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progreso General</span>
            <span className="text-sm font-bold text-gray-900">{indicator.completion_percentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${progressColor}`}
              style={{ width: `${indicator.completion_percentage}%` }}
            />
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{indicator.total_tasks}</div>
            <div className="text-xs text-gray-500">Total Tareas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{indicator.completed_tasks}</div>
            <div className="text-xs text-gray-500">Completadas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{indicator.overdue_tasks}</div>
            <div className="text-xs text-gray-500">Vencidas</div>
          </div>
        </div>

        {/* Status Distribution */}
        {indicator.status_distribution && indicator.status_distribution.length > 0 && (
          <div className="mt-3">
            <div className="text-sm font-medium text-gray-700 mb-2">Distribución de Estados</div>
            <div className="space-y-1">
              {indicator.status_distribution.slice(0, 3).map((status, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">{status.status_name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{status.count}</span>
                    <div className="w-12 bg-gray-200 rounded-full h-1">
                      <div 
                        className="h-1 rounded-full bg-blue-500"
                        style={{ width: `${status.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
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

        const response = await fetch(`/api/indicators-analytics?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📊 Output data received:', data);
        
        // Transform data to match our new structure
        const transformedData: OutputData = {
          output_number: selectedOutput,
          indicators: data.indicatorMetrics?.map((indicator: any) => ({
            indicator_code: indicator.indicator_code,
            indicator_name: indicator.indicator_name,
            total_tasks: indicator.total_tasks || 0,
            completed_tasks: indicator.completed_tasks || 0,
            completion_percentage: indicator.completion_percentage || 0,
            overdue_tasks: indicator.overdue_tasks || 0,
            status_distribution: data.taskStatusMetrics || [],
            trend: indicator.completion_percentage >= 75 ? 'up' : 
                   indicator.completion_percentage >= 50 ? 'stable' : 'down',
            performance_rating: indicator.completion_percentage >= 90 ? 'excellent' :
                               indicator.completion_percentage >= 75 ? 'good' :
                               indicator.completion_percentage >= 50 ? 'warning' : 'critical'
          })) || [],
          summary: {
            total_indicators: data.indicatorMetrics?.length || 0,
            avg_completion: data.indicatorMetrics?.reduce((acc: number, ind: any) => acc + (ind.completion_percentage || 0), 0) / (data.indicatorMetrics?.length || 1) || 0,
            total_tasks: data.indicatorMetrics?.reduce((acc: number, ind: any) => acc + (ind.total_tasks || 0), 0) || 0,
            completed_tasks: data.indicatorMetrics?.reduce((acc: number, ind: any) => acc + (ind.completed_tasks || 0), 0) || 0,
            overdue_tasks: data.indicatorMetrics?.reduce((acc: number, ind: any) => acc + (ind.overdue_tasks || 0), 0) || 0,
          }
        };
        
        setOutputData(transformedData);
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
                <PerformanceIndicator value={outputData.summary.avg_completion} type="completion" />
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
                <IndicatorCard key={index} indicator={indicator} />
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
    </div>
  );
}