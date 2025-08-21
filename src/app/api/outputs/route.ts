import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    
    try {
      const query = `
        SELECT DISTINCT output_number
        FROM indicators
        WHERE output_number IS NOT NULL 
        ORDER BY output_number
      `;
      
      const result = await client.query(query);
      
      return NextResponse.json({
        outputs: result.rows.map(row => ({
          value: row.output_number.toString(),
          label: `Output ${row.output_number}`
        }))
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
