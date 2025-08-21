# 📊 **CONSULTAS SQL & CHARTS PARA INDICADORES - BioFincas**

## 🎯 **ANÁLISIS ESTRATÉGICO DE INDICADORES**

---

## **1. 📈 DASHBOARD DE RENDIMIENTO GENERAL**

### **Query SQL:**
```sql
-- Dashboard principal de rendimiento por Work Package
SELECT 
  w.workpackage_name,
  COUNT(DISTINCT p.product_id) as total_products,
  COUNT(t.task_id) as total_tasks,
  COUNT(CASE WHEN s.status_name IN ('completed', 'done', 'finished', 'completada') THEN 1 END) as completed_tasks,
  ROUND(
    (COUNT(CASE WHEN s.status_name IN ('completed', 'done', 'finished', 'completada') THEN 1 END) * 100.0 / 
     NULLIF(COUNT(t.task_id), 0)), 2
  ) as completion_percentage,
  COUNT(DISTINCT o.organization_id) as organizations_involved,
  COUNT(DISTINCT ph.phase_id) as phases_used
FROM workpackages w
LEFT JOIN products p ON w.workpackage_id = p.workpackage_id
LEFT JOIN tasks t ON p.product_id = t.product_id
LEFT JOIN status s ON t.status_id = s.status_id
LEFT JOIN organizations o ON t.responsable_id = o.organization_id
LEFT JOIN phases ph ON t.phase_id = ph.phase_id
GROUP BY w.workpackage_id, w.workpackage_name
ORDER BY completion_percentage DESC;
```

### **Chart Tipo:** Bar Chart con métricas múltiples
**Componente React:**
```tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PerformanceDashboard = ({ data }) => (
  <ResponsiveContainer width="100%" height={400}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="workpackage_name" angle={-45} textAnchor="end" height={100} />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="total_products" fill="#8884d8" name="Productos" />
      <Bar dataKey="completed_tasks" fill="#82ca9d" name="Tareas Completadas" />
      <Bar dataKey="organizations_involved" fill="#ffc658" name="Organizaciones" />
    </BarChart>
  </ResponsiveContainer>
);
```

---

## **2. 🔄 TIMELINE DE PROGRESO POR INDICADORES**

### **Query SQL:**
```sql
-- Timeline de progreso mensual por indicador
SELECT 
  i.indicator_name,
  DATE_TRUNC('month', t.created_at) as month,
  COUNT(t.task_id) as tasks_created,
  COUNT(CASE WHEN s.status_name IN ('completed', 'done', 'finished', 'completada') THEN 1 END) as tasks_completed,
  ROUND(AVG(CASE 
    WHEN t.end_date_actual IS NOT NULL AND t.start_date_actual IS NOT NULL 
    THEN EXTRACT(DAYS FROM (t.end_date_actual - t.start_date_actual))
    ELSE NULL 
  END), 2) as avg_completion_days
FROM indicators i
LEFT JOIN product_indicators pi ON i.indicator_id = pi.indicator_id
LEFT JOIN products p ON pi.product_id = p.product_id
LEFT JOIN tasks t ON p.product_id = t.product_id
LEFT JOIN status s ON t.status_id = s.status_id
WHERE t.created_at >= NOW() - INTERVAL '12 months'
GROUP BY i.indicator_id, i.indicator_name, DATE_TRUNC('month', t.created_at)
ORDER BY month DESC, i.indicator_name;
```

### **Chart Tipo:** Line Chart Multi-Series
**Componente React:**
```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const IndicatorTimeline = ({ data }) => (
  <ResponsiveContainer width="100%" height={400}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="tasks_created" stroke="#8884d8" strokeWidth={2} name="Tareas Creadas" />
      <Line type="monotone" dataKey="tasks_completed" stroke="#82ca9d" strokeWidth={2} name="Tareas Completadas" />
      <Line type="monotone" dataKey="avg_completion_days" stroke="#ff7300" strokeWidth={2} name="Promedio Días" />
    </LineChart>
  </ResponsiveContainer>
);
```

---

## **3. 🎯 MATRIZ DE IMPACTO VS PROGRESO**

### **Query SQL:**
```sql
-- Matriz de impacto por organización y tipo de indicador
SELECT 
  o.organization_name,
  i.indicator_name,
  COUNT(DISTINCT p.product_id) as products_managed,
  COUNT(t.task_id) as total_tasks,
  COUNT(CASE WHEN s.status_name IN ('completed', 'done', 'finished', 'completada') THEN 1 END) as completed_tasks,
  ROUND(
    (COUNT(CASE WHEN s.status_name IN ('completed', 'done', 'finished', 'completada') THEN 1 END) * 100.0 / 
     NULLIF(COUNT(t.task_id), 0)), 2
  ) as efficiency_rate,
  -- Calcular impacto basado en tipo de indicador
  CASE 
    WHEN i.indicator_name ILIKE '%productividad%' THEN 'Alto'
    WHEN i.indicator_name ILIKE '%sostenibilidad%' THEN 'Muy Alto'
    WHEN i.indicator_name ILIKE '%social%' THEN 'Alto'
    WHEN i.indicator_name ILIKE '%calidad%' THEN 'Medio'
    ELSE 'Medio'
  END as impact_level
FROM organizations o
JOIN tasks t ON o.organization_id = t.responsable_id
JOIN products p ON t.product_id = p.product_id
JOIN product_indicators pi ON p.product_id = pi.product_id
JOIN indicators i ON pi.indicator_id = i.indicator_id
LEFT JOIN status s ON t.status_id = s.status_id
GROUP BY o.organization_id, o.organization_name, i.indicator_id, i.indicator_name
HAVING COUNT(t.task_id) > 0
ORDER BY efficiency_rate DESC, products_managed DESC;
```

### **Chart Tipo:** Scatter Plot (Bubble Chart)
**Componente React:**
```tsx
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const ImpactMatrix = ({ data }) => {
  const getColor = (impact) => {
    switch(impact) {
      case 'Muy Alto': return '#ff6b6b';
      case 'Alto': return '#4ecdc4';
      case 'Medio': return '#45b7d1';
      default: return '#96ceb4';
    }
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ScatterChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="efficiency_rate" name="Eficiencia %" />
        <YAxis dataKey="products_managed" name="Productos Gestionados" />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
        <Scatter dataKey="total_tasks" fill="#8884d8">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getColor(entry.impact_level)} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
};
```

---

## **4. 📅 ANÁLISIS DE RETRASOS Y PREDICCIONES**

### **Query SQL:**
```sql
-- Análisis de retrasos y predicción de fechas
SELECT 
  p.product_name,
  ph.phase_name,
  COUNT(t.task_id) as total_tasks,
  COUNT(CASE 
    WHEN t.end_date_planned < CURRENT_DATE AND s.status_name NOT IN ('completed', 'done', 'finished', 'completada') 
    THEN 1 
  END) as overdue_tasks,
  COUNT(CASE 
    WHEN t.end_date_planned BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days' 
    THEN 1 
  END) as due_next_week,
  AVG(CASE 
    WHEN t.end_date_actual IS NOT NULL AND t.end_date_planned IS NOT NULL 
    THEN EXTRACT(DAYS FROM (t.end_date_actual - t.end_date_planned))
    ELSE NULL 
  END) as avg_delay_days,
  -- Predicción de riesgo basado en tendencias
  CASE 
    WHEN AVG(CASE 
      WHEN t.end_date_actual IS NOT NULL AND t.end_date_planned IS NOT NULL 
      THEN EXTRACT(DAYS FROM (t.end_date_actual - t.end_date_planned))
      ELSE 0 
    END) > 7 THEN 'Alto Riesgo'
    WHEN AVG(CASE 
      WHEN t.end_date_actual IS NOT NULL AND t.end_date_planned IS NOT NULL 
      THEN EXTRACT(DAYS FROM (t.end_date_actual - t.end_date_planned))
      ELSE 0 
    END) > 3 THEN 'Riesgo Medio'
    ELSE 'Bajo Riesgo'
  END as risk_level
FROM products p
JOIN tasks t ON p.product_id = t.product_id
LEFT JOIN phases ph ON t.phase_id = ph.phase_id
LEFT JOIN status s ON t.status_id = s.status_id
GROUP BY p.product_id, p.product_name, ph.phase_id, ph.phase_name
HAVING COUNT(t.task_id) > 0
ORDER BY avg_delay_days DESC NULLS LAST;
```

### **Chart Tipo:** Heatmap + Alert Dashboard
**Componente React:**
```tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const DelayAnalysis = ({ data }) => {
  const getRiskColor = (risk) => {
    switch(risk) {
      case 'Alto Riesgo': return '#ff4757';
      case 'Riesgo Medio': return '#ffa726';
      case 'Bajo Riesgo': return '#26de81';
      default: return '#778ca3';
    }
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="product_name" angle={-45} textAnchor="end" height={100} />
        <YAxis />
        <Tooltip />
        <Bar dataKey="overdue_tasks" name="Tareas Vencidas">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getRiskColor(entry.risk_level)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
```

