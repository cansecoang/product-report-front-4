"use client"

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from 'next/navigation';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { Target, MapPin, Package, Calendar } from "lucide-react";
import { IndicatorsHeader } from "@/components/indicators-header";

// Interfaces para los datos
interface IndicatorMetric {
  indicator_id: number;
  indicator_code: string;
  indicator_name: string;
  output_number: string;
  products_using: number;
  countries_covered: number;
  total_tasks: number;
  completed_tasks: number;
  completion_percentage: number;
  avg_delay_days: number;
  working_groups_using: number;
}

interface CountryMetric {
  country_name: string;
  total_products: number;
  total_tasks: number;
  completed_tasks: number;
  country_completion_rate: number;
  overdue_products: number;
}

interface ProductMetric {
  product_id: number;
  product_name: string;
  country_id: number;
  country_name: string;
  indicator_code: string;
  indicator_name: string;
  total_tasks: number;
  completed_tasks: number;
  completion_percentage: number;
  delivery_status: "En Tiempo" | "Retrasado" | "Vence Hoy";
}

interface IndicatorsAnalyticsData {
  indicatorMetrics: IndicatorMetric[];
  countryMetrics: CountryMetric[];
  productMetrics: ProductMetric[];
}

export default function IndicatorsDashboardPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="text-muted-foreground">Cargando...</div></div>}>
      <IndicatorsDashboardContent />
    </Suspense>
  );
}

function IndicatorsDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 🎯 URL-FIRST: Estados desde URL
  const [selectedOutput, setSelectedOutput] = useState<string | null>(null);
  const [selectedIndicator, setSelectedIndicator] = useState<string | null>(null);
  
  // 🎯 Estado de datos
  const [data, setData] = useState<IndicatorsAnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);

  // 🎯 URL-FIRST: Leer parámetros de la URL
  useEffect(() => {
    const urlOutput = searchParams.get('output');
    const urlIndicator = searchParams.get('indicator');
    
    console.log('🔗 URL params:', { output: urlOutput, indicator: urlIndicator });
    
    if (urlOutput !== selectedOutput) {
      console.log('📊 Output changed to:', urlOutput);
      setSelectedOutput(urlOutput);
    }
    
    if (urlIndicator !== selectedIndicator) {
      console.log('🎯 Indicator changed to:', urlIndicator);
      setSelectedIndicator(urlIndicator);
    }
  }, [searchParams, selectedOutput, selectedIndicator]);

  // 🎯 URL-FIRST: Actualizar URL cuando cambien los filtros
  const updateURL = (output: string | null, indicator: string | null) => {
    const params = new URLSearchParams();
    if (output) params.set('output', output);
    if (indicator) params.set('indicator', indicator);
    
    const newURL = `/indicators/dashboard${params.toString() ? `?${params.toString()}` : ''}`;
    console.log('🔄 Updating URL to:', newURL);
    router.push(newURL);
  };

  // 🎯 Handlers para cambio de filtros
  const handleOutputChange = (outputId: string | null) => {
    console.log('📊 Output selected:', outputId);
    updateURL(outputId, null); // Reset indicator cuando cambia output
  };

  const handleIndicatorChange = (indicatorId: string | null) => {
    console.log('🎯 Indicator selected:', indicatorId);
    updateURL(selectedOutput, indicatorId);
  };

  // 🎯 Fetch de datos cuando cambian los filtros URL
  useEffect(() => {
    const fetchIndicatorsAnalytics = async () => {
      if (!selectedOutput || !selectedIndicator) {
        console.log('⏳ Missing filters, not fetching:', { selectedOutput, selectedIndicator });
        setData(null);
        return;
      }

      console.log('🚀 Fetching analytics for:', { output: selectedOutput, indicator: selectedIndicator });
      setLoading(true);

      try {
        const params = new URLSearchParams();
        if (selectedOutput) params.append('output', selectedOutput);
        if (selectedIndicator) params.append('indicator', selectedIndicator);

        const response = await fetch(`/api/indicators-analytics?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const analyticsData: IndicatorsAnalyticsData = await response.json();
        console.log('📊 Analytics data received:', analyticsData);
        setData(analyticsData);
      } catch (error) {
        console.error('❌ Error fetching indicators analytics:', error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchIndicatorsAnalytics();
  }, [selectedOutput, selectedIndicator]);

  // 🎯 Determinar qué mostrar
  const showInitialState = !selectedOutput || !selectedIndicator || !data;
  


  // Colores para gráficos
  const statusColors = useMemo(() => ({
    "En Tiempo": "#22c55e",
    "Retrasado": "#ef4444",
    "Vence Hoy": "#f59e0b",
  }), []);

  // Datos procesados para gráficos
  const chartData = useMemo(() => {
    if (!data) return null;

    const { countryMetrics, productMetrics } = data;
    
    // Datos para el gráfico de barras de países
    const countryChartData = countryMetrics.map((country) => ({
      name: country.country_name,
      productos: country.total_products,
      tareas: country.total_tasks,
      completadas: country.completed_tasks,
      progreso: Number(country.country_completion_rate.toFixed(1)),
    }));

    // Datos para el gráfico de pie de estado de entrega
    const deliveryStatusData = productMetrics.reduce((acc, product) => {
      const status = product.delivery_status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const pieChartData = Object.entries(deliveryStatusData).map(([status, count]) => ({
      name: status,
      value: count,
      color: statusColors[status as keyof typeof statusColors],
    }));

    // Datos para el gráfico de líneas de progreso por producto
    const progressChartData = productMetrics.map((product) => ({
      name: product.product_name.length > 20 
        ? product.product_name.substring(0, 20) + "..." 
        : product.product_name,
      progreso: Number(product.completion_percentage.toFixed(1)),
      tareas_totales: product.total_tasks,
      tareas_completadas: product.completed_tasks,
    }));

    return {
      countryChartData,
      pieChartData,
      progressChartData,
    };
  }, [data, statusColors]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header con dropdowns */}
      <IndicatorsHeader
        selectedOutput={selectedOutput}
        selectedIndicator={selectedIndicator}
        onOutputChange={handleOutputChange}
        onIndicatorChange={handleIndicatorChange}
      />

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando análisis de indicadores...</p>
          </div>
        </div>
      )}

      {/* Estado inicial - cuando no hay filtros o datos */}
      {showInitialState && !loading && (
        <div className="text-center py-12">
          <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Selecciona un Indicador</h3>
          <p className="text-muted-foreground">
            Elige un output e indicador en los filtros superiores para ver el análisis detallado.
          </p>
        </div>
      )}

      {/* Dashboard con datos */}
      {data && !loading && chartData && (
        <>
          {/* Métricas principales */}
          {data.indicatorMetrics.map((indicator) => (
            <div key={indicator.indicator_id} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Tarjetas de métricas */}
              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Productos Activos</p>
                    <p className="text-2xl font-bold">{indicator.products_using}</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Países Cubiertos</p>
                    <p className="text-2xl font-bold">{indicator.countries_covered}</p>
                  </div>
                  <MapPin className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tareas Totales</p>
                    <p className="text-2xl font-bold">{indicator.total_tasks}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-orange-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Progreso General</p>
                    <p className="text-2xl font-bold">{indicator.completion_percentage.toFixed(1)}%</p>
                  </div>
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>
          ))}

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de barras por país */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Progreso por País</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.countryChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="productos" fill="#0088FE" name="Productos" />
                  <Bar dataKey="tareas" fill="#00C49F" name="Tareas Totales" />
                  <Bar dataKey="completadas" fill="#FFBB28" name="Tareas Completadas" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfico de pie de estados de entrega */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Estado de Entregas</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico de líneas de progreso por producto */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Progreso por Producto</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.progressChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="progreso"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name="Progreso (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Tabla de productos */}
          <div className="bg-white rounded-lg border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Productos del Indicador</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      País
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tareas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progreso
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.productMetrics.map((product) => (
                    <tr key={product.product_id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {product.product_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.country_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {product.completed_tasks}/{product.total_tasks}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${product.completion_percentage}%` }}
                            ></div>
                          </div>
                          <div className="text-sm text-gray-900">
                            {product.completion_percentage.toFixed(1)}%
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                          style={{
                            backgroundColor: statusColors[product.delivery_status],
                            color: 'white',
                          }}
                        >
                          {product.delivery_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
