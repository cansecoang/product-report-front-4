/**
 * Add Product Wizard - REFACTORED VERSION
 * 
 * Reemplaza add-product-modal-new.tsx (765 líneas) con wizard de 5 pasos
 * con validación Zod, React Query, y UX profesional
 */

"use client"

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { Wizard, WizardStep } from '@/components/wizard';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Users, Building2, Target, MapPin, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface WorkPackage {
  workpackage_id: number;
  workpackage_name: string;
}

interface Country {
  country_id: number;
  country_name: string;
}

interface Organization {
  organization_id: number;
  organization_name: string;
  organization_description?: string;
}

interface User {
  user_id: number;
  user_name: string;
  user_last_name: string;
  user_email: string;
}

interface Indicator {
  indicator_id: number;
  indicator_name: string;
  indicator_code: string;
  indicator_description?: string;
}

interface ResponsibleAssignment {
  user_id: number;
  role_label: string;
  is_primary: boolean;
  position: number;
}

interface OrganizationAssignment {
  organization_id: number;
  relation_type: string;
  position: number;
}

interface DistributorOther {
  display_name: string;
  contact: string;
}

interface ProductFormData {
  // Basic Info
  product_name: string;
  product_objective: string;
  deliverable: string;
  delivery_date: string;
  product_output: string;
  
  // Location & Context
  workpackage_id: string;
  product_owner_id: string;
  country_id: string;
  
  // Additional Info
  methodology_description: string;
  gender_specific_actions: string;
  next_steps: string;
  
  // Relations
  responsibles: ResponsibleAssignment[];
  organizations: OrganizationAssignment[];
  indicators: number[];
  distributor_orgs: number[];
  distributor_users: number[];
  distributor_others: DistributorOther[];
}

interface AddProductWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded?: () => void;
}

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

const basicInfoSchema = z.object({
  product_name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  product_objective: z.string().min(10, 'El objetivo debe tener al menos 10 caracteres'),
  deliverable: z.string().min(3, 'El entregable es requerido'),
  delivery_date: z.string().min(1, 'La fecha de entrega es requerida'),
  product_output: z.string().optional(),
});

const locationSchema = z.object({
  workpackage_id: z.string().min(1, 'Selecciona un Work Package'),
  product_owner_id: z.string().min(1, 'Selecciona una organización'),
  country_id: z.string().min(1, 'Selecciona un país'),
});


const indicatorsSchema = z.object({
  indicators: z.array(z.number()).min(1, 'Selecciona al menos un indicador'),
});


// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AddProductWizard({ isOpen, onClose, onProductAdded }: AddProductWizardProps) {
  const queryClient = useQueryClient();
  
  // Form data state
  const [formData, setFormData] = useState<ProductFormData>({
    product_name: '',
    product_objective: '',
    deliverable: '',
    delivery_date: '',
    product_output: '',
    workpackage_id: '',
    product_owner_id: '',
    country_id: '',
    methodology_description: '',
    gender_specific_actions: '',
    next_steps: '',
    responsibles: [],
    organizations: [],
    indicators: [],
    distributor_orgs: [],
    distributor_users: [],
    distributor_others: [],
  });

  // Options state
  const [workPackages, setWorkPackages] = useState<WorkPackage[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch options when wizard opens
  useEffect(() => {
    if (isOpen) {
      fetchAllOptions();
    }
  }, [isOpen]);

  const fetchAllOptions = async () => {
    setLoading(true);
    try {
      const responses = await Promise.allSettled([
        fetch('/api/work-packages').then(r => r.json()),
        fetch('/api/countries').then(r => r.json()),
        fetch('/api/organizations').then(r => r.json()),
        fetch('/api/responsibles').then(r => r.json()),
        fetch('/api/indicators').then(r => r.json()),
      ]);

      const [wpRes, countriesRes, orgsRes, usersRes, indicatorsRes] = responses;

      if (wpRes.status === 'fulfilled') {
        setWorkPackages(wpRes.value.workpackages || []);
      }
      if (countriesRes.status === 'fulfilled') {
        setCountries(countriesRes.value.countries || []);
      }
      if (orgsRes.status === 'fulfilled') {
        setOrganizations(orgsRes.value.organizations || []);
      }
      if (usersRes.status === 'fulfilled') {
        setUsers(usersRes.value.responsibles || []);
      }
      if (indicatorsRes.status === 'fulfilled') {
        setIndicators(indicatorsRes.value.indicators || []);
      }
    } catch (error) {
      console.error('Error fetching options:', error);
      toast.error('Error cargando opciones', {
        description: 'Algunas opciones podrían no estar disponibles'
      });
    } finally {
      setLoading(false);
    }
  };

  // Update form data helper
  const updateFormData = (updates: Partial<ProductFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // Handle wizard completion
  const handleComplete = async () => {
    // Validate all data
    try {
      basicInfoSchema.parse(formData);
      locationSchema.parse(formData);
      indicatorsSchema.parse(formData);

      // Submit to API
      const payload = {
        ...formData,
        workpackage_id: parseInt(formData.workpackage_id),
        product_owner_id: parseInt(formData.product_owner_id),
        country_id: parseInt(formData.country_id),
      };

      const response = await fetch('/api/add-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['products'] });
        
        toast.success('Producto creado', {
          description: 'El producto ha sido agregado exitosamente'
        });
        
        onProductAdded?.();
        onClose();
        
        // Reset form
        setFormData({
          product_name: '',
          product_objective: '',
          deliverable: '',
          delivery_date: '',
          product_output: '',
          workpackage_id: '',
          product_owner_id: '',
          country_id: '',
          methodology_description: '',
          gender_specific_actions: '',
          next_steps: '',
          responsibles: [],
          organizations: [],
          indicators: [],
          distributor_orgs: [],
          distributor_users: [],
          distributor_others: [],
        });
      } else {
        const errorData = await response.json();
        toast.error('Error al crear producto', {
          description: errorData.message || 'Inténtalo de nuevo'
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error('Validación fallida', {
          description: error.issues[0].message
        });
      } else {
        toast.error('Error', {
          description: 'No se pudo crear el producto'
        });
      }
    }
  };

  // Wizard steps configuration
  const steps: WizardStep[] = [
    {
      id: 'basic-info',
      title: 'Información Básica',
      description: 'Datos principales del producto',
      icon: Info,
    },
    {
      id: 'location',
      title: 'Ubicación y Contexto',
      description: 'Work Package, organización y país',
      icon: MapPin,
    },
    {
      id: 'team',
      title: 'Equipo',
      description: 'Responsables y organizaciones',
      icon: Users,
    },
    {
      id: 'indicators',
      title: 'Indicadores',
      description: 'Asociar indicadores al producto',
      icon: Target,
    },
    {
      id: 'review',
      title: 'Revisión',
      description: 'Confirmar y crear',
      icon: Building2,
    },
  ];

  return (
    <Wizard
      isOpen={isOpen}
      onClose={onClose}
      steps={steps}
      onComplete={handleComplete}
      title="Crear Nuevo Producto"
      description="Completa todos los pasos para crear un producto"
    >
      {({ currentStep }) => {
        switch (steps[currentStep].id) {
          case 'basic-info':
            return (
              <div data-step="basic-info" className="space-y-4">
                <BasicInfoStep 
                  data={formData} 
                  onChange={updateFormData}
                  loading={loading}
                />
              </div>
            );
          case 'location':
            return (
              <div data-step="location" className="space-y-4">
                <LocationStep
                  data={formData}
                  onChange={updateFormData}
                  workPackages={workPackages}
                  organizations={organizations}
                  countries={countries}
                  loading={loading}
                />
              </div>
            );
          case 'team':
            return (
              <div data-step="team" className="space-y-4">
                <TeamStep
                  data={formData}
                  onChange={updateFormData}
                  users={users}
                  organizations={organizations}
                  loading={loading}
                />
              </div>
            );
          case 'indicators':
            return (
              <div data-step="indicators" className="space-y-4">
                <IndicatorsStep
                  data={formData}
                  onChange={updateFormData}
                  indicators={indicators}
                  loading={loading}
                />
              </div>
            );
          case 'review':
            return (
              <div data-step="review" className="space-y-4">
                <ReviewStep data={formData} />
              </div>
            );
          default:
            return null;
        }
      }}
    </Wizard>
  );
}

// ============================================================================
// STEP COMPONENTS
// ============================================================================

interface StepProps {
  data: ProductFormData;
  onChange: (updates: Partial<ProductFormData>) => void;
  loading?: boolean;
}

function BasicInfoStep({ data, onChange, loading }: StepProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="product_name">Nombre del Producto *</Label>
        <Input
          id="product_name"
          value={data.product_name}
          onChange={(e) => onChange({ product_name: e.target.value })}
          placeholder="Ej: Diplomado Biofincas"
          disabled={loading}
        />
      </div>

      <div>
        <Label htmlFor="product_objective">Objetivo del Producto *</Label>
        <Textarea
          id="product_objective"
          value={data.product_objective}
          onChange={(e) => onChange({ product_objective: e.target.value })}
          placeholder="Describe el objetivo principal del producto..."
          rows={4}
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="deliverable">Entregable *</Label>
          <Input
            id="deliverable"
            value={data.deliverable}
            onChange={(e) => onChange({ deliverable: e.target.value })}
            placeholder="Ej: Informe de Sesiones"
            disabled={loading}
          />
        </div>

        <div>
          <Label htmlFor="delivery_date">Fecha de Entrega *</Label>
          <Input
            id="delivery_date"
            type="date"
            value={data.delivery_date}
            onChange={(e) => onChange({ delivery_date: e.target.value })}
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="product_output">Output del Producto</Label>
        <Input
          id="product_output"
          value={data.product_output}
          onChange={(e) => onChange({ product_output: e.target.value })}
          placeholder="Ej: OUT-1.1"
          disabled={loading}
        />
        <p className="text-sm text-muted-foreground mt-1">
          Opcional - Código del output asociado
        </p>
      </div>
    </div>
  );
}

interface LocationStepProps extends StepProps {
  workPackages: WorkPackage[];
  organizations: Organization[];
  countries: Country[];
}

function LocationStep({ data, onChange, workPackages, organizations, countries, loading }: LocationStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="workpackage_id">Work Package *</Label>
        <Select
          value={data.workpackage_id}
          onValueChange={(value) => onChange({ workpackage_id: value })}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un Work Package" />
          </SelectTrigger>
          <SelectContent>
            {workPackages.map((wp) => (
              <SelectItem key={wp.workpackage_id} value={String(wp.workpackage_id)}>
                {wp.workpackage_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="product_owner_id">Organización Primaria *</Label>
        <Select
          value={data.product_owner_id}
          onValueChange={(value) => onChange({ product_owner_id: value })}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una organización" />
          </SelectTrigger>
          <SelectContent>
            {organizations.map((org) => (
              <SelectItem key={org.organization_id} value={String(org.organization_id)}>
                {org.organization_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="country_id">País *</Label>
        <Select
          value={data.country_id}
          onValueChange={(value) => onChange({ country_id: value })}
          disabled={loading}
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
    </div>
  );
}

interface TeamStepProps extends StepProps {
  users: User[];
  organizations: Organization[];
}

function TeamStep({ data, onChange, users, organizations, loading }: TeamStepProps) {
  const addResponsible = () => {
    onChange({
      responsibles: [
        ...data.responsibles,
        {
          user_id: 0,
          role_label: '',
          is_primary: false,
          position: data.responsibles.length + 1,
        },
      ],
    });
  };

  const removeResponsible = (index: number) => {
    onChange({
      responsibles: data.responsibles.filter((_, i) => i !== index),
    });
  };

  const updateResponsible = (
    index: number,
    field: keyof ResponsibleAssignment,
    value: ResponsibleAssignment[keyof ResponsibleAssignment]
  ) => {
    const updated = [...data.responsibles];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ responsibles: updated });
  };

  const addOrganization = () => {
    onChange({
      organizations: [
        ...data.organizations,
        {
          organization_id: 0,
          relation_type: '',
          position: data.organizations.length + 1,
        },
      ],
    });
  };

  const removeOrganization = (index: number) => {
    onChange({
      organizations: data.organizations.filter((_, i) => i !== index),
    });
  };

  const updateOrganization = (
    index: number,
    field: keyof OrganizationAssignment,
    value: OrganizationAssignment[keyof OrganizationAssignment]
  ) => {
    const updated = [...data.organizations];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ organizations: updated });
  };

  return (
    <div className="space-y-6">
      {/* Responsables */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Label>Responsables</Label>
          <Button
            type="button"
            onClick={addResponsible}
            size="sm"
            variant="outline"
            disabled={loading}
          >
            <Plus className="h-4 w-4 mr-1" />
            Agregar
          </Button>
        </div>

        <div className="space-y-3">
          {data.responsibles.map((responsible, index) => (
            <div key={index} className="flex gap-2 items-start p-3 border rounded-lg">
              <div className="flex-1 space-y-2">
                <Select
                  value={String(responsible.user_id)}
                  onValueChange={(value) => updateResponsible(index, 'user_id', parseInt(value))}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.user_id} value={String(user.user_id)}>
                        {user.user_name} {user.user_last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  value={responsible.role_label}
                  onChange={(e) => updateResponsible(index, 'role_label', e.target.value)}
                  placeholder="Rol (ej: Coordinador)"
                  disabled={loading}
                />
              </div>

              <Button
                type="button"
                onClick={() => removeResponsible(index)}
                size="icon"
                variant="ghost"
                disabled={loading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {data.responsibles.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay responsables asignados
            </p>
          )}
        </div>
      </div>

      {/* Organizations */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Label>Organizaciones Colaboradoras</Label>
          <Button
            type="button"
            onClick={addOrganization}
            size="sm"
            variant="outline"
            disabled={loading}
          >
            <Plus className="h-4 w-4 mr-1" />
            Agregar
          </Button>
        </div>

        <div className="space-y-3">
          {data.organizations.map((org, index) => (
            <div key={index} className="flex gap-2 items-start p-3 border rounded-lg">
              <div className="flex-1 space-y-2">
                <Select
                  value={String(org.organization_id)}
                  onValueChange={(value) => updateOrganization(index, 'organization_id', parseInt(value))}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona organización" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((organization) => (
                      <SelectItem key={organization.organization_id} value={String(organization.organization_id)}>
                        {organization.organization_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  value={org.relation_type}
                  onChange={(e) => updateOrganization(index, 'relation_type', e.target.value)}
                  placeholder="Tipo de relación (ej: Implementador)"
                  disabled={loading}
                />
              </div>

              <Button
                type="button"
                onClick={() => removeOrganization(index)}
                size="icon"
                variant="ghost"
                disabled={loading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {data.organizations.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay organizaciones colaboradoras
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

interface IndicatorsStepProps extends StepProps {
  indicators: Indicator[];
}

function IndicatorsStep({ data, onChange, indicators, loading }: IndicatorsStepProps) {
  const toggleIndicator = (indicatorId: number) => {
    const newIndicators = data.indicators.includes(indicatorId)
      ? data.indicators.filter(id => id !== indicatorId)
      : [...data.indicators, indicatorId];
    
    onChange({ indicators: newIndicators });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Indicadores Asociados *</Label>
        <p className="text-sm text-muted-foreground mb-3">
          Selecciona al menos un indicador
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
          {indicators.map((indicator) => (
            <button
              key={indicator.indicator_id}
              type="button"
              onClick={() => toggleIndicator(indicator.indicator_id)}
              disabled={loading}
              className={`p-3 border rounded-lg text-left transition-colors ${
                data.indicators.includes(indicator.indicator_id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">{indicator.indicator_code}</Badge>
                    {data.indicators.includes(indicator.indicator_id) && (
                      <Badge variant="default">Seleccionado</Badge>
                    )}
                  </div>
                  <p className="font-medium text-sm">{indicator.indicator_name}</p>
                  {indicator.indicator_description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {indicator.indicator_description}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {data.indicators.length > 0 && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium">
              {data.indicators.length} indicador(es) seleccionado(s)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewStep({ data }: { data: ProductFormData }) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm font-medium text-blue-900">
          Revisa la información antes de crear el producto
        </p>
      </div>

      <div className="space-y-4">
        {/* Basic Info */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Info className="h-4 w-4" />
            Información Básica
          </h4>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="font-medium text-muted-foreground">Nombre:</dt>
              <dd>{data.product_name}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">Objetivo:</dt>
              <dd>{data.product_objective}</dd>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <dt className="font-medium text-muted-foreground">Entregable:</dt>
                <dd>{data.deliverable}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Fecha:</dt>
                <dd>{data.delivery_date}</dd>
              </div>
            </div>
          </dl>
        </div>

        {/* Location */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Ubicación y Contexto
          </h4>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="font-medium text-muted-foreground">Work Package ID:</dt>
              <dd>{data.workpackage_id}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">Organización ID:</dt>
              <dd>{data.product_owner_id}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">País ID:</dt>
              <dd>{data.country_id}</dd>
            </div>
          </dl>
        </div>

        {/* Team */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Equipo
          </h4>
          <div className="space-y-2 text-sm">
            <div>
              <dt className="font-medium text-muted-foreground">Responsables:</dt>
              <dd>{data.responsibles.length} asignado(s)</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">Organizaciones:</dt>
              <dd>{data.organizations.length} asignada(s)</dd>
            </div>
          </div>
        </div>

        {/* Indicators */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Indicadores
          </h4>
          <p className="text-sm">
            {data.indicators.length} indicador(es) seleccionado(s)
          </p>
        </div>
      </div>
    </div>
  );
}