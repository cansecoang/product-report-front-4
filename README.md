# 🌱 BioFincas - Dashboard de Biodiversidad

Plataforma integral para monitoreo de biodiversidad y sostenibilidad agrícola con análisis avanzado de indicadores.

## 🚀 **NUEVA ESTRUCTURA UX/UI IMPLEMENTADA**

### **✅ COMPLETADO:**

#### **🏠 Dashboard Principal (`/`)**
- **KPIs Cards** con métricas clave
- **Acciones Rápidas** para navegación
- **Tabs** con Overview, Actividad y Analytics
- **Progreso Visual** con barras de progreso
- **Actividad Reciente** en tiempo real

#### **📊 Analytics Dashboard (`/analytics`)**
- **Métricas de rendimiento** globales
- **Tabs organizados** por tipo de visualización:
  - 📈 **Rendimiento**: Bar Charts multi-métricos
  - 🔄 **Timeline**: Line Charts de progreso mensual
  - 🎯 **Matriz Impacto**: Scatter Plots por organización
  - 🌍 **Geográfico**: Radar Charts territoriales

#### **⚙️ Configuración (`/settings`)**
- **Gestión de Organizaciones** con CRUD
- **Estados de Tareas** configurables
- **Fases de Proyecto** ordenadas
- **Indicadores de Desempeño** con metas

#### **🎨 Componentes shadcn/ui Integrados:**
- ✅ `Card` - Contenedores de información
- ✅ `Badge` - Etiquetas de estado
- ✅ `Tabs` - Navegación entre secciones
- ✅ `Button` - Acciones interactivas
- ✅ `Dialog` - Modales (disponible)
- ✅ `Alert` - Notificaciones (disponible)

### **🔄 EN DESARROLLO:**

#### **📈 Charts de Indicadores**
Basados en [`CONSULTAS_INDICADORES_CHARTS.md`](./CONSULTAS_INDICADORES_CHARTS.md):

1. **📈 Dashboard de Rendimiento General** - Bar Chart multi-métrico
2. **🔄 Timeline de Progreso** - Line Chart multi-series
3. **🎯 Matriz de Impacto vs Progreso** - Scatter Plot (Bubble Chart)
4. **📅 Análisis de Retrasos** - Heatmap + Alert Dashboard
5. **🌍 Impacto Territorial** - Radar Chart
6. **📊 Eficiencia por Fases** - Combo Chart (Bar + Line)
7. **🎭 Análisis de Género** - Donut + Bar Chart
8. **📈 Predicciones Futuras** - Area Chart con ML

### **⏳ PRÓXIMOS PASOS:**

1. **Instalar Recharts** para visualizaciones
2. **Crear APIs de Analytics** con queries SQL optimizadas
3. **Implementar Charts Reales** con datos de BD
4. **Agregar filtros interactivos**
5. **Exportación** a PDF/Excel

---

## 🏗️ **ARQUITECTURA DE LA APLICACIÓN**

```
📁 src/
├── 📁 app/
│   ├── 🏠 page.tsx              # Dashboard Principal
│   ├── 📊 analytics/page.tsx    # Charts y Analytics
│   ├── ⚙️ settings/page.tsx     # Configuración
│   ├── 📋 product/              # Gestión de Productos
│   │   ├── list/page.tsx
│   │   ├── gantt/page.tsx
│   │   └── metrics/page.tsx
│   └── 📈 indicators/           # Indicadores
│       └── metrics/page.tsx
│
├── 📁 components/
│   ├── 🎨 ui/                   # shadcn/ui components
│   ├── 📊 charts/               # Charts personalizados (próximamente)
│   ├── app-sidebar.tsx          # Navegación lateral
│   └── global-navbar.tsx        # Barra superior
│
└── 📁 lib/
    ├── db.ts                    # Conexión BD (PostgreSQL + Prisma)
    ├── data-access.ts           # Queries existentes
    └── data-access-prisma.ts    # Nuevas queries con Prisma
```

---

## 🎯 **CARACTERÍSTICAS PRINCIPALES**

### **🔧 TECNOLOGÍAS:**
- ⚡ **Next.js 15** con Turbopack
- 🎨 **shadcn/ui** + Tailwind CSS
- 🗄️ **PostgreSQL** (Vercel Postgres + Prisma Accelerate)
- 📊 **Recharts** (próximamente)
- 🔒 **TypeScript** para type safety

