/**
 * Command Palette Component
 * 
 * Búsqueda global con ⌘K (Mac) / Ctrl+K (Windows)
 * Navegación rápida por productos, tareas, páginas
 */

"use client"

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from './ui/command';
import {
  Search,
  Package,
  CheckSquare,
  Settings,
  BarChart3,
  FileText,
  Home,
  Loader2,
} from 'lucide-react';
import Fuse from 'fuse.js';
import { toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================

interface CommandItem {
  id: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  keywords?: string[];
  group: 'pages' | 'products' | 'tasks' | 'actions';
}

interface Product {
  product_id: number;
  product_name: string;
  product_description?: string;
}

interface Task {
  task_id: number;
  task_name: string;
  task_description?: string;
}

// ============================================================================
// COMMAND PALETTE
// ============================================================================

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // ============================================================================
  // KEYBOARD SHORTCUT
  // ============================================================================

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // ⌘K (Mac) o Ctrl+K (Windows/Linux)
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const fetchData = useCallback(async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const [productsRes, tasksRes] = await Promise.all([
        fetch('/api/products').then(r => r.ok ? r.json() : []),
        fetch('/api/explore-tasks').then(r => r.ok ? r.json() : []),
      ]);

      setProducts(productsRes.slice(0, 50)); // Limitar a 50 items
      setTasks(tasksRes.slice(0, 50));
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, [loading]);

  // Fetch data when opening
  useEffect(() => {
    if (open && products.length === 0 && tasks.length === 0) {
      fetchData();
    }
  }, [open, products.length, tasks.length, fetchData]);

  // ============================================================================
  // STATIC PAGES & ACTIONS
  // ============================================================================

  const staticItems: CommandItem[] = [
    {
      id: 'home',
      title: 'Inicio',
      description: 'Ir a la página principal',
      icon: <Home className="h-4 w-4" />,
      action: () => router.push('/'),
      keywords: ['home', 'inicio', 'principal'],
      group: 'pages',
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Ver métricas y análisis',
      icon: <BarChart3 className="h-4 w-4" />,
      action: () => router.push('/analytics'),
      keywords: ['analytics', 'metricas', 'graficos', 'charts'],
      group: 'pages',
    },
    {
      id: 'indicators',
      title: 'Indicadores',
      description: 'Ver indicadores del proyecto',
      icon: <FileText className="h-4 w-4" />,
      action: () => router.push('/indicators'),
      keywords: ['indicators', 'indicadores', 'kpi'],
      group: 'pages',
    },
    {
      id: 'settings',
      title: 'Configuración',
      description: 'Ajustes del sistema',
      icon: <Settings className="h-4 w-4" />,
      action: () => router.push('/settings'),
      keywords: ['settings', 'configuracion', 'ajustes'],
      group: 'pages',
    },
  ];

  // ============================================================================
  // FUZZY SEARCH
  // ============================================================================

  const fuseOptions = {
    keys: ['title', 'description', 'keywords'],
    threshold: 0.3,
    includeScore: true,
  };

  const getFilteredItems = () => {
    // Crear items dinámicos de productos
    const productItems: CommandItem[] = products.map(product => ({
      id: `product-${product.product_id}`,
      title: product.product_name,
      description: product.product_description || 'Ver detalles del producto',
      icon: <Package className="h-4 w-4" />,
      action: () => router.push(`/product/${product.product_id}`),
      keywords: [product.product_name, product.product_description || ''].filter(Boolean),
      group: 'products' as const,
    }));

    // Crear items dinámicos de tareas
    const taskItems: CommandItem[] = tasks.map(task => ({
      id: `task-${task.task_id}`,
      title: task.task_name,
      description: task.task_description || 'Ver detalles de la tarea',
      icon: <CheckSquare className="h-4 w-4" />,
      action: () => {
        toast.info(`Tarea: ${task.task_name}`, {
          description: task.task_description || 'Sin descripción',
        });
      },
      keywords: [task.task_name, task.task_description || ''].filter(Boolean),
      group: 'tasks' as const,
    }));

    const allItems = [...staticItems, ...productItems, ...taskItems];

    if (!search) return allItems;

    // Fuzzy search
    const fuse = new Fuse(allItems, fuseOptions);
    const results = fuse.search(search);
    return results.map(result => result.item);
  };

  const filteredItems = getFilteredItems();

  // Agrupar items
  const groupedItems = {
    pages: filteredItems.filter(item => item.group === 'pages'),
    products: filteredItems.filter(item => item.group === 'products'),
    tasks: filteredItems.filter(item => item.group === 'tasks'),
    actions: filteredItems.filter(item => item.group === 'actions'),
  };

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSelect = (item: CommandItem) => {
    setOpen(false);
    setSearch('');
    item.action();
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      {/* Trigger Button (opcional - ya que tenemos ⌘K) */}
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground border rounded-lg hover:bg-accent/50 transition-colors"
      >
        <Search className="h-4 w-4" />
        <span>Buscar...</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Command Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Buscar productos, tareas, páginas..."
          value={search}
          onValueChange={setSearch}
        />
        
        <CommandList>
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <CommandEmpty>
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Search className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No se encontraron resultados para &quot;{search}&quot;
                  </p>
                </div>
              </CommandEmpty>

              {/* Pages */}
              {groupedItems.pages.length > 0 && (
                <CommandGroup heading="📄 Páginas">
                  {groupedItems.pages.map((item) => (
                    <CommandItem
                      key={item.id}
                      onSelect={() => handleSelect(item)}
                      className="flex items-center gap-3"
                    >
                      {item.icon}
                      <div className="flex-1">
                        <div className="font-medium">{item.title}</div>
                        {item.description && (
                          <div className="text-xs text-muted-foreground">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Products */}
              {groupedItems.products.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup heading="📦 Productos">
                    {groupedItems.products.slice(0, 5).map((item) => (
                      <CommandItem
                        key={item.id}
                        onSelect={() => handleSelect(item)}
                        className="flex items-center gap-3"
                      >
                        {item.icon}
                        <div className="flex-1">
                          <div className="font-medium">{item.title}</div>
                          {item.description && (
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                    {groupedItems.products.length > 5 && (
                      <div className="px-2 py-1 text-xs text-muted-foreground text-center">
                        +{groupedItems.products.length - 5} productos más
                      </div>
                    )}
                  </CommandGroup>
                </>
              )}

              {/* Tasks */}
              {groupedItems.tasks.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup heading="✅ Tareas">
                    {groupedItems.tasks.slice(0, 5).map((item) => (
                      <CommandItem
                        key={item.id}
                        onSelect={() => handleSelect(item)}
                        className="flex items-center gap-3"
                      >
                        {item.icon}
                        <div className="flex-1">
                          <div className="font-medium">{item.title}</div>
                          {item.description && (
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                    {groupedItems.tasks.length > 5 && (
                      <div className="px-2 py-1 text-xs text-muted-foreground text-center">
                        +{groupedItems.tasks.length - 5} tareas más
                      </div>
                    )}
                  </CommandGroup>
                </>
              )}
            </>
          )}
        </CommandList>

        {/* Footer */}
        <div className="border-t px-3 py-2 text-xs text-muted-foreground flex items-center justify-between">
          <span>Usa ↑↓ para navegar</span>
          <span>Enter para seleccionar</span>
          <span>Esc para cerrar</span>
        </div>
      </CommandDialog>
    </>
  );
}
