"use client"

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, Trash2 } from 'lucide-react';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: () => void;
}

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

export default function AddProductModal({ isOpen, onClose, onProductAdded }: AddProductModalProps) {
  // Estados para el formulario principal
  const [formData, setFormData] = useState({
    product_name: '',
    product_objective: '',
    deliverable: '',
    delivery_date: '',
    product_output: '',
    methodology_description: '',
    gender_specific_actions: '',
    next_steps: '',
    workpackage_id: '',
    product_owner_id: '',
    country_id: ''
  });

  // Estados para las opciones disponibles
  const [workPackages, setWorkPackages] = useState<WorkPackage[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [indicators, setIndicators] = useState<Indicator[]>([]);

  // Estados para las relaciones
  const [responsibleAssignments, setResponsibleAssignments] = useState<ResponsibleAssignment[]>([]);
  const [organizationAssignments, setOrganizationAssignments] = useState<OrganizationAssignment[]>([]);
  const [selectedIndicators, setSelectedIndicators] = useState<number[]>([]);
  const [distributorOrgs, setDistributorOrgs] = useState<number[]>([]);
  const [distributorUsers, setDistributorUsers] = useState<number[]>([]);
  const [distributorOthers, setDistributorOthers] = useState<DistributorOther[]>([]);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch todas las opciones al abrir el modal
  useEffect(() => {
    if (isOpen) {
      fetchAllOptions();
    }
  }, [isOpen]);

  const fetchAllOptions = async () => {
    setLoading(true);
    setError(null);
    try {
      // Crear endpoints simulados si no existen
      const mockData = {
        workpackages: [
          { workpackage_id: 1, workpackage_name: "Conservation & Restoration" },
          { workpackage_id: 2, workpackage_name: "Sustainable Agriculture" },
          { workpackage_id: 3, workpackage_name: "Capacity Building" },
          { workpackage_id: 4, workpackage_name: "Research & Monitoring" }
        ],
        countries: [
          { country_id: 1, country_name: "Colombia" },
          { country_id: 2, country_name: "Mexico" },
          { country_id: 3, country_name: "Peru" }
        ],
        organizations: [
          { organization_id: 1, organization_name: "OroVerde", organization_description: "German environmental organization" },
          { organization_id: 2, organization_name: "Pronatura Sur", organization_description: "Mexican conservation organization" },
          { organization_id: 3, organization_name: "SINCHI", organization_description: "Colombian research institute" }
        ],
        users: [
          { user_id: 1, user_name: "Ana", user_last_name: "García", user_email: "ana.garcia@example.com" },
          { user_id: 2, user_name: "Carlos", user_last_name: "Méndez", user_email: "carlos.mendez@example.com" },
          { user_id: 3, user_name: "María", user_last_name: "Silva", user_email: "maria.silva@example.com" }
        ],
        indicators: [
          { indicator_id: 1, indicator_name: "Hectares Restored", indicator_code: "1.1", indicator_description: "Total hectares of forest restored" },
          { indicator_id: 2, indicator_name: "Farmers Trained", indicator_code: "2.1", indicator_description: "Number of farmers trained in sustainable practices" },
          { indicator_id: 3, indicator_name: "Species Monitored", indicator_code: "1.2", indicator_description: "Number of species under monitoring" }
        ]
      };

      // Intentar cargar desde APIs reales, usar datos mock como fallback
      try {
        const responses = await Promise.allSettled([
          fetch('/api/work-packages'),
          fetch('/api/countries'),
          fetch('/api/organizations'),
          fetch('/api/responsibles'),
          fetch('/api/indicators')
        ]);

        // Procesar respuestas
        const [wpRes, countriesRes, orgsRes, usersRes, indicatorsRes] = responses;

        setWorkPackages(
          wpRes.status === 'fulfilled' && wpRes.value.ok 
            ? (await wpRes.value.json()).workpackages || mockData.workpackages
            : mockData.workpackages
        );
        
        setCountries(
          countriesRes.status === 'fulfilled' && countriesRes.value.ok 
            ? (await countriesRes.value.json()).countries || mockData.countries
            : mockData.countries
        );
        
        setOrganizations(
          orgsRes.status === 'fulfilled' && orgsRes.value.ok 
            ? (await orgsRes.value.json()).organizations || mockData.organizations
            : mockData.organizations
        );
        
        setUsers(
          usersRes.status === 'fulfilled' && usersRes.value.ok 
            ? (await usersRes.value.json()).responsibles || mockData.users
            : mockData.users
        );
        
        setIndicators(
          indicatorsRes.status === 'fulfilled' && indicatorsRes.value.ok 
            ? (await indicatorsRes.value.json()).indicators || mockData.indicators
            : mockData.indicators
        );

      } catch (error) {
        console.warn('Using mock data due to API error:', error);
        setWorkPackages(mockData.workpackages);
        setCountries(mockData.countries);
        setOrganizations(mockData.organizations);
        setUsers(mockData.users);
        setIndicators(mockData.indicators);
      }

    } catch (error) {
      console.error('Error fetching options:', error);
      setError('Error cargando las opciones.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addResponsible = () => {
    setResponsibleAssignments([...responsibleAssignments, {
      user_id: 0,
      role_label: '',
      is_primary: false,
      position: responsibleAssignments.length + 1
    }]);
  };

  const removeResponsible = (index: number) => {
    setResponsibleAssignments(responsibleAssignments.filter((_, i) => i !== index));
  };

  const updateResponsible = (index: number, field: keyof ResponsibleAssignment, value: any) => {
    const updated = [...responsibleAssignments];
    updated[index] = { ...updated[index], [field]: value };
    setResponsibleAssignments(updated);
  };

  const addOrganization = () => {
    setOrganizationAssignments([...organizationAssignments, {
      organization_id: 0,
      relation_type: '',
      position: organizationAssignments.length + 1
    }]);
  };

  const removeOrganization = (index: number) => {
    setOrganizationAssignments(organizationAssignments.filter((_, i) => i !== index));
  };

  const updateOrganization = (index: number, field: keyof OrganizationAssignment, value: any) => {
    const updated = [...organizationAssignments];
    updated[index] = { ...updated[index], [field]: value };
    setOrganizationAssignments(updated);
  };

  const addDistributorOther = () => {
    setDistributorOthers([...distributorOthers, {
      display_name: '',
      contact: ''
    }]);
  };

  const removeDistributorOther = (index: number) => {
    setDistributorOthers(distributorOthers.filter((_, i) => i !== index));
  };

  const updateDistributorOther = (index: number, field: keyof DistributorOther, value: string) => {
    const updated = [...distributorOthers];
    updated[index] = { ...updated[index], [field]: value };
    setDistributorOthers(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        workpackage_id: parseInt(formData.workpackage_id),
        product_owner_id: parseInt(formData.product_owner_id),
        country_id: parseInt(formData.country_id),
        responsibles: responsibleAssignments.filter(r => r.user_id > 0),
        organizations: organizationAssignments.filter(o => o.organization_id > 0),
        indicators: selectedIndicators,
        distributor_orgs: distributorOrgs,
        distributor_users: distributorUsers,
        distributor_others: distributorOthers.filter(d => d.display_name.trim() !== '')
      };

      const response = await fetch('/api/add-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onProductAdded();
        handleClose();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error creating product');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Error submitting form');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      product_name: '',
      product_objective: '',
      deliverable: '',
      delivery_date: '',
      product_output: '',
      methodology_description: '',
      gender_specific_actions: '',
      next_steps: '',
      workpackage_id: '',
      product_owner_id: '',
      country_id: ''
    });
    setResponsibleAssignments([]);
    setOrganizationAssignments([]);
    setSelectedIndicators([]);
    setDistributorOrgs([]);
    setDistributorUsers([]);
    setDistributorOthers([]);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Crear Nuevo Producto</h2>
          <Button onClick={handleClose} variant="ghost" size="sm">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="text-gray-500">Cargando opciones...</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            <div className="space-y-8">
              {/* Información Básica del Producto */}
              <section>
                <h3 className="text-lg font-medium mb-4 text-gray-900">Información Básica</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Nombre del Producto *</label>
                    <Input
                      name="product_name"
                      value={formData.product_name}
                      onChange={handleInputChange}
                      required
                      placeholder="Ej: Diplomado Biofincas"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Objetivo del Producto *</label>
                    <Textarea
                      name="product_objective"
                      value={formData.product_objective}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      placeholder="Describe el objetivo principal del producto..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Entregable *</label>
                    <Input
                      name="deliverable"
                      value={formData.deliverable}
                      onChange={handleInputChange}
                      required
                      placeholder="Ej: Informe de Sesiones del Diplomado"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Fecha de Entrega *</label>
                    <Input
                      type="date"
                      name="delivery_date"
                      value={formData.delivery_date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Output del Producto</label>
                    <Input
                      name="product_output"
                      value={formData.product_output}
                      onChange={handleInputChange}
                      placeholder="Ej: OUT-1.1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Work Package *</label>
                    <select
                      name="workpackage_id"
                      value={formData.workpackage_id}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar Work Package</option>
                      {workPackages.map(wp => (
                        <option key={wp.workpackage_id} value={wp.workpackage_id}>
                          {wp.workpackage_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Organización Primaria *</label>
                    <select
                      name="product_owner_id"
                      value={formData.product_owner_id}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar Organización</option>
                      {organizations.map(org => (
                        <option key={org.organization_id} value={org.organization_id}>
                          {org.organization_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">País *</label>
                    <select
                      name="country_id"
                      value={formData.country_id}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar País</option>
                      {countries.map(country => (
                        <option key={country.country_id} value={country.country_id}>
                          {country.country_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              {/* Metodología y Acciones */}
              <section>
                <h3 className="text-lg font-medium mb-4 text-gray-900">Metodología y Acciones</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Descripción de Metodología</label>
                    <Textarea
                      name="methodology_description"
                      value={formData.methodology_description}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Describe la metodología a utilizar..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Acciones Específicas de Género</label>
                    <Textarea
                      name="gender_specific_actions"
                      value={formData.gender_specific_actions}
                      onChange={handleInputChange}
                      rows={2}
                      placeholder="Describe las acciones relacionadas con género..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Próximos Pasos</label>
                    <Textarea
                      name="next_steps"
                      value={formData.next_steps}
                      onChange={handleInputChange}
                      rows={2}
                      placeholder="Describe los próximos pasos..."
                    />
                  </div>
                </div>
              </section>

              {/* Personas Responsables */}
              <section>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Personas Responsables</h3>
                  <Button type="button" onClick={addResponsible} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Responsable
                  </Button>
                </div>
                <div className="space-y-3">
                  {responsibleAssignments.map((responsible, index) => (
                    <div key={index} className="p-4 bg-muted/50 rounded border">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Usuario</label>
                          <select
                            value={responsible.user_id}
                            onChange={(e) => updateResponsible(index, 'user_id', parseInt(e.target.value))}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                          >
                            <option value={0}>Seleccionar Usuario</option>
                            {users.map(user => (
                              <option key={user.user_id} value={user.user_id}>
                                {user.user_name} {user.user_last_name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Rol</label>
                          <Input
                            value={responsible.role_label}
                            onChange={(e) => updateResponsible(index, 'role_label', e.target.value)}
                            placeholder="Ej: Coordinación"
                            className="text-sm"
                          />
                        </div>
                        <div className="flex items-center space-x-4">
                          <label className="flex items-center text-sm">
                            <input
                              type="checkbox"
                              checked={responsible.is_primary}
                              onChange={(e) => updateResponsible(index, 'is_primary', e.target.checked)}
                              className="mr-2"
                            />
                            Responsable Primario
                          </label>
                        </div>
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            onClick={() => removeResponsible(index)}
                            variant="outline"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Organizaciones Involucradas */}
              <section>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Organizaciones Involucradas</h3>
                  <Button type="button" onClick={addOrganization} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Organización
                  </Button>
                </div>
                <div className="space-y-3">
                  {organizationAssignments.map((orgAssignment, index) => (
                    <div key={index} className="p-4 bg-muted/50 rounded border">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Organización</label>
                          <select
                            value={orgAssignment.organization_id}
                            onChange={(e) => updateOrganization(index, 'organization_id', parseInt(e.target.value))}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                          >
                            <option value={0}>Seleccionar Organización</option>
                            {organizations.map(org => (
                              <option key={org.organization_id} value={org.organization_id}>
                                {org.organization_name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Tipo de Relación</label>
                          <Input
                            value={orgAssignment.relation_type}
                            onChange={(e) => updateOrganization(index, 'relation_type', e.target.value)}
                            placeholder="Ej: Apoyo, Colaboración"
                            className="text-sm"
                          />
                        </div>
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            onClick={() => removeOrganization(index)}
                            variant="outline"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Indicadores Relacionados */}
              <section>
                <h3 className="text-lg font-medium mb-4 text-gray-900">Indicadores Relacionados</h3>
                <div className="max-h-40 overflow-y-auto border rounded p-3 bg-gray-50">
                  {indicators.map(indicator => (
                    <label key={indicator.indicator_id} className="flex items-center space-x-2 py-1">
                      <input
                        type="checkbox"
                        checked={selectedIndicators.includes(indicator.indicator_id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIndicators([...selectedIndicators, indicator.indicator_id]);
                          } else {
                            setSelectedIndicators(selectedIndicators.filter(id => id !== indicator.indicator_id));
                          }
                        }}
                      />
                      <span className="text-sm">
                        {indicator.indicator_name} ({indicator.indicator_code})
                      </span>
                    </label>
                  ))}
                </div>
              </section>

              {/* Distribuidores */}
              <section>
                <h3 className="text-lg font-medium mb-4 text-gray-900">Distribuidores y Usuarios</h3>
                
                {/* Organizaciones Distribuidoras */}
                <div className="mb-4">
                  <h4 className="text-md font-medium mb-2 text-gray-700">Organizaciones Distribuidoras</h4>
                  <div className="max-h-32 overflow-y-auto border rounded p-3 bg-orange-50">
                    {organizations.map(org => (
                      <label key={org.organization_id} className="flex items-center space-x-2 py-1">
                        <input
                          type="checkbox"
                          checked={distributorOrgs.includes(org.organization_id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setDistributorOrgs([...distributorOrgs, org.organization_id]);
                            } else {
                              setDistributorOrgs(distributorOrgs.filter(id => id !== org.organization_id));
                            }
                          }}
                        />
                        <span className="text-sm">{org.organization_name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Usuarios Distribuidores */}
                <div className="mb-4">
                  <h4 className="text-md font-medium mb-2 text-gray-700">Usuarios Distribuidores</h4>
                  <div className="max-h-32 overflow-y-auto border rounded p-3 bg-blue-50">
                    {users.map(user => (
                      <label key={user.user_id} className="flex items-center space-x-2 py-1">
                        <input
                          type="checkbox"
                          checked={distributorUsers.includes(user.user_id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setDistributorUsers([...distributorUsers, user.user_id]);
                            } else {
                              setDistributorUsers(distributorUsers.filter(id => id !== user.user_id));
                            }
                          }}
                        />
                        <span className="text-sm">
                          {user.user_name} {user.user_last_name} ({user.user_email})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Otros Distribuidores */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-md font-medium text-gray-700">Otros Distribuidores</h4>
                    <Button type="button" onClick={addDistributorOther} variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Otro
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {distributorOthers.map((other, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded border">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <Input
                              value={other.display_name}
                              onChange={(e) => updateDistributorOther(index, 'display_name', e.target.value)}
                              placeholder="Nombre de la entidad"
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Input
                              value={other.contact}
                              onChange={(e) => updateDistributorOther(index, 'contact', e.target.value)}
                              placeholder="Información de contacto"
                              className="text-sm"
                            />
                          </div>
                          <div className="flex justify-end">
                            <Button
                              type="button"
                              onClick={() => removeDistributorOther(index)}
                              variant="outline"
                              size="sm"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            {/* Botones de Acción */}
            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
              <Button type="button" onClick={handleClose} variant="outline">
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Creando...' : 'Crear Producto'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
