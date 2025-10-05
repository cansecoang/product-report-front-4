"use client"

/**
 * 🔄 Products React Query Hooks
 * 
 * Hooks para gestionar el estado de productos con cache inteligente
 * Reemplaza fetch manual y window.location.reload()
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// Types
interface Product {
  id: number
  name: string
  objective?: string
  deliverable?: string
  delivery_date?: string
  workPackageId: number
  outputNumber: number
  productOwnerName?: string
  country?: string
  // ... más campos según tu schema
}

interface ProductsResponse {
  products: Product[]
  pagination?: {
    page: number
    limit: number
    totalPages: number
    totalCount: number
  }
}

// ===========================
// QUERIES (Fetch data)
// ===========================

/**
 * Hook para obtener todos los productos
 * Con cache de 5 minutos
 */
export function useProducts(filters?: {
  workPackageId?: string
  outputNumber?: string
  countryId?: string
}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.workPackageId) params.append('workPackageId', filters.workPackageId)
      if (filters?.outputNumber) params.append('outputNumber', filters.outputNumber)
      if (filters?.countryId) params.append('countryId', filters.countryId)

      const response = await fetch(`/api/products?${params}`)
      if (!response.ok) throw new Error('Error al cargar productos')
      return response.json() as Promise<ProductsResponse>
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

/**
 * Hook para obtener un producto específico por ID
 */
export function useProduct(productId: number | string | null) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const response = await fetch(`/api/product-full-details?productId=${productId}`)
      if (!response.ok) throw new Error('Error al cargar producto')
      const data = await response.json()
      return data.product
    },
    enabled: !!productId, // Solo ejecuta si hay productId
  })
}

/**
 * Hook para obtener tareas de un producto
 */
export function useProductTasks(productId: string | null, options?: {
  page?: number
  limit?: number
  phaseId?: number | null
}) {
  return useQuery({
    queryKey: ['product-tasks', productId, options],
    queryFn: async () => {
      if (!productId) throw new Error('Product ID is required')
      
      const params = new URLSearchParams({
        productId,
        page: String(options?.page || 1),
        limit: String(options?.limit || 10)
      })
      
      if (options?.phaseId) {
        params.append('phaseId', String(options.phaseId))
      }

      const response = await fetch(`/api/product-tasks?${params}`)
      if (!response.ok) throw new Error('Error al cargar tareas')
      return response.json()
    },
    enabled: !!productId,
  })
}

// ===========================
// MUTATIONS (Modify data)
// ===========================

/**
 * Hook para crear un nuevo producto
 * Invalida cache automáticamente después de crear
 */
export function useAddProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (productData: Product) => {
      const response = await fetch('/api/add-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al crear producto')
      }

      return response.json()
    },
    onMutate: async (newProduct) => {
      // Actualización optimista: Mostrar inmediatamente en UI
      await queryClient.cancelQueries({ queryKey: ['products'] })
      
      const previousProducts = queryClient.getQueryData(['products'])
      
      // Agregar producto temporalmente
      queryClient.setQueryData(['products'], (old: ProductsResponse | undefined) => ({
        ...old,
        products: [...(old?.products || []), { ...newProduct, id: 'temp' }]
      }))

      return { previousProducts }
    },
    onError: (error, newProduct, context) => {
      // Rollback en caso de error
      queryClient.setQueryData(['products'], context?.previousProducts)
      
      toast.error('Error al crear producto', {
        description: error instanceof Error ? error.message : 'Error desconocido'
      })
    },
    onSuccess: (data) => {
      // Invalidar cache para refrescar desde el servidor
      queryClient.invalidateQueries({ queryKey: ['products'] })
      
      toast.success('Producto creado exitosamente', {
        description: 'El producto ha sido agregado al sistema',
        action: {
          label: 'Ver producto',
          onClick: () => {
            window.location.href = `/product?productId=${data.productId}`
          }
        }
      })
    },
  })
}

/**
 * Hook para actualizar un producto existente
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ productId, data }: { productId: number, data: Partial<Product> }) => {
      const response = await fetch(`/api/product-full-edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, ...data }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al actualizar producto')
      }

      return response.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId] })
      
      toast.success('Producto actualizado', {
        description: 'Los cambios se han guardado exitosamente'
      })
    },
    onError: (error) => {
      toast.error('Error al actualizar', {
        description: error instanceof Error ? error.message : 'Error desconocido'
      })
    },
  })
}

/**
 * Hook para eliminar un producto
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (productId: number) => {
      const response = await fetch(`/api/delete-product`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: productId }),
      })

      if (!response.ok) {
        throw new Error('Error al eliminar producto')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      
      toast.success('Producto eliminado', {
        description: 'El producto ha sido eliminado del sistema'
      })
    },
    onError: (error) => {
      toast.error('Error al eliminar', {
        description: error instanceof Error ? error.message : 'Error desconocido'
      })
    },
  })
}

// ===========================
// EJEMPLO DE USO
// ===========================

/*
// En un componente:
function ProductList() {
  // Cargar productos
  const { data, isLoading, error } = useProducts({
    workPackageId: '1',
    outputNumber: '1.1'
  })

  // Mutaciones
  const addProduct = useAddProduct()
  const deleteProduct = useDeleteProduct()

  if (isLoading) return <Skeleton />
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <button onClick={() => addProduct.mutate(newProductData)}>
        {addProduct.isPending ? 'Creando...' : 'Crear Producto'}
      </button>

      {data?.products.map(product => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <button onClick={() => deleteProduct.mutate(product.id)}>
            Eliminar
          </button>
        </div>
      ))}
    </div>
  )
}
*/
