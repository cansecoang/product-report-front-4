'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings } from 'lucide-react';

interface Column {
  key: string;
  label: string;
  visible: boolean;
}

interface ColumnCustomizerProps {
  columns: Column[];
  onColumnsChange: (columns: Column[]) => void;
}

export default function ColumnCustomizer({ columns, onColumnsChange }: ColumnCustomizerProps) {
  const handleToggle = (key: string) => {
    const updated = columns.map(col => 
      col.key === key ? { ...col, visible: !col.visible } : col
    );
    onColumnsChange(updated);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Customize Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {columns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.key}
            checked={column.visible}
            onCheckedChange={() => handleToggle(column.key)}
          >
            {column.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}