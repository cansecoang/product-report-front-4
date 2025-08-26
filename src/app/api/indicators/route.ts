import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';



export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const outputFilter = searchParams.get('output');

    let query = 'SELECT indicator_id, indicator_code, indicator_name, indicator_description, output_number FROM indicators';
    const queryParams: string[] = [];

    // Si hay filtro de output, agregarlo a la consulta
    if (outputFilter) {
      query += ' WHERE output_number = $1';
      queryParams.push(outputFilter);
    }

    query += ' ORDER BY indicator_name';

    const result = await pool.query(query, queryParams);

    console.log(`Fetched ${result.rows.length} indicators${outputFilter ? ` for output ${outputFilter}` : ''}`);

    return NextResponse.json({ indicators: result.rows });
  } catch (error) {
    console.error('Error fetching indicators:', error);
    
    // Return empty array instead of mock data to show real state
    return NextResponse.json({ indicators: [] });
  }
}
