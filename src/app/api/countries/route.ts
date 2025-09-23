import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    const query = `
      SELECT 
        country_id as id,
        country_name as name
      FROM countries 
      ORDER BY country_name
    `;

    const result = await pool.query(query);

    return NextResponse.json({
      countries: result.rows
    });

  } catch (error) {
    console.error('Error fetching countries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch countries' }, 
      { status: 500 }
    );
  }
}
