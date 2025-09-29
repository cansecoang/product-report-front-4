"use client"

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";

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

interface Organization {
  organization_id?: number;
  organization_name: string;
  organization_description?: string;
  relation_type?: string;
  position?: number;
}

interface Responsible {
  user_id: string;
  user_name?: string;
  user_last_name?: string;
  user_email?: string;
  role_label?: string;
  is_primary?: boolean;
  position?: number;
}

interface Indicator {
  indicator_id: string;
  indicator_code?: string;
  output_number?: string;
  indicator_name: string;
  indicator_description?: string;
}

interface DistributorOrg {
  organization_id: number;
  organization_name: string;
  organization_description?: string;
  position?: number;
}

interface DistributorUser {
  user_id: string;
  user_name?: string;
  user_last_name?: string;
  user_email?: string;
  position?: number;
}

interface DistributorOther {
  display_name: string;
  contact?: string;
  position?: number;
}

interface Distributors {
  organizations: DistributorOrg[];
  users: DistributorUser[];
  others: DistributorOther[];
}

interface DetailedProductInfo {
  product: ProductInfo;
  primaryOrganization?: {
    organization_name: string;
    organization_description?: string;
  } | null;
  organizations?: Organization[];
  responsibles?: Responsible[];
  indicators?: Indicator[];
  distributors?: Distributors;
}

