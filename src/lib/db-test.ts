import { query } from '@/lib/db';

// Función para probar la conexión a la base de datos
export async function testConnection() {
  try {
    const result = await query('SELECT version()');
    console.log('✅ Conexión exitosa a PostgreSQL');
    console.log('📊 Versión:', result.rows[0].version);
    return { success: true, version: result.rows[0].version };
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Función para listar todas las tablas
export async function listTables() {
  try {
    const result = await query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);
    console.log('📋 Tablas encontradas:', result.rows);
    return result.rows;
  } catch (error) {
    console.error('❌ Error listando tablas:', error);
    return [];
  }
}

// Función para ver estructura de una tabla
export async function describeTable(tableName: string) {
  try {
    const result = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = $1 AND table_schema = 'public'
      ORDER BY ordinal_position
    `, [tableName]);
    console.log(`📋 Estructura de ${tableName}:`, result.rows);
    return result.rows;
  } catch (error) {
    console.error(`❌ Error describiendo tabla ${tableName}:`, error);
    return [];
  }
}
