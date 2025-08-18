"use client"

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

interface Status {
  status_id: number;
  status_name: string;
}

interface Organization {
  org_id: number;
  org_name: string;
}

interface TaskDetailModalProps {
  taskId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated?: () => void;
  onTaskDeleted?: () => void;
}

function TaskDetailModal({ taskId, isOpen, onClose, onTaskUpdated, onTaskDeleted }: TaskDetailModalProps) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Task>({} as Task);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  useEffect(() => {
    if (taskId && isOpen) {
      fetchTaskDetails(taskId);
    }
  }, [taskId, isOpen]);

  useEffect(() => {
    if (task) {
      setEditedTask({ ...task });
    }
  }, [task]);

  useEffect(() => {
    if (isEditing) {
      fetchOptions();
    }
  }, [isEditing]);

  const fetchTaskDetails = async (id: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/task-details?taskId=${id}`);
      if (response.ok) {
        const data = await response.json();
        setTask(data.task);
      } else {
        console.error('Error fetching task details');
      }
    } catch (error) {
      console.error('Error fetching task details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const [statusesRes, orgsRes] = await Promise.all([
        fetch('/api/statuses'),
        fetch('/api/organizations')
      ]);
      
      if (statusesRes.ok) {
        const statusesData = await statusesRes.json();
        setStatuses(statusesData.statuses || []);
      }
      
      if (orgsRes.ok) {
        const orgsData = await orgsRes.json();
        setOrganizations(orgsData.organizations || []);
      }
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/update-task', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedTask),
      });

      if (response.ok) {
        setIsEditing(false);
        await fetchTaskDetails(taskId!);
        onTaskUpdated?.();
      } else {
        console.error('Error updating task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/delete-task?taskId=${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onTaskDeleted?.();
        onClose();
      } else {
        console.error('Error deleting task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (task) {
      setEditedTask({ ...task });
    }
  };

  const handleInputChange = (field: keyof Task, value: string | number) => {
    setEditedTask(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  if (loading && !task) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {isEditing ? 'Editar Tarea' : 'Detalle de Tarea'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <Input
                  value={editedTask.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Detalle
                </label>
                <textarea
                  value={editedTask.detail || ''}
                  onChange={(e) => handleInputChange('detail', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Inicio Planeado
                  </label>
                  <Input
                    type="datetime-local"
                    value={editedTask.start_planned ? new Date(editedTask.start_planned).toISOString().slice(0, 16) : ''}
                    onChange={(e) => handleInputChange('start_planned', e.target.value ? new Date(e.target.value).toISOString() : '')}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fin Planeado
                  </label>
                  <Input
                    type="datetime-local"
                    value={editedTask.end_planned ? new Date(editedTask.end_planned).toISOString().slice(0, 16) : ''}
                    onChange={(e) => handleInputChange('end_planned', e.target.value ? new Date(e.target.value).toISOString() : '')}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Inicio Real
                  </label>
                  <Input
                    type="datetime-local"
                    value={editedTask.start_actual ? new Date(editedTask.start_actual).toISOString().slice(0, 16) : ''}
                    onChange={(e) => handleInputChange('start_actual', e.target.value ? new Date(e.target.value).toISOString() : '')}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fin Real
                  </label>
                  <Input
                    type="datetime-local"
                    value={editedTask.end_actual ? new Date(editedTask.end_actual).toISOString().slice(0, 16) : ''}
                    onChange={(e) => handleInputChange('end_actual', e.target.value ? new Date(e.target.value).toISOString() : '')}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  value={editedTask.status_id || ''}
                  onChange={(e) => handleInputChange('status_id', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar estado</option>
                  {Array.isArray(statuses) && statuses.map((status) => (
                    <option key={status.status_id} value={status.status_id}>
                      {status.status_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organización
                </label>
                <select
                  value={editedTask.org_id || ''}
                  onChange={(e) => handleInputChange('org_id', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar organización</option>
                  {Array.isArray(organizations) && organizations.map((org) => (
                    <option key={org.org_id} value={org.org_id}>
                      {org.org_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-in Oro Verde
                  </label>
                  <Input
                    type="datetime-local"
                    value={editedTask.checkin_oro_verde ? new Date(editedTask.checkin_oro_verde).toISOString().slice(0, 16) : ''}
                    onChange={(e) => handleInputChange('checkin_oro_verde', e.target.value ? new Date(e.target.value).toISOString() : '')}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-in Usuario
                  </label>
                  <Input
                    type="datetime-local"
                    value={editedTask.checkin_user ? new Date(editedTask.checkin_user).toISOString().slice(0, 16) : ''}
                    onChange={(e) => handleInputChange('checkin_user', e.target.value ? new Date(e.target.value).toISOString() : '')}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-in Comunicación
                  </label>
                  <Input
                    type="datetime-local"
                    value={editedTask.checkin_communication ? new Date(editedTask.checkin_communication).toISOString().slice(0, 16) : ''}
                    onChange={(e) => handleInputChange('checkin_communication', e.target.value ? new Date(e.target.value).toISOString() : '')}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-in Género
                  </label>
                  <Input
                    type="datetime-local"
                    value={editedTask.checkin_gender ? new Date(editedTask.checkin_gender).toISOString().slice(0, 16) : ''}
                    onChange={(e) => handleInputChange('checkin_gender', e.target.value ? new Date(e.target.value).toISOString() : '')}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{task.name}</h3>
                {task.detail && (
                  <p className="text-gray-600 mt-2">{task.detail}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Fase</p>
                  <p className="text-gray-900">{task.phase_name || 'Sin fase'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Estado</p>
                  <p className="text-gray-900">{task.status_name || 'Sin estado'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Organización</p>
                  <p className="text-gray-900">{task.org_name || 'Sin organización'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Producto</p>
                  <p className="text-gray-900">{task.product_name || 'Sin producto'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Inicio Planeado</p>
                  <p className="text-gray-900">
                    {task.start_planned ? new Date(task.start_planned).toLocaleString('es-ES') : 'No definido'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Fin Planeado</p>
                  <p className="text-gray-900">
                    {task.end_planned ? new Date(task.end_planned).toLocaleString('es-ES') : 'No definido'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Inicio Real</p>
                  <p className="text-gray-900">
                    {task.start_actual ? new Date(task.start_actual).toLocaleString('es-ES') : 'No definido'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Fin Real</p>
                  <p className="text-gray-900">
                    {task.end_actual ? new Date(task.end_actual).toLocaleString('es-ES') : 'No definido'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Check-ins:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Oro Verde:</span> {task.checkin_oro_verde ? new Date(task.checkin_oro_verde).toLocaleString('es-ES') : 'No definido'}
                  </div>
                  <div>
                    <span className="font-medium">Usuario:</span> {task.checkin_user ? new Date(task.checkin_user).toLocaleString('es-ES') : 'No definido'}
                  </div>
                  <div>
                    <span className="font-medium">Comunicación:</span> {task.checkin_communication ? new Date(task.checkin_communication).toLocaleString('es-ES') : 'No definido'}
                  </div>
                  <div>
                    <span className="font-medium">Género:</span> {task.checkin_gender ? new Date(task.checkin_gender).toLocaleString('es-ES') : 'No definido'}
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 mt-4">
                <p>Creado: {new Date(task.created_at).toLocaleString('es-ES')}</p>
                <p>Actualizado: {new Date(task.updated_at).toLocaleString('es-ES')}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 p-6 border-t">
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                onClick={handleCancelEdit}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={handleEdit}
                disabled={loading}
              >
                Editar
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDelete}
                disabled={loading}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                {loading ? 'Eliminando...' : 'Eliminar'}
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cerrar
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default TaskDetailModal;