interface ProductDetailModalProps {
  product: ProductInfo;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

interface ProductCheckin {
  task_id: number;
  task_name: string;
  checkin_date: string;
  checkin_type: string;
  status_name: string;
  organization_name: string;
  days_until_checkin: number;
  urgency_level: 'overdue' | 'today' | 'tomorrow' | 'this_week' | 'later';
}

interface CheckinData {
  totalCheckins: number;
  checkins: {
    overdue: ProductCheckin[];
    today: ProductCheckin[];
    tomorrow: ProductCheckin[];
    this_week: ProductCheckin[];
    later: ProductCheckin[];
  };
  allCheckins: ProductCheckin[];
}

export function ProductDetailModal({ product, isOpen, onClose, onEdit, onDelete }: ProductDetailModalProps) {
  const [detailedInfo, setDetailedInfo] = useState<DetailedProductInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [checkinData, setCheckinData] = useState<CheckinData | null>(null);
  const [isLoadingCheckins, setIsLoadingCheckins] = useState(false);

  const fetchDetailedInfo = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/product-full-details?productId=${product.id}`);
      const data = await response.json();
      setDetailedInfo(data);
    } catch (error) {
      console.error('Error fetching detailed info:', error);
    } finally {
      setIsLoading(false);
    }
  }, [product.id]);

  const fetchCheckins = useCallback(async () => {
    setIsLoadingCheckins(true);
    try {
      const response = await fetch(`/api/product-checkins/${product.id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setCheckinData(data);
      } else {
        console.error('API returned error:', data.error);
      }
    } catch (error) {
      console.error('Error fetching checkins:', error);
      // Reset checkinData to avoid showing stale data
      setCheckinData(null);
    } finally {
      setIsLoadingCheckins(false);
    }
  }, [product.id]);

  useEffect(() => {
    if (isOpen && product.id) {
      fetchDetailedInfo();
      fetchCheckins();
    }
  }, [isOpen, product.id, fetchDetailedInfo, fetchCheckins]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-background rounded-lg border shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden z-[10000]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Product Details</h2>
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="h-8 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
              >
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
                className="h-8 border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
              >
                Delete
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <p>Loading detailed information...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Basic Information */}
              <section>
                <h3 className="text-lg font-medium mb-3">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground">Product Name:</span>
                    <p className="text-foreground mt-1">{product.name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Product Owner:</span>
                    <p className="text-foreground mt-1">{product.primaryOrganization || 'Not assigned'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Country:</span>
                    <p className="text-foreground mt-1">{product.country || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Delivery Date:</span>
                    <p className="text-foreground mt-1">{formatDate(product.deliveryDate)}</p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-medium text-muted-foreground">Objective:</span>
                    <p className="text-foreground mt-1">{product.objective || 'No objective specified'}</p>
                  </div>
                  {product.deliverable && (
                    <div className="md:col-span-2">
                      <span className="font-medium text-muted-foreground">Deliverable:</span>
                      <p className="text-foreground mt-1">{product.deliverable}</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Primary Organization Details */}
              {detailedInfo?.primaryOrganization && (
                <section>
                  <h3 className="text-lg font-medium mb-3">Product Owner</h3>
                  <div className="p-4 bg-primary/5 rounded border border-primary/20">
                    <p className="font-medium text-primary">{detailedInfo.primaryOrganization.organization_name}</p>
                    {detailedInfo.primaryOrganization.organization_description && (
                      <p className="text-sm text-muted-foreground mt-2">{detailedInfo.primaryOrganization.organization_description}</p>
                    )}
                  </div>
                </section>
              )}

              {/* Organizations Involved */}
              {detailedInfo?.organizations && detailedInfo.organizations.length > 0 && (
                <section>
                  <h3 className="text-lg font-medium mb-3">Organizations Involved</h3>
                  <div className="space-y-2">
                    {detailedInfo.organizations.map((org, index) => (
                      <div key={index} className="p-3 bg-muted/50 rounded border">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{org.organization_name}</p>
                            {org.organization_description && (
                              <p className="text-sm text-muted-foreground mt-1">{org.organization_description}</p>
                            )}
                          </div>
                          {org.relation_type && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              {org.relation_type}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Responsible Persons */}
              {detailedInfo?.responsibles && detailedInfo.responsibles.length > 0 && (
                <section>
                  <h3 className="text-lg font-medium mb-3">Responsible Persons</h3>
                  <div className="space-y-2">
                    {detailedInfo.responsibles.map((resp, index) => (
                      <div key={index} className="p-3 bg-muted/50 rounded border">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">
                              {resp.user_name} {resp.user_last_name}
                              {resp.is_primary && (
                                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                  Primary
                                </span>
                              )}
                            </p>
                            {resp.user_email && (
                              <p className="text-sm text-muted-foreground">{resp.user_email}</p>
                            )}
                          </div>
                          {resp.role_label && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {resp.role_label}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Related Indicators */}
              {detailedInfo?.indicators && detailedInfo.indicators.length > 0 && (
                <section>
                  <h3 className="text-lg font-medium mb-3">Related Indicators</h3>
                  <div className="space-y-2">
                    {detailedInfo.indicators.map((indicator, index) => (
                      <div key={index} className="p-3 bg-muted/50 rounded border">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{indicator.indicator_name}</p>
                            {indicator.indicator_description && (
                              <p className="text-sm text-muted-foreground mt-1">{indicator.indicator_description}</p>
                            )}
                          </div>
                          <div className="text-right">
                            {indicator.indicator_code && (
                              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded block mb-1">
                                {indicator.indicator_code}
                              </span>
                            )}
                            {indicator.output_number && (
                              <span className="text-xs text-muted-foreground">
                                Output: {indicator.output_number}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Distributors Section */}
              {detailedInfo?.distributors && (
                detailedInfo.distributors.organizations.length > 0 || 
                detailedInfo.distributors.users.length > 0 || 
                detailedInfo.distributors.others.length > 0
              ) && (
                <section>
                  <h3 className="text-lg font-medium mb-3">Distribuidores y/o Usuarios</h3>
                  
                  {/* Distributor Organizations */}
                  {detailedInfo.distributors.organizations.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-md font-medium mb-2 text-muted-foreground">Organizations</h4>
                      <div className="space-y-2">
                        {detailedInfo.distributors.organizations.map((org, index) => (
                          <div key={index} className="p-3 bg-orange-50 rounded border border-orange-200">
                            <p className="font-medium text-orange-900">{org.organization_name}</p>
                            {org.organization_description && (
                              <p className="text-sm text-orange-700 mt-1">{org.organization_description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Distributor Users */}
                  {detailedInfo.distributors.users.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-md font-medium mb-2 text-muted-foreground">Users</h4>
                      <div className="space-y-2">
                        {detailedInfo.distributors.users.map((user, index) => (
                          <div key={index} className="p-3 bg-blue-50 rounded border border-blue-200">
                            <p className="font-medium text-blue-900">
                              {user.user_name} {user.user_last_name}
                            </p>
                            {user.user_email && (
                              <p className="text-sm text-blue-700">{user.user_email}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Other Distributors */}
                  {detailedInfo.distributors.others.length > 0 && (
                    <div>
                      <h4 className="text-md font-medium mb-2 text-muted-foreground">Others</h4>
                      <div className="space-y-2">
                        {detailedInfo.distributors.others.map((other, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded border border-gray-200">
                            <p className="font-medium text-gray-900">{other.display_name}</p>
                            {other.contact && (
                              <p className="text-sm text-gray-700">Contact: {other.contact}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* Check-ins Section */}
              <section>
                <h3 className="text-lg font-medium mb-3">Check-ins del Producto</h3>
                {isLoadingCheckins ? (
                  <div className="flex items-center justify-center h-20">
                    <p className="text-sm text-gray-500">Cargando check-ins...</p>
                  </div>
                ) : checkinData && checkinData.totalCheckins > 0 ? (
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600 mb-3">
                      Total de check-ins: <span className="font-medium">{checkinData.totalCheckins}</span>
                    </div>

                    {/* Check-ins vencidos */}
                    {checkinData.checkins.overdue.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-red-700 flex items-center gap-2">
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          Vencidos ({checkinData.checkins.overdue.length})
                        </h4>
                        {checkinData.checkins.overdue.map((checkin) => (
                          <div key={`overdue-${checkin.task_id}-${checkin.checkin_type}`} className="p-3 bg-red-50 border-l-4 border-red-500 rounded">
                            <p className="text-sm font-medium text-red-900">{checkin.task_name}</p>
                            <p className="text-xs text-red-700">
                              Fecha: {new Date(checkin.checkin_date).toLocaleDateString('es-ES')}
                            </p>
                            <p className="text-xs text-red-600">
                              Estado: {checkin.status_name} • {checkin.organization_name} • <span className="font-medium text-blue-700">{checkin.checkin_type}</span>
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Check-ins de hoy */}
                    {checkinData.checkins.today.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-orange-700 flex items-center gap-2">
                          <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                          Hoy ({checkinData.checkins.today.length})
                        </h4>
                        {checkinData.checkins.today.map((checkin) => (
                          <div key={`today-${checkin.task_id}-${checkin.checkin_type}`} className="p-3 bg-orange-50 border-l-4 border-orange-500 rounded">
                            <p className="text-sm font-medium text-orange-900">{checkin.task_name}</p>
                            <p className="text-xs text-orange-700">
                              Fecha: {new Date(checkin.checkin_date).toLocaleDateString('es-ES')}
                            </p>
                            <p className="text-xs text-orange-600">
                              Estado: {checkin.status_name} • {checkin.organization_name} • <span className="font-medium text-blue-700">{checkin.checkin_type}</span>
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Check-ins próximos */}
                    {(checkinData.checkins.tomorrow.length > 0 || checkinData.checkins.this_week.length > 0) && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-blue-700 flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          Próximos ({checkinData.checkins.tomorrow.length + checkinData.checkins.this_week.length})
                        </h4>
                        {[...checkinData.checkins.tomorrow, ...checkinData.checkins.this_week].map((checkin) => (
                          <div key={`upcoming-${checkin.task_id}-${checkin.checkin_type}`} className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                            <p className="text-sm font-medium text-blue-900">{checkin.task_name}</p>
                            <p className="text-xs text-blue-700">
                              Fecha: {new Date(checkin.checkin_date).toLocaleDateString('es-ES')} 
                              ({checkin.urgency_level === 'tomorrow' ? 'mañana' : 'esta semana'})
                            </p>
                            <p className="text-xs text-blue-600">
                              Estado: {checkin.status_name} • {checkin.organization_name} • <span className="font-medium text-blue-700">{checkin.checkin_type}</span>
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Check-ins futuros */}
                    {checkinData.checkins.later.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                          Futuros ({checkinData.checkins.later.length})
                        </h4>
                        {checkinData.checkins.later.slice(0, 3).map((checkin) => (
                          <div key={`later-${checkin.task_id}-${checkin.checkin_type}`} className="p-3 bg-gray-50 border-l-4 border-gray-500 rounded">
                            <p className="text-sm font-medium text-gray-900">{checkin.task_name}</p>
                            <p className="text-xs text-gray-700">
                              Fecha: {new Date(checkin.checkin_date).toLocaleDateString('es-ES')}
                            </p>
                            <p className="text-xs text-gray-600">
                              Estado: {checkin.status_name} • {checkin.organization_name} • <span className="font-medium text-blue-700">{checkin.checkin_type}</span>
                            </p>
                          </div>
                        ))}
                        {checkinData.checkins.later.length > 3 && (
                          <p className="text-xs text-gray-500 text-center">
                            ... y {checkinData.checkins.later.length - 3} más
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500">No hay check-ins programados para este producto</p>
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Usar portal para renderizar el modal en el body
  return typeof window !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null;
}
