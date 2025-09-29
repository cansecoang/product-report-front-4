"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Settings, 
  Building, 
  Flag,
  Tag,
  Target,
  Plus,
  Edit,
  Trash2
} from "lucide-react"

export default function SettingsPage() {
  // Datos mock para configuración
  const organizations = [
    { id: 1, name: "Cooperativa San Juan", type: "Cooperativa", country: "Guatemala", status: "Activa" },
    { id: 2, name: "BioFincas Corp", type: "Empresa", country: "República Dominicana", status: "Activa" },
    { id: 3, name: "Verde Sostenible", type: "ONG", country: "Honduras", status: "Inactiva" }
  ]

  const statuses = [
    { id: 1, name: "No Iniciado", color: "gray", description: "Tarea sin comenzar" },
    { id: 2, name: "En Progreso", color: "blue", description: "Tarea en desarrollo" },
    { id: 3, name: "Completado", color: "green", description: "Tarea finalizada" },
    { id: 4, name: "Bloqueado", color: "red", description: "Tarea con impedimentos" }
  ]

  const phases = [
    { id: 1, name: "Planificación", description: "Fase inicial de diseño y planificación" },
    { id: 2, name: "Implementación", description: "Ejecución de actividades planificadas" },
    { id: 3, name: "Monitoreo", description: "Seguimiento y evaluación de resultados" },
    { id: 4, name: "Cierre", description: "Finalización y documentación" }
  ]

  const indicators = [
    { id: 1, name: "Productividad", code: "PROD-001", target: "5000 kg/ha", unit: "kg/ha" },
    { id: 2, name: "Sostenibilidad", code: "SOST-001", target: "100 puntos", unit: "puntos" },
    { id: 3, name: "Biodiversidad", code: "BIO-001", target: "85%", unit: "%" },
    { id: 4, name: "Capacitación", code: "CAP-001", target: "200 personas", unit: "personas" }
  ]

  return (
    <div className="p-6">
      <div className="space-y-8 pb-8">
        
      {/* Configuration Tabs */}
      <Tabs defaultValue="organizations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="organizations">Organizaciones</TabsTrigger>
          <TabsTrigger value="statuses">Estados</TabsTrigger>
          <TabsTrigger value="phases">Fases</TabsTrigger>
          <TabsTrigger value="indicators">Indicadores</TabsTrigger>
        </TabsList>

        <TabsContent value="organizations" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="h-5 w-5" />
                  <span>Organizaciones</span>
                </CardTitle>
                <CardDescription>
                  Gestión de organizaciones participantes en el proyecto
                </CardDescription>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Organización
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {organizations.map((org) => (
                  <div key={org.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{org.name}</p>
                        <Badge variant="outline">{org.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{org.country}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={org.status === 'Activa' ? 'default' : 'secondary'}>
                        {org.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
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
                  <span>Estados de Tareas</span>
                </CardTitle>
                <CardDescription>
                  Configuración de estados para el ciclo de vida de tareas
                </CardDescription>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Estado
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statuses.map((status) => (
                  <div key={status.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <div 
                          className={`w-3 h-3 rounded-full bg-${status.color}-500`}
                        ></div>
                        <p className="font-medium">{status.name}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{status.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
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
                  <span>Fases de Proyecto</span>
                </CardTitle>
                <CardDescription>
                  Definición de fases para organización de actividades
                </CardDescription>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Fase
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {phases.map((phase, index) => (
                  <div key={phase.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">{phase.name}</p>
                        <p className="text-sm text-muted-foreground">{phase.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
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
                  <span>Indicadores de Desempeño</span>
                </CardTitle>
                <CardDescription>
                  Configuración de métricas e indicadores clave
                </CardDescription>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Indicador
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {indicators.map((indicator) => (
                  <div key={indicator.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{indicator.name}</p>
                        <Badge variant="outline">{indicator.code}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Meta: {indicator.target} • Unidad: {indicator.unit}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Organizaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">3 países</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Estados Configurados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">4 activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Fases Definidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">Todas en uso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Indicadores Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">15 configurados</p>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  )
}
