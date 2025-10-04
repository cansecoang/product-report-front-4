import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    
    try {
      // Primero verificar si la tabla existe
      const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'outputs'
        ) as table_exists
      `);
      
      console.log('¿Existe la tabla outputs?:', tableCheck.rows[0]);
      
      if (!tableCheck.rows[0].table_exists) {
        return NextResponse.json({
          error: 'La tabla outputs no existe',
          tableExists: false
        });
      }
      
      // Ver la estructura de la tabla
      const structure = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'outputs' AND table_schema = 'public'
        ORDER BY ordinal_position
      `);
      
      console.log('Estructura de outputs:', structure.rows);
      
      // Contar registros
      const count = await client.query('SELECT COUNT(*) FROM outputs');
      console.log('Registros en outputs:', count.rows[0]);
      
      // Obtener datos
      const data = await client.query('SELECT * FROM outputs ORDER BY output_number LIMIT 10');
      console.log('Datos de outputs:', data.rows);
      
      return NextResponse.json({
        tableExists: true,
        structure: structure.rows,
        count: count.rows[0].count,
        data: data.rows
      });
      
    } catch (error) {
      console.error('Query error:', error);
      return NextResponse.json({ 
        error: 'Database query failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({ 
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
