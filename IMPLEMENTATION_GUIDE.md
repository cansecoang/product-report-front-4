# 🎯 GUÍA DE IMPLEMENTACIÓN - MEJORAS UX/UI BIOFINCAS

## ✅ COMPLETADO

### 1. Sistema de Notificaciones (Sonner) - ✅ IMPLEMENTADO
**Archivos creados/modificados:**
- ✅ `src/components/ui/toast.tsx` - Componente Toaster configurado
- ✅ `src/providers/query-provider.tsx` - Provider de React Query con DevTools
- ✅ `src/app/layout.tsx` - Integrado Toaster y QueryProvider
- ✅ `src/app/settings/page.tsx` - Reemplazados alerts por toasts
- ✅ `src/components/gantt-chart.tsx` - Reemplazados alerts por toasts
- ✅ `src/components/task-detail-modal.tsx` - Reemplazados alerts por toasts

**Uso:**
```typescript
import { toast } from 'sonner'

// Éxito
toast.success('Producto creado', {
  description: 'El producto ha sido agregado exitosamente'
})

// Error
toast.error('Error al guardar', {
  description: 'No se pudo guardar. Intenta de nuevo.'
})

// Con acción
toast.success('Cambios guardados', {
  action: {
    label: 'Deshacer',
    onClick: () => undoChanges()
  }
})

// Loading (promise)
toast.promise(
  saveData(),
  {
    loading: 'Guardando...',
    success: 'Guardado exitosamente',
    error: 'Error al guardar'
  }
)
```

### 2. Design Tokens Sistema - ✅ IMPLEMENTADO
**Archivo creado:**
- ✅ `src/lib/design-tokens.ts` - Tokens completos de diseño

**Tokens disponibles:**
- `spacing`: xxs (4px) → 5xl (96px)
- `typography`: display, h1-h6, large, base, small, tiny, caption
- `borderRadius`: xs → 2xl, full
- `shadows`: xs → 2xl, inner
- `transitions`: fast, base, slow, slower
- `zIndex`: dropdown, sticky, fixed, modalBackdrop, modal, popover, tooltip, toast
- `brandColors`: primary (50-900), success, warning, error, info

**Uso:**
```typescript
import { spacing, typography, brandColors } from '@/lib/design-tokens'

// En componentes
<div style={{ padding: spacing.md, borderRadius: borderRadius.lg }}>
  <h1 className="text-[2.25rem] leading-[2.75rem] font-bold">
    Título
  </h1>
</div>
```

### 3. Hooks Utilities - ✅ IMPLEMENTADO
**Archivo creado:**
- ✅ `src/hooks/use-debounced-value.ts` - Hook para debouncing

**Uso:**
```typescript
import { useDebouncedValue } from '@/hooks/use-debounced-value'

const [search, setSearch] = useState('')
const debouncedSearch = useDebouncedValue(search, 500)

useEffect(() => {
  if (debouncedSearch) {
    searchAPI(debouncedSearch) // Solo se ejecuta después de 500ms sin cambios
  }
}, [debouncedSearch])
```

### 4. Wizard Components - ✅ PARCIALMENTE IMPLEMENTADO
**Archivos creados:**
- ✅ `src/components/step-progress.tsx` - Indicador de progreso multi-paso
- ✅ `src/components/wizard.tsx` - Wrapper del wizard con navegación

**Pendiente:**
- Crear steps individuales para add-product-modal-new.tsx
- Implementar validación por step con Zod
- Refactorizar modal actual a wizard de 5 pasos

---

## 📋 PENDIENTE DE IMPLEMENTAR

### FASE 1: CRÍTICO

#### 🔥 1.3 Loading States y Skeletons
**Archivos a crear:**
- `src/components/ui/skeleton.tsx` - Ya existe (verificar)
- `src/components/loading-states.tsx` - Estados de carga reutilizables