---

## **5. 🌍 IMPACTO TERRITORIAL Y ORGANIZACIONAL**

### **Query SQL:**
```sql
-- Análisis de impacto por organización y distribución geográfica
SELECT 
  o.organization_name,
  COUNT(DISTINCT p.product_id) as products_count,
  COUNT(DISTINCT w.workpackage_id) as workpackages_involved,
  COUNT(t.task_id) as total_tasks,
  COUNT(CASE WHEN t.checkin_oro_verde IS NOT NULL AND t.checkin_oro_verde != '' THEN 1 END) as oro_verde_checkins,
  COUNT(CASE WHEN t.checkin_user IS NOT NULL AND t.checkin_user != '' THEN 1 END) as user_checkins,
  COUNT(CASE WHEN t.checkin_communication IS NOT NULL AND t.checkin_communication != '' THEN 1 END) as communication_checkins,
  COUNT(CASE WHEN t.checkin_gender IS NOT NULL AND t.checkin_gender != '' THEN 1 END) as gender_checkins,
  -- Calcular índice de participación
  ROUND(
    (COUNT(CASE WHEN t.checkin_oro_verde IS NOT NULL AND t.checkin_oro_verde != '' THEN 1 END) + 
     COUNT(CASE WHEN t.checkin_user IS NOT NULL AND t.checkin_user != '' THEN 1 END) + 
     COUNT(CASE WHEN t.checkin_communication IS NOT NULL AND t.checkin_communication != '' THEN 1 END) + 
     COUNT(CASE WHEN t.checkin_gender IS NOT NULL AND t.checkin_gender != '' THEN 1 END)) * 100.0 / 
     NULLIF(COUNT(t.task_id) * 4, 0), 2
  ) as participation_index
FROM organizations o
LEFT JOIN tasks t ON o.organization_id = t.responsable_id
LEFT JOIN products p ON t.product_id = p.product_id
LEFT JOIN workpackages w ON p.workpackage_id = w.workpackage_id
GROUP BY o.organization_id, o.organization_name
HAVING COUNT(t.task_id) > 0
ORDER BY participation_index DESC, total_tasks DESC;
```

### **Chart Tipo:** Radar Chart
**Componente React:**
```tsx
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';

const TerritorialImpact = ({ data }) => {
  const radarData = data.map(org => ({
    organization: org.organization_name.substring(0, 15) + '...',
    products: (org.products_count / Math.max(...data.map(d => d.products_count))) * 100,
    tasks: (org.total_tasks / Math.max(...data.map(d => d.total_tasks))) * 100,
    participation: org.participation_index,
    workpackages: (org.workpackages_involved / Math.max(...data.map(d => d.workpackages_involved))) * 100
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart data={radarData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="organization" />
        <PolarRadiusAxis angle={60} domain={[0, 100]} />
        <Radar name="Productos" dataKey="products" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
        <Radar name="Tareas" dataKey="tasks" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
        <Radar name="Participación" dataKey="participation" stroke="#ffc658" fill="#ffc658" fillOpacity={0.3} />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  );
};
```

---

## **6. 📊 ANÁLISIS DE EFICIENCIA POR FASES**

### **Query SQL:**
```sql
-- Eficiencia y duración por fases del proyecto
SELECT 
  ph.phase_name,
  COUNT(t.task_id) as total_tasks,
  COUNT(CASE WHEN s.status_name IN ('completed', 'done', 'finished', 'completada') THEN 1 END) as completed_tasks,
  ROUND(
    COUNT(CASE WHEN s.status_name IN ('completed', 'done', 'finished', 'completada') THEN 1 END) * 100.0 / 
    NULLIF(COUNT(t.task_id), 0), 2
  ) as completion_rate,
  ROUND(AVG(CASE 
    WHEN t.end_date_actual IS NOT NULL AND t.start_date_actual IS NOT NULL 
    THEN EXTRACT(DAYS FROM (t.end_date_actual - t.start_date_actual))
    ELSE NULL 
  END), 2) as avg_duration_days,
  ROUND(AVG(CASE 
    WHEN t.end_date_planned IS NOT NULL AND t.start_date_planned IS NOT NULL 
    THEN EXTRACT(DAYS FROM (t.end_date_planned - t.start_date_planned))
    ELSE NULL 
  END), 2) as avg_planned_duration,
  COUNT(DISTINCT o.organization_id) as organizations_count,
  COUNT(DISTINCT p.product_id) as products_count
FROM phases ph
LEFT JOIN tasks t ON ph.phase_id = t.phase_id
LEFT JOIN status s ON t.status_id = s.status_id
LEFT JOIN organizations o ON t.responsable_id = o.organization_id
LEFT JOIN products p ON t.product_id = p.product_id
GROUP BY ph.phase_id, ph.phase_name
HAVING COUNT(t.task_id) > 0
ORDER BY completion_rate DESC;
```

