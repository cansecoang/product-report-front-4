'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import GanttChart from '@/components/gantt-chart';

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
  product_id: number;
  product_name?: string;
  indicator_id?: number;
  indicator_name?: string;
  responsible_id?: number;
  responsible_name?: string;
  created_at: string;
  updated_at: string;
}

// Interfaz para los datos que vienen de la API
interface ApiTask {
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
  product_id: number;
  product_name?: string;
  indicator_id?: number;
  indicator_name?: string;
  org_id?: number;
  org_name?: string;
  created_at?: string;
  updated_at?: string;
}

export default function GanttPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="text-muted-foreground">Cargando...</div></div>}>
      <GanttPageContent />
    </Suspense>
  );
}

function GanttPageContent() {
  console.log('🔧 GanttPage component initialized');
  console.log('🔧 useEffect imported?', typeof useEffect);
  console.log('🔧 useState imported?', typeof useState);
  
  const searchParams = useSearchParams();
  console.log('🔧 searchParams obtained:', searchParams);
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  console.log('🔍 GanttPage render state:', {
    tasksLength: tasks.length,
    loading,
    selectedProductId,
    urlProductId: searchParams.get('productId'),
    tasks: tasks.map(t => ({ id: t.id, name: t.name }))
  });

  // Función para cargar tasks con useCallback
  const fetchTasks = useCallback(async (productId: string) => {
    console.log('🔄 fetchTasks called with productId:', productId);
    setLoading(true);
    try {
      const url = `/api/product-tasks?productId=${productId}&limit=1000`;
      console.log('🌐 Fetching from URL:', url);
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 API response:', data);
        
        // Mapear las tareas de la API al formato que espera GanttChart
        const mappedTasks = (data.tasks || []).map((task: ApiTask) => ({
          id: task.id,
          name: task.name,
          detail: task.detail,
          start_planned: task.start_planned,
          end_planned: task.end_planned,
          start_actual: task.start_actual,
          end_actual: task.end_actual,
          checkin_oro_verde: task.checkin_oro_verde,
          checkin_user: task.checkin_user,
          checkin_communication: task.checkin_communication,
          checkin_gender: task.checkin_gender,
          phase_id: task.phase_id,
          phase_name: task.phase_name,
          status_id: task.status_id,
          status_name: task.status_name,
          product_id: task.product_id,
          product_name: task.product_name,
          indicator_id: task.indicator_id,
          indicator_name: task.indicator_name,
          responsible_id: task.org_id,
          responsible_name: task.org_name,
          created_at: task.created_at || new Date().toISOString(),
          updated_at: task.updated_at || new Date().toISOString(),
        }));
        
        setTasks(mappedTasks);
        console.log('✅ Tasks loaded and mapped:', mappedTasks.length);
      } else {
        console.error('❌ Error response:', response.status);
        setTasks([]);
      }
    } catch (error) {
      console.error('❌ Fetch error:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []); // Sin dependencias porque no usa ningún state o prop externo

  // Función para refrescar datos
  const refreshData = () => {
    if (selectedProductId) {
      fetchTasks(selectedProductId);
    }
  };

  // Test useEffect sin dependencias
  console.log('🔥 Código antes del useEffect');
  
  useEffect(() => {
    console.log('🎯 useEffect SIMPLE ejecutado');
  });

  console.log('🔥 Código después del useEffect');

  // useEffect principal que carga las tareas
  useEffect(() => {
    console.log('🚀 useEffect EJECUTADO');
    
    const urlProductId = searchParams.get('productId');
    console.log('🔍 URL productId detectado:', urlProductId);
    
    if (urlProductId) {
      console.log('📦 Actualizando selectedProductId a:', urlProductId);
      setSelectedProductId(urlProductId);
      
      console.log('📦 Iniciando carga de tareas para producto:', urlProductId);
      
      // Función fetch dentro del useEffect para evitar dependencias problemáticas
      const fetchTasksInternal = async () => {
        console.log('🔄 fetchTasksInternal called with productId:', urlProductId);
        setLoading(true);
        try {
          const url = `/api/product-tasks?productId=${urlProductId}&limit=1000`;
          console.log('🌐 Fetching from URL:', url);
          const response = await fetch(url);
          
          if (response.ok) {
            const data = await response.json();
            console.log('📊 API response:', data);
            
            // Mapear las tareas de la API al formato que espera GanttChart
            const mappedTasks = (data.tasks || []).map((task: ApiTask) => ({
              id: task.id,
              name: task.name,
              detail: task.detail,
              start_planned: task.start_planned,
              end_planned: task.end_planned,
              start_actual: task.start_actual,
              end_actual: task.end_actual,
              checkin_oro_verde: task.checkin_oro_verde,
              checkin_user: task.checkin_user,
              checkin_communication: task.checkin_communication,
              checkin_gender: task.checkin_gender,
              phase_id: task.phase_id,
              phase_name: task.phase_name,
              status_id: task.status_id,
              status_name: task.status_name,
              product_id: task.product_id,
              product_name: task.product_name,
              indicator_id: task.indicator_id,
              indicator_name: task.indicator_name,
              responsible_id: task.org_id,
              responsible_name: task.org_name,
              created_at: task.created_at || new Date().toISOString(),
              updated_at: task.updated_at || new Date().toISOString(),
            }));
            
            setTasks(mappedTasks);
            console.log('✅ Tasks loaded and mapped:', mappedTasks.length);
          } else {
            console.error('❌ Error response:', response.status);
            setTasks([]);
          }
        } catch (error) {
          console.error('❌ Fetch error:', error);
          setTasks([]);
        } finally {
          setLoading(false);
        }
      };
      
      fetchTasksInternal();
    } else {
      console.log('❌ No hay productId en URL');
    }
  }, [searchParams]); // Solo searchParams

  return (
    <div className="space-y-4 w-full overflow-hidden" style={{ maxWidth: "100%" }}>
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="text-muted-foreground">Cargando tareas...</div>
          </div>
        )}
        
        {!loading && !selectedProductId && (
          <div className="flex justify-center items-center h-64">
            <div className="text-muted-foreground">
              Selecciona un producto para ver su diagrama de Gantt
            </div>
          </div>
        )}
        
        {!loading && selectedProductId && tasks.length === 0 && (
          <div className="flex justify-center items-center h-64">
            <div className="text-muted-foreground">
              No hay tareas para mostrar en el producto {selectedProductId}
            </div>
          </div>
        )}
        
        {!loading && selectedProductId && tasks.length > 0 && (
          <div>
            <GanttChart tasks={tasks} refreshData={refreshData} />
          </div>
        )}
    </div>
  );
}