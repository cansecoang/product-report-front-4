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
      const [
        workPackagesRes,
        countriesRes,
        organizationsRes,
        usersRes,
        indicatorsRes
      ] = await Promise.all([
        fetch('/api/work-packages'),
        fetch('/api/countries'),
        fetch('/api/organizations'),
        fetch('/api/responsibles'),
        fetch('/api/indicators')
      ]);

      const [
        workPackagesData,
        countriesData,
        organizationsData,
        usersData,
        indicatorsData
      ] = await Promise.all([
        workPackagesRes.ok ? workPackagesRes.json() : { workpackages: [] },
        countriesRes.ok ? countriesRes.json() : { countries: [] },
        organizationsRes.ok ? organizationsRes.json() : { organizations: [] },
        usersRes.ok ? usersRes.json() : { responsibles: [] },
        indicatorsRes.ok ? indicatorsRes.json() : { indicators: [] }
      ]);

      setWorkPackages(workPackagesData.workpackages || []);
      setCountries(countriesData.countries || []);
      setOrganizations(organizationsData.organizations || []);
      setUsers(usersData.responsibles || []);
      setIndicators(indicatorsData.indicators || []);

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
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Agregar Nuevo Producto</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="text-gray-500">Cargando opciones...</div>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Básica del Producto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nombre del Producto *</label>
                <Input
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Ej: Proyecto Café Orgánico"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Work Package *</label>
                <select
                  name="work_package_id"
                  value={formData.work_package_id}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Seleccionar Work Package</option>
                  {workPackages.map(wp => (
                    <option key={wp.id} value={wp.id}>{wp.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">País *</label>
                <Input
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                  placeholder="Ej: Colombia"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Fecha de Entrega</label>
                <Input
                  type="date"
                  name="delivery_date"
                  value={formData.delivery_date}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Presupuesto</label>
                <Input
                  type="number"
                  step="0.01"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  placeholder="Ej: 50000.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Estado</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="active">Activo</option>
                  <option value="paused">Pausado</option>
                  <option value="completed">Completado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Descripción</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Descripción del producto..."
              />
            </div>

            {/* Relaciones Muchos a Muchos */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold border-b pb-2">Relaciones del Producto</h3>
              
              {/* Indicadores */}
              <div>
                <label className="block text-sm font-medium mb-2">Indicadores</label>
                <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                  {indicators.map(indicator => (
                    <label key={indicator.id} className="flex items-center space-x-2 py-1">
                      <input
                        type="checkbox"
                        checked={selectedIndicators.includes(indicator.id)}
                        onChange={() => handleMultiSelectChange(indicator.id, selectedIndicators, setSelectedIndicators)}
                      />
                      <span className="text-sm">{indicator.name} ({indicator.unit})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Responsables */}
              <div>
                <label className="block text-sm font-medium mb-2">Responsables</label>
                <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                  {responsibles.map(responsible => (
                    <label key={responsible.id} className="flex items-center space-x-2 py-1">
                      <input
                        type="checkbox"
                        checked={selectedResponsibles.includes(responsible.id)}
                        onChange={() => handleMultiSelectChange(responsible.id, selectedResponsibles, setSelectedResponsibles)}
                      />
                      <span className="text-sm">{responsible.name} - {responsible.email}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Organizaciones */}
              <div>
                <label className="block text-sm font-medium mb-2">Organizaciones</label>
                <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                  {organizations.map(org => (
                    <label key={org.id} className="flex items-center space-x-2 py-1">
                      <input
                        type="checkbox"
                        checked={selectedOrganizations.includes(org.id)}
                        onChange={() => handleMultiSelectChange(org.id, selectedOrganizations, setSelectedOrganizations)}
                      />
                      <span className="text-sm">{org.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Organizaciones Distribuidoras */}
              <div>
                <label className="block text-sm font-medium mb-2">Organizaciones Distribuidoras</label>
                <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                  {distributorOrgs.map(distOrg => (
                    <label key={distOrg.id} className="flex items-center space-x-2 py-1">
                      <input
                        type="checkbox"
                        checked={selectedDistributorOrgs.includes(distOrg.id)}
                        onChange={() => handleMultiSelectChange(distOrg.id, selectedDistributorOrgs, setSelectedDistributorOrgs)}
                      />
                      <span className="text-sm">{distOrg.name} ({distOrg.type})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Usuarios Distribuidores */}
              <div>
                <label className="block text-sm font-medium mb-2">Usuarios Distribuidores</label>
                <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                  {distributorUsers.map(distUser => (
                    <label key={distUser.id} className="flex items-center space-x-2 py-1">
                      <input
                        type="checkbox"
                        checked={selectedDistributorUsers.includes(distUser.id)}
                        onChange={() => handleMultiSelectChange(distUser.id, selectedDistributorUsers, setSelectedDistributorUsers)}
                      />
                      <span className="text-sm">{distUser.name} - {distUser.specialty}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Otros Distribuidores */}
              <div>
                <label className="block text-sm font-medium mb-2">Otros Distribuidores</label>
                <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                  {distributorOthers.map(distOther => (
                    <label key={distOther.id} className="flex items-center space-x-2 py-1">
                      <input
                        type="checkbox"
                        checked={selectedDistributorOthers.includes(distOther.id)}
                        onChange={() => handleMultiSelectChange(distOther.id, selectedDistributorOthers, setSelectedDistributorOthers)}
                      />
                      <span className="text-sm">{distOther.name} ({distOther.type})</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {submitting ? 'Creando...' : 'Crear Producto'}
              </Button>
            </div>
          </form>
          </>
        )}
      </div>
    </div>
  );
}
