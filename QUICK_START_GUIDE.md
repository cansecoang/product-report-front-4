# 🚀 Quick Start - Nuevas Features UX/UI

## ⌨️ Atajos de Teclado

### Command Palette
- **⌘K** (Mac) / **Ctrl+K** (Windows) - Abrir búsqueda global
- **↑** / **↓** - Navegar resultados
- **Enter** - Seleccionar item
- **Esc** - Cerrar palette

---

## 🎯 Nuevas Rutas

### `/tasks` - Demo de Virtualización
Muestra una lista virtualizada de 100+ tareas con:
- Performance optimizada (solo renderiza items visibles)
- Stats en tiempo real
- Click en tarea para ver detalles en toast

### Todas las Páginas - Command Palette
Presiona **⌘K** en cualquier página para:
- 📄 Navegar a páginas (Home, Analytics, Indicators, Settings)
- 📦 Buscar productos (fuzzy search)
- ✅ Ver tareas recientes
- 🔍 Búsqueda instantánea

---

## 📦 Componentes Nuevos

### 1. Notificaciones (Sonner)

```tsx
import { toast } from 'sonner';

// Success
toast.success('Producto creado exitosamente');

// Error
toast.error('Error al guardar cambios');

// Con descripción
toast.info('Cargando datos', {
  description: 'Esto puede tardar unos segundos...'
});

// Con acción
toast.success('Producto guardado', {
  action: {
    label: 'Ver',
    onClick: () => router.push(`/product/${id}`)
  }
});

// Promise (automático)
toast.promise(
  saveProduct(),
  {
    loading: 'Guardando...',
    success: 'Producto guardado',
    error: 'Error al guardar'
  }
);
```

### 2. React Query Hooks

```tsx
import { useProducts, useAddProduct, useUpdateProduct } from '@/hooks/use-products';

function ProductList() {
  // Query con cache 5min
  const { data: products, isLoading, error } = useProducts({
    filters: { status: 'active' }
  });

  // Mutation con optimistic updates
  const addProduct = useAddProduct();
  
  const handleAdd = () => {
    addProduct.mutate(
      { name: 'Nuevo Producto' },
      {
        onSuccess: () => toast.success('Creado'),
        onError: () => toast.error('Error')
      }
    );
  };

  if (isLoading) return <ProductListSkeleton />;
  if (error) return <ErrorMessage error={error} />;

  return <div>{products.map(...)}</div>;
}
```

### 3. Wizard Multi-Step

```tsx
import { AddProductWizardComplete } from '@/components/add-product-wizard-complete';

function CreateProduct() {
  const handleComplete = async (data) => {
    await saveProduct(data);
    toast.success('Producto creado');
  };

  return (
    <AddProductWizardComplete
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onSuccess={handleComplete}
    />
  );
}
```

### 4. Loading States

```tsx
import { 
  ProductListSkeleton,
  TableSkeleton,
  MetricsSkeleton,
  CardSkeleton
} from '@/components/loading-states';

function Products() {
  const { data, isLoading } = useProducts();

  if (isLoading) return <ProductListSkeleton count={5} />;
  
  return <ProductList products={data} />;
}
```

### 5. Design Tokens

```tsx
import { designTokens } from '@/lib/design-tokens';

const StyledCard = styled.div`
  padding: ${designTokens.spacing.lg};
  font-size: ${designTokens.typography.body.size};
  color: ${designTokens.brandColors.primary};
  box-shadow: ${designTokens.shadows.md};
  transition: all ${designTokens.transitions.base};
  z-index: ${designTokens.zIndex.modal};
`;

// O directamente en JSX
<div style={{
  padding: designTokens.spacing.md,
  fontSize: designTokens.typography.h3.size,
  fontWeight: designTokens.typography.h3.weight,
}} />
```

### 6. Accesibilidad

```tsx
import { 
  useFocusTrap,
  useKeyboardNavigation,
  SkipLink,
  VisuallyHidden
} from '@/lib/accessibility';

function Modal({ isOpen, onClose, items }) {
  // Focus trap en modal
  const modalRef = useFocusTrap(isOpen);

  // Navegación con teclado
  const { selectedIndex, handleKeyDown } = useKeyboardNavigation({
    items,
    onSelect: (item) => console.log('Selected:', item),
    isEnabled: isOpen,
  });

  return (
    <div ref={modalRef}>
      <SkipLink href="#main">Saltar al contenido</SkipLink>
      
      <VisuallyHidden>
        <h1>Diálogo de configuración</h1>
      </VisuallyHidden>

      <ul onKeyDown={handleKeyDown}>
        {items.map((item, i) => (
          <li 
            key={i} 
            aria-selected={i === selectedIndex}
            role="option"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 7. Listas Virtualizadas

```tsx
import { 
  VirtualizedTaskList,
  VirtualizedList,
  VirtualizedTable 
} from '@/components/virtualized-lists';

// Lista de tareas (especializada)
<VirtualizedTaskList
  tasks={tasks}
  onTaskClick={(task) => toast.info(task.task_name)}
  height={600}
  itemHeight={80}
/>

