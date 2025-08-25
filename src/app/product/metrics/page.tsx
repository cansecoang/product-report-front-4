"use client"

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from 'next/navigation';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadialBarChart,
  RadialBar
} from "recharts";

interface ProductSummary {
  product_name: string;
  total_tasks: string;
  completed_tasks: string;
  in_progress_tasks: string;
  pending_tasks: string;
  completion_percentage: string;
}

interface StatusDistribution {
  name: string;
  value: string;
  percentage: string;
}

interface ChartStatusData {
  name: string;
  value: number;
  percentage: number;
}

export default function MetricsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="text-muted-foreground">Cargando métricas...</div></div>}>
      <MetricsPageContent />
    </Suspense>
  );
}

function MetricsPageContent() {
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [productSummary, setProductSummary] = useState<ProductSummary | null>(null);
  const [statusDistribution, setStatusDistribution] = useState<StatusDistribution[]>([]);

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

  const fetchMetrics = async (productId: string) => {
    setLoading(true);
    try {
      const url = `/api/metrics?productId=${productId}`;
      
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        setProductSummary(data.productSummary);
        setStatusDistribution(data.statusDistribution);
      } else {
        const errorText = await response.text();
        console.error('Error fetching metrics:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🎯 URL-FIRST: Detectar productId desde la URL
  useEffect(() => {
    const urlProductId = searchParams.get('productId');
    console.log('🔗 Metrics: ProductId desde URL:', urlProductId);
    
    if (urlProductId !== selectedProductId) {
      console.log('📦 Product changed to:', urlProductId);
      setSelectedProductId(urlProductId);
      
      if (!urlProductId) {
        setProductSummary(null);
        setStatusDistribution([]);
      }
    }
  }, [searchParams, selectedProductId]);

  // 🎯 Cargar métricas cuando tenemos un productId válido
  useEffect(() => {
    if (selectedProductId) {
      fetchMetrics(selectedProductId);
    }
  }, [selectedProductId]);

  // Preparar datos para los gráficos (memoizado para evitar recálculos)
  const chartData = useMemo(() => {
    const progressData = productSummary ? [
      { name: 'Completado', value: parseFloat(productSummary.completion_percentage) }
    ] : [];

    const statusData = statusDistribution.map((item: StatusDistribution) => ({
      name: item.name,
      value: parseInt(item.value),
      percentage: parseFloat(item.percentage)
    }));
    
    return { progressData, statusData };
  }, [productSummary, statusDistribution]);

  // Verificar si no hay producto seleccionado
  if (!selectedProductId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-2">No hay producto seleccionado</h2>
          <p className="text-gray-600">Selecciona un producto del menú superior para ver las métricas.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Cargando métricas...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 pt-2">
      {/* Header con resumen ejecutivo */}
      {productSummary && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">{productSummary.product_name}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progreso General del Producto */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Progreso General</h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={chartData.progressData}>
              <RadialBar 
                dataKey="value" 
                cornerRadius={10} 
                fill="#10B981"
              />
              <Tooltip formatter={(value) => [`${value}%`, 'Completado']} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="text-center mt-4">
            <span className="text-3xl font-bold text-green-600">
              {productSummary?.completion_percentage || 0}%
            </span>
            <p className="text-gray-600">Completado</p>
          </div>
        </div>

        {/* Distribución por Estado */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Distribución por Estado</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.statusData.map((entry: ChartStatusData, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value} tareas`, name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Tabla de Detalles */}
        <div className="bg-white rounded-xl shadow p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Detalles por Estado</h2>
          <div className="overflow-x-clip">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Estado</th>
                  <th className="px-4 py-2 text-right">Cantidad</th>
                  <th className="px-4 py-2 text-right">Porcentaje</th>
                </tr>
              </thead>
              <tbody>
                {chartData.statusData.map((item: ChartStatusData, index: number) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-2 flex items-center">
                      <div 
                        className="w-4 h-4 rounded mr-2" 
                        style={{ backgroundColor: COLORS[index] }}
                      ></div>
                      {item.name}
                    </td>
                    <td className="px-4 py-2 text-right font-medium">{item.value}</td>
                    <td className="px-4 py-2 text-right">{item.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Insights */}
      {productSummary && (
        <div className="mt-8 bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {parseFloat(productSummary.completion_percentage) >= 80 && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-medium text-green-800">🎉 Excelente Progreso</h3>
                <p className="text-sm text-green-700">El producto está muy avanzado con {productSummary.completion_percentage}% completado.</p>
              </div>
            )}
            
            {parseInt(productSummary.completed_tasks) > parseInt(productSummary.in_progress_tasks) && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-800">✅ Productividad Alta</h3>
                <p className="text-sm text-blue-700">Más tareas completadas que en progreso. ¡Buen ritmo!</p>
              </div>
            )}
            
            {parseInt(productSummary.total_tasks) > 0 && (
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h3 className="font-medium text-purple-800">📊 Análisis General</h3>
                <p className="text-sm text-purple-700">Total de {productSummary.total_tasks} tareas en el producto.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