### **Chart Tipo:** Combo Chart (Bar + Line)
**Componente React:**
```tsx
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PhaseEfficiency = ({ data }) => (
  <ResponsiveContainer width="100%" height={400}>
    <ComposedChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="phase_name" angle={-45} textAnchor="end" height={80} />
      <YAxis yAxisId="left" />
      <YAxis yAxisId="right" orientation="right" />
      <Tooltip />
      <Legend />
      <Bar yAxisId="left" dataKey="total_tasks" fill="#8884d8" name="Total Tareas" />
      <Bar yAxisId="left" dataKey="completed_tasks" fill="#82ca9d" name="Completadas" />
      <Line yAxisId="right" type="monotone" dataKey="completion_rate" stroke="#ff7300" strokeWidth={3} name="% Completado" />
    </ComposedChart>
  </ResponsiveContainer>
);
```

---

## **7. 🎭 ANÁLISIS DE GÉNERO Y DIVERSIDAD**

### **Query SQL:**
```sql
-- Análisis de participación por género y comunicación
SELECT 
  CASE 
    WHEN t.checkin_gender ILIKE '%mujer%' OR t.checkin_gender ILIKE '%female%' THEN 'Mujeres'
    WHEN t.checkin_gender ILIKE '%hombre%' OR t.checkin_gender ILIKE '%male%' THEN 'Hombres'
    WHEN t.checkin_gender IS NOT NULL AND t.checkin_gender != '' THEN 'Otros'
    ELSE 'No Especificado'
  END as gender_category,
  COUNT(t.task_id) as tasks_count,
  COUNT(CASE WHEN s.status_name IN ('completed', 'done', 'finished', 'completada') THEN 1 END) as completed_tasks,
  ROUND(
    COUNT(CASE WHEN s.status_name IN ('completed', 'done', 'finished', 'completada') THEN 1 END) * 100.0 / 
    NULLIF(COUNT(t.task_id), 0), 2
  ) as completion_rate,
  COUNT(CASE WHEN t.checkin_communication IS NOT NULL AND t.checkin_communication != '' THEN 1 END) as with_communication,
  COUNT(DISTINCT o.organization_id) as organizations_involved,
  ROUND(AVG(CASE 
    WHEN t.end_date_actual IS NOT NULL AND t.start_date_actual IS NOT NULL 
    THEN EXTRACT(DAYS FROM (t.end_date_actual - t.start_date_actual))
    ELSE NULL 
  END), 2) as avg_task_duration
FROM tasks t
LEFT JOIN status s ON t.status_id = s.status_id
LEFT JOIN organizations o ON t.responsable_id = o.organization_id
GROUP BY gender_category
ORDER BY tasks_count DESC;
```

### **Chart Tipo:** Donut Chart + Bar Chart
**Componente React:**
```tsx
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const GenderAnalysis = ({ data }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div style={{ display: 'flex', width: '100%', height: 400 }}>
      <ResponsiveContainer width="50%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={120}
            dataKey="tasks_count"
            nameKey="gender_category"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <ResponsiveContainer width="50%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="gender_category" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="completion_rate" fill="#82ca9d" name="% Completado" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
```

---

## **8. 📈 PREDICCIÓN Y TENDENCIAS FUTURAS**

