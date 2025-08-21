"use client"

import React, { useState, useEffect, useMemo } from "react";
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
  RadialBarChart,
  RadialBar,
  ScatterChart,
  Scatter
} from "recharts";

// Interfaces para los datos de progreso por indicador
interface IndicatorProgress {
  indicator_id: number;
  indicator_code: string;
  indicator_name: string;
  indicator_description: string;
  output_number: string;
  products_using: number;
  countries_covered: number;
  working_groups_using: number;
  adoption_percentage: number;
  avg_days_to_delivery: number;
}

interface TaskProgress {
  indicator_name: string;
  indicator_code: string;
  product_name: string;
  country_id: number;
  country_name: string;
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  pending_tasks: number;
  completion_percentage: number;
  delivery_date: string;
  delivery_status: string;
}

interface TimelineItem {
  indicator_name: string;
  output_number: string;
  product_name: string;
  delivery_date: string;
  total_tasks: number;
  progress_percentage: number;
  delivery_month: number;
  delivery_year: number;
}

interface OutputComparison {
  output_number: string;
  indicators_count: number;
  products_count: number;
  avg_completion_rate: number;
  total_tasks_all_products: number;
}

interface GeographicDistribution {
  country_name: string;
  indicators_used: number;
  products_count: number;
  total_tasks: number;
  country_completion_rate: number;
  overdue_products: number;
}

