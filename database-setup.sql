-- Scripts SQL para configurar tu base de datos BioFincas
-- Ejecuta estos comandos en tu PostgreSQL

-- 1. Crear tabla workpackages
CREATE TABLE IF NOT EXISTS workpackages (
    workpackage_id SERIAL PRIMARY KEY,
    workpackage_name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Crear tabla products
CREATE TABLE IF NOT EXISTS products (
    product_id SERIAL PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    description TEXT,
    workpackage_id INTEGER REFERENCES workpackages(workpackage_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Insertar datos de ejemplo para BioFincas
INSERT INTO workpackages (workpackage_name, description) VALUES 
('WP-001: Gestión de Fincas', 'Sistema integral para gestión de fincas biológicas'),
('WP-002: Control de Cultivos', 'Monitoreo y control de cultivos orgánicos'),
('WP-003: Análisis de Suelo', 'Análisis y certificación de suelos orgánicos'),
('WP-004: Certificaciones Bio', 'Gestión de certificaciones orgánicas'),
('WP-005: Reportes Financieros', 'Sistema de reportes y análisis financiero')
ON CONFLICT DO NOTHING;

INSERT INTO products (product_name, workpackage_id, description) VALUES 
-- Products para WP-001: Gestión de Fincas
('Registro de Propiedades', 1, 'Sistema para registrar y gestionar propiedades rurales'),
('Control de Empleados', 1, 'Gestión de personal y trabajadores de finca'),
('Inventario de Equipos', 1, 'Control de maquinaria y herramientas'),

-- Products para WP-002: Control de Cultivos
('Monitor de Siembra', 2, 'Seguimiento de procesos de siembra'),
('Control de Plagas Bio', 2, 'Gestión de control de plagas orgánico'),
('Calendario de Cosecha', 2, 'Planificación y seguimiento de cosechas'),

-- Products para WP-003: Análisis de Suelo
('Test de pH', 3, 'Análisis de acidez del suelo'),
('Control de Nutrientes', 3, 'Monitoreo de nutrientes del suelo'),
('Certificación Orgánica', 3, 'Proceso de certificación de suelos'),

-- Products para WP-004: Certificaciones Bio
('Auditoría Interna', 4, 'Sistema de auditorías internas'),
('Documentación Bio', 4, 'Gestión de documentos para certificación'),
('Seguimiento Normativo', 4, 'Control de cumplimiento normativo'),

-- Products para WP-005: Reportes Financieros
('Análisis de Costos', 5, 'Análisis de costos de producción'),
('Reporte de Ventas', 5, 'Seguimiento de ventas y ingresos'),
('Proyección Financiera', 5, 'Proyecciones y presupuestos')
ON CONFLICT DO NOTHING;

-- 4. Verificar que los datos se insertaron correctamente
SELECT 
    w.workpackage_id,
    w.workpackage_name,
    COUNT(p.product_id) as product_count
FROM workpackages w
LEFT JOIN products p ON w.workpackage_id = p.workpackage_id
GROUP BY w.workpackage_id, w.workpackage_name
ORDER BY w.workpackage_id;
