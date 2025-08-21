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
    
    // Mock data as fallback
    const mockIndicators = [
      { indicator_id: 1, indicator_code: '1.1', indicator_name: 'Productividad', indicator_description: 'Producción por hectárea', output_number: '1' },
      { indicator_id: 2, indicator_code: '2.1', indicator_name: 'Sostenibilidad', indicator_description: 'Certificaciones ambientales', output_number: '2' },
      { indicator_id: 3, indicator_code: '3.1', indicator_name: 'Calidad', indicator_description: 'Estándares de calidad', output_number: '3' },
      { indicator_id: 4, indicator_code: '4.1', indicator_name: 'Innovación', indicator_description: 'Tecnologías implementadas', output_number: '4' },
      { indicator_id: 5, indicator_code: '5.1', indicator_name: 'Capacitación', indicator_description: 'Agricultores capacitados', output_number: '5' },
      { indicator_id: 6, indicator_code: '6.1', indicator_name: 'Impacto Social', indicator_description: 'Familias beneficiadas', output_number: '6' }
    ];

    return NextResponse.json({ indicators: mockIndicators });
  }
}
