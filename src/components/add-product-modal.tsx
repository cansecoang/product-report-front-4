"use client"

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: () => void;
}

interface WorkPackage {
  id: string;
  name: string;
}

interface Option {
  id: number;
  name: string;
  email?: string;
  description?: string;
  unit?: string;
  type?: string;
  specialty?: string;
  contact_info?: string;
}

export default function AddProductModal({ isOpen, onClose, onProductAdded }: AddProductModalProps) {
  const [formData, setFormData] = useState({
    product_name: '',
    work_package_id: '',
    country: '',
    delivery_date: '',
    description: '',
    budget: '',
    status: 'active'
  });

  // Estados para las opciones de relaciones
  const [workPackages, setWorkPackages] = useState<WorkPackage[]>([]);
  const [indicators, setIndicators] = useState<Option[]>([]);
  const [responsibles, setResponsibles] = useState<Option[]>([]);
  const [organizations, setOrganizations] = useState<Option[]>([]);
  const [distributorOrgs, setDistributorOrgs] = useState<Option[]>([]);
  const [distributorUsers, setDistributorUsers] = useState<Option[]>([]);
  const [distributorOthers, setDistributorOthers] = useState<Option[]>([]);

  // Estados para las selecciones múltiples
  const [selectedIndicators, setSelectedIndicators] = useState<number[]>([]);
  const [selectedResponsibles, setSelectedResponsibles] = useState<number[]>([]);
  const [selectedOrganizations, setSelectedOrganizations] = useState<number[]>([]);
  const [selectedDistributorOrgs, setSelectedDistributorOrgs] = useState<number[]>([]);
  const [selectedDistributorUsers, setSelectedDistributorUsers] = useState<number[]>([]);
  const [selectedDistributorOthers, setSelectedDistributorOthers] = useState<number[]>([]);

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
        indicatorsRes,
        responsiblesRes,
        organizationsRes,
        distributorOrgsRes,
        distributorUsersRes,
        distributorOthersRes
      ] = await Promise.all([
        fetch('/api/work-packages'),
        fetch('/api/indicators'),
        fetch('/api/responsibles'),
        fetch('/api/organizations'),
        fetch('/api/distributor-orgs'),
        fetch('/api/distributor-users'),
        fetch('/api/distributor-others')
      ]);

      if (!workPackagesRes.ok) {
        console.error('Error fetching work packages');
      }
      if (!indicatorsRes.ok) {
        console.error('Error fetching indicators');
      }
      if (!responsiblesRes.ok) {
        console.error('Error fetching responsibles');
      }
      if (!organizationsRes.ok) {
        console.error('Error fetching organizations');
      }
      if (!distributorOrgsRes.ok) {
        console.error('Error fetching distributor orgs');
      }
      if (!distributorUsersRes.ok) {
        console.error('Error fetching distributor users');
      }
      if (!distributorOthersRes.ok) {
        console.error('Error fetching distributor others');
      }

      const [
        workPackagesData,
        indicatorsData,
        responsiblesData,
        organizationsData,
        distributorOrgsData,
        distributorUsersData,
        distributorOthersData
      ] = await Promise.all([
        workPackagesRes.ok ? workPackagesRes.json() : [],
        indicatorsRes.ok ? indicatorsRes.json() : { indicators: [] },
        responsiblesRes.ok ? responsiblesRes.json() : { responsibles: [] },
        organizationsRes.ok ? organizationsRes.json() : { organizations: [] },
        distributorOrgsRes.ok ? distributorOrgsRes.json() : { distributorOrgs: [] },
        distributorUsersRes.ok ? distributorUsersRes.json() : { distributorUsers: [] },
        distributorOthersRes.ok ? distributorOthersRes.json() : { distributorOthers: [] }
      ]);

      setWorkPackages(workPackagesData || []);
      setIndicators(indicatorsData.indicators || []);
      setResponsibles(responsiblesData.responsibles || []);
      setOrganizations(organizationsData.organizations || []);
      setDistributorOrgs(distributorOrgsData.distributorOrgs || []);
      setDistributorUsers(distributorUsersData.distributorUsers || []);
      setDistributorOthers(distributorOthersData.distributorOthers || []);

    } catch (error) {
      console.error('Error fetching options:', error);
      setError('Error cargando las opciones. Se usarán datos de ejemplo.');
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

  const handleMultiSelectChange = (
    value: number,
    currentSelection: number[],
    setSelection: (selection: number[]) => void
  ) => {
    if (currentSelection.includes(value)) {
      setSelection(currentSelection.filter(id => id !== value));
    } else {
      setSelection([...currentSelection, value]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        indicator_ids: selectedIndicators,
        responsible_ids: selectedResponsibles,
        organization_ids: selectedOrganizations,
        distributor_org_ids: selectedDistributorOrgs,
        distributor_user_ids: selectedDistributorUsers,
        distributor_other_ids: selectedDistributorOthers
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
        console.error('Error creating product');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      product_name: '',
      work_package_id: '',
      country: '',
      delivery_date: '',
      description: '',
      budget: '',
      status: 'active'
    });
    setSelectedIndicators([]);
    setSelectedResponsibles([]);
    setSelectedOrganizations([]);
    setSelectedDistributorOrgs([]);
    setSelectedDistributorUsers([]);
    setSelectedDistributorOthers([]);
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