**Implementación sugerida:**
```typescript
// En cada componente con fetch
const [isLoading, setIsLoading] = useState(true)

if (isLoading) {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-20 w-full" />
      ))}
    </div>
  )
}
```

**Estados optimistas:**
```typescript
import { useOptimistic } from 'react'

const [optimisticTasks, addOptimisticTask] = useOptimistic(
  tasks,
  (state, newTask) => [...state, newTask]
)

const handleAdd = async (task) => {
  addOptimisticTask(task) // UI se actualiza inmediatamente
  await fetch('/api/tasks', { method: 'POST', body: JSON.stringify(task) })
}
```

#### 🔥 1.4 React Query - Eliminar window.location.reload()
**Archivos a modificar:**
- `src/components/add-product-modal-new.tsx` línea ~55 (window.location.reload)
- Todos los componentes que hacen fetch manual

**Patrón de implementación:**
```typescript
// hooks/use-products.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('/api/products')
      return res.json()
    }
  })
}

export function useAddProduct() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (product) => {
      const res = await fetch('/api/products', {
        method: 'POST',
        body: JSON.stringify(product)
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Producto creado')
    }
  })
}

// En componente
const { data: products, isLoading } = useProducts()
const addProduct = useAddProduct()

const handleSubmit = () => {
  addProduct.mutate(formData)
  // NO más window.location.reload()!
}
```

---

### FASE 2: IMPORTANTE

#### ⚡ 2.1 Usar Design Tokens en Componentes
**Archivos a actualizar:**
- Todos los componentes con clases hardcodeadas
- Crear helper functions para generar clases

**Ejemplo:**
```typescript
// Antes
<div className="p-4 gap-2 text-lg">

// Después
import { spacing, typography } from '@/lib/design-tokens'

<div className={cn(
  "p-[var(--spacing-md)]",
  "gap-[var(--spacing-sm)]",
  "text-[var(--text-large-size)]"
)}>
```

#### ⚡ 2.2 Accesibilidad (WCAG AA)
**Checklist por implementar:**

1. **Keyboard Navigation:**
```typescript
import { useHotkeys } from 'react-hotkeys-hook'

// En cada modal/dialog
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }
  window.addEventListener('keydown', handleEscape)
  return () => window.removeEventListener('keydown', handleEscape)
}, [onClose])
```

2. **ARIA Labels:**
```tsx
// Antes
<input placeholder="Buscar..." />

// Después
<label htmlFor="search" className="sr-only">Buscar productos</label>
<input 
  id="search"
  aria-label="Buscar productos"
  aria-describedby="search-hint"
  placeholder="Buscar..." 
/>
<p id="search-hint" className="sr-only">
  Escribe para buscar productos por nombre o descripción
</p>
```

3. **Focus Management:**
```typescript
import { useRef, useEffect } from 'react'

const Modal = ({ isOpen }) => {
  const firstFocusableRef = useRef<HTMLButtonElement>(null)
  
  useEffect(() => {
    if (isOpen) {
      firstFocusableRef.current?.focus()
    }
  }, [isOpen])
  
  return (
    <Dialog>
      <Button ref={firstFocusableRef}>Primer elemento</Button>
    </Dialog>
  )
}
```

#### ⚡ 2.3 Responsive Design Coherente
**Crear sistema de breakpoints:**
```typescript
// tailwind.config.ts
export default {
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    }
  }
}

// Componente responsivo coherente
<div className="
  grid 
  grid-cols-1 
  xs:grid-cols-2 
  sm:grid-cols-2 
  md:grid-cols-3 
  lg:grid-cols-4 
  xl:grid-cols-5
  gap-4
  sm:gap-5
  lg:gap-6
">
```