export default function IndicatorsMetricsPage() {
  const [loading, setLoading] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState<string | null>(null);
  const [data, setData] = useState<{
    indicatorProgress: IndicatorProgress[];
    taskProgress: TaskProgress[];
    timeline: TimelineItem[];
    outputComparison: OutputComparison[];
    geographicDistribution: GeographicDistribution[];
  } | null>(null);

  // Colores para gráficos
  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'];

  const fetchIndicatorsMetrics = async (indicatorId?: string) => {
    setLoading(true);
    try {
      const url = indicatorId 
        ? `/api/indicators-metrics?indicatorId=${indicatorId}`
        : '/api/indicators-metrics';
      
      const response = await fetch(url);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        console.error('Error fetching indicators metrics:', response.status);
      }
    } catch (error) {
      console.error('Error fetching indicators metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndicatorsMetrics(selectedIndicator || undefined);
  }, [selectedIndicator]);

  // Preparar datos para gráficos
  const chartData = useMemo(() => {
    if (!data) return null;

    // Datos para adopción de indicadores (pie chart)
    const adoptionData = data.indicatorProgress.map(item => ({
      name: item.indicator_name,
      value: item.adoption_percentage,
      products: item.products_using,
      countries: item.countries_covered
    }));

    // Datos para progreso por país (bar chart)
    const countryProgressData = data.geographicDistribution.map(item => ({
      country: item.country_name,
      completion: item.country_completion_rate,
      tasks: item.total_tasks,
      indicators: item.indicators_used,
      overdue: item.overdue_products
    }));

    // Datos para timeline de entrega (line chart)
    const timelineData = data.timeline.reduce((acc, item) => {
      const monthKey = `${item.delivery_year}-${String(item.delivery_month).padStart(2, '0')}`;
      const existing = acc.find(x => x.month === monthKey);
      
      if (existing) {
        existing.projects++;
        existing.avgProgress = (existing.avgProgress + item.progress_percentage) / 2;
      } else {
        acc.push({
          month: monthKey,
          projects: 1,
          avgProgress: item.progress_percentage,
          displayMonth: `${item.delivery_month}/${item.delivery_year}`
        });
      }
      return acc;
    }, [] as Array<{
      month: string;
      projects: number;
      avgProgress: number;
      displayMonth: string;
    }>);

    // Datos para comparación de outputs (radar)
    const outputRadarData = data.outputComparison.map(item => ({
      output: item.output_number,
      completion: item.avg_completion_rate,
      indicators: item.indicators_count * 10, // Escalar para visualización
      products: item.products_count * 20, // Escalar para visualización
      tasks: Math.min(item.total_tasks_all_products / 10, 100) // Escalar y limitar
    }));

    // Datos para progreso individual por indicador (radial bars)
    const indicatorRadialData = data.indicatorProgress.map(item => ({
      name: item.indicator_code,
      adoption: item.adoption_percentage,
      fullName: item.indicator_name
    }));

    return {
      adoptionData,
      countryProgressData,
      timelineData,
      outputRadarData,
      indicatorRadialData
    };
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Cargando progreso de indicadores...</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-2">No hay datos disponibles</h2>
          <p className="text-gray-600">No se pudieron cargar las métricas de progreso de indicadores.</p>
        </div>
      </div>
    );
  }

  // Calcular KPIs globales
  const avgCompletion = data.geographicDistribution.reduce((sum, item) => sum + item.country_completion_rate, 0) / data.geographicDistribution.length;
  const totalTasks = data.geographicDistribution.reduce((sum, item) => sum + item.total_tasks, 0);
  const overdueProducts = data.geographicDistribution.reduce((sum, item) => sum + item.overdue_products, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Progreso por Indicadores</h1>
        <p className="text-gray-600 mb-6">
          Dashboard de progreso de indicadores: adopción, avance de tareas, timeline de entrega y distribución geográfica
        </p>

        {/* Filtro de Indicador */}
        <div className="mb-6">
          <select
            value={selectedIndicator || ''}
            onChange={(e) => setSelectedIndicator(e.target.value || null)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="">Todos los Indicadores</option>
            {data.indicatorProgress.map((indicator) => (
              <option key={indicator.indicator_id} value={indicator.indicator_id.toString()}>
                {indicator.indicator_code} - {indicator.indicator_name}
              </option>
            ))}
          </select>
        </div>

        {/* KPIs Globales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{data.indicatorProgress.length}</div>
            <div className="text-sm text-gray-600">Indicadores Activos</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{avgCompletion.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Progreso Promedio</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">{totalTasks}</div>
            <div className="text-sm text-gray-600">Total Tareas</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-red-600">{overdueProducts}</div>
            <div className="text-sm text-gray-600">Productos Retrasados</div>
          </div>
        </div>
      </div>

      {/* Fila 1: Adopción de Indicadores + Progreso por País */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Adopción de Indicadores */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Adopción de Indicadores</h2>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={chartData?.adoptionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData?.adoptionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name, props) => [
                `${value}% adopción`,
                props.payload.name
              ]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Progreso por País */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Progreso por País</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData?.countryProgressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="country" />
              <YAxis />
              <Tooltip formatter={(value, name) => [
                name === 'completion' ? `${value}%` : value,
                name === 'completion' ? 'Completado' : 
                name === 'tasks' ? 'Tareas' : 
                name === 'indicators' ? 'Indicadores' : 'Retrasados'
              ]} />
              <Legend />
              <Bar dataKey="completion" fill="#10B981" name="% Completado" />
              <Bar dataKey="overdue" fill="#EF4444" name="Productos Retrasados" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Fila 2: Timeline de Entrega + Progreso Individual */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Timeline de Entrega */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Timeline de Entregas</h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData?.timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="displayMonth" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="avgProgress" 
                stroke="#8884d8" 
                strokeWidth={3}
                name="Progreso Promedio %" 
              />
              <Line 
                type="monotone" 
                dataKey="projects" 
                stroke="#82ca9d" 
                strokeWidth={2}
                name="Número de Proyectos" 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Progreso Individual por Indicador */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Adopción por Indicador</h2>
          <ResponsiveContainer width="100%" height={350}>
            <RadialBarChart data={chartData?.indicatorRadialData}>
              <RadialBar
                label={{ position: 'insideStart', fill: '#fff' }}
                background
                dataKey="adoption"
              />
              <Tooltip formatter={(value, name, props) => [
                `${value}%`,
                props.payload.fullName
              ]} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Fila 3: Scatter Comparativo + Tabla de Progreso */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Scatter: Países vs Indicadores */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Distribución: Países vs Indicadores</h2>
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart>
              <CartesianGrid />
              <XAxis 
                type="number" 
                dataKey="indicators" 
                name="Indicadores Usados" 
                domain={[0, 'dataMax + 1']}
              />
              <YAxis 
                type="number" 
                dataKey="completion" 
                name="% Completado" 
                domain={[0, 100]}
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                formatter={(value, name) => [
                  name === 'completion' ? `${value}%` : value,
                  name === 'completion' ? '% Completado' : 'Indicadores Usados'
                ]}
                labelFormatter={(label, payload) => 
                  payload?.[0]?.payload?.country || 'País'
                }
              />
              <Scatter 
                name="Países" 
                data={chartData?.countryProgressData} 
                fill="#8884d8"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Tabla de Progreso Detallado */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Progreso Detallado por Producto</h2>
          <div className="overflow-y-auto max-h-80">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50">
                <tr className="border-b">
                  <th className="text-left p-2">Indicador</th>
                  <th className="text-left p-2">Producto</th>
                  <th className="text-center p-2">Progreso</th>
                  <th className="text-center p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.taskProgress.map((task, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <div className="font-medium">{task.indicator_code}</div>
                      <div className="text-xs text-gray-500">{task.country_name}</div>
                    </td>
                    <td className="p-2">{task.product_name}</td>
                    <td className="p-2 text-center">
                      <div className="flex flex-col">
                        <span className="font-medium">{task.completion_percentage}%</span>
                        <span className="text-xs text-gray-500">
                          {task.completed_tasks}/{task.total_tasks} tareas
                        </span>
                      </div>
                    </td>
                    <td className="p-2 text-center">
                      <span className={`px-2 py-1 rounded text-xs ${
                        task.delivery_status === 'En Tiempo' ? 'bg-green-100 text-green-800' :
                        task.delivery_status === 'Vence Hoy' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {task.delivery_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Resumen Estadístico */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Resumen Estadístico por Indicador</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.indicatorProgress.map((indicator) => (
            <div key={indicator.indicator_id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-sm">{indicator.indicator_code}</h3>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {indicator.output_number}
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-3">{indicator.indicator_name}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Adopción:</span>
                  <div className="font-medium">{indicator.adoption_percentage}%</div>
                </div>
                <div>
                  <span className="text-gray-500">Productos:</span>
                  <div className="font-medium">{indicator.products_using}</div>
                </div>
                <div>
                  <span className="text-gray-500">Países:</span>
                  <div className="font-medium">{indicator.countries_covered}</div>
                </div>
                <div>
                  <span className="text-gray-500">Días promedio:</span>
                  <div className="font-medium">{Math.round(indicator.avg_days_to_delivery)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
