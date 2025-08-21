import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// Configuración de la base de datos


export async function GET() {
  try {
    const client = await pool.connect();
    
    try {
      const query = `
        SELECT 
          organization_id,
          organization_name,
          organization_description,
          organization_type
        FROM organizations
        WHERE organization_type = 'M'
        ORDER BY organization_name
      `;
      
      const result = await client.query(query);
      
      return NextResponse.json({
        organizations: result.rows
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organizations' },
      { status: 500 }
    );
  }
}