#### ⚡ 2.4 Virtualización de Listas
**Implementación con TanStack Virtual:**
```typescript
import { useVirtualizer } from '@tanstack/react-virtual'

const TaskList = ({ tasks }) => {
  const parentRef = useRef<HTMLDivElement>(null)
  
  const virtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // altura estimada por item
    overscan: 5 // items extra renderizados fuera de vista
  })
  
  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map(virtualRow => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`
            }}
          >
            <TaskCard task={tasks[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

### FASE 3: MEJORAS

#### 🎨 3.1 Command Palette (⌘K)
**Implementación:**
```typescript
import { Command } from 'cmdk'

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(true)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])
  
  return (
    <Command.Dialog open={open} onOpenChange={setOpen}>
      <Command.Input placeholder="¿Qué deseas hacer?" />
      <Command.List>
        <Command.Group heading="Acciones">
          <Command.Item onSelect={() => navigate('/product/new')}>
            <Plus /> Agregar Producto
          </Command.Item>
          <Command.Item onSelect={() => navigate('/analytics')}>
            <BarChart3 /> Ver Analytics
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  )
}
```

#### 🎨 3.2 Keyboard Shortcuts
```typescript
import { useHotkeys } from 'react-hotkeys-hook'

export function useGlobalShortcuts() {
  useHotkeys('ctrl+n', () => openAddProduct(), {
    description: 'Crear nuevo producto'
  })
  
  useHotkeys('ctrl+k', () => openSearch(), {
    description: 'Abrir búsqueda rápida'
  })
  
  useHotkeys('?', () => openShortcutsHelp(), {
    description: 'Ver atajos de teclado'
  })
}
```

---

## 🚀 PLAN DE EJECUCIÓN RECOMENDADO

### Semana 1
- [x] Implementar Sonner toasts (COMPLETADO)
- [x] Crear Design Tokens (COMPLETADO)
- [x] Setup React Query (COMPLETADO parcialmente)
- [ ] Eliminar todos los window.location.reload()
- [ ] Crear hooks de queries y mutations

### Semana 2
- [ ] Refactorizar add-product-modal a Wizard de 5 pasos
- [ ] Implementar loading states y skeletons
- [ ] Agregar estados optimistas en mutations

### Semana 3
- [ ] Mejorar accesibilidad (ARIA, keyboard nav)
- [ ] Estandarizar responsive design
- [ ] Implementar virtualización en listas largas

### Semana 4
- [ ] Command Palette
- [ ] Keyboard shortcuts globales
- [ ] Micro-animations
- [ ] Dark mode completo

---

## 📊 MÉTRICAS DE ÉXITO

**Antes:**
- ❌ `alert()` para notificaciones
- ❌ `window.location.reload()` destruye estado
- ❌ Sin loading states
- ❌ Inconsistencia de espaciado (gap-1, gap-2, gap-3, gap-4, gap-6)
- ❌ Modales de 765+ líneas
- ❌ Sin accesibilidad

**Después (Objetivo):**
- ✅ Sistema de notificaciones profesional (Sonner)
- ✅ Cache inteligente (React Query)
- ✅ Loading states y feedback optimista
- ✅ Design tokens coherentes
- ✅ Wizards multi-paso intuitivos
- ✅ WCAG AA compliance

---

## 🛠 COMANDOS ÚTILES

```bash
# Instalar dependencias
npm install sonner @tanstack/react-query @tanstack/react-table @tanstack/react-virtual cmdk react-hotkeys-hook fuse.js @dnd-kit/core recharts react-countup xlsx zod react-hook-form @hookform/resolvers

# Desarrollo con React Query DevTools
npm run dev
# Abrir http://localhost:3001 y ver DevTools en la esquina inferior derecha

# Build de producción
npm run build
```

---

## 📚 RECURSOS

- [Sonner Docs](https://sonner.emilkowal.ski/)
- [TanStack Query](https://tanstack.com/query/latest)
- [TanStack Table](https://tanstack.com/table/latest)
- [TanStack Virtual](https://tanstack.com/virtual/latest)
- [cmdk](https://cmdk.paco.me/)
- [React Hotkeys Hook](https://react-hotkeys-hook.vercel.app/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

