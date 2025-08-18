import { NextResponse } from 'next/server';
import { testConnection, listTables, describeTable } from '@/lib/db-test';

export async function GET() {
  try {
    console.log('🔍 Probando conexión a la base de datos...');
    
    // Probar conexión
    const connectionTest = await testConnection();
    if (!connectionTest.success) {
      return NextResponse.json({
        error: 'No se pudo conectar a la base de datos',
        details: connectionTest.error
      }, { status: 500 });
    }

    // Listar tablas
    const tables = await listTables();
    
    // Obtener estructura de las primeras tablas
    const tableStructures: Record<string, unknown> = {};
    for (const table of tables.slice(0, 5)) { // Solo las primeras 5 para no saturar
      tableStructures[table.tablename] = await describeTable(table.tablename);
    }

    return NextResponse.json({
      success: true,
      connection: connectionTest,
      tables: tables,
      tableStructures: tableStructures,
      message: '✅ Conexión exitosa a PostgreSQL'
    });

  } catch (error) {
    console.error('❌ Error en test de base de datos:', error);
    return NextResponse.json({
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
