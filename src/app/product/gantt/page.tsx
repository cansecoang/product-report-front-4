"use client"

import { useState, useEffect } from 'react';
import GanttChart from "@/components/gantt-chart";

interface Task {
  id: number;
  name: string;
  detail?: string;
  start_planned?: string;
  end_planned?: string;
  start_actual?: string;
  end_actual?: string;
  checkin_oro_verde?: string;
  checkin_user?: string;
  checkin_communication?: string;
  checkin_gender?: string;
  phase_id: number;
  phase_name?: string;
  status_id: number;
  status_name?: string;
  org_id?: number;
  org_name?: string;
  product_id: number;
  product_name?: string;
  created_at: string;
  updated_at: string;
}

export default function GanttPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Fetch tasks para el producto seleccionado - igual que en la página de lista
  const fetchTasks = async (productId: string) => {
    setLoading(true);
    try {
      // Obtenemos todas las tareas del producto seleccionado (sin paginación para el gantt)
      const response = await fetch(`/api/product-tasks?productId=${productId}&limit=1000`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || []);
        console.log('📊 Tareas cargadas para gantt:', data.tasks?.length || 0);
      } else {
        console.error('Error fetching tasks for gantt');
        setTasks([]);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // Escuchar cambios en localStorage - igual que en la página de lista
  useEffect(() => {
    const checkProductSelection = () => {
      const productId = localStorage.getItem('selectedProductId');
      if (productId !== selectedProductId) {
        console.log('📦 Product changed in gantt to:', productId);
        setSelectedProductId(productId);
        if (productId) {
          fetchTasks(productId);
        } else {
          setTasks([]);
          setLoading(false);
        }
      }
    };

    // Check initial state
    checkProductSelection();

    // Listen for storage changes
    const handleStorageChange = () => {
      checkProductSelection();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically in case of same-tab changes
    const interval = setInterval(checkProductSelection, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [selectedProductId]);

  const refreshData = () => {
    if (selectedProductId) {
      fetchTasks(selectedProductId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Cargando tareas para el gantt chart...</div>
      </div>
    );
  }

  if (!selectedProductId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Selecciona un producto para ver el gantt chart</div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">No hay tareas para mostrar en el gantt chart</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Gantt Chart - Producto {selectedProductId}
          </h1>
          <p className="text-gray-600">
            {tasks.length} tareas encontradas
          </p>
        </div>
        <GanttChart tasks={tasks} refreshData={refreshData} />
      </div>
    </div>
  );
}
