-- =====================================================
-- SCRIPT PARA BORRAR TODAS LAS TABLAS COMPLETAMENTE
-- Ejecutar en pgAdmin4 Query Tool
-- =====================================================

-- PASO 1: Desactivar verificación de foreign keys temporalmente
SET session_replication_role = replica;

-- PASO 2: Borrar todas las tablas en el orden correcto
-- (Tablas hijo primero para evitar problemas de foreign keys)

-- Borrar tablas de relaciones primero
DROP TABLE IF EXISTS product_distributor_others CASCADE;
DROP TABLE IF EXISTS product_distributor_users CASCADE;
DROP TABLE IF EXISTS product_distributor_orgs CASCADE;
DROP TABLE IF EXISTS product_organizations CASCADE;
DROP TABLE IF EXISTS product_indicators CASCADE;
DROP TABLE IF EXISTS product_responsibles CASCADE;

-- Borrar tabla products (que depende de otras)
DROP TABLE IF EXISTS products CASCADE;

-- Borrar tablas independientes
DROP TABLE IF EXISTS indicators CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS countries CASCADE;
DROP TABLE IF EXISTS workpackages CASCADE;

-- Borrar cualquier otra tabla que pueda existir
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS phases CASCADE;
DROP TABLE IF EXISTS statuses CASCADE;
DROP TABLE IF EXISTS task_phases CASCADE;
DROP TABLE IF EXISTS task_statuses CASCADE;

-- PASO 3: Reactivar verificación de foreign keys
SET session_replication_role = DEFAULT;

-- PASO 4: Verificar que todas las tablas fueron borradas
SELECT 
    schemaname,
    tablename 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Si aparecen tablas en el resultado anterior, significa que no se borraron
-- En ese caso, ejecuta este comando más agresivo:

-- COMANDO ALTERNATIVO (solo si el anterior no funciona):
-- DROP SCHEMA public CASCADE;
-- CREATE SCHEMA public;
-- GRANT ALL ON SCHEMA public TO postgres;
-- GRANT ALL ON SCHEMA public TO public;

-- PASO 5: Mensaje de confirmación
SELECT 'Todas las tablas han sido borradas exitosamente!' as status;
