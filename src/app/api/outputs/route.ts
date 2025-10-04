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
      
      return NextResponse.json({
        outputs: result.rows
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
