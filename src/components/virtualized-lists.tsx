/**
 * Virtualized List Components
 * 
 * Componentes optimizados para renderizar listas largas (1000+ items)
 * Usa @tanstack/react-virtual para performance óptima
 */

"use client"

import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface Task {
  task_id: number;
  task_name: string;
  task_description?: string;
  status_name?: string;
  deadline_date?: string;
  responsible_name?: string;
  organization_name?: string;
}

interface VirtualizedTaskListProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  height?: number;
  itemHeight?: number;
}

// ============================================================================
// VIRTUALIZED TASK LIST
// ============================================================================

export function VirtualizedTaskList({ 
  tasks, 
  onTaskClick,
  height = 600,
  itemHeight = 80
}: VirtualizedTaskListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan: 5, // Renderiza 5 items extra arriba/abajo
  });

  const getStatusIcon = (status?: string) => {
    if (!status) return <Clock className="h-4 w-4" />;
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('complet') || statusLower.includes('done')) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (statusLower.includes('progress') || statusLower.includes('doing')) {
      return <Clock className="h-4 w-4 text-blue-500" />;
    }
    if (statusLower.includes('blocked') || statusLower.includes('overdue')) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    return <Clock className="h-4 w-4 text-gray-400" />;
  };

  const getStatusColor = (status?: string) => {
    if (!status) return 'default';
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('complet') || statusLower.includes('done')) return 'default';
    if (statusLower.includes('progress') || statusLower.includes('doing')) return 'secondary';
    if (statusLower.includes('blocked') || statusLower.includes('overdue')) return 'destructive';
    return 'outline';
  };

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground">No hay tareas para mostrar</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header con stats */}
      <div className="mb-4 p-3 bg-muted/50 rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm">
          <span className="font-medium">
            Total: <span className="text-blue-600">{tasks.length}</span> tareas
          </span>
          <span className="text-muted-foreground">
            (Renderizando solo {virtualizer.getVirtualItems().length} visibles)
          </span>
        </div>
        <Badge variant="outline">Virtualizado ⚡</Badge>
      </div>

      {/* Virtualized List */}
      <div
        ref={parentRef}
        className="border rounded-lg overflow-auto"
        style={{ height: `${height}px` }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const task = tasks[virtualRow.index];
            
            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <Card
                  className="mx-2 my-1 p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => onTaskClick?.(task)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(task.status_name)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-medium text-sm line-clamp-1">
                          {task.task_name}
                        </h4>
                        {task.status_name && (
                          <Badge variant={getStatusColor(task.status_name)} className="flex-shrink-0">
                            {task.status_name}
                          </Badge>
                        )}
                      </div>
                      
                      {task.task_description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                          {task.task_description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {task.responsible_name && (
                          <span className="flex items-center gap-1">
                            👤 {task.responsible_name}
                          </span>
                        )}
                        {task.organization_name && (
                          <span className="flex items-center gap-1">
                            🏢 {task.organization_name}
                          </span>
                        )}
                        {task.deadline_date && (
                          <span className="flex items-center gap-1">
                            📅 {new Date(task.deadline_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer info */}
      <div className="mt-2 text-xs text-muted-foreground text-center">
        💡 Solo se renderizan los items visibles para máxima performance
      </div>
    </div>
  );
}

// ============================================================================
// VIRTUALIZED SIMPLE LIST (Generic)
// ============================================================================

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  height?: number;
  itemHeight?: number;
  onItemClick?: (item: T, index: number) => void;
}

export function VirtualizedList<T>({
  items,
  renderItem,
  height = 600,
  itemHeight = 60,
  onItemClick,
}: VirtualizedListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan: 5,
  });

  return (
    <div
      ref={parentRef}
      className="border rounded-lg overflow-auto"
      style={{ height: `${height}px` }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const item = items[virtualRow.index];
          
          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
              onClick={() => onItemClick?.(item, virtualRow.index)}
            >
              {renderItem(item, virtualRow.index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// VIRTUALIZED TABLE
// ============================================================================

interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
  width?: string;
}

interface VirtualizedTableProps<T> {
  data: T[];
  columns: Column<T>[];
  height?: number;
  rowHeight?: number;
  onRowClick?: (item: T, index: number) => void;
}

export function VirtualizedTable<T>({
  data,
  columns,
  height = 600,
  rowHeight = 48,
  onRowClick,
}: VirtualizedTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 10,
  });

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Table Header */}
      <div className="bg-muted/50 border-b sticky top-0 z-10">
        <div className="flex">
          {columns.map((column) => (
            <div
              key={column.key}
              className="px-4 py-3 text-sm font-medium text-left"
              style={{ width: column.width || 'auto', flex: column.width ? undefined : 1 }}
            >
              {column.header}
            </div>
          ))}
        </div>
      </div>

      {/* Table Body (Virtualized) */}
      <div
        ref={parentRef}
        className="overflow-auto"
        style={{ height: `${height}px` }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const item = data[virtualRow.index];
            
            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                className="border-b hover:bg-accent/50 transition-colors cursor-pointer"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                onClick={() => onRowClick?.(item, virtualRow.index)}
              >
                <div className="flex">
                  {columns.map((column) => (
                    <div
                      key={column.key}
                      className="px-4 py-3 text-sm"
                      style={{ width: column.width || 'auto', flex: column.width ? undefined : 1 }}
                    >
                      {column.render(item)}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-muted/30 border-t px-4 py-2 text-xs text-muted-foreground">
        Mostrando {virtualizer.getVirtualItems().length} de {data.length} filas
      </div>
    </div>
  );
}
