# Instrucciones para Deploy en Vercel

## Opción 1: Deploy desde el CLI de Vercel

### Paso 1: Instalar Vercel CLI
```bash
npm i -g vercel
```

### Paso 2: Login en Vercel
```bash
vercel login
```

### Paso 3: Deploy
```bash
cd /c/Users/Angel/OneDrive/Documentos/oroverde/product_report_mvp/product-report-front-4
vercel
```

### Paso 4: Configurar Variables de Entorno en Vercel
Después del deploy inicial, ve a tu dashboard de Vercel y configura las variables de entorno:
- `DB_HOST`: Tu host de base de datos
- `DB_PORT`: Puerto de la base de datos  
- `DB_NAME`: Nombre de la base de datos
- `DB_USER`: Usuario de la base de datos
- `DB_PASSWORD`: Contraseña de la base de datos

### Paso 5: Redeploy
```bash
vercel --prod
```

## Opción 2: Deploy desde GitHub

### Paso 1: Subir a GitHub
```bash
git add .
git commit -m "Preparar para deploy en Vercel"
git push origin main
```

### Paso 2: Conectar en vercel.com
1. Ve a https://vercel.com
2. Haz login con GitHub
3. Importa tu repositorio
4. Configura las variables de entorno:
   - `DB_HOST`
   - `DB_PORT` 
   - `DB_NAME`
   - `DB_USER`
   - `DB_PASSWORD`
5. Deploy

## Nota Importante sobre Base de Datos
Tu base de datos actual (localhost:5434) no será accesible desde Vercel. Necesitarás:

1. **Opción Recomendada**: Migrar a una base de datos en la nube:
   - PostgreSQL en Vercel
   - Supabase
   - Railway
   - PlanetScale
   - AWS RDS

2. **Opción Temporal**: Usar una base de datos de prueba con datos mock

## Variables de Entorno para Producción

Cuando tengas tu base de datos en la nube, las variables serían algo así:

```
DB_HOST=tu-host.postgres.vercel-storage.com
DB_PORT=5432
DB_NAME=tu_base_datos
DB_USER=tu_usuario
DB_PASSWORD=tu_password_segura
```
