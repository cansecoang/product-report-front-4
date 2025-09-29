"use client"

import { Button } from "@/components/ui/button";
import { Plus, Filter, Grid3X3 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ProductActions() {
  return (
    <>
      {/* Filtro de vista */}
      <div className="flex items-center gap-2">
        <Grid3X3 className="h-4 w-4 text-gray-500" />
        <Select defaultValue="matrix">
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="matrix">Vista Matriz</SelectItem>
            <SelectItem value="list">Vista Lista</SelectItem>
            <SelectItem value="gantt">Vista Gantt</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filtro por Work Package */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-500" />
        <Select defaultValue="all">
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por WP" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los Work Packages</SelectItem>
            <SelectItem value="wp1">Work Package 1</SelectItem>
            <SelectItem value="wp2">Work Package 2</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Botón de agregar producto */}
      <Button className="bg-blue-600 hover:bg-blue-700">
        <Plus className="h-4 w-4 mr-2" />
        Nuevo Producto
      </Button>
    </>
  );
}