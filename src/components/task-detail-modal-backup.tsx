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
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (taskId && isOpen) {
      fetchTaskDetails(taskId);
    }
  }, [taskId, isOpen]);

  const fetchTaskDetails = async (id: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/task-details?taskId=${id}`);
      const data = await response.json();
      setTask(data.task);
    } catch (error) {
      console.error('Error fetching task details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleDelete = async () => {
    if (!task || !window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/delete-task?taskId=${task.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onTaskDeleted?.();
        onClose();
      } else {
        console.error('Error deleting task');
        alert('Failed to delete task. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async (updatedTask: Task) => {
    try {
      const response = await fetch(`/api/update-task`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTask),
      });

      if (response.ok) {
        const data = await response.json();
        setTask(data.task);
        setIsEditing(false);
        onTaskUpdated?.();
      } else {
        console.error('Error updating task');
        alert('Failed to update task. Please try again.');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
      <div className="relative bg-background rounded-lg border shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Task Details</h2>
          <div className="flex items-center gap-2">
            {task && !isEditing && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading task details...</span>
            </div>
          ) : task ? (
            <div className="space-y-6">
              {/* Basic Info */}
              <section>
                <h3 className="text-lg font-medium mb-3">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/50 rounded border">
                    <span className="font-medium text-muted-foreground">Task Name:</span>
                    <h4 className="text-lg font-medium text-foreground mt-1">{task.name}</h4>
                  </div>
                  
                  {task.detail && (
                    <div className="p-3 bg-muted/50 rounded border md:col-span-2">
                      <span className="font-medium text-muted-foreground">Description:</span>
                      <p className="text-foreground mt-1 whitespace-pre-wrap">{task.detail}</p>
                    </div>
                  )}
                  
                  <div className="p-3 bg-muted/50 rounded border">
                    <span className="font-medium text-muted-foreground">Phase:</span>
                    <p className="text-foreground mt-1">{task.phase_name || 'Not assigned'}</p>
                  </div>
                  
                  <div className="p-3 bg-muted/50 rounded border">
                    <span className="font-medium text-muted-foreground">Status:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                      task.status_name === 'Done' || task.status_name === 'Completed'
                        ? 'bg-green-100 text-green-800'
                        : task.status_name === 'In Process' || task.status_name === 'In Progress'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status_name || 'Unknown'}
                    </span>
                  </div>
                  
                  <div className="p-3 bg-muted/50 rounded border">
                    <span className="font-medium text-muted-foreground">Assigned Organization:</span>
                    <p className="text-foreground mt-1">{task.org_name || 'Not assigned'}</p>
                  </div>
                  
                  <div className="p-3 bg-muted/50 rounded border">
                    <span className="font-medium text-muted-foreground">Product:</span>
                    <p className="text-foreground mt-1">{task.product_name || 'Unknown'}</p>
                  </div>
                </div>
              </section>

              {/* Timeline */}
              <section>
                <h3 className="text-lg font-medium mb-3">Timeline</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/50 rounded border">
                    <span className="font-medium text-muted-foreground">Planned Start:</span>
                    <p className="text-foreground mt-1">{formatDate(task.start_planned)}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded border">
                    <span className="font-medium text-muted-foreground">Planned End:</span>
                    <p className="text-foreground mt-1">{formatDate(task.end_planned)}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded border">
                    <span className="font-medium text-muted-foreground">Actual Start:</span>
                    <p className="text-foreground mt-1">{formatDate(task.start_actual)}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded border">
                    <span className="font-medium text-muted-foreground">Actual End:</span>
                    <p className="text-foreground mt-1">{formatDate(task.end_actual)}</p>
                  </div>
                </div>
              </section>

              {/* Check-ins */}
              {(task.checkin_oro_verde || task.checkin_user || task.checkin_communication || task.checkin_gender) && (
                <section>
                  <h3 className="text-lg font-medium mb-3">Check-ins</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {task.checkin_oro_verde && (
                      <div className="p-3 bg-muted/50 rounded border">
                        <span className="font-medium text-muted-foreground">Oro Verde Check-in:</span>
                        <p className="text-foreground mt-1">{formatDate(task.checkin_oro_verde)}</p>
                      </div>
                    )}
                    {task.checkin_user && (
                      <div className="p-3 bg-muted/50 rounded border">
                        <span className="font-medium text-muted-foreground">User Check-in:</span>
                        <p className="text-foreground mt-1">{formatDate(task.checkin_user)}</p>
                      </div>
                    )}
                    {task.checkin_communication && (
                      <div className="p-3 bg-muted/50 rounded border">
                        <span className="font-medium text-muted-foreground">Communication Check-in:</span>
                        <p className="text-foreground mt-1">{formatDate(task.checkin_communication)}</p>
                      </div>
                    )}
                    {task.checkin_gender && (
                      <div className="p-3 bg-muted/50 rounded border">
                        <span className="font-medium text-muted-foreground">Gender Check-in:</span>
                        <p className="text-foreground mt-1">{formatDate(task.checkin_gender)}</p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Metadata */}
              <section>
                <h3 className="text-lg font-medium mb-3">Metadata</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground">Created:</span>
                    <p className="text-foreground mt-1">{formatDate(task.created_at)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Last Updated:</span>
                    <p className="text-foreground mt-1">{formatDate(task.updated_at)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Task ID:</span>
                    <p className="text-foreground mt-1 font-mono">{task.id}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Product ID:</span>
                    <p className="text-foreground mt-1 font-mono">{task.product_id}</p>
                  </div>
                </div>
              </section>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">No task data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TaskDetailModal;
