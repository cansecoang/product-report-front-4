"use client"

import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string | null;
  onTaskAdded: () => void;
}

interface Phase {
  phase_id: number;
  phase_name: string;
}

interface Status {
  status_id: number;
  status_name: string;
}

interface Organization {
  organization_id: number;
  organization_name: string;
  organization_description?: string;
  organization_type?: string;
}

interface TaskFormData {
  task_name: string;
  task_detail: string;
  start_date_planned: string;
  end_date_planned: string;
  start_date_actual: string;
  end_date_actual: string;
  checkin_oro_verde: string;
  checkin_user: string;
  checkin_communication: string;
  checkin_gender: string;
  phase_id: string;
  status_id: string;
  responsable_id: string;
}

export default function AddTaskModal({ isOpen, onClose, productId, onTaskAdded }: AddTaskModalProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    task_name: '',
    task_detail: '',
    start_date_planned: '',
    end_date_planned: '',
    start_date_actual: '',
    end_date_actual: '',
    checkin_oro_verde: '',
    checkin_user: '',
    checkin_communication: '',
    checkin_gender: '',
    phase_id: '',
    status_id: '',
    responsable_id: ''
  });

  const [phases, setPhases] = useState<Phase[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Cargar datos necesarios para el formulario
  const loadFormData = useCallback(async () => {
    setLoading(true);
    try {
      // Cargar fases, estados y organizaciones en paralelo
      const [phasesRes, statusesRes, orgsRes] = await Promise.all([
        fetch(`/api/product-phases?productId=${productId}`),
        fetch('/api/statuses'),
        fetch('/api/organizations')
      ]);

      const [phasesData, statusesData, orgsData] = await Promise.all([
        phasesRes.json(),
        statusesRes.json(),
        orgsRes.json()
      ]);

      console.log('🔍 Organizations data received:', orgsData);

      setPhases((phasesData.phases || []).filter((phase: Phase) => phase.phase_id));
      setStatuses((statusesData.statuses || []).filter((status: Status) => status.status_id));
      setOrganizations((orgsData.organizations || []).filter((org: Organization) => org.organization_id));
      
      console.log('✅ Organizations loaded:', (orgsData.organizations || []).length);
    } catch (error) {
      console.error('Error loading form data:', error);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (isOpen && productId) {
      loadFormData();
    }
  }, [isOpen, productId, loadFormData]);

  // Monitor organizations state
  useEffect(() => {
    console.log('🔍 Organizations state updated:', organizations.length, organizations);
  }, [organizations]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productId) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/add-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          product_id: productId,
          phase_id: parseInt(formData.phase_id),
          status_id: parseInt(formData.status_id),
          responsable_id: formData.responsable_id ? parseInt(formData.responsable_id) : null
        }),
      });

      if (response.ok) {
        // Resetear formulario
        setFormData({
          task_name: '',
          task_detail: '',
          start_date_planned: '',
          end_date_planned: '',
          start_date_actual: '',
          end_date_actual: '',
          checkin_oro_verde: '',
          checkin_user: '',
          checkin_communication: '',
          checkin_gender: '',
          phase_id: '',
          status_id: '',
          responsable_id: ''
        });
        
        // Cerrar modal y actualizar lista
        onClose();
        onTaskAdded();
      } else {
        console.error('Error creating task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Resetear formulario
    setFormData({
      task_name: '',
      task_detail: '',
      start_date_planned: '',
      end_date_planned: '',
      start_date_actual: '',
      end_date_actual: '',
      checkin_oro_verde: '',
      checkin_user: '',
      checkin_communication: '',
      checkin_gender: '',
      phase_id: '',
      status_id: '',
      responsable_id: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-background rounded-lg border shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Add New Task</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading form data...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Task Name */}
              <div>
                <label htmlFor="task_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Task Name *
                </label>
                <Input
                  id="task_name"
                  name="task_name"
                  type="text"
                  required
                  value={formData.task_name}
                  onChange={handleInputChange}
                  placeholder="Enter task name"
                  className="w-full"
                />
              </div>

              {/* Task Detail */}
              <div>
                <label htmlFor="task_detail" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="task_detail"
                  name="task_detail"
                  rows={3}
                  value={formData.task_detail}
                  onChange={handleInputChange}
                  placeholder="Enter task description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Dates Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="start_date_planned" className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date Planned
                  </label>
                  <Input
                    id="start_date_planned"
                    name="start_date_planned"
                    type="date"
                    value={formData.start_date_planned}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="end_date_planned" className="block text-sm font-medium text-gray-700 mb-2">
                    End Date Planned
                  </label>
                  <Input
                    id="end_date_planned"
                    name="end_date_planned"
                    type="date"
                    value={formData.end_date_planned}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Actual Dates Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="start_date_actual" className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date Actual
                  </label>
                  <Input
                    id="start_date_actual"
                    name="start_date_actual"
                    type="date"
                    value={formData.start_date_actual}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="end_date_actual" className="block text-sm font-medium text-gray-700 mb-2">
                    End Date Actual
                  </label>
                  <Input
                    id="end_date_actual"
                    name="end_date_actual"
                    type="date"
                    value={formData.end_date_actual}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Selects Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="phase_id" className="block text-sm font-medium text-gray-700 mb-2">
                    Phase *
                  </label>
                  <select
                    id="phase_id"
                    name="phase_id"
                    required
                    value={formData.phase_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Phase</option>
                    {phases.map((phase, index) => (
                      <option key={`phase-${phase.phase_id}-${index}`} value={phase.phase_id}>
                        {phase.phase_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="status_id" className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    id="status_id"
                    name="status_id"
                    required
                    value={formData.status_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Status</option>
                    {statuses.map((status, index) => (
                      <option key={`status-${status.status_id}-${index}`} value={status.status_id}>
                        {status.status_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="responsable_id" className="block text-sm font-medium text-gray-700 mb-2">
                    Assigned To *
                  </label>
                  <select
                    id="responsable_id"
                    name="responsable_id"
                    value={formData.responsable_id}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Organization</option>
                    {organizations.map((org, index) => (
                      <option key={`org-${org.organization_id}-${index}`} value={org.organization_id}>
                        {org.organization_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Checkin Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="checkin_oro_verde" className="block text-sm font-medium text-gray-700 mb-2">
                    Checkin Oro Verde
                  </label>
                  <Input
                    id="checkin_oro_verde"
                    name="checkin_oro_verde"
                    type="datetime-local"
                    value={formData.checkin_oro_verde}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="checkin_user" className="block text-sm font-medium text-gray-700 mb-2">
                    Checkin User
                  </label>
                  <Input
                    id="checkin_user"
                    name="checkin_user"
                    type="datetime-local"
                    value={formData.checkin_user}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="checkin_communication" className="block text-sm font-medium text-gray-700 mb-2">
                    Checkin Communication
                  </label>
                  <Input
                    id="checkin_communication"
                    name="checkin_communication"
                    type="datetime-local"
                    value={formData.checkin_communication}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="checkin_gender" className="block text-sm font-medium text-gray-700 mb-2">
                    Checkin Gender
                  </label>
                  <Input
                    id="checkin_gender"
                    name="checkin_gender"
                    type="datetime-local"
                    value={formData.checkin_gender}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={submitting || loading || !formData.task_name || !formData.phase_id || !formData.status_id}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {submitting ? 'Adding...' : 'Add Task'}
          </Button>
        </div>
      </div>
    </div>
  );
}
