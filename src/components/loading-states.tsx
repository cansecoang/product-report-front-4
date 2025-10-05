/**
 * Loading States - Skeleton Components
 * 
 * Componentes reutilizables para estados de carga profesionales
 * Mejora la percepción de velocidad y UX
 */

import { Skeleton } from "@/components/ui/skeleton"

/**
 * Skeleton para listas de productos
 * Uso: <ProductListSkeleton count={5} />
 */
export function ProductListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <div 
          key={i} 
          className="flex items-center gap-4 p-4 border rounded-lg bg-card"
        >
          {/* Avatar/Icon */}
          <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
          
          {/* Content */}
          <div className="space-y-2 flex-1 min-w-0">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          
          {/* Actions */}
          <Skeleton className="h-8 w-24 flex-shrink-0" />
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton para cards/tarjetas
 * Uso: <CardSkeleton />
 */
export function CardSkeleton() {
  return (
    <div className="border rounded-lg p-6 space-y-4 bg-card">
      <Skeleton className="h-6 w-1/3" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  )
}

/**
 * Skeleton para tabla de datos
 * Uso: <TableSkeleton rows={10} columns={5} />
 */
export function TableSkeleton({ 
  rows = 10, 
  columns = 5 
}: { 
  rows?: number
  columns?: number 
}) {
  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-muted/50 border-b p-4">
        <div className="flex gap-4">
          {[...Array(columns)].map((_, i) => (
            <Skeleton key={`header-${i}`} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y">
        {[...Array(rows)].map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="p-4">
            <div className="flex gap-4">
              {[...Array(columns)].map((_, colIndex) => (
                <Skeleton 
                  key={`cell-${rowIndex}-${colIndex}`} 
                  className="h-4 flex-1" 
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Skeleton para grid de productos
 * Uso: <ProductGridSkeleton count={6} />
 */
export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(count)].map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Skeleton para detalles de producto
 * Uso: <ProductDetailSkeleton />
 */
export function ProductDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </div>
      
      {/* Metadata */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-full" />
          </div>
        ))}
      </div>
      
      {/* Content sections */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
      
      {/* Tasks table */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-1/4" />
        <TableSkeleton rows={5} columns={4} />
      </div>
    </div>
  )
}

/**
 * Skeleton para métricas/indicadores
 * Uso: <MetricsSkeleton count={4} />
 */
export function MetricsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(count)].map((_, i) => (
        <div 
          key={i} 
          className="border rounded-lg p-6 space-y-3 bg-card"
        >
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton para gráficos
 * Uso: <ChartSkeleton />
 */
export function ChartSkeleton() {
  return (
    <div className="border rounded-lg p-6 bg-card">
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <div className="h-64 flex items-end gap-2">
          {[...Array(12)].map((_, i) => (
            <Skeleton 
              key={i} 
              className="flex-1"
              style={{ 
                height: `${Math.random() * 80 + 20}%` 
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton para sidebar/menu
 * Uso: <SidebarSkeleton />
 */
export function SidebarSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-10 w-full rounded-lg" />
      <div className="space-y-2">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-full rounded-md" />
        ))}
      </div>
    </div>
  )
}

/**
 * Skeleton para formulario
 * Uso: <FormSkeleton fields={6} />
 */
export function FormSkeleton({ fields = 6 }: { fields?: number }) {
  return (
    <div className="space-y-4">
      {[...Array(fields)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      ))}
      <div className="flex gap-2 pt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  )
}

/**
 * Skeleton genérico de página completa
 * Uso: <PageSkeleton />
 */
export function PageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      
      {/* Metrics */}
      <MetricsSkeleton count={4} />
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CardSkeleton />
        </div>
        <div>
          <CardSkeleton />
        </div>
      </div>
    </div>
  )
}