// Lista genérica
<VirtualizedList
  items={items}
  renderItem={(item, index) => (
    <div className="p-4 border-b">
      {item.name}
    </div>
  )}
  height={500}
  itemHeight={60}
  onItemClick={(item) => handleClick(item)}
/>

// Tabla virtualizada
<VirtualizedTable
  data={products}
  columns={[
    {
      key: 'name',
      header: 'Nombre',
      render: (product) => product.product_name,
      width: '200px',
    },
    {
      key: 'status',
      header: 'Estado',
      render: (product) => <Badge>{product.status}</Badge>,
    },
  ]}
  height={600}
  rowHeight={48}
  onRowClick={(product) => router.push(`/product/${product.id}`)}
/>
```

### 8. Command Palette

```tsx
// Ya está integrado globalmente en layout.tsx
// Solo necesitas presionar ⌘K para usarlo

// Si quieres customizar items estáticos:
import { CommandPalette } from '@/components/command-palette';

// Edita staticItems en command-palette.tsx para agregar páginas
const staticItems = [
  {
    id: 'custom-page',
    title: 'Mi Página',
    description: 'Ir a mi página custom',
    icon: <Star className="h-4 w-4" />,
    action: () => router.push('/my-page'),
    keywords: ['custom', 'mi página'],
    group: 'pages',
  },
  // ...
];
```

---

## 🎨 Best Practices

### 1. Siempre usar Toast en lugar de alert()
```tsx
❌ alert('Producto creado');
✅ toast.success('Producto creado');
```

### 2. Usar React Query en lugar de fetch directo
```tsx
❌ 
const [data, setData] = useState([]);
useEffect(() => {
  fetch('/api/products').then(r => r.json()).then(setData);
}, []);

✅ 
const { data } = useProducts();
```

### 3. Nunca usar window.location.reload()
```tsx
❌ 
await saveProduct();
window.location.reload();

✅ 
const { mutate } = useAddProduct();
mutate(data); // Automáticamente invalida cache
```

### 4. Mostrar loading states
```tsx
❌ 
if (isLoading) return <div>Loading...</div>;

✅ 
if (isLoading) return <ProductListSkeleton count={5} />;
```

### 5. Usar Design Tokens
```tsx
❌ 
<div style={{ padding: '16px', fontSize: '14px' }} />

✅ 
<div style={{ 
  padding: designTokens.spacing.md,
  fontSize: designTokens.typography.body.size 
}} />
```

### 6. Virtualizar listas largas (>100 items)
```tsx
❌ 
{tasks.map(task => <TaskCard task={task} />)}

✅ 
<VirtualizedTaskList tasks={tasks} height={600} />
```

---

## 🧪 Testing Quick Checks

### ✅ Toasts
1. Crear un producto → Ver toast success
2. Error de red → Ver toast error
3. Toast debe auto-cerrar en 3s

### ✅ React Query
1. Abrir DevTools (ícono en bottom-right)
2. Ver queries en cache
3. Navegar entre páginas → No re-fetch si cache válido
4. Esperar 5min → Auto re-fetch (stale time)

### ✅ Wizard
1. Abrir wizard de crear producto
2. Intentar avanzar sin llenar campos → Ver validación
3. Llenar paso 1 → Avanzar al paso 2
4. Ver progress bar actualizarse
5. Review final debe mostrar todos los datos

### ✅ Loading States
1. Recargar página con red lenta (DevTools)
2. Ver skeletons mientras carga
3. Transición suave a contenido real

### ✅ Command Palette
1. Presionar **⌘K**
2. Buscar "ana" → Ver "Analytics" en resultados
3. Usar **↑** **↓** para navegar
4. Presionar **Enter** → Navegar a página
5. Presionar **Esc** → Cerrar palette

### ✅ Virtualización
1. Ir a `/tasks`
2. Ver stats "Mostrando X de 100"
3. Scroll rápido → No lag
4. Click en tarea → Ver toast con detalles

---

## 📚 Documentación Completa

- **IMPLEMENTATION_GUIDE.md** - Guía técnica detallada
- **COMPLETE_TRANSFORMATION_SUMMARY.md** - Resumen completo de cambios
- **PRODUCTION_READY_CHECKLIST.md** - Checklist de verificación
- **NEXT_STEPS.md** - Ejemplos de código avanzado

---

## 🆘 Troubleshooting

### Command Palette no abre con ⌘K
- Verificar que `<CommandPalette />` esté en `layout.tsx`
- Verificar que no haya otro shortcut ocupando ⌘K

### React Query DevTools no aparece
- Solo visible en modo desarrollo (`npm run dev`)
- Verificar `query-provider.tsx` tenga `<ReactQueryDevtools />`

### Listas virtualizadas con lag
- Reducir `overscan` de 5 a 3
- Aumentar `estimateSize` si items son más altos
- Verificar que `height` sea fijo (no `auto`)

### Toasts no aparecen
- Verificar que `<Toaster />` esté en `layout.tsx`
- Verificar imports: `import { toast } from 'sonner'`

---

*Última actualización: 100% Implementation Complete* 🎉
