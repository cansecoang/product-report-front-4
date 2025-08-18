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
  Area
} from "recharts";

interface Task {
  id: number;
  name: string;
  start_planned?: string;
  end_planned?: string;
  start_actual?: string;
  end_actual?: string;
  phase_id: number;
  phase_name?: string;
  status_id: number;
  status_name?: string;
  created_at: string;
  updated_at: string;
}

interface MetricsData {
  productProgress: Array<{ name: string; value: number }>;
  statusSummary: Array<{ status: string; count: number }>;
  progressTimeline: Array<{ name: string; progress: number }>;
  phaseDistribution: Array<{ name: string; value: number }>;
}

export default function MetricsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [metricsData, setMetricsData] = useState<MetricsData>({
    productProgress: [],
    statusSummary: [],
    progressTimeline: [],
    phaseDistribution: []
  });

  const COLORS = ["#CB1973", "#C0C6D2"]; // Rosa y gris

  // Fetch tasks para el producto seleccionado
  const fetchTasks = async (productId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/product-tasks?productId=${productId}&limit=1000`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || []);
        console.log('📊 Tareas cargadas para métricas:', data.tasks?.length || 0);
      } else {
        console.error('Error fetching tasks for metrics');
        setTasks([]);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // Procesar tareas para generar datos de métricas
  const processMetricsData = (tasks: Task[]): MetricsData => {
    if (tasks.length === 0) {
      return {
        productProgress: [],
        statusSummary: [],
        progressTimeline: [],
        phaseDistribution: []
      };
    }

    // 1. Product Progress (completadas vs pendientes)
    const completedTasks = tasks.filter(task => 
      task.status_name && ['completed', 'done', 'finished', 'completada'].includes(task.status_name.toLowerCase())
    ).length;
    const pendingTasks = tasks.length - completedTasks;
    
    const productProgress = [
      { name: 'Completed', value: completedTasks },
      { name: 'Pending', value: pendingTasks }
    ];

    // 2. Status Summary (agrupado por estado)
    const statusGroups = tasks.reduce((acc, task) => {
      const status = task.status_name || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusSummary = Object.entries(statusGroups).map(([status, count]) => ({
      status,
      count
    }));

    // 3. Progress Timeline (por mes de creación)
    const timelineGroups = tasks.reduce((acc, task) => {
      const date = new Date(task.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      acc[monthKey] = (acc[monthKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const progressTimeline = Object.entries(timelineGroups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, progress]) => ({
        name: month,
        progress
      }));

    // 4. Phase Distribution (agrupado por fase)
    const phaseGroups = tasks.reduce((acc, task) => {
      const phase = task.phase_name || 'Unknown';
      acc[phase] = (acc[phase] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const phaseDistribution = Object.entries(phaseGroups).map(([name, value]) => ({
      name,
      value
    }));

    return {
      productProgress,
      statusSummary,
      progressTimeline,
      phaseDistribution
    };
  };

  // Escuchar cambios en localStorage
  useEffect(() => {
    const checkProductSelection = () => {
      const productId = localStorage.getItem('selectedProductId');
      if (productId !== selectedProductId) {
        console.log('📦 Product changed in metrics to:', productId);
        setSelectedProductId(productId);
        if (productId) {
          fetchTasks(productId);
        } else {
          setTasks([]);
          setLoading(false);
        }
      }
    };

    checkProductSelection();
    window.addEventListener('storage', checkProductSelection);
    const interval = setInterval(checkProductSelection, 1000);

    return () => {
      window.removeEventListener('storage', checkProductSelection);
      clearInterval(interval);
    };
  }, [selectedProductId]);

  // Actualizar métricas cuando cambien las tareas
  useEffect(() => {
    const newMetricsData = processMetricsData(tasks);
    setMetricsData(newMetricsData);
  }, [tasks]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Cargando métricas...</div>
      </div>
    );
  }

  if (!selectedProductId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Selecciona un producto para ver las métricas</div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">No hay tareas para mostrar métricas</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Métricas - Producto {selectedProductId}
          </h1>
          <p className="text-gray-600">
            {tasks.length} tareas analizadas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pie Chart - Product Progress */}
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-semibold mb-2">Product Progress</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={metricsData.productProgress}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {metricsData.productProgress.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart - Task Status */}
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-semibold mb-2">Task Status</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={metricsData.statusSummary}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#CB1973" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Line Chart - Progress Over Time */}
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-semibold mb-2">Progress Over Time</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={metricsData.progressTimeline}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="progress" stroke="#CB1973" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Area Chart - Phase Distribution */}
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-semibold mb-2">Phase Distribution</h2>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={metricsData.phaseDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="value" stroke="#1f2b48" fill="#7389BE" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
