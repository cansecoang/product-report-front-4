// Script para ejecutar el reset de la base de datos
const resetDatabase = async () => {
  try {
    console.log('🗑️ Iniciando reset de la base de datos...');
    
    const response = await fetch('http://localhost:3000/api/reset-database', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ ¡Base de datos reseteada exitosamente!');
      console.log('📊 Resultado:', result);
    } else {
      console.error('❌ Error al resetear la base de datos:', result);
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error);
  }
};

// Ejecutar el reset
resetDatabase();