### **🌟 UX/UI FEATURES:**
- 📱 **Responsive Design** para móvil y desktop
- 🎨 **Dark/Light Mode** automático
- ⚡ **Loading States** con Skeleton components
- 🔄 **Real-time Updates** para métricas
- 📊 **Interactive Charts** con tooltips y filtros

### **📊 ANALYTICS AVANZADOS:**
- 📈 **8 tipos de charts** especializados
- 🎯 **KPIs ejecutivos** en tiempo real
- 🌍 **Análisis geográfico** por país/región
- 👥 **Métricas de diversidad** e inclusión
- 🔮 **Predicciones ML** para optimización

---

## 🚀 **INSTALACIÓN Y DESARROLLO**

### **Prerequisitos:**
```bash
Node.js 18+
PostgreSQL (local o Vercel Postgres)
```

### **Setup:**
```bash
# Clonar repositorio
git clone [repo-url]
cd product-report-front-4

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# Ejecutar desarrollo
npm run dev
```

### **Variables de Entorno:**
```bash
# .env.local
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=..."
POSTGRES_URL="postgres://user:pass@db.prisma.io:5432/..."
```

---

## 📊 **MÉTRICAS Y KPIs**

### **Dashboard Principal:**
- 👥 **Productores Capacitados**: 1,247 (Meta: 1,000) +24%
- 🌱 **Prácticas Biodiversas**: 78% (Meta: 70%) +8%
- 🎯 **Productos Activos**: 14 (Meta: 12) +17%
- 🏢 **Organizaciones**: 45 (Meta: 40) +13%

### **Analytics Avanzados:**
- 📈 **Eficiencia Global**: 87.3% (+12.5% vs mes anterior)
- 🌍 **Impacto Territorial**: 3 países, 45 organizaciones
- 👤 **Productores Impactados**: 1,247 (+24% vs objetivo)
- 🎯 **Biodiversidad Score**: 78.4 (Excelente)

---

## 🎨 **COMPONENTES REUTILIZABLES**

### **Cards de KPIs:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Métrica</CardTitle>
    <Icon />
  </CardHeader>
  <CardContent>
    <div>Valor</div>
    <Badge>Tendencia</Badge>
  </CardContent>
</Card>
```

### **Charts Placeholder:**
```tsx
<div className="h-[300px] border-2 border-dashed rounded-lg">
  <div className="text-center">
    <Icon className="h-12 w-12" />
    <p>Tipo de Chart</p>
    <Badge>Próximamente</Badge>
  </div>
</div>
```

---

## 📱 **NAVEGACIÓN**

### **Sidebar Principal:**
- 🏠 **Dashboard** - `/`
- 📋 **Productos** - `/product`
  - 📝 Lista - `/product/list`
  - 📊 Gantt - `/product/gantt`
  - 📈 Métricas - `/product/metrics`
- 📊 **Indicadores** - `/indicators`
  - 📈 Métricas - `/indicators`
  - 📊 Analytics - `/analytics`
- ⚙️ **Configuración** - `/settings`

### **Acciones Rápidas:**
- ➕ Agregar Producto
- 📊 Ver Analytics
- 🎯 Gestionar Indicadores
- 📅 Programar Actividad

---

## 📈 **ROADMAP DE DESARROLLO**

### **Fase 1: UX/UI Base** ✅
- [x] Dashboard Principal con KPIs
- [x] Estructura de navegación
- [x] Páginas de Analytics y Settings
- [x] Componentes shadcn/ui integrados

### **Fase 2: Charts Interactivos** 🔄
- [ ] Instalar y configurar Recharts
- [ ] Implementar 8 charts de indicadores
- [ ] APIs de analytics optimizadas
- [ ] Filtros y interactividad

### **Fase 3: Features Avanzadas** ⏳
- [ ] Exportación a PDF/Excel
- [ ] Notificaciones en tiempo real
- [ ] Optimización de performance
- [ ] Testing y documentación

---

## 🤝 **CONTRIBUCIÓN**

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

---

## 📄 **LICENCIA**

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

---

## 📞 **CONTACTO**

**Proyecto BioFincas** - Dashboard de Biodiversidad  
📧 Email: [contacto]  
🌐 Website: [website]

---

*Última actualización: Agosto 20, 2025*  
*Versión: 2.0 - Nueva estructura UX/UI implementada*
