"use client"

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ProductDetailModal } from "./product-detail-modal";

interface ProductInfo {
  id: string;
  name: string;
  objective?: string;
  deliverable?: string;
  deliveryDate?: string;
  outputNumber?: string;
  methodologyDescription?: string;
  genderSpecificActions?: string;
  nextSteps?: string;
  workPackageId: string;
  workPackageName?: string;
  primaryOrganization?: string;
  country?: string;
}

interface ProductInfoDisplayProps {
  productId: string;
}

export function ProductInfoDisplay({ productId }: ProductInfoDisplayProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [product, setProduct] = useState<ProductInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProductInfo = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/product-full-details?productId=${productId}`);
        const data = await response.json();
        if (data.product) {
          setProduct(data.product);
        }
      } catch (error) {
        console.error('Error fetching product info:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchProductInfo();
    }
  }, [productId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        <p>Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        <p>Select a product to view details</p>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      {/* Content sin tarjeta adicional, se integra en el layout principal */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <h2 className="text-xl font-semibold text-foreground">{product.name}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Primary Organization:</span>
                <p className="text-foreground">{product.primaryOrganization || 'Not assigned'}</p>
              </div>
              
              <div>
                <span className="font-medium text-muted-foreground">Country:</span>
                <p className="text-foreground">{product.country || 'Not specified'}</p>
              </div>

              <div>
                <span className="font-medium text-muted-foreground">Delivery Date:</span>
                <p className="text-foreground">{formatDate(product.deliveryDate)}</p>
              </div>
            </div>

            {product.objective && (
              <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                <span className="font-medium text-muted-foreground">Objective:</span>
                <p className="text-sm text-foreground mt-1">{product.objective}</p>
              </div>
            )}
          </div>

          <Button 
            onClick={() => setIsModalOpen(true)}
            variant="outline"
            className="ml-4"
          >
            View Details
          </Button>
        </div>
      </div>

      <ProductDetailModal 
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