### **Query SQL:**
```sql
-- Análisis predictivo basado en tendencias históricas
WITH monthly_stats AS (
  SELECT 
    DATE_TRUNC('month', t.created_at) as month,
    COUNT(t.task_id) as tasks_created,
    COUNT(CASE WHEN s.status_name IN ('completed', 'done', 'finished', 'completada') THEN 1 END) as tasks_completed,
    AVG(CASE 
      WHEN t.end_date_actual IS NOT NULL AND t.start_date_actual IS NOT NULL 
      THEN EXTRACT(DAYS FROM (t.end_date_actual - t.start_date_actual))
      ELSE NULL 
    END) as avg_duration
  FROM tasks t
  LEFT JOIN status s ON t.status_id = s.status_id
  WHERE t.created_at >= NOW() - INTERVAL '12 months'
  GROUP BY DATE_TRUNC('month', t.created_at)
),
trend_analysis AS (
  SELECT 
    month,
    tasks_created,
    tasks_completed,
    avg_duration,
    LAG(tasks_created, 1) OVER (ORDER BY month) as prev_created,
    LAG(tasks_completed, 1) OVER (ORDER BY month) as prev_completed,
    ROUND(
      (tasks_created - LAG(tasks_created, 1) OVER (ORDER BY month)) * 100.0 / 
      NULLIF(LAG(tasks_created, 1) OVER (ORDER BY month), 0), 2
    ) as growth_rate
  FROM monthly_stats
)
SELECT 
  month,
  tasks_created,
  tasks_completed,
  ROUND(avg_duration, 2) as avg_duration,
  COALESCE(growth_rate, 0) as growth_rate,
  -- Predicción simple para próximo mes
  ROUND(tasks_created + (tasks_created * COALESCE(growth_rate, 0) / 100), 0) as predicted_next_month,
  CASE 
    WHEN growth_rate > 20 THEN 'Crecimiento Acelerado'
    WHEN growth_rate > 5 THEN 'Crecimiento Estable'
    WHEN growth_rate > -5 THEN 'Estable'
    ELSE 'Decrecimiento'
  END as trend_status
FROM trend_analysis
ORDER BY month DESC;
```

### **Chart Tipo:** Area Chart con predicciones
**Componente React:**
```tsx
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

const PredictiveTrends = ({ data }) => (
  <ResponsiveContainer width="100%" height={400}>
    <AreaChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Area type="monotone" dataKey="tasks_created" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} name="Tareas Creadas" />
      <Area type="monotone" dataKey="tasks_completed" stackId="2" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} name="Tareas Completadas" />
      <Area type="monotone" dataKey="predicted_next_month" stroke="#ff7300" fill="#ff7300" fillOpacity={0.3} strokeDasharray="5 5" name="Predicción" />
      <ReferenceLine y={0} stroke="#000" />
    </AreaChart>
  </ResponsiveContainer>
);
```

---

## **🚀 IMPLEMENTACIÓN RECOMENDADA**

### **API Endpoints Necesarios:**
```typescript
// src/app/api/analytics/performance/route.ts
// src/app/api/analytics/timeline/route.ts
// src/app/api/analytics/impact-matrix/route.ts
// src/app/api/analytics/delays/route.ts
// src/app/api/analytics/territorial/route.ts
// src/app/api/analytics/phases/route.ts
// src/app/api/analytics/gender/route.ts
// src/app/api/analytics/predictions/route.ts
```

### **Componente Dashboard Principal:**
```tsx
import { useState, useEffect } from 'react';
import PerformanceDashboard from './charts/PerformanceDashboard';
import IndicatorTimeline from './charts/IndicatorTimeline';
import ImpactMatrix from './charts/ImpactMatrix';
// ... otros imports

const AnalyticsDashboard = () => {
  const [dashboardData, setDashboardData] = useState({});
  
  useEffect(() => {
    // Cargar todos los datos de analytics
    loadAnalyticsData();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
      <div className="col-span-2">
        <PerformanceDashboard data={dashboardData.performance} />
      </div>
      <IndicatorTimeline data={dashboardData.timeline} />
      <ImpactMatrix data={dashboardData.impact} />
      <DelayAnalysis data={dashboardData.delays} />
      <TerritorialImpact data={dashboardData.territorial} />
      <PhaseEfficiency data={dashboardData.phases} />
      <GenderAnalysis data={dashboardData.gender} />
      <PredictiveTrends data={dashboardData.predictions} />
    </div>
  );
};
```

---

## **📋 PRÓXIMOS PASOS**

1. **Crear endpoints de analytics** con las consultas SQL
2. **Implementar componentes de charts** con Recharts
3. **Configurar dashboard principal** con grid responsivo
4. **Añadir filtros interactivos** (fechas, organizaciones, productos)
5. **Implementar exportación** a PDF/Excel
6. **Configurar actualizaciones en tiempo real** con WebSockets

¿Te gustaría que implemente alguno de estos charts específicos o prefieres que empecemos con la creación de los endpoints de analytics?
