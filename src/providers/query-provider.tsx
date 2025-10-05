"use client"

/**
 * 🔄 React Query Provider
 * Configuración global de cache, stale time, retry logic
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Configuración por defecto para todas las queries
            staleTime: 5 * 60 * 1000, // 5 minutos - datos considerados "frescos"
            gcTime: 10 * 60 * 1000,   // 10 minutos - garbage collection (antes cacheTime)
            retry: 2,                  // Reintentar 2 veces en caso de error
            refetchOnWindowFocus: false, // No refetch al cambiar de tab
            refetchOnReconnect: true,  // Refetch al reconectar internet
            refetchOnMount: true,      // Refetch al montar componente si los datos están stale
          },
          mutations: {
            // Configuración por defecto para todas las mutations
            retry: 1,
            onError: (error) => {
              console.error('Mutation error:', error)
            },
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools solo en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}
