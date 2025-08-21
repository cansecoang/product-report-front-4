"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart3, 
  Users, 
  Target, 
  Calendar, 
  Plus,
  Activity,
  Leaf,
  TrendingUp,
  Package,
  Building,
  Zap,
  Home,
  Clock
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex-1 space-y-8 p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          Dashboard BioFincas
        </h1>
        <p className="text-muted-foreground text-lg">
          Monitoreo de biodiversidad y sostenibilidad agrícola en tiempo real
        </p>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-green-200 dark:border-green-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-in slide-in-from-bottom-4 duration-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300 uppercase tracking-wide">
              Productores Capacitados
            </CardTitle>
            <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
              <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900 dark:text-green-100">1,247</div>
            <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-300 mt-2">
              <TrendingUp className="h-4 w-4" />
              <span>+24% vs objetivo</span>
            </div>
            <Badge className="mt-3 bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-300">
              Meta Superada
            </Badge>
          </CardContent>
        </Card>

        <Card className="relative bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-in slide-in-from-bottom-4 duration-500 delay-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wide">
              Prácticas Biodiversas
            </CardTitle>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <Leaf className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">78%</div>
            <div className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300 mt-2">
              <TrendingUp className="h-4 w-4" />
              <span>+8% implementación</span>
            </div>
            <Badge className="mt-3 bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-300">
              Excelente
            </Badge>
          </CardContent>
        </Card>

        <Card className="relative bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/50 dark:to-violet-950/50 border-purple-200 dark:border-purple-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-in slide-in-from-bottom-4 duration-500 delay-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wide">
              Productos Activos
            </CardTitle>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
              <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">14</div>
            <div className="flex items-center gap-2 text-sm font-medium text-purple-700 dark:text-purple-300 mt-2">
              <TrendingUp className="h-4 w-4" />
              <span>+17% crecimiento</span>
            </div>
            <Badge className="mt-3 bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 border-purple-300">
              En Progreso
            </Badge>
          </CardContent>
        </Card>

        <Card className="relative bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/50 dark:to-amber-950/50 border-orange-200 dark:border-orange-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-in slide-in-from-bottom-4 duration-500 delay-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300 uppercase tracking-wide">
              Organizaciones
            </CardTitle>
            <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
              <Building className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">45</div>
            <div className="flex items-center gap-2 text-sm font-medium text-orange-700 dark:text-orange-300 mt-2">
              <TrendingUp className="h-4 w-4" />
              <span>+13% participación</span>
            </div>
            <Badge className="mt-3 bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300 border-orange-300">
              Objetivo Logrado
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50 border-slate-200 dark:border-slate-700 shadow-lg animate-in slide-in-from-bottom-4 duration-500 delay-400">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl font-semibold">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg">
              <Zap className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            Acciones Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button className="h-14 justify-start bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all duration-200" size="lg">
              <Plus className="h-5 w-5 mr-3" />
              Agregar Producto
            </Button>
            <Button className="h-14 justify-start border-2 border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950/50 shadow-md hover:shadow-lg transition-all duration-200" size="lg" variant="outline">
              <BarChart3 className="h-5 w-5 mr-3 text-blue-600" />
              Ver Analytics
            </Button>
            <Button className="h-14 justify-start border-2 border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-950/50 shadow-md hover:shadow-lg transition-all duration-200" size="lg" variant="outline">
              <Target className="h-5 w-5 mr-3 text-purple-600" />
              Gestionar Indicadores
            </Button>
            <Button className="h-14 justify-start border-2 border-orange-200 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-950/50 shadow-md hover:shadow-lg transition-all duration-200" size="lg" variant="outline">
              <Calendar className="h-5 w-5 mr-3 text-orange-600" />
              Programar Actividad
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[450px] h-12 bg-slate-100 dark:bg-slate-800 p-1">
          <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Home className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Activity className="h-4 w-4" />
            Actividad
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Progress Overview */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold text-green-900 dark:text-green-100">
                      Progreso General
                    </CardTitle>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Estado actual de implementación
                    </p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                    Q3 2025
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-green-900 dark:text-green-100">Capacitación Productores</span>
                    <span className="text-green-700 dark:text-green-300">87%</span>
                  </div>
                  <div className="w-full bg-green-200 dark:bg-green-900/50 rounded-full h-3">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-1000 ease-out" style={{ width: '87%' }}></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-blue-900 dark:text-blue-100">Implementación Biodiversidad</span>
                    <span className="text-blue-700 dark:text-blue-300">78%</span>
                  </div>
                  <div className="w-full bg-blue-200 dark:bg-blue-900/50 rounded-full h-3">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-1000 ease-out delay-200" style={{ width: '78%' }}></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-purple-900 dark:text-purple-100">Adopción Tecnológica</span>
                    <span className="text-purple-700 dark:text-purple-300">65%</span>
                  </div>
                  <div className="w-full bg-purple-200 dark:bg-purple-900/50 rounded-full h-3">
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-1000 ease-out delay-400" style={{ width: '65%' }}></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-emerald-900 dark:text-emerald-100">Certificación Sostenibilidad</span>
                    <span className="text-emerald-700 dark:text-emerald-300">92%</span>
                  </div>
                  <div className="w-full bg-emerald-200 dark:bg-emerald-900/50 rounded-full h-3">
                    <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full transition-all duration-1000 ease-out delay-600" style={{ width: '92%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rendimiento Chart Placeholder */}
            <Card className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50 border-slate-200 dark:border-slate-700 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold">Rendimiento por Región</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Comparativo mensual</p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">
                    Próximamente
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl flex flex-col items-center justify-center space-y-4 text-muted-foreground bg-slate-50/50 dark:bg-slate-800/50">
                  <div className="p-4 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                    <BarChart3 className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">Bar Chart Multi-métrico</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Rendimiento por región y período</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-white dark:bg-slate-800">Recharts + SQL</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 dark:border-blue-800 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                Actividad Reciente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-4 p-4 bg-green-100 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-900 dark:text-green-100">Nueva capacitación completada</p>
                  <p className="text-sm text-green-700 dark:text-green-300">45 productores certificados en Costa Rica</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">Hace 2 horas</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-4 bg-blue-100 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Actualización de métricas</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Datos de biodiversidad sincronizados</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Hace 4 horas</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-4 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">Nuevo producto registrado</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">Café sostenible - Región Andina</p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Ayer</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 border-purple-200 dark:border-purple-800 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold">Timeline de Progreso</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Evolución mensual por indicador</p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">
                    Próximamente
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] border-2 border-dashed border-purple-300 dark:border-purple-600 rounded-xl flex flex-col items-center justify-center space-y-4 text-muted-foreground bg-purple-50/50 dark:bg-purple-800/50">
                  <div className="p-4 bg-purple-100 dark:bg-purple-900/50 rounded-full">
                    <TrendingUp className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-purple-700 dark:text-purple-300">Line Chart Multi-series</p>
                    <p className="text-sm text-purple-500 dark:text-purple-400 mt-1">Histórico 12 meses</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-white dark:bg-purple-800">Histórico 12 meses</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-orange-200 dark:border-orange-800 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold">Matriz Impacto vs Progreso</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Análisis por organización</p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">
                    Próximamente
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] border-2 border-dashed border-orange-300 dark:border-orange-600 rounded-xl flex flex-col items-center justify-center space-y-4 text-muted-foreground bg-orange-50/50 dark:bg-orange-800/50">
                  <div className="p-4 bg-orange-100 dark:bg-orange-900/50 rounded-full">
                    <Target className="h-12 w-12 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-orange-700 dark:text-orange-300">Scatter Plot (Bubble Chart)</p>
                    <p className="text-sm text-orange-500 dark:text-orange-400 mt-1">Organizaciones</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-white dark:bg-orange-800">Organizaciones</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
