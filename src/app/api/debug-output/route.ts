import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const outputFilter = searchParams.get('output');

    console.log('🔍 Debug API called with output:', outputFilter);

    if (!outputFilter) {
      return NextResponse.json({ error: 'Output parameter is required' }, { status: 400 });
    }

    // Query simple para debug
    const simpleQuery = `
      SELECT 
        i.indicator_id,
        i.indicator_code,
        i.indicator_name,
        i.indicator_description,
        COUNT(DISTINCT pi.product_id) as products_count
      FROM indicators i
      LEFT JOIN product_indicators pi ON i.indicator_id = pi.indicator_id
      WHERE i.output_number = $1
      GROUP BY i.indicator_id, i.indicator_code, i.indicator_name, i.indicator_description
      HAVING COUNT(DISTINCT pi.product_id) > 0
      ORDER BY i.indicator_code
    `;

    console.log('🔍 Executing simple query...');
    const result = await pool.query(simpleQuery, [outputFilter]);
    
    console.log('📊 Simple query result:', result.rows);

    return NextResponse.json({
      output_number: outputFilter,
      indicators: result.rows,
      debug: true
    });

  } catch (error) {
    console.error('❌ Error in debug API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}