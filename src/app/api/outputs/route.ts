import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    
    try {
      const query = `
        SELECT *
        FROM outputs
        ORDER BY output_number
      `;
      
      const result = await client.query(query);
      
      console.log('Outputs loaded:', result.rows);
      
      // Transformar los datos al formato esperado por el frontend
      const transformedOutputs = result.rows.map(row => ({
        outputNumber: row.output_number,
        name: row.output_name
      }));
      
      return NextResponse.json({
        outputs: transformedOutputs
      });
      
    } catch (error) {
      console.error('Query error:', error);
      return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }
}
