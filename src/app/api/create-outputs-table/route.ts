import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    
    try {
      // Crear la tabla outputs
      await client.query(`
        CREATE TABLE IF NOT EXISTS outputs (
          output_id SERIAL PRIMARY KEY,
          output_number VARCHAR(50) NOT NULL UNIQUE,
          output_name TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log('✅ Tabla outputs creada');
      
      // Insertar outputs del 1 al 4
      const outputsToInsert = [
        { number: '1', name: 'Output 1' },
        { number: '2', name: 'Output 2' },
        { number: '3', name: 'Output 3' },
        { number: '4', name: 'Output 4' }
      ];
      
      for (const output of outputsToInsert) {
        await client.query(`
          INSERT INTO outputs (output_number, output_name)
          VALUES ($1, $2)
          ON CONFLICT (output_number) DO NOTHING
        `, [output.number, output.name]);
      }
      
      console.log('✅ Outputs 1-4 insertados')
      
      // Verificar los datos insertados
      const result = await client.query('SELECT * FROM outputs ORDER BY output_number');
      
      return NextResponse.json({
        success: true,
        message: 'Tabla outputs creada e inicializada',
        outputs: result.rows,
        count: result.rows.length
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
