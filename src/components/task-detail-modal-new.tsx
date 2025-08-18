"use client"

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Task {
  id: number;
  activity: string;
  subactivity?: string;
  checkin?: string;
  checkout?: string;
  status_name?: string;
  organization_name?: string;
  work_package: string;
  phase_name?: string;
  days_required?: number;
  priority?: string;
  notes?: string;
  assigned_user?: string;
  status_id?: number;
  organization_id?: number;
  phase_id?: number;
}

interface Status {
  id: number;
  name: string;
}

interface Organization {
  organization_id: number;
  name: string;
}

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated?: () => void;
  onTaskDeleted?: () => void;
}

const TaskDetailModal = ({ task, isOpen, onClose, onTaskUpdated, onTaskDeleted }: TaskDetailModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Task>({} as Task);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setEditedTask({ ...task });
    }
  }, [task]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [statusesRes, orgsRes] = await Promise.all([
          fetch('/api/statuses'),
          fetch('/api/organizations')
        ]);
        
        if (statusesRes.ok) {
          const statusesData = await statusesRes.json();
          setStatuses(statusesData);
        }
        
        if (orgsRes.ok) {
          const orgsData = await orgsRes.json();
          setOrganizations(orgsData);
        }
      } catch (error) {
        console.error('Error fetching options:', error);
      }
    };

    if (isEditing) {
      fetchOptions();
    }
  }, [isEditing]);

  if (!isOpen || !task) return null;

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
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
        onTaskUpdated?.();
        onClose();
      } else {
        console.error('Error updating task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/delete-task', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: task.id }),
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
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedTask({ ...task });
  };

  const handleInputChange = (field: keyof Task, value: string | number) => {
    setEditedTask(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
                  Actividad
                </label>
                <Input
                  value={editedTask.activity || ''}
                  onChange={(e) => handleInputChange('activity', e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subactividad
                </label>
                <Input
                  value={editedTask.subactivity || ''}
                  onChange={(e) => handleInputChange('subactivity', e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-in
                  </label>
                  <Input
                    type="datetime-local"
                    value={editedTask.checkin ? new Date(editedTask.checkin).toISOString().slice(0, 16) : ''}
                    onChange={(e) => handleInputChange('checkin', e.target.value ? new Date(e.target.value).toISOString() : '')}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-out
                  </label>
                  <Input
                    type="datetime-local"
                    value={editedTask.checkout ? new Date(editedTask.checkout).toISOString().slice(0, 16) : ''}
                    onChange={(e) => handleInputChange('checkout', e.target.value ? new Date(e.target.value).toISOString() : '')}
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
                  {statuses.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organización
                </label>
                <select
                  value={editedTask.organization_id || ''}
                  onChange={(e) => handleInputChange('organization_id', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar organización</option>
                  {organizations.map((org) => (
                    <option key={org.organization_id} value={org.organization_id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Package
                </label>
                <Input
                  value={editedTask.work_package || ''}
                  onChange={(e) => handleInputChange('work_package', e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Días Requeridos
                  </label>
                  <Input
                    type="number"
                    value={editedTask.days_required || ''}
                    onChange={(e) => handleInputChange('days_required', parseInt(e.target.value) || 0)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prioridad
                  </label>
                  <select
                    value={editedTask.priority || ''}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar prioridad</option>
                    <option value="Baja">Baja</option>
                    <option value="Media">Media</option>
                    <option value="Alta">Alta</option>
                    <option value="Crítica">Crítica</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario Asignado
                </label>
                <Input
                  value={editedTask.assigned_user || ''}
                  onChange={(e) => handleInputChange('assigned_user', e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas
                </label>
                <textarea
                  value={editedTask.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{task.activity}</h3>
                {task.subactivity && (
                  <p className="text-gray-600">{task.subactivity}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Work Package</p>
                  <p className="text-gray-900">{task.work_package}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Fase</p>
                  <p className="text-gray-900">{task.phase_name || 'Sin fase'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Estado</p>
                  <p className="text-gray-900">{task.status_name || 'Sin estado'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Organización</p>
                  <p className="text-gray-900">{task.organization_name || 'Sin organización'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Check-in</p>
                  <p className="text-gray-900">
                    {task.checkin ? new Date(task.checkin).toLocaleString('es-ES') : 'No definido'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Check-out</p>
                  <p className="text-gray-900">
                    {task.checkout ? new Date(task.checkout).toLocaleString('es-ES') : 'No definido'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Días Requeridos</p>
                  <p className="text-gray-900">{task.days_required || 'No definido'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Prioridad</p>
                  <p className="text-gray-900">{task.priority || 'No definida'}</p>
                </div>
              </div>

              {task.assigned_user && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Usuario Asignado</p>
                  <p className="text-gray-900">{task.assigned_user}</p>
                </div>
              )}

              {task.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Notas</p>
                  <p className="text-gray-900">{task.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 p-6 border-t">
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                onClick={handleCancelEdit}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? 'Guardando...' : 'Guardar'}
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={handleEdit}
                disabled={isLoading}
              >
                Editar
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDelete}
                disabled={isLoading}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                {isLoading ? 'Eliminando...' : 'Eliminar'}
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
};

export default TaskDetailModal;
