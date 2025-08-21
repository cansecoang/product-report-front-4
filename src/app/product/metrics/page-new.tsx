"use client"

import React, { useState, useEffect } from "react";
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
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar
} from "recharts";

interface ProductSummary {
  product_name: string;
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  pending_tasks: number;
  overdue_tasks: number;
  completion_percentage: number;
}

interface DistributionItem {
  name: string;
  value: number;
  percentage: number;
}

interface MonthlyProgress {
  month: string;
  completed_tasks: number;
}

interface OrganizationData {
  name: string;
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
}

interface TimelineAnalysis {
  on_time: number;
  delayed: number;
  overdue: number;
  pending: number;
  avg_delay_days: number;
}

interface MetricsData {
  productSummary: ProductSummary | null;
  statusDistribution: DistributionItem[];
  phaseDistribution: DistributionItem[];
  monthlyProgress: MonthlyProgress[];
  organizationDistribution: OrganizationData[];
  timelineAnalysis: TimelineAnalysis | null;
}

export default function MetricsPage() {
  const [loading, setLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [metricsData, setMetricsData] = useState<MetricsData>({
    productSummary: null,
    statusDistribution: [],
    phaseDistribution: [],
    monthlyProgress: [],
    organizationDistribution: [],
    timelineAnalysis: null
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
  const STATUS_COLORS = {
    'Completed': '#10B981',
    'In Progress': '#3B82F6', 
    'Pending': '#F59E0B',
    'Overdue': '#EF4444'
  };

  const fetchMetrics = async (productId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/metrics?productId=${productId}`);
      if (response.ok) {
        const data = await response.json();
        setMetricsData(data);
      } else {
        console.error('Error fetching metrics');
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Escuchar cambios en localStorage
  useEffect(() => {
    const checkProductSelection = () => {
      const productId = localStorage.getItem('selectedProductId');
      if (productId && productId !== selectedProductId) {
        setSelectedProductId(productId);
      }
    };

    checkProductSelection();
    window.addEventListener('storage', checkProductSelection);

    return () => {
      window.removeEventListener('storage', checkProductSelection);
    };
  }, [selectedProductId]);

  useEffect(() => {
    if (selectedProductId) {
      fetchMetrics(selectedProductId);
    }
  }, [selectedProductId]);

  // Verificar primero si no hay producto seleccionado
  if (!selectedProductId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-lg font-medium mb-2">No hay producto seleccionado</h2>
          <p className="text-muted-foreground">Selecciona un producto del menú superior para ver las métricas.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Cargando métricas...</div>
      </div>
    );
  }

  const { productSummary, statusDistribution, phaseDistribution, monthlyProgress, organizationDistribution, timelineAnalysis } = metricsData;

  // Preparar datos para el gráfico de progreso general
  const progressData = [
    { name: 'Completado', value: productSummary?.completion_percentage || 0, color: '#10B981' }
  ];

  // Preparar datos para análisis de plazos
  const timelineData = timelineAnalysis ? [
    { name: 'A Tiempo', value: timelineAnalysis.on_time, color: '#10B981' },
    { name: 'Retrasadas', value: timelineAnalysis.delayed, color: '#F59E0B' },
    { name: 'Vencidas', value: timelineAnalysis.overdue, color: '#EF4444' },
    { name: 'Pendientes', value: timelineAnalysis.pending, color: '#6B7280' }
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header con resumen ejecutivo */}
      {productSummary && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">{productSummary.product_name}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{productSummary.total_tasks}</div>
              <div className="text-sm text-gray-600">Total Tareas</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{productSummary.completed_tasks}</div>
              <div className="text-sm text-gray-600">Completadas</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-blue-500">{productSummary.in_progress_tasks}</div>
              <div className="text-sm text-gray-600">En Progreso</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-yellow-500">{productSummary.pending_tasks}</div>
              <div className="text-sm text-gray-600">Pendientes</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-red-500">{productSummary.overdue_tasks}</div>
              <div className="text-sm text-gray-600">Vencidas</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progreso General del Producto */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Progreso General</h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={progressData}>
              <RadialBar 
                dataKey="value" 
                cornerRadius={10} 
                fill="#10B981"
              />
              <Tooltip formatter={(value) => [`${value}%`, 'Completado']} />
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-3xl font-bold">
                {productSummary?.completion_percentage || 0}%
              </text>
            </RadialBarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribución por Estado */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Distribución por Estado</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] || COLORS[index]} 
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value} tareas (${statusDistribution.find(item => item.name === name)?.percentage}%)`, name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Progreso Mensual */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Tareas Completadas por Mes</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} tareas`, 'Completadas']} />
              <Area 
                type="monotone" 
                dataKey="completed_tasks" 
                stroke="#10B981" 
                fill="#10B981" 
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Análisis de Cumplimiento de Plazos */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Cumplimiento de Plazos</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} tareas`, '']} />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
          {timelineAnalysis && timelineAnalysis.avg_delay_days && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Promedio de retraso:</strong> {Math.round(timelineAnalysis.avg_delay_days)} días
              </p>
            </div>
          )}
        </div>

        {/* Distribución por Fase */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Distribución por Fase</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={phaseDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value, name) => [`${value} tareas (${phaseDistribution.find(item => item.name === name)?.percentage}%)`, 'Tareas']} />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Rendimiento por Organización */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Rendimiento por Organización</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={organizationDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'completion_rate') return [`${value}%`, 'Tasa de Completado'];
                  return [`${value}`, name === 'total_tasks' ? 'Total Tareas' : 'Completadas'];
                }}
              />
              <Legend />
              <Bar dataKey="total_tasks" fill="#94A3B8" name="Total" />
              <Bar dataKey="completed_tasks" fill="#10B981" name="Completadas" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights y Recomendaciones */}
      {productSummary && (
        <div className="mt-8 bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Insights y Recomendaciones</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {productSummary.completion_percentage >= 80 && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-medium text-green-800">🎉 Excelente Progreso</h3>
                <p className="text-sm text-green-700">El producto está muy avanzado con {productSummary.completion_percentage}% completado.</p>
              </div>
            )}
            
            {productSummary.overdue_tasks > 0 && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <h3 className="font-medium text-red-800">⚠️ Tareas Vencidas</h3>
                <p className="text-sm text-red-700">Hay {productSummary.overdue_tasks} tarea(s) vencida(s) que requieren atención inmediata.</p>
              </div>
            )}
            
            {productSummary.in_progress_tasks > productSummary.completed_tasks && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-800">🚀 Alta Actividad</h3>
                <p className="text-sm text-blue-700">Muchas tareas en progreso. Mantén el ritmo de trabajo.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
