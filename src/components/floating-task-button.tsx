"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import AddTaskModal from "@/components/add-task-modal";
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function FloatingTaskButton() {
  const searchParams = useSearchParams();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const queryClient = useQueryClient();
  
  useEffect(() => {
    // Verificar si hay un producto seleccionado en los parámetros de URL
    const productId = searchParams.get('productId');
    setSelectedProduct(productId);
  }, [searchParams]);

  // Solo mostrar el botón si hay un producto seleccionado
  if (!selectedProduct) {
    return null;
  }

  const handleAddTask = () => {
    setIsAddTaskModalOpen(true);
  };

  const handleTaskAdded = () => {
    setIsAddTaskModalOpen(false);
    
    // ✅ Invalidar cache para refrescar tareas
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['product-tasks', selectedProduct] });
    
    // ✅ Notificación profesional
    toast.success('Tarea creada', {
      description: 'La tarea ha sido agregada exitosamente'
    });
  };

  return (
    <>
      <Button
        onClick={handleAddTask}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 z-50"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Modal para agregar tarea */}
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        productId={selectedProduct}
        onTaskAdded={handleTaskAdded}
      />
    </>
  );
}