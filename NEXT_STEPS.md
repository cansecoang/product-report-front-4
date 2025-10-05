# 🚀 QUICK START - Próximos Pasos

Este documento te guía para continuar implementando las mejoras restantes.

## 📝 TAREAS PENDIENTES (Prioridad)

### 1. ❗ Eliminar window.location.reload() en add-product-modal-new.tsx

**Ubicación:** `src/components/add-product-modal-new.tsx` línea ~55

**Código actual:**
```typescript
const handleProductAdded = () => {
  setIsAddProductModalOpen(false);
  window.location.reload(); // ❌ MAL
};
```

**Código correcto:**
```typescript
import { useQueryClient } from '@tanstack/react-query'

const queryClient = useQueryClient()

const handleProductAdded = () => {
  setIsAddProductModalOpen(false);
  
  // ✅ Invalidar cache para refrescar datos
  queryClient.invalidateQueries({ queryKey: ['products'] })
  
  // ✅ Notificación profesional
  toast.success('Producto creado', {
    description: 'El producto ha sido agregado exitosamente'
  })
}
```

---

### 2. 🔄 Refactorizar add-product-modal-new.tsx a Wizard

**Pasos:**

1. **Copiar el archivo wizard:**
```bash
# Ya está creado en:
src/components/add-product-wizard.tsx
```

2. **Reemplazar en dynamic-page-header.tsx:**
```typescript
// Antes
import AddProductModal from "@/components/add-product-modal-new"

// Después
import AddProductWizard from "@/components/add-product-wizard"

// Y cambiar el componente:
<AddProductWizard
  isOpen={isAddProductModalOpen}
  onClose={() => setIsAddProductModalOpen(false)}
  onProductAdded={handleProductAdded}
/>
```

3. **Completar los steps del wizard:**

Editar `src/components/add-product-wizard.tsx` y completar cada step:

```typescript
// BasicInfoStep - Ya tiene estructura básica
function BasicInfoStep({ data, onChange }: StepProps) {
  const [outputs, setOutputs] = useState([])
  
  useEffect(() => {
    // Cargar outputs
    fetch('/api/outputs')
      .then(res => res.json())
      .then(data => setOutputs(data))
  }, [])
  
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="product_name">Nombre del Producto *</Label>
        <Input
          id="product_name"
          value={data.product_name || ''}
          onChange={(e) => onChange({ product_name: e.target.value })}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="product_objective">Objetivo *</Label>
        <Textarea
          id="product_objective"
          value={data.product_objective || ''}
          onChange={(e) => onChange({ product_objective: e.target.value })}
          rows={4}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="product_output">Output *</Label>
        <Select
          value={data.product_output || ''}
          onValueChange={(value) => onChange({ product_output: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un output" />
          </SelectTrigger>
          <SelectContent>
            {outputs.map((output) => (
              <SelectItem key={output.outputNumber} value={output.outputNumber}>
                {output.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Más campos... */}
    </div>
  )
}

// LocationStep
function LocationStep({ data, onChange }: StepProps) {
  const [countries, setCountries] = useState([])
  const [workPackages, setWorkPackages] = useState([])
  
  useEffect(() => {
    Promise.all([
      fetch('/api/countries').then(r => r.json()),
      fetch('/api/work-packages').then(r => r.json())
    ]).then(([countriesData, workPackagesData]) => {
      setCountries(countriesData)
      setWorkPackages(workPackagesData)
    })
  }, [])
  
  return (
    <div className="space-y-4">
      <div>
        <Label>País *</Label>
        <Select
          value={data.country_id || ''}
          onValueChange={(value) => onChange({ country_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un país" />
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => (
              <SelectItem key={country.country_id} value={String(country.country_id)}>
                {country.country_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Work Package, Working Group... */}
    </div>
  )
}

// TeamStep, IndicatorsStep, ReviewStep...
// Seguir el mismo patrón
```

---

### 3. 📊 Implementar Loading States con Skeletons

**Crear componente reutilizable:**

```typescript
// src/components/loading-states.tsx
import { Skeleton } from "@/components/ui/skeleton"

export function ProductListSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="border rounded-lg p-6 space-y-4">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  )
}
```

**Usar en componentes:**

```typescript
// src/app/product/page.tsx
import { useProducts } from '@/hooks/use-products'
import { ProductListSkeleton } from '@/components/loading-states'

export default function ProductPage() {
  const { data, isLoading } = useProducts()
  
  if (isLoading) {
    return <ProductListSkeleton />
  }
  
  return (
    <div>
      {data?.products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

---

### 4. ♿ Mejorar Accesibilidad (WCAG AA)

**A. Agregar labels y ARIA:**

```typescript
// Antes
<Input placeholder="Buscar productos..." />

// Después
<div>
  <Label htmlFor="search-products" className="sr-only">
    Buscar productos
  </Label>
  <Input
    id="search-products"
    placeholder="Buscar productos..."
    aria-label="Buscar productos por nombre o descripción"
    aria-describedby="search-hint"
  />
  <span id="search-hint" className="sr-only">
    Escribe al menos 3 caracteres para buscar
  </span>
</div>
```

**B. Focus management en modales:**

```typescript
import { useRef, useEffect } from 'react'

export function AccessibleModal({ isOpen, onClose, children }) {
  const firstFocusableRef = useRef<HTMLButtonElement>(null)
  const lastFocusableRef = useRef<HTMLButtonElement>(null)
  
  useEffect(() => {
    if (isOpen) {
      firstFocusableRef.current?.focus()
    }
  }, [isOpen])
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
    
    if (e.key === 'Tab') {
      const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
      
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent onKeyDown={handleKeyDown}>
        {children}
        <Button ref={firstFocusableRef}>Primera acción</Button>
        <Button ref={lastFocusableRef}>Última acción</Button>
      </DialogContent>
    </Dialog>
  )
}
```

**C. Keyboard shortcuts:**

```typescript
import { useHotkeys } from 'react-hotkeys-hook'

export function useGlobalShortcuts() {
  const navigate = useNavigate()
  
  // Ctrl/Cmd + K para búsqueda
  useHotkeys('ctrl+k, cmd+k', (e) => {
    e.preventDefault()
    openSearchPalette()
  })
  
  // Ctrl/Cmd + N para nuevo producto
  useHotkeys('ctrl+n, cmd+n', (e) => {
    e.preventDefault()
    openAddProductModal()
  })
  
  // ? para ayuda
  useHotkeys('shift+slash', () => {
    openShortcutsHelp()
  })
}
```

---

### 5. 🚀 Virtualización de Listas Largas

**Implementar en task lists:**

```typescript
import { useVirtualizer } from '@tanstack/react-virtual'

export function VirtualizedTaskList({ tasks }: { tasks: Task[] }) {
  const parentRef = useRef<HTMLDivElement>(null)
  
  const virtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5
  })
  
  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => (
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

## 🎯 CHECKLIST RÁPIDO

### Semana 1 (Crítico)
- [ ] Eliminar `window.location.reload()` en add-product-modal
- [ ] Reemplazar modal por wizard
- [ ] Agregar skeletons en listas principales
- [ ] Probar React Query cache en producción

### Semana 2 (Importante)
- [ ] Completar 5 steps del wizard
- [ ] Validación Zod por step
- [ ] ARIA labels en todos los forms
- [ ] Keyboard navigation en modales

### Semana 3 (Mejoras)
- [ ] Virtualización en task lists
- [ ] Debouncing en búsquedas
- [ ] Command palette (⌘K)

### Semana 4 (Polish)
- [ ] Dark mode completo
- [ ] Micro-animations
- [ ] Performance audit
- [ ] Accessibility audit

---

## 🛠 COMANDOS ÚTILES

```bash
# Verificar que las dependencias están instaladas
npm list sonner @tanstack/react-query

# Buscar todos los window.location.reload
grep -r "window.location.reload" src/

# Buscar todos los alert()
grep -r "alert(" src/

# Correr el proyecto
npm run dev

# Build para producción
npm run build

# Linter
npm run lint
```

---

## 📚 RECURSOS RECOMENDADOS

- **Sonner:** https://sonner.emilkowal.ski/
- **TanStack Query:** https://tanstack.com/query/latest/docs/react/overview
- **TanStack Virtual:** https://tanstack.com/virtual/latest
- **React Hotkeys Hook:** https://react-hotkeys-hook.vercel.app/
- **Zod:** https://zod.dev/
- **WCAG Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/

---

## 💡 TIPS

1. **Siempre usar React Query para fetch:**
   - ✅ `useQuery()` para GET
   - ✅ `useMutation()` para POST/PUT/DELETE
   - ❌ `fetch()` directo en componentes

2. **Siempre usar toast en lugar de alert:**
   - ✅ `toast.success()`, `toast.error()`
   - ❌ `alert()`, `confirm()`

3. **Siempre agregar loading states:**
   - ✅ `{isLoading ? <Skeleton /> : <Content />}`
   - ❌ Mostrar nada mientras carga

4. **Siempre validar con Zod:**
   - ✅ Definir schema antes de formulario
   - ✅ Validar en cliente y servidor

5. **Siempre pensar en accesibilidad:**
   - ✅ Labels, ARIA, keyboard navigation
   - ✅ Contraste de colores
   - ✅ Focus visible

---

**🎉 ¡Éxito con la implementación!**
