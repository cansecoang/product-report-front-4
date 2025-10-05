"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Building, 
  Flag,
  Tag,
  Target,
  Plus,
  Edit,
  Trash2,
  Loader2
} from "lucide-react"

// Componente Modal CRUD
interface CrudModalProps {
  type: string;
  item: Organization | Country | WorkPackage | WorkingGroup | Status | Phase | Indicator | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  countries?: Country[];
  outputs?: Output[];
}

function CrudModal({ type, item, isOpen, onClose, onSave, countries, outputs }: CrudModalProps) {
  type CrudItem = Partial<Organization & Country & WorkPackage & WorkingGroup & Status & Phase & Indicator>;
  const [formData, setFormData] = useState<CrudItem>({})

  // Debug: Ver qué outputs recibe el modal
  useEffect(() => {
    console.log('🔔 CrudModal recibió outputs:', outputs?.length || 0, outputs)
  }, [outputs])

  useEffect(() => {
    if (item) {
      console.log('📝 Editando item:', item)
      setFormData(item)
    } else {
      // Reset form for new item
      setFormData({})
    }
  }, [item])

  const mapFormDataToAPI = (
    type: string,
    formData: Partial<Organization & Country & WorkPackage & WorkingGroup & Status & Phase & Indicator>
  ) => {
    switch (type) {
      case 'organization':
        return {
          name: formData.organization_name,
          description: formData.organization_description,
          type: formData.organization_type,
          country: formData.organization_country,
        }
      case 'country':
        return {
          name: formData.country_name,
        }
      case 'workpackage':
        return {
          name: formData.workpackage_name,
          description: formData.workpackage_description,
        }
      case 'workinggroup':
        return {
          name: formData.workinggroup_name,
          description: formData.workinggroup_description,
        }
      case 'status':
        return {
          name: formData.status_name,
          description: formData.status_description,
        }
      case 'phase':
        return {
          name: formData.phase_name,
          description: formData.phase_description,
        }
      case 'indicator':
        return {
          name: formData.indicator_name,
          code: formData.indicator_code,
          description: formData.indicator_description,
          output_number: formData.output_number,
        }
      default:
        return formData
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const endpoint = getEndpoint(type)
      const method = item ? 'PUT' : 'POST'
      
      const mappedData = mapFormDataToAPI(type, formData)
      const requestData = item ? { ...mappedData, id: getItemId(item, type) } : mappedData
      console.log('Sending data:', requestData)
      console.log('Endpoint:', endpoint)
      console.log('Method:', method)

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (response.ok) {
        onSave()
      } else {
        const errorData = await response.text()
        console.error('Error saving item:', response.status, errorData)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const getEndpoint = (type: string) => {
    const endpoints: { [key: string]: string } = {
      organization: '/api/organizations',
      country: '/api/countries',
      workpackage: '/api/work-packages',
      workinggroup: '/api/working-groups',
      status: '/api/statuses',
      phase: '/api/phases',
      indicator: '/api/indicators',
    }
    return endpoints[type] || ''
  }

  const getItemId = (
    item: Organization | Country | WorkPackage | WorkingGroup | Status | Phase | Indicator,
    type: string
  ) => {
    const idFields: { [key: string]: string } = {
      organization: 'organization_id',
      country: 'country_id',
      workpackage: 'workpackage_id',
      workinggroup: 'workinggroup_id',
      status: 'status_id',
      phase: 'phase_id',
      indicator: 'indicator_id',
    }
    return item[idFields[type] as keyof typeof item]
  }

  const getModalTitle = (type: string, isEdit: boolean) => {
    const titles: { [key: string]: string } = {
      organization: 'Organization',
      country: 'Country',
      workpackage: 'Work Package',
      workinggroup: 'Working Group',
      status: 'Status',
      phase: 'Phase',
      indicator: 'Indicator',
    }
    return `${isEdit ? 'Edit' : 'Add'} ${titles[type] || 'Item'}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{getModalTitle(type, !!item)}</DialogTitle>
          <DialogDescription>
            {item ? 'Edit the fields and save the changes.' : 'Fill in the information to create a new record.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {renderFormFields(type, formData, setFormData, countries, outputs)}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {item ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function renderFormFields(
  type: string,
  formData: Partial<Organization & Country & WorkPackage & WorkingGroup & Status & Phase & Indicator>,
  setFormData: (data: Partial<Organization & Country & WorkPackage & WorkingGroup & Status & Phase & Indicator>) => void,
  countries?: Country[],
  outputs?: Output[]
) {
  console.log('🎨 Rendering form for type:', type, 'outputs:', outputs?.length || 0)
  
  const handleChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    })
  }

  switch (type) {
    case 'organization':
      return (
        <>
          <div key="org-name" className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input
              id="name"
              value={formData.organization_name || ''}
              onChange={(e) => handleChange('organization_name', e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div key="org-type" className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">Type</Label>
            <Select
              value={formData.organization_type || ''}
              onValueChange={(value) => handleChange('organization_type', value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="S">S - Secondary</SelectItem>
                <SelectItem value="M">M - Main</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div key="org-country" className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="country" className="text-right">Country</Label>
            <Select
              value={formData.organization_country || ''}
              onValueChange={(value) => handleChange('organization_country', value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countries?.map((country) => (
                  <SelectItem key={country.country_id} value={country.country_name}>
                    {country.country_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div key="org-description" className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Description</Label>
            <Textarea
              id="description"
              value={formData.organization_description || ''}
              onChange={(e) => handleChange('organization_description', e.target.value)}
              className="col-span-3"
            />
          </div>
        </>
      )
    case 'country':
      return (
        <>
          <div key="country-name" className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input
              id="name"
              value={formData.country_name || ''}
              onChange={(e) => handleChange('country_name', e.target.value)}
              className="col-span-3"
              required
            />
          </div>
        </>
      )
    case 'workpackage':
      return (
        <>
          <div key="wp-name" className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input
              id="name"
              value={formData.workpackage_name || ''}
              onChange={(e) => handleChange('workpackage_name', e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div key="wp-desc" className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Description</Label>
            <Textarea
              id="description"
              value={formData.workpackage_description || ''}
              onChange={(e) => handleChange('workpackage_description', e.target.value)}
              className="col-span-3"
            />
          </div>
        </>
      )
    case 'workinggroup':
      return (
        <>
          <div key="wg-name" className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input
              id="name"
              value={formData.workinggroup_name || ''}
              onChange={(e) => handleChange('workinggroup_name', e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div key="wg-desc" className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Description</Label>
            <Textarea
              id="description"
              value={formData.workinggroup_description || ''}
              onChange={(e) => handleChange('workinggroup_description', e.target.value)}
              className="col-span-3"
            />
          </div>
        </>
      )
    case 'status':
      return (
        <>
          <div key="status-name" className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input
              id="name"
              value={formData.status_name || ''}
              onChange={(e) => handleChange('status_name', e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div key="status-desc" className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Description</Label>
            <Textarea
              id="description"
              value={formData.status_description || ''}
              onChange={(e) => handleChange('status_description', e.target.value)}
              className="col-span-3"
            />
          </div>
        </>
      )
    case 'phase':
      return (
        <>
          <div key="phase-name" className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input
              id="name"
              value={formData.phase_name || ''}
              onChange={(e) => handleChange('phase_name', e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div key="phase-desc" className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Description</Label>
            <Textarea
              id="description"
              value={formData.phase_description || ''}
              onChange={(e) => handleChange('phase_description', e.target.value)}
              className="col-span-3"
            />
          </div>
        </>
      )
    case 'indicator':
      return (
        <>
          <div key="ind-name" className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input
              id="name"
              value={formData.indicator_name || ''}
              onChange={(e) => handleChange('indicator_name', e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div key="ind-code" className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="code" className="text-right">Code</Label>
            <Input
              id="code"
              value={formData.indicator_code || ''}
              onChange={(e) => handleChange('indicator_code', e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div key="ind-desc" className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Description</Label>
            <Textarea
              id="description"
              value={formData.indicator_description || ''}
              onChange={(e) => handleChange('indicator_description', e.target.value)}
              className="col-span-3"
            />
          </div>
          <div key="ind-output" className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="output_number" className="text-right">Output</Label>
            <Select
              value={formData.output_number ? String(formData.output_number) : ''}
              onValueChange={(value) => {
                console.log('📝 Output seleccionado:', value)
                handleChange('output_number', value)
              }}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select output" />
              </SelectTrigger>
              <SelectContent>
                {!outputs || outputs.length === 0 ? (
                  <SelectItem value="no-data" disabled>
                    No outputs available
                  </SelectItem>
                ) : (
                  <>
                    {outputs.map((output) => (
                      <SelectItem 
                        key={output.output_id} 
                        value={String(output.output_number)}
                      >
                        {output.output_name}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </>
      )
    default:
      return null
  }
}

// Interfaces
interface Organization {
  organization_id: number;
  organization_name: string;
  organization_description?: string;
  organization_type?: string;
  organization_country?: string;
}

interface Status {
  status_id: number;
  status_name: string;
  status_description?: string;
  status_color?: string;
}

interface Phase {
  phase_id: number;
  phase_name: string;
  phase_description?: string;
  phase_order?: number;
}

interface Indicator {
  indicator_id: number;
  indicator_name: string;
  indicator_code: string;
  indicator_description?: string;
  indicator_target?: string;
  indicator_unit?: string;
  output_number?: string;
}

interface Country {
  country_id: number;
  country_name: string;
  country_code?: string;
}

interface Output {
  output_id: number;
  output_number: string;
  output_name: string;
}

interface WorkPackage {
  workpackage_id: number;
  workpackage_name: string;
  workpackage_description?: string;
}

interface WorkingGroup {
  workinggroup_id: number;
  workinggroup_name: string;
  workinggroup_description?: string;
}

export default function SettingsPage() {
  // State para datos
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [workPackages, setWorkPackages] = useState<WorkPackage[]>([])
  const [workingGroups, setWorkingGroups] = useState<WorkingGroup[]>([])
  const [statuses, setStatuses] = useState<Status[]>([])
  const [phases, setPhases] = useState<Phase[]>([])
  const [indicators, setIndicators] = useState<Indicator[]>([])
  const [outputs, setOutputs] = useState<Output[]>([])
  
  // State para loading
  const [loading, setLoading] = useState({
    organizations: false,
    countries: false,
    workPackages: false,
    workingGroups: false,
    statuses: false,
    phases: false,
    indicators: false,
    outputs: false
  })

  // State para modales
  const [openModal, setOpenModal] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<
    Organization | Country | WorkPackage | WorkingGroup | Status | Phase | Indicator | null
  >(null)

  // State para modal de confirmación de eliminación
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ type: string; id: number; name: string } | null>(null)

  // Función para eliminar items
  const handleDelete = async (type: string, id: number) => {
    // Cerrar modal inmediatamente para mejor UX
    setDeleteConfirmOpen(false)
    const itemName = itemToDelete?.name
    setItemToDelete(null)
    
    try {
      const endpoint = getEndpoint(type)
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })

      if (response.ok) {
        // Recargar datos después de eliminar
        if (type === 'organization') loadOrganizations()
        if (type === 'country') loadCountries()
        if (type === 'workpackage') loadWorkPackages()
        if (type === 'workinggroup') loadWorkingGroups()
        if (type === 'status') loadStatuses()
        if (type === 'phase') loadPhases()
        if (type === 'indicator') loadIndicators()
      } else {
        alert(`Error deleting ${itemName || 'item'}`)
      }
    } catch (error) {
      console.error('Error:', error)
      alert(`Error deleting ${itemName || 'item'}`)
    }
  }

  // Función para abrir modal de confirmación de eliminación
  const openDeleteConfirm = (type: string, id: number, name: string) => {
    setItemToDelete({ type, id, name })
    setDeleteConfirmOpen(true)
  }

  const getEndpoint = (type: string) => {
    const endpoints: { [key: string]: string } = {
      organization: '/api/organizations',
      country: '/api/countries',
      workpackage: '/api/work-packages',
      workinggroup: '/api/working-groups',
      status: '/api/statuses',
      phase: '/api/phases',
      indicator: '/api/indicators',
    }
    return endpoints[type] || ''
  }

  // Funciones para cargar datos
  const loadOrganizations = async () => {
    setLoading(prev => ({ ...prev, organizations: true }))
    try {
      const response = await fetch('/api/organizations')
      const data = await response.json()
      setOrganizations(data.organizations || [])
    } catch (error) {
      console.error('Error loading organizations:', error)
    } finally {
      setLoading(prev => ({ ...prev, organizations: false }))
    }
  }

  const loadStatuses = async () => {
    setLoading(prev => ({ ...prev, statuses: true }))
    try {
      const response = await fetch('/api/statuses')
      const data = await response.json()
      setStatuses(data.statuses || [])
    } catch (error) {
      console.error('Error loading statuses:', error)
    } finally {
      setLoading(prev => ({ ...prev, statuses: false }))
    }
  }

  const loadPhases = async () => {
    setLoading(prev => ({ ...prev, phases: true }))
    try {
      const response = await fetch('/api/phases')
      const data = await response.json()
      setPhases(data.phases || [])
    } catch (error) {
      console.error('Error loading phases:', error)
    } finally {
      setLoading(prev => ({ ...prev, phases: false }))
    }
  }

  const loadIndicators = async () => {
    setLoading(prev => ({ ...prev, indicators: true }))
    try {
      const response = await fetch('/api/indicators')
      const data = await response.json()
      setIndicators(data.indicators || [])
    } catch (error) {
      console.error('Error loading indicators:', error)
    } finally {
      setLoading(prev => ({ ...prev, indicators: false }))
    }
  }

  const loadCountries = async () => {
    setLoading(prev => ({ ...prev, countries: true }))
    try {
      const response = await fetch('/api/countries')
      const data = await response.json()
      setCountries(data.countries || [])
    } catch (error) {
      console.error('Error loading countries:', error)
    } finally {
      setLoading(prev => ({ ...prev, countries: false }))
    }
  }

  const loadWorkPackages = async () => {
    setLoading(prev => ({ ...prev, workPackages: true }))
    try {
      const response = await fetch('/api/work-packages')
      const data = await response.json()
      setWorkPackages(data.workpackages || [])
    } catch (error) {
      console.error('Error loading work packages:', error)
    } finally {
      setLoading(prev => ({ ...prev, workPackages: false }))
    }
  }

  const loadWorkingGroups = async () => {
    setLoading(prev => ({ ...prev, workingGroups: true }))
    try {
      const response = await fetch('/api/working-groups')
      const data = await response.json()
      setWorkingGroups(data.workingGroups || [])
    } catch (error) {
      console.error('Error loading working groups:', error)
    } finally {
      setLoading(prev => ({ ...prev, workingGroups: false }))
    }
  }

  const loadOutputs = async () => {
    setLoading(prev => ({ ...prev, outputs: true }))
    try {
      console.log('🔍 Cargando outputs...')
      const response = await fetch('/api/outputs')
      console.log('📡 Response status:', response.status)
      const data = await response.json()
      console.log('📦 Outputs data:', data)
      setOutputs(data.outputs || [])
      console.log('✅ Outputs cargados:', data.outputs?.length || 0)
    } catch (error) {
      console.error('❌ Error loading outputs:', error)
    } finally {
      setLoading(prev => ({ ...prev, outputs: false }))
    }
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    loadOrganizations()
    loadCountries()
    loadWorkPackages()
    loadWorkingGroups()
    loadStatuses()
    loadPhases()
    loadIndicators()
    loadOutputs()
  }, [])

  return (
    <div className="p-6">
      <div className="space-y-8 pb-8">
        
      {/* Configuration Tabs */}
      <Tabs defaultValue="organizations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="countries">Countries</TabsTrigger>
          <TabsTrigger value="workpackages">Work Packages</TabsTrigger>
          <TabsTrigger value="workinggroups">Working Groups</TabsTrigger>
          <TabsTrigger value="statuses">Statuses</TabsTrigger>
          <TabsTrigger value="phases">Phases</TabsTrigger>
          <TabsTrigger value="indicators">Indicators</TabsTrigger>
        </TabsList>

        <TabsContent value="organizations" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="h-5 w-5" />
                  <span>Organizations</span>
                </CardTitle>
                <CardDescription>
                  Management of participating organizations in the project
                </CardDescription>
              </div>
              <Button onClick={() => {
                setEditingItem(null)
                setOpenModal('organization')
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Organization
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading.organizations ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  organizations.map((org) => (
                    <div key={org.organization_id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{org.organization_name}</p>
                          {org.organization_type && (
                            <Badge variant="outline">{org.organization_type}</Badge>
                          )}
                        </div>
                        {org.organization_country && (
                          <p className="text-sm text-muted-foreground">{org.organization_country}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => {
                          setEditingItem(org)
                          setOpenModal('organization')
                        }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openDeleteConfirm('organization', org.organization_id, org.organization_name)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="countries" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Flag className="h-5 w-5" />
                  <span>Countries</span>
                </CardTitle>
                <CardDescription>
                  Management of countries where organizations operate
                </CardDescription>
              </div>
              <Button onClick={() => {
                setEditingItem(null)
                setOpenModal('country')
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Country
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading.countries ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  countries.map((country) => (
                    <div key={country.country_id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{country.country_name}</p>
                          {country.country_code && (
                            <Badge variant="outline">{country.country_code}</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => {
                          setEditingItem(country)
                          setOpenModal('country')
                        }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openDeleteConfirm('country', country.country_id, country.country_name)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workpackages" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Tag className="h-5 w-5" />
                  <span>Work Packages</span>
                </CardTitle>
                <CardDescription>
                  Management of project work packages
                </CardDescription>
              </div>
              <Button onClick={() => {
                setEditingItem(null)
                setOpenModal('workpackage')
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Work Package
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading.workPackages ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  workPackages.map((wp) => (
                    <div key={wp.workpackage_id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{wp.workpackage_name}</p>
                        {wp.workpackage_description && (
                          <p className="text-sm text-muted-foreground">{wp.workpackage_description}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => {
                          setEditingItem(wp)
                          setOpenModal('workpackage')
                        }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openDeleteConfirm('workpackage', wp.workpackage_id, wp.workpackage_name)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workinggroups" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Working Groups</span>
                </CardTitle>
                <CardDescription>
                  Management of project working groups
                </CardDescription>
              </div>
              <Button onClick={() => {
                setEditingItem(null)
                setOpenModal('workinggroup')
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Working Group
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading.workingGroups ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  workingGroups.map((wg) => (
                    <div key={wg.workinggroup_id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{wg.workinggroup_name}</p>
                        {wg.workinggroup_description && (
                          <p className="text-sm text-muted-foreground">{wg.workinggroup_description}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => {
                          setEditingItem(wg)
                          setOpenModal('workinggroup')
                        }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openDeleteConfirm('workinggroup', wg.workinggroup_id, wg.workinggroup_name)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statuses" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Flag className="h-5 w-5" />
                  <span>Task Statuses</span>
                </CardTitle>
                <CardDescription>
                  Configuration of statuses for task lifecycle
                </CardDescription>
              </div>
              <Button onClick={() => {
                setEditingItem(null)
                setOpenModal('status')
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Status
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading.statuses ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  statuses.map((status) => (
                    <div key={status.status_id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{status.status_name}</p>
                        {status.status_description && (
                          <p className="text-sm text-muted-foreground">{status.status_description}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => {
                          setEditingItem(status)
                          setOpenModal('status')
                        }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openDeleteConfirm('status', status.status_id, status.status_name)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="phases" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Tag className="h-5 w-5" />
                  <span>Project Phases</span>
                </CardTitle>
                <CardDescription>
                  Definition of phases for activity organization
                </CardDescription>
              </div>
              <Button onClick={() => {
                setEditingItem(null)
                setOpenModal('phase')
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Phase
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading.phases ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  phases.map((phase, index) => (
                    <div key={phase.phase_id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium">{phase.phase_name}</p>
                          {phase.phase_description && (
                            <p className="text-sm text-muted-foreground">{phase.phase_description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => {
                          setEditingItem(phase)
                          setOpenModal('phase')
                        }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openDeleteConfirm('phase', phase.phase_id, phase.phase_name)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="indicators" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Performance Indicators</span>
                </CardTitle>
                <CardDescription>
                  Configuration of key metrics and indicators
                </CardDescription>
              </div>
              <Button onClick={() => {
                setEditingItem(null)
                setOpenModal('indicator')
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Indicator
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading.indicators ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  indicators.map((indicator) => (
                    <div key={indicator.indicator_id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{indicator.indicator_name}</p>
                          <Badge variant="outline">{indicator.indicator_code}</Badge>
                        </div>
                        {indicator.output_number && (
                          <p className="text-sm text-muted-foreground">
                            Output: {indicator.output_number}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => {
                          setEditingItem(indicator)
                          setOpenModal('indicator')
                        }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openDeleteConfirm('indicator', indicator.indicator_id, indicator.indicator_name)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>


      {/* Modales para CRUD */}
      {openModal && (
        <CrudModal
          type={openModal}
          item={editingItem}
          isOpen={!!openModal}
          countries={countries}
          outputs={outputs}
          onClose={() => {
            setOpenModal(null)
            setEditingItem(null)
          }}
          onSave={() => {
            // Recargar datos después de guardar
            if (openModal === 'organization') loadOrganizations()
            if (openModal === 'country') loadCountries()
            if (openModal === 'workpackage') loadWorkPackages()
            if (openModal === 'workinggroup') loadWorkingGroups()
            if (openModal === 'status') loadStatuses()
            if (openModal === 'phase') loadPhases()
            if (openModal === 'indicator') loadIndicators()
            
            setOpenModal(null)
            setEditingItem(null)
          }}
        />
      )}

      {/* Modal de confirmación de eliminación */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{itemToDelete?.name}</strong>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => {
                setDeleteConfirmOpen(false)
                setItemToDelete(null)
              }}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive"
              onClick={() => {
                if (itemToDelete) {
                  handleDelete(itemToDelete.type, itemToDelete.id)
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  )
}
