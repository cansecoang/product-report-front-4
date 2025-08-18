# Instrucciones para Deploy en Vercel

## Variables de Entorno para Render Database

**IMPORTANTE:** La configuración SSL ya está incluida en el código para Render. Solo necesitas configurar estas variables:

### Opción A: DATABASE_URL (Recomendado)
```
DATABASE_URL=postgresql://oroverde_kqhp_user:N4gSE0rlFNQ8eBHb3wMOkOaF73OzKFOE@dpg-ctj1lk88fa8c73avpk40-a.oregon-postgres.render.com/oroverde_kqhp
```

### Opción B: Variables Individuales
```
DB_HOST=dpg-ctj1lk88fa8c73avpk40-a.oregon-postgres.render.com
DB_PORT=5432
DB_NAME=oroverde_kqhp
DB_USER=oroverde_kqhp_user
DB_PASSWORD=N4gSE0rlFNQ8eBHb3wMOkOaF73OzKFOE
```

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
Después del deploy inicial, configura las variables usando UNA de las opciones arriba:
```bash
# Opción A
vercel env add DATABASE_URL

# O Opción B  
vercel env add DB_HOST
vercel env add DB_PORT
vercel env add DB_NAME
vercel env add DB_USER
vercel env add DB_PASSWORD
```

### Paso 5: Redeploy
```bash
vercel --prod
```

## Opción 2: Deploy desde GitHub

### Paso 1: Subir a GitHub
```bash
git add .
git commit -m "Preparar para deploy en Vercel con configuración SSL"
git push origin main
```

### Paso 2: Conectar en vercel.com
1. Ve a https://vercel.com
2. Haz login con GitHub
3. Importa tu repositorio
4. En "Environment Variables", agrega UNA de las opciones de arriba
5. Deploy automático

## Verificación Post-Deploy

Una vez deployado, prueba estos endpoints en tu URL de Vercel:
- `https://tu-app.vercel.app/api/db-test` - Debe mostrar `"success": true`
- `https://tu-app.vercel.app/api/indicators` - Debe mostrar lista de indicadores
- `https://tu-app.vercel.app/` - Página principal con botón "+ Add Product"

## Configuración SSL 

✅ **Ya configurado**: El código en `src/lib/db.ts` detecta automáticamente Render y aplica SSL
✅ **Funciona en desarrollo**: Probado exitosamente con `curl http://localhost:3000/api/db-test`
✅ **Compatible con Vercel**: La misma configuración funcionará en producción
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
