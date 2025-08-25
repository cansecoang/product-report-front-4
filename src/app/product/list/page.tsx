"use client"

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import ColumnCustomizer from "@/components/column-customizer";
import TaskDetailModal from "@/components/task-detail-modal";

// Interface para las tareas - usando la estructura exacta del query proporcionado
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

interface Column {
  key: string;
  label: string;
  visible: boolean;
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface Phase {
  phase_id: number;
  phase_name: string;
  task_count: number;
}

export default function TasksListPage() {
  const searchParams = useSearchParams();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });
  
  // Columnas disponibles - basadas en los alias del query proporcionado
  const [columns, setColumns] = useState<Column[]>([
    { key: 'name', label: 'Task Name', visible: true },
    { key: 'status_name', label: 'Status', visible: true },
    { key: 'start_planned', label: 'Start Date', visible: true },
    { key: 'end_planned', label: 'End Date', visible: true },
    { key: 'phase_name', label: 'Phase', visible: true },
    { key: 'org_name', label: 'Organization', visible: true },
  ]);

  // 🎯 URL-FIRST: Producto seleccionado viene de la URL
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  
  // Estados para las fases y filtrado
  const [phases, setPhases] = useState<Phase[]>([]);
  const [selectedPhaseId, setSelectedPhaseId] = useState<number | null>(null);
  const [totalTasks, setTotalTasks] = useState(0); // Para almacenar el total real
  
  // Estado para el modal de detalle de tarea
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // 🎯 URL-FIRST: Detectar productId desde la URL
  useEffect(() => {
    const urlProductId = searchParams.get('productId');
    console.log('🔗 TasksList: ProductId desde URL:', urlProductId);
    
    if (urlProductId !== selectedProductId) {
      console.log('📦 Product changed to:', urlProductId);
      setSelectedProductId(urlProductId);
      
      if (urlProductId) {
        setCurrentPage(1); // Reset página al cambiar producto
        setSelectedPhaseId(null); // Reset filtro de fase
      } else {
        setTasks([]); // Limpiar tareas si no hay producto
        setPhases([]); // Limpiar fases si no hay producto
        setTotalTasks(0); // Limpiar total de tareas
      }
    }
  }, [searchParams, selectedProductId]);

  const handleTaskClick = (taskId: number) => {
    setSelectedTaskId(taskId);
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setSelectedTaskId(null);
  };

  const handleTaskAdded = () => {
    // Recargar las tareas y fases cuando se agrega una nueva tarea
    if (selectedProductId) {
      fetchPhases(selectedProductId);
      loadTasks(selectedProductId, currentPage, sortConfig, selectedPhaseId);
    }
  };

  const fetchTasks = useCallback(async (productId: string, page: number, sort: SortConfig, phaseId: number | null = null) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        productId,
        page: page.toString(),
        limit: '10',
        sortBy: sort.key,
        sortOrder: sort.direction
      });

      if (phaseId !== null) {
        params.append('phaseId', phaseId.toString());
      }

      const response = await fetch(`/api/product-tasks?${params}`);
      const data = await response.json();
      
      setTasks(data.tasks || []);
      setTotalPages(data.pagination?.totalPages || 1);
      
      // Si no hay filtro de fase, también actualizamos el total de tareas
      if (phaseId === null) {
        setTotalTasks(data.pagination?.totalCount || data.tasks?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para obtener el total de tareas sin filtro de fase
  const fetchTotalTasks = useCallback(async (productId: string) => {
    try {
      const response = await fetch(`/api/product-tasks?productId=${productId}&page=1&limit=1`);
      const data = await response.json();
      setTotalTasks(data.pagination?.totalCount || 0);
    } catch (error) {
      console.error('Error fetching total tasks:', error);
      setTotalTasks(0);
    }
  }, []);

  // Función para obtener las fases
  const fetchPhases = useCallback(async (productId: string) => {
    try {
      const response = await fetch(`/api/product-phases?productId=${productId}`);
      const data = await response.json();
      setPhases(data.phases || []);
    } catch (error) {
      console.error('Error fetching phases:', error);
      setPhases([]);
    }
  }, []);

  // Función para cargar tareas
  const loadTasks = useCallback((productId: string, page: number = 1, sort: SortConfig = sortConfig, phaseId: number | null = selectedPhaseId) => {
    console.log('🔄 Loading tasks for product:', productId, 'page:', page, 'phase:', phaseId);
    fetchTasks(productId, page, sort, phaseId);
  }, [fetchTasks, sortConfig, selectedPhaseId]);

  // 🎯 URL-FIRST: Cargar datos cuando cambia el producto desde la URL
  useEffect(() => {
    const urlProductId = searchParams.get('productId');
    console.log('🔗 TasksList: ProductId desde URL:', urlProductId);
    
    if (urlProductId !== selectedProductId) {
      console.log('📦 Product changed to:', urlProductId);
      setSelectedProductId(urlProductId);
      
      if (urlProductId) {
        setCurrentPage(1); // Reset página al cambiar producto
        setSelectedPhaseId(null); // Reset filtro de fase
      } else {
        setTasks([]); // Limpiar tareas si no hay producto
        setPhases([]); // Limpiar fases si no hay producto
        setTotalTasks(0); // Limpiar total de tareas
      }
    }
  }, [searchParams, selectedProductId]);

  // 🎯 Cargar datos cuando tenemos un productId válido
  useEffect(() => {
    if (selectedProductId) {
      fetchPhases(selectedProductId);
      fetchTotalTasks(selectedProductId);
      loadTasks(selectedProductId, currentPage, sortConfig, selectedPhaseId);
    }
  }, [selectedProductId, currentPage, sortConfig, selectedPhaseId, fetchPhases, fetchTotalTasks, loadTasks]);

  // Función para manejar el cambio de fase
  const handlePhaseChange = (phaseId: number | null) => {
    setSelectedPhaseId(phaseId);
    setCurrentPage(1); // Reset página al cambiar filtro
    if (selectedProductId) {
      loadTasks(selectedProductId, 1, sortConfig, phaseId);
    }
  };

  const handleSort = (columnKey: string) => {
    const newDirection: 'asc' | 'desc' = sortConfig.key === columnKey && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    const newSortConfig = { key: columnKey, direction: newDirection };
    setSortConfig(newSortConfig);
    
    if (selectedProductId) {
      fetchTasks(selectedProductId, currentPage, newSortConfig);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (selectedProductId) {
      fetchTasks(selectedProductId, page, sortConfig);
    }
  };

  const visibleColumns = columns.filter(col => col.visible);

  const renderSortIcon = (columnKey: string) => {
    if (sortConfig.key !== columnKey) {
      return (
        <svg className="w-4 h-4 ml-1 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return sortConfig.direction === 'asc' ? (
      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  if (!selectedProductId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-lg font-medium mb-2">No hay producto seleccionado</h2>
          <p className="text-muted-foreground">Selecciona un producto del menú superior para ver las tareas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8">
      {/* Pestañas de filtrado por fase */}
      <div className="flex items-center justify-between">
        {/* Pestañas de fases */}
        <div className="flex items-center space-x-1">
          {/* Pestaña "All" */}
          <button
            onClick={() => handlePhaseChange(null)}
            className={`px-6 py-2 text-sm font-medium border-b-2 transition-colors ${
              selectedPhaseId === null
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            Outline
            <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded-full">
              {totalTasks}
            </span>
          </button>
          
          {/* Pestañas de fases */}
          {phases.map((phase) => (
            <button
              key={phase.phase_id}
              onClick={() => handlePhaseChange(phase.phase_id)}
              className={`px-6 py-2 text-sm font-medium border-b-2 transition-colors ${
                selectedPhaseId === phase.phase_id
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              {phase.phase_name}
              <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded-full">
                {phase.task_count}
              </span>
            </button>
          ))}
        </div>

        {/* Controles de la derecha */}
        <div className="flex items-center gap-2">
          {/* Customize Columns */}
          <ColumnCustomizer columns={columns} onColumnsChange={setColumns} />
        </div>
      </div>

      {/* Tabla de tareas */}
      <div className="border rounded-lg overflow-hidden">
        {/* Header de tabla */}
        <div className="bg-gray-50 border-b">
          <div className="grid gap-4 p-4" style={{ gridTemplateColumns: `repeat(${visibleColumns.length}, 1fr)` }}>
            {visibleColumns.map((column) => (
              <button
                key={column.key}
                onClick={() => handleSort(column.key)}
                className="flex items-center justify-start text-left font-medium text-gray-700 hover:text-gray-900"
              >
                {column.label}
                {renderSortIcon(column.key)}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido de tabla */}
        <div className="bg-white">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-500">Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No tasks found for the selected criteria.
            </div>
          ) : (
            tasks.map((task, index) => (
              <div
                key={task.id}
                className={`grid gap-4 p-4 border-b hover:bg-blue-50 cursor-pointer transition-colors ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                }`}
                style={{ gridTemplateColumns: `repeat(${visibleColumns.length}, 1fr)` }}
                onClick={() => handleTaskClick(task.id)}
                title="Click to view task details"
              >
                {visibleColumns.map((column) => (
                  <div key={column.key} className="text-sm">
                    {column.key === 'name' && task.name}
                    {column.key === 'status_name' && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        task.status_name === 'Done' || task.status_name === 'Completed'
                          ? 'bg-green-100 text-green-800'
                          : task.status_name === 'In Process' || task.status_name === 'In Progress'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status_name || 'Pending'}
                      </span>
                    )}
                    {column.key === 'start_planned' && (
                      task.start_planned ? new Date(task.start_planned).toLocaleDateString() : '-'
                    )}
                    {column.key === 'end_planned' && (
                      task.end_planned ? new Date(task.end_planned).toLocaleDateString() : '-'
                    )}
                    {column.key === 'phase_name' && (task.phase_name || '-')}
                    {column.key === 'org_name' && (task.org_name || 'Not assigned')}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Paginación (cuadro rojo) */}
      <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last
            </Button>
          </div>
          
          <div className="text-sm text-gray-700">
            Rows per page: 10
          </div>
        </div>
      </div>

      {/* Modal de detalle de tarea */}
      <TaskDetailModal
        taskId={selectedTaskId}
        isOpen={isTaskModalOpen}
        onClose={closeTaskModal}
        onTaskUpdated={handleTaskAdded}
        onTaskDeleted={handleTaskAdded}
      />
    </div>
  );
}

