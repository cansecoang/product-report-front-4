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
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Scatter,
  ScatterChart,
  ZAxis
} from "recharts";

interface IndicatorData {
  indicator_id: number;
  indicator_name: string;
  indicator_description: string;
  indicator_unit: string;
  target_value: number;
  product_id: number;
  product_name: string;
  country: string;
  delivery_date: string;
  total_tasks: number;
  completed_tasks: number;
  avg_duration_days: number;
}

export default function IndicatorsMetricsPage() {
  const [indicators, setIndicators] = useState<IndicatorData[]>([]);
  const [loading, setLoading] = useState(true);

  // Colores para los charts
  const COLORS = ["#CB1973", "#1f2b48", "#7389BE", "#C0C6D2", "#E91E63", "#2196F3"];

  // Fetch datos de indicadores
  const fetchIndicators = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/indicators-metrics');
      if (response.ok) {
        const data = await response.json();
        setIndicators(data.indicators || []);
        console.log('📊 Indicadores cargados:', data.indicators?.length || 0);
      } else {
        console.error('Error fetching indicators');
        setIndicators([]);
      }
    } catch (error) {
      console.error('Error fetching indicators:', error);
      setIndicators([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndicators();
  }, []);

  // Procesar datos para diferentes charts
  const processChartsData = (indicators: IndicatorData[]) => {
    // 1. Progress por Indicador (Pie Chart)
    const progressByIndicator = indicators.map(ind => ({
      name: ind.indicator_name,
      progress: ind.total_tasks > 0 ? Math.round((ind.completed_tasks / ind.total_tasks) * 100) : 0,
      completed: ind.completed_tasks,
      total: ind.total_tasks
    }));

    // 2. Productos por País (Bar Chart)
    const productsByCountry = indicators.reduce((acc, ind) => {
      const existing = acc.find(item => item.country === ind.country);
      if (existing) {
        existing.products += 1;
        existing.totalTasks += ind.total_tasks;
        existing.completedTasks += ind.completed_tasks;
      } else {
        acc.push({
          country: ind.country,
          products: 1,
          totalTasks: ind.total_tasks,
          completedTasks: ind.completed_tasks
        });
      }
      return acc;
    }, [] as Array<{country: string; products: number; totalTasks: number; completedTasks: number}>);

    // 3. Timeline de Entregas (Line Chart)
    const deliveryTimeline = indicators.map(ind => ({
      product: ind.product_name.substring(0, 15) + '...',
      month: new Date(ind.delivery_date).toLocaleDateString('es', { month: 'short', year: 'numeric' }),
      progress: ind.total_tasks > 0 ? Math.round((ind.completed_tasks / ind.total_tasks) * 100) : 0,
      indicator: ind.indicator_name
    })).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

    // 4. Duración Promedio por Indicador (Area Chart)
    const durationByIndicator = indicators.map(ind => ({
      indicator: ind.indicator_name,
      duration: Math.round(ind.avg_duration_days || 0),
      progress: ind.total_tasks > 0 ? Math.round((ind.completed_tasks / ind.total_tasks) * 100) : 0
    }));

    // 5. Performance Radar (Radar Chart)
    const radarData = indicators.slice(0, 6).map(ind => ({
      indicator: ind.indicator_name.substring(0, 10),
      progress: ind.total_tasks > 0 ? Math.round((ind.completed_tasks / ind.total_tasks) * 100) : 0,
      efficiency: ind.avg_duration_days ? Math.max(0, 100 - (ind.avg_duration_days * 2)) : 50,
      target: 100
    }));

    // 6. Scatter: Tareas vs Progreso (Scatter Chart)
    const scatterData = indicators.map(ind => ({
      name: ind.product_name.substring(0, 15),
      tasks: ind.total_tasks,
      progress: ind.total_tasks > 0 ? Math.round((ind.completed_tasks / ind.total_tasks) * 100) : 0,
      indicator: ind.indicator_name
    }));

    return {
      progressByIndicator,
      productsByCountry,
      deliveryTimeline,
      durationByIndicator,
      radarData,
      scatterData
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Cargando métricas de indicadores...</div>
      </div>
    );
  }

  if (indicators.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">No hay datos de indicadores para mostrar</div>
      </div>
    );
  }

  const chartsData = processChartsData(indicators);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Métricas de Indicadores
          </h1>
          <p className="text-gray-600">
            {indicators.length} indicadores analizados
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          
          {/* 1. Pie Chart - Progress por Indicador */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Progreso por Indicador</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartsData.progressByIndicator}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="progress"
                >
                  {chartsData.progressByIndicator.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Progreso']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 2. Bar Chart - Productos por País */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Productos por País</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartsData.productsByCountry}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="country" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="products" fill="#CB1973" name="Productos" />
                <Bar dataKey="totalTasks" fill="#1f2b48" name="Total Tareas" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 3. Line Chart - Timeline de Entregas */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Timeline de Entregas</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartsData.deliveryTimeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="progress" 
                  stroke="#CB1973" 
                  strokeWidth={3}
                  name="Progreso %" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 4. Area Chart - Duración vs Progreso */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Duración Promedio</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartsData.durationByIndicator}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="indicator" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="duration" 
                  stroke="#1f2b48" 
                  fill="#7389BE" 
                  name="Días promedio"
                />
                <Area 
                  type="monotone" 
                  dataKey="progress" 
                  stroke="#CB1973" 
                  fill="#E91E63" 
                  name="Progreso %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* 5. Radar Chart - Performance Global */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Performance Radar</h2>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={chartsData.radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="indicator" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="Progreso"
                  dataKey="progress"
                  stroke="#CB1973"
                  fill="#CB1973"
                  fillOpacity={0.3}
                />
                <Radar
                  name="Eficiencia"
                  dataKey="efficiency"
                  stroke="#1f2b48"
                  fill="#1f2b48"
                  fillOpacity={0.3}
                />
                <Tooltip />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* 6. Scatter Chart - Tareas vs Progreso */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Tareas vs Progreso</h2>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={chartsData.scatterData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tasks" name="Tareas" />
                <YAxis dataKey="progress" name="Progreso %" />
                <ZAxis dataKey="tasks" range={[50, 400]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  formatter={(value, name) => [
                    name === 'tasks' ? `${value} tareas` : `${value}%`,
                    name === 'tasks' ? 'Total Tareas' : 'Progreso'
                  ]}
                />
                <Scatter fill="#CB1973" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

        </div>

        {/* Resumen de Indicadores */}
        <div className="mt-8 bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Resumen de Indicadores</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {indicators.map((indicator) => (
              <div key={indicator.indicator_id} className="p-4 border rounded-lg bg-gray-50">
                <h3 className="font-semibold text-sm">{indicator.indicator_name}</h3>
                <p className="text-xs text-gray-600 mb-2">{indicator.product_name}</p>
                <div className="flex justify-between text-sm">
                  <span>Progreso:</span>
                  <span className="font-semibold">
                    {indicator.total_tasks > 0 ? 
                      Math.round((indicator.completed_tasks / indicator.total_tasks) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>País:</span>
                  <span>{indicator.country}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tareas:</span>
                  <span>{indicator.completed_tasks}/{indicator.total_tasks}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
