# Script para migrar datos de localhost a Render

## Opción 1: Usar pg_dump y psql (Recomendado)

### Exportar datos de tu base local:
```bash
pg_dump -h localhost -p 5434 -U postgres -d BioFincas > biofincas_backup.sql
```

### Importar a Render:
```bash
psql -h tu-hostname.render.com -p 5432 -U tu_usuario -d tu_database < biofincas_backup.sql
```

## Opción 2: Usar GUI (pgAdmin, DBeaver, etc.)

1. Conecta a tu base local
2. Exporta las tablas (SQL dump)
3. Conecta a Render
4. Importa el dump

## Opción 3: Recrear manualmente

Si prefieres empezar limpio, puedes:
1. Ejecutar el `database-setup.sql` en Render
2. Insertar algunos datos de prueba
3. O migrar solo las tablas importantes

## Estructura de tablas que necesitas migrar:

- workpackages
- products  
- users
- organizations
- indicators
- countries
- phases
- status
- tasks
- Todas las tablas de relaciones (product_*, etc.)

## Conexión a Render desde herramientas locales:

**Host**: tu-hostname.render.com
**Port**: 5432
**Database**: tu_database_name
**Username**: tu_username  
**Password**: tu_password
**SSL**: Required (habilitado)
