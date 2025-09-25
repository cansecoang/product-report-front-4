import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Building, Target, Users, BookOpen, Mail } from "lucide-react";

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string | null;
}

interface ProductDetail {
  product: {
    id: number;
    name: string;
    objective: string;
    deliverable: string;
    deliveryDate: string;
    outputNumber: number;
    methodologyDescription: string;
    genderSpecificActions: string;
    nextSteps: string;
    workPackageName: string;
    workingGroupName: string;
    primaryOrganization: string;
    country: string;
  };
  primaryOrganization: {
    organization_name: string;
    organization_description: string;
  } | null;
  organizations: Array<{
    organization_id: number;
    organization_name: string;
    organization_description: string;
    relation_type: string;
  }>;
  responsibles: Array<{
    user_id: number;
    user_name: string;
    user_last_name: string;
    user_email: string;
    role_label: string;
    is_primary: boolean;
  }>;
  indicators: Array<{
    indicator_id: number;
    indicator_code: string;
    indicator_name: string;
  }>;
  distributors: {
    organizations: Array<{
      organization_id: number;
      organization_name: string;
      organization_description: string;
    }>;
    users: Array<{
      user_id: number;
      display_name: string;
      user_email: string;
    }>;
    others: Array<{
      id: number;
      other_name: string;
      other_email: string;
      other_phone: string;
    }>;
  };
}

export function ProductDetailsModal({ isOpen, onClose, productId }: ProductDetailsModalProps) {
  const [productDetail, setProductDetail] = React.useState<ProductDetail | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchProductDetails = React.useCallback(async () => {
    if (!productId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/product-full-details?productId=${productId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error loading product details');
      }
      
      setProductDetail(data);
    } catch (err) {
      console.error('Error fetching product details:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  React.useEffect(() => {
    if (isOpen && productId) {
      fetchProductDetails();
    }
  }, [isOpen, productId, fetchProductDetails]);



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Detalles del Producto
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Cargando detalles...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <p className="text-red-800">Error: {error}</p>
          </div>
        )}

        {productDetail && (
          <div className="space-y-6">
            {/* Header del producto */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {productDetail.product.name}
              </h2>
              <p className="text-gray-700 mb-4 leading-relaxed">{productDetail.product.objective}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">{productDetail.product.country}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">{productDetail.product.workPackageName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Output {productDetail.product.outputNumber}</span>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-white/50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong className="text-gray-700">Entregable:</strong>
                    <p className="text-gray-600 mt-1">{productDetail.product.deliverable}</p>
                  </div>
                  <div>
                    <strong className="text-gray-700">Fecha de entrega:</strong>
                    <p className="text-gray-600 mt-1 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(productDetail.product.deliveryDate)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Metodología */}
            {productDetail.product.methodologyDescription && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    Metodología
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {productDetail.product.methodologyDescription}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Acciones de Género */}
            {productDetail.product.genderSpecificActions && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    Acciones Específicas de Género
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {productDetail.product.genderSpecificActions}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Próximos Pasos */}
            {productDetail.product.nextSteps && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-600" />
                    Próximos Pasos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {productDetail.product.nextSteps}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Indicadores Asociados */}
            {productDetail.indicators.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    Indicadores Asociados ({productDetail.indicators.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3">
                    {productDetail.indicators.map((indicator) => (
                      <div 
                        key={indicator.indicator_id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{indicator.indicator_name}</p>
                          <p className="text-sm text-gray-600">{indicator.indicator_code}</p>
                        </div>
                        <Badge variant="outline">{indicator.indicator_code}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Responsables */}
            {productDetail.responsibles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-600" />
                    Responsables ({productDetail.responsibles.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {productDetail.responsibles.map((responsible) => (
                      <div 
                        key={responsible.user_id}
                        className="p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              {responsible.user_name} {responsible.user_last_name}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {responsible.user_email}
                            </p>
                            <p className="text-sm text-blue-600 font-medium mt-1">
                              {responsible.role_label}
                            </p>
                          </div>
                          {responsible.is_primary && (
                            <Badge variant="default" className="text-xs">Principal</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Organizaciones Involucradas */}
            {productDetail.organizations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-indigo-600" />
                    Organizaciones Involucradas ({productDetail.organizations.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3">
                    {productDetail.organizations.map((org) => (
                      <div 
                        key={org.organization_id}
                        className="p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{org.organization_name}</p>
                            {org.organization_description && (
                              <p className="text-sm text-gray-600 mt-1">{org.organization_description}</p>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs ml-2">
                            {org.relation_type || 'Participante'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}