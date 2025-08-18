"use client"

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";

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
}

function TaskDetailModal({ taskId, isOpen, onClose }: TaskDetailModalProps) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);

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
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <p>Loading task details...</p>
            </div>
          ) : task ? (
            <div className="space-y-6">
              {/* Basic Information */}
              <section>
                <h3 className="text-lg font-medium mb-3">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground">Task Name:</span>
                    <p className="text-foreground mt-1">{task.name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Product:</span>
                    <p className="text-foreground mt-1">{task.product_name || 'Not assigned'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Phase:</span>
                    <p className="text-foreground mt-1">{task.phase_name || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Status:</span>
                    <p className="text-foreground mt-1">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {task.status_name || 'Unknown'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Organization:</span>
                    <p className="text-foreground mt-1">{task.org_name || 'Not assigned'}</p>
                  </div>
                  {task.detail && (
                    <div className="md:col-span-2">
                      <span className="font-medium text-muted-foreground">Description:</span>
                      <p className="text-foreground mt-1">{task.detail}</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Timeline Information */}
              <section>
                <h3 className="text-lg font-medium mb-3">Timeline</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground">Planned Dates</h4>
                    <div className="p-3 bg-muted/50 rounded border">
                      <div className="space-y-2">
                        <div>
                          <span className="font-medium text-muted-foreground">Start Date:</span>
                          <p className="text-foreground mt-1">{formatDate(task.start_planned)}</p>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">End Date:</span>
                          <p className="text-foreground mt-1">{formatDate(task.end_planned)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground">Actual Dates</h4>
                    <div className="p-3 bg-muted/50 rounded border">
                      <div className="space-y-2">
                        <div>
                          <span className="font-medium text-muted-foreground">Start Date:</span>
                          <p className="text-foreground mt-1">{formatDate(task.start_actual)}</p>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">End Date:</span>
                          <p className="text-foreground mt-1">{formatDate(task.end_actual)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Check-in Information */}
              {(task.checkin_oro_verde || task.checkin_user || task.checkin_communication || task.checkin_gender) && (
                <section>
                  <h3 className="text-lg font-medium mb-3">Check-in Information</h3>
                  <div className="space-y-3">
                    {task.checkin_oro_verde && (
                      <div className="p-3 bg-muted/50 rounded border">
                        <span className="font-medium text-muted-foreground">Oro Verde Check-in:</span>
                        <p className="text-foreground mt-1">{task.checkin_oro_verde}</p>
                      </div>
                    )}
                    {task.checkin_user && (
                      <div className="p-3 bg-muted/50 rounded border">
                        <span className="font-medium text-muted-foreground">User Check-in:</span>
                        <p className="text-foreground mt-1">{task.checkin_user}</p>
                      </div>
                    )}
                    {task.checkin_communication && (
                      <div className="p-3 bg-muted/50 rounded border">
                        <span className="font-medium text-muted-foreground">Communication Check-in:</span>
                        <p className="text-foreground mt-1">{task.checkin_communication}</p>
                      </div>
                    )}
                    {task.checkin_gender && (
                      <div className="p-3 bg-muted/50 rounded border">
                        <span className="font-medium text-muted-foreground">Gender Check-in:</span>
                        <p className="text-foreground mt-1">{task.checkin_gender}</p>
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
