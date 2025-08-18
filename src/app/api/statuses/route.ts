import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// Configuración de la base de datos


export async function GET() {
  try {
    const client = await pool.connect();
    
    try {
      const query = `
        SELECT 
          status_id,
          status_name
        FROM status
        ORDER BY status_name
      `;
      
      const result = await client.query(query);
      
      return NextResponse.json({
        statuses: result.rows
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching statuses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statuses' },
      { status: 500 }
    );
  }
}
