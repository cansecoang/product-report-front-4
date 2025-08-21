#!/bin/bash

# Script para resetear la base de datos completamente
# Ejecuta este script para limpiar y recrear todas las tablas

echo "🗑️ Iniciando reset completo de la base de datos..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: Ejecuta este script desde el directorio raíz del proyecto"
    exit 1
fi

# Verificar que el servidor no esté corriendo
echo "⚠️  IMPORTANTE: Asegúrate de que el servidor de desarrollo esté parado antes de continuar"
echo "   Presiona Ctrl+C en la terminal donde tienes 'npm run dev' ejecutándose"
read -p "¿Has parado el servidor? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Por favor para el servidor primero y vuelve a ejecutar este script"
    exit 1
fi

# Función para hacer la petición de reset
reset_database() {
    echo "🔄 Enviando petición de reset a la API..."
    
    # Iniciar el servidor temporalmente en background
    echo "🚀 Iniciando servidor temporal..."
    npm run dev &
    SERVER_PID=$!
    
    # Esperar a que el servidor esté listo
    echo "⏳ Esperando a que el servidor esté listo..."
    sleep 10
    
    # Hacer la petición de reset
    echo "📡 Ejecutando reset de base de datos..."
    curl -X POST http://localhost:3000/api/reset-database \
         -H "Content-Type: application/json" \
         -w "\nHTTP Status: %{http_code}\n"
    
    # Parar el servidor temporal
    echo "🛑 Parando servidor temporal..."
    kill $SERVER_PID 2>/dev/null || true
    
    echo "✅ Reset completado!"
}

# Ejecutar el reset
reset_database

echo ""
echo "🎉 ¡Base de datos reseteada exitosamente!"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Ejecuta 'npm run dev' para iniciar el servidor"
echo "   2. Ve a http://localhost:3000 para verificar que todo funciona"
echo "   3. Prueba el modal de detalles del producto - ya no debería dar errores"
echo ""
echo "📊 Datos de ejemplo creados:"
echo "   • 5 países"
echo "   • 5 organizaciones"
echo "   • 5 usuarios"
echo "   • 4 work packages"
echo "   • 6 productos"
echo "   • 5 indicadores"
