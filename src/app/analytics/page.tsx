"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Globe,
  Users,
  Download,
  RefreshCw
} from "lucide-react"

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      {/* Action buttons */}
      <div className="flex justify-end items-center space-x-2">
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Header description */}
      <div className="space-y-2">
        <p className="text-muted-foreground">
          Análisis avanzado de indicadores y métricas de biodiversidad
        </p>
      </div>

      {/* KPIs Analytics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiencia Global</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87.3%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Indicadores Cumplidos</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24/30</div>
            <p className="text-xs text-muted-foreground">
              80% de cumplimiento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tendencia Sostenibilidad</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12.5%</div>
            <p className="text-xs text-muted-foreground">
              Mejora trimestral
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cobertura Global</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15 países</div>
            <p className="text-xs text-muted-foreground">
              3 regiones activas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="biodiversity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="biodiversity">Biodiversidad</TabsTrigger>
          <TabsTrigger value="sustainability">Sostenibilidad</TabsTrigger>
          <TabsTrigger value="productivity">Productividad</TabsTrigger>
          <TabsTrigger value="regions">Regiones</TabsTrigger>
        </TabsList>

        <TabsContent value="biodiversity" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Índice de Biodiversidad</CardTitle>
                <CardDescription>
                  Evolución mensual del índice de biodiversidad por región
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px] flex items-center justify-center bg-muted/30 rounded">
                  <div className="text-center space-y-2">
                    <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Chart de Biodiversidad</p>
                    <Badge variant="secondary">En desarrollo</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Especies Registradas</CardTitle>
                <CardDescription>
                  Distribución por tipo de especie y región
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-muted/30 rounded">
                  <div className="text-center space-y-2">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Chart de Especies</p>
                    <Badge variant="secondary">En desarrollo</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sustainability" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Sostenibilidad</CardTitle>
                <CardDescription>
                  Indicadores clave de sostenibilidad agrícola
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-muted/30 rounded">
                  <div className="text-center space-y-2">
                    <Target className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Chart de Sostenibilidad</p>
                    <Badge variant="secondary">En desarrollo</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Impacto Ambiental</CardTitle>
                <CardDescription>
                  Evaluación del impacto ambiental por proyecto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-muted/30 rounded">
                  <div className="text-center space-y-2">
                    <Globe className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Chart de Impacto</p>
                    <Badge variant="secondary">En desarrollo</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="productivity" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Productividad Agrícola</CardTitle>
                <CardDescription>
                  Rendimiento por hectárea y tipo de cultivo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-muted/30 rounded">
                  <div className="text-center space-y-2">
                    <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Chart de Productividad</p>
                    <Badge variant="secondary">En desarrollo</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Eficiencia de Recursos</CardTitle>
                <CardDescription>
                  Uso de agua, energía y recursos por región
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-muted/30 rounded">
                  <div className="text-center space-y-2">
                    <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Chart de Eficiencia</p>
                    <Badge variant="secondary">En desarrollo</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="regions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Cobertura por Región</CardTitle>
                <CardDescription>
                  Distribución geográfica de proyectos activos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-muted/30 rounded">
                  <div className="text-center space-y-2">
                    <Globe className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Mapa de Regiones</p>
                    <Badge variant="secondary">En desarrollo</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Comparativa Regional</CardTitle>
                <CardDescription>
                  Comparación de indicadores entre regiones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-muted/30 rounded">
                  <div className="text-center space-y-2">
                    <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Chart Comparativo</p>
                    <Badge variant="secondary">En desarrollo</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Status & Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Estado de Desarrollo</CardTitle>
          <CardDescription>
            Progreso de implementación de funcionalidades de analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Charts de Indicadores</span>
              <Badge variant="secondary">En desarrollo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">APIs de Analytics</span>
              <Badge variant="outline">Pendiente</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}