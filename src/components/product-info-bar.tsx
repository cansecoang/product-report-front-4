"use client"

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Calendar, User, Globe, Package, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProductDetailModal } from '@/components/product-detail-modal';

interface ProductInfo {
  product_id: number;
  product_name: string;
  delivery_date: string | null;
  product_owner_name: string | null;
  country_name: string | null;
}

export function ProductInfoBar() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);

  useEffect(() => {
    if (!productId) {
      setProductInfo(null);
      return;
    }

    const fetchProductInfo = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('🔄 Fetching product info for ID:', productId);
        const response = await fetch(`/api/product-info/${productId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch product info');
        }
        
        const data = await response.json();
        
        if (data.success && data.product) {
          setProductInfo(data.product);
          console.log('✅ Product info loaded:', data.product.product_name);
        } else {
          throw new Error(data.error || 'Product not found');
        }
        
      } catch (err) {
        console.error('❌ Error loading product info:', err);
        setError(err instanceof Error ? err.message : 'Failed to load product info');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductInfo();
  }, [productId]);

  // No mostrar nada si no hay producto seleccionado
  if (!productId || !productInfo) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-b border-blue-200 dark:border-blue-800 px-6 py-3">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-pulse" />
          <span className="text-sm text-blue-700 dark:text-blue-300">Cargando información del producto...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-950/20 border-b border-red-200 dark:border-red-800 px-6 py-3">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-red-600 dark:text-red-400" />
          <span className="text-sm text-red-700 dark:text-red-300">Error: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 border-b border-emerald-200 dark:border-emerald-800 px-6 py-2 sticky top-0 z-20">
      <div className="flex items-center justify-between">
        {/* Información principal del producto */}
        <div className="flex items-center gap-6">
          {/* Nombre del producto */}
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-lg text-emerald-900 dark:text-emerald-100">
              {productInfo.product_name}
            </h2>
          </div>

          {/* Separador visual */}
          <div className="h-6 w-px bg-emerald-300 dark:bg-emerald-700"></div>

          {/* Información adicional en badges */}
          <div className="flex items-center gap-4">
            {/* País */}
            {productInfo.country_name && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                  {productInfo.country_name}
                </Badge>
              </div>
            )}

            {/* Product Owner */}
            {productInfo.product_owner_name && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {productInfo.product_owner_name}
                </Badge>
              </div>
            )}

            {/* Fecha de entrega */}
            {productInfo.delivery_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                  Entrega: {productInfo.delivery_date}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Botón de detalle del producto */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsProductDetailOpen(true)}
          className="flex items-center gap-2 bg-white/80 hover:bg-white border-emerald-300"
        >
          <Info className="h-4 w-4" />
          Ver Detalle
        </Button>
      </div>

      {/* Modal de detalle del producto */}
      <ProductDetailModal
        product={{
          id: productInfo.product_id.toString(),
          name: productInfo.product_name,
          deliveryDate: productInfo.delivery_date || undefined,
          workPackageId: '',
          country: productInfo.country_name || undefined,
          primaryOrganization: productInfo.product_owner_name || undefined
        }}
        isOpen={isProductDetailOpen}
        onClose={() => setIsProductDetailOpen(false)}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    </div>
  );
}