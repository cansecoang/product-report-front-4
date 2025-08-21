"use client"

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, Trash2 } from 'lucide-react';

interface EditingProduct {
  product_id: number;
  product_name: string;
  product_objective: string;
  deliverable: string;
  delivery_date: string;
  methodology_description: string;
  gender_specific_actions: string;
  next_steps: string;
  workpackage_id: string;
  workinggroup_id?: string; // Agregar working group como opcional
  product_owner_id: string;
  country_id: string;
  output_number: string;
  // Relaciones
  responsibles?: ResponsibleAssignment[];
  organizations?: OrganizationAssignment[];
  indicators?: number[];
  distributorOrgs?: number[];
  distributorUsers?: number[];
  distributorOthers?: DistributorOther[];
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: () => void;
  onProductUpdated?: () => void; // Callback específico para actualización
  editingProduct?: EditingProduct; // Producto a editar (opcional)
  mode?: 'create' | 'edit'; // Modo del modal
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

export default function AddProductModal({ 
  isOpen, 
  onClose, 
  onProductAdded, 
  onProductUpdated,
  editingProduct, 
  mode = 'create' 
}: AddProductModalProps) {
  // Estados para el formulario principal
  const [formData, setFormData] = useState({
    product_name: '',
    product_objective: '',
    deliverable: '',
    delivery_date: '',
    methodology_description: '',
    gender_specific_actions: '',
    next_steps: '',
    workpackage_id: '',
    workinggroup_id: '', // Nuevo campo para working group
    product_owner_id: '',
    country_id: '',
    output_number: ''
  });

  // Estados para las opciones disponibles
  const [workPackages, setWorkPackages] = useState<WorkPackage[]>([]);
  const [workingGroups, setWorkingGroups] = useState<{workinggroup_id: number, workinggroup_name: string, workinggroup_description: string}[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [outputs, setOutputs] = useState<{value: string, label: string}[]>([]);

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
        ]
      };

      // Intentar cargar desde APIs reales, usar datos mock como fallback
      try {
        const responses = await Promise.allSettled([
          fetch('/api/work-packages'),
          fetch('/api/working-groups'),
          fetch('/api/countries'),
          fetch('/api/organizations'),
          fetch('/api/responsibles'),
          fetch('/api/indicators'),
          fetch('/api/outputs')
        ]);

        // Procesar respuestas
        const [wpRes, wgRes, countriesRes, orgsRes, usersRes, , outputsRes] = responses;

        // Work Packages
        if (wpRes.status === 'fulfilled' && wpRes.value.ok) {
          const wpData = await wpRes.value.json();
          console.log('Work packages data:', wpData);
          setWorkPackages(Array.isArray(wpData.workpackages) ? wpData.workpackages : mockData.workpackages);
        } else {
          setWorkPackages(mockData.workpackages);
        }
        
        // Working Groups
        if (wgRes.status === 'fulfilled' && wgRes.value.ok) {
          const wgData = await wgRes.value.json();
          console.log('Working groups data:', wgData);
          setWorkingGroups(Array.isArray(wgData.workingGroups) ? wgData.workingGroups : []);
        } else {
          setWorkingGroups([]);
        }
        
        // Countries - usar datos reales de la BD
        if (countriesRes.status === 'fulfilled' && countriesRes.value.ok) {
          const countriesData = await countriesRes.value.json();
          console.log('Countries data:', countriesData);
          setCountries(Array.isArray(countriesData.countries) ? countriesData.countries : []);
        } else {
          setCountries([]);
        }
        
        // Organizations - solo las que tienen organization_type = 'M'
        if (orgsRes.status === 'fulfilled' && orgsRes.value.ok) {
          const orgsData = await orgsRes.value.json();
          console.log('Organizations data:', orgsData);
          setOrganizations(Array.isArray(orgsData.organizations) ? orgsData.organizations : []);
        } else {
          setOrganizations([]);
        }
        
        // Users - datos reales de la BD
        if (usersRes.status === 'fulfilled' && usersRes.value.ok) {
          const usersData = await usersRes.value.json();
          console.log('Users data:', usersData);
          setUsers(Array.isArray(usersData.responsibles) ? usersData.responsibles : []);
        } else {
          setUsers([]);
        }
        
        // Indicators - inicialmente vacío, se carga cuando se selecciona output
        setIndicators([]);

        // Outputs - valores únicos de output_number
        if (outputsRes.status === 'fulfilled' && outputsRes.value.ok) {
          const outputsData = await outputsRes.value.json();
          console.log('Outputs data:', outputsData);
          setOutputs(Array.isArray(outputsData.outputs) ? outputsData.outputs : []);
        } else {
          setOutputs([]);
        }

      } catch (error) {
        console.warn('Using fallback data due to API error:', error);
        setWorkPackages(mockData.workpackages);
        setCountries([]);
        setOrganizations([]);
        setUsers([]);
        setIndicators([]);
        setOutputs([]);
      }

    } catch (error) {
      console.error('Error fetching options:', error);
      setError('Error cargando las opciones.');
    } finally {
      setLoading(false);
    }
  };

  // Función para formatear fecha para input date HTML
  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return '';
    try {
      // Si ya está en formato YYYY-MM-DD, devolverlo tal como está
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateString;
      }
      // Si es una fecha completa, extraer solo la parte de fecha
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const loadProductData = useCallback((product: EditingProduct) => {
    console.log('loadProductData called with:', product);
    console.log('Product responsibles to load:', product.responsibles);
    console.log('Product organizations to load:', product.organizations);
    console.log('Product indicators to load:', product.indicators);
    
    // Cargar datos básicos del formulario
    setFormData({
      product_name: product.product_name || '',
      product_objective: product.product_objective || '',
      deliverable: product.deliverable || '',
      delivery_date: formatDateForInput(product.delivery_date || ''),
      methodology_description: product.methodology_description || '',
      gender_specific_actions: product.gender_specific_actions || '',
      next_steps: product.next_steps || '',
      workpackage_id: product.workpackage_id?.toString() || '',
      workinggroup_id: product.workinggroup_id?.toString() || '', // Agregar working group
      product_owner_id: product.product_owner_id?.toString() || '',
      country_id: product.country_id?.toString() || '',
      output_number: product.output_number?.toString() || ''
    });

    // Cargar responsables
    if (product.responsibles) {
      console.log('Loading responsibles:', product.responsibles);
      setResponsibleAssignments(product.responsibles.map(r => ({
        user_id: r.user_id || 0,
        role_label: r.role_label || '',
        is_primary: r.is_primary || false,
        position: r.position || 0
      })));
    } else {
      console.log('No responsibles to load');
    }

    // Cargar organizaciones
    if (product.organizations) {
      console.log('Loading organizations:', product.organizations);
      setOrganizationAssignments(product.organizations.map(o => ({
        organization_id: o.organization_id || 0,
        relation_type: o.relation_type || '',
        position: o.position || 0
      })));
    } else {
      console.log('No organizations to load');
    }

    // Cargar indicadores seleccionados
    if (product.indicators) {
      console.log('Loading indicators:', product.indicators);
      setSelectedIndicators(product.indicators);
    } else {
      console.log('No indicators to load');
    }

    // Cargar distribuidores
    if (product.distributorOrgs) {
      console.log('Loading distributor orgs:', product.distributorOrgs);
      setDistributorOrgs(product.distributorOrgs);
    } else {
      console.log('No distributor orgs to load');
    }

    if (product.distributorUsers) {
      console.log('Loading distributor users:', product.distributorUsers);
      setDistributorUsers(product.distributorUsers);
    } else {
      console.log('No distributor users to load');
    }

    if (product.distributorOthers) {
      console.log('Loading distributor others:', product.distributorOthers);
      setDistributorOthers(product.distributorOthers);
    } else {
      console.log('No distributor others to load');
    }

    // Cargar indicadores filtrados por output si hay un output seleccionado
    if (product.output_number) {
      // Usar setTimeout para evitar problemas de dependencias
      setTimeout(() => {
        fetchIndicatorsByOutput(product.output_number || '');
      }, 100);
    }
  }, []); // Sin dependencias porque usamos setTimeout

  // Función para cargar indicadores filtrados por output
  const fetchIndicatorsByOutput = async (outputNumber: string) => {
    if (!outputNumber) {
      setIndicators([]);
      return;
    }
    
    try {
      const response = await fetch(`/api/indicators?output=${outputNumber}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Filtered indicators data:', data);
        setIndicators(Array.isArray(data.indicators) ? data.indicators : []);
      } else {
        console.error('Error fetching filtered indicators');
        setIndicators([]);
      }
    } catch (error) {
      console.error('Error fetching indicators:', error);
      setIndicators([]);
    }
  };

  // Fetch todas las opciones al abrir el modal
  useEffect(() => {
    if (isOpen) {
      fetchAllOptions();
      
      // Si estamos en modo edición y hay un producto, cargar sus datos
      if (mode === 'edit' && editingProduct) {
        loadProductData(editingProduct);
      }
    }
  }, [isOpen, mode, editingProduct, loadProductData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Si cambió el output, cargar indicadores filtrados
    if (name === 'output_number') {
      fetchIndicatorsByOutput(value);
      // Limpiar indicadores seleccionados cuando cambia el output
      setSelectedIndicators([]);
    }
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

  const updateResponsible = (index: number, field: keyof ResponsibleAssignment, value: string | number | boolean) => {
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

  const updateOrganization = (index: number, field: keyof OrganizationAssignment, value: string | number) => {
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
      const payload: {
        product_name: string;
        product_objective: string;
        deliverable: string;
        delivery_date: string;
        methodology_description: string;
        gender_specific_actions: string;
        next_steps: string;
        workpackage_id: number;
        workinggroup_id?: number; // Nuevo campo working group
        product_owner_id: number;
        country_id: number;
        product_output: string; // Cambiado de output_number a product_output
        responsibles: ResponsibleAssignment[];
        organizations: OrganizationAssignment[];
        indicators: number[];
        distributor_orgs: number[];
        distributor_users: number[];
        distributor_others: DistributorOther[];
        product_id?: number;
      } = {
        ...formData,
        product_output: formData.output_number, // Mapear output_number a product_output
        workpackage_id: parseInt(formData.workpackage_id),
        workinggroup_id: formData.workinggroup_id ? parseInt(formData.workinggroup_id) : undefined,
        product_owner_id: parseInt(formData.product_owner_id),
        country_id: parseInt(formData.country_id),
        responsibles: responsibleAssignments.filter(r => r.user_id > 0),
        organizations: organizationAssignments.filter(o => o.organization_id > 0),
        indicators: selectedIndicators,
        distributor_orgs: distributorOrgs,
        distributor_users: distributorUsers,
        distributor_others: distributorOthers.filter(d => d.display_name.trim() !== '')
      };

      console.log('Submitting product with payload:', payload);
      console.log('Responsibles to submit:', payload.responsibles);
      console.log('Organizations to submit:', payload.organizations);
      console.log('Indicators to submit:', payload.indicators);
      console.log('Distributor orgs to submit:', payload.distributor_orgs);
      console.log('Distributor users to submit:', payload.distributor_users);
      console.log('Distributor others to submit:', payload.distributor_others);

      // Si estamos editando, agregar el ID del producto
      if (mode === 'edit' && editingProduct) {
        payload.product_id = editingProduct.product_id;
      }

      const endpoint = mode === 'edit' ? '/api/update-product' : '/api/add-product';
      const method = mode === 'edit' ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // Llamar al callback correspondiente según el modo
        if (mode === 'edit' && onProductUpdated) {
          onProductUpdated();
        } else {
          onProductAdded();
        }
        handleClose();
      } else {
        const errorData = await response.json();
        setError(errorData.message || `Error ${mode === 'edit' ? 'updating' : 'creating'} product`);
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
      methodology_description: '',
      gender_specific_actions: '',
      next_steps: '',
      workpackage_id: '',
      workinggroup_id: '', // Agregar working group
      product_owner_id: '',
      country_id: '',
      output_number: ''
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-background rounded-lg border shadow-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto mx-4">
        <div className="sticky top-0 bg-background border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {mode === 'edit' ? 'Editar Producto' : 'Crear Nuevo Producto'}
          </h2>
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
                    <label className="block text-sm font-medium mb-2">Output *</label>
                    <select
                      name="output_number"
                      value={formData.output_number || ''}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar Output</option>
                      {Array.isArray(outputs) && outputs.map(output => (
                        <option key={output.value} value={output.value}>
                          {output.label}
                        </option>
                      ))}
                    </select>
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
                      {Array.isArray(workPackages) && workPackages.map(wp => (
                        <option key={wp.workpackage_id} value={wp.workpackage_id}>
                          {wp.workpackage_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Working Group</label>
                    <select
                      name="workinggroup_id"
                      value={formData.workinggroup_id}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar Working Group</option>
                      {Array.isArray(workingGroups) && workingGroups.map(wg => (
                        <option key={wg.workinggroup_id} value={wg.workinggroup_id}>
                          {wg.workinggroup_name}
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
                      {Array.isArray(organizations) && organizations.map(org => (
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
                      {Array.isArray(countries) && countries.map(country => (
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
                            {Array.isArray(users) && users.map(user => (
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
                            {Array.isArray(organizations) && organizations.map(org => (
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
                  {Array.isArray(indicators) && indicators.map(indicator => (
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
                    {Array.isArray(organizations) && organizations.map(org => (
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
                    {Array.isArray(users) && users.map(user => (
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
                {submitting 
                  ? (mode === 'edit' ? 'Actualizando...' : 'Creando...') 
                  : (mode === 'edit' ? 'Actualizar Producto' : 'Crear Producto')
                }
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
