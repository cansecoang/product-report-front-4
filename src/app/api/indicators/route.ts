import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'BioFincas',
  password: '2261',
  port: 5434,
});

export async function GET() {
  try {
    const result = await pool.query('SELECT id, name, description, unit, target_value FROM indicators ORDER BY name');
    const indicators = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      unit: row.unit,
      target_value: row.target_value
    }));

    return NextResponse.json({ indicators });
  } catch (error) {
    console.error('Error fetching indicators:', error);
    
    // Mock data as fallback
    const mockIndicators = [
      { id: 1, name: 'Productividad', description: 'Producción por hectárea', unit: 'kg/ha', target_value: 5000 },
      { id: 2, name: 'Sostenibilidad', description: 'Certificaciones ambientales', unit: 'puntos', target_value: 100 },
      { id: 3, name: 'Calidad', description: 'Estándares de calidad', unit: '%', target_value: 95 },
      { id: 4, name: 'Innovación', description: 'Tecnologías implementadas', unit: 'tecnologías', target_value: 5 },
      { id: 5, name: 'Capacitación', description: 'Agricultores capacitados', unit: 'personas', target_value: 200 },
      { id: 6, name: 'Impacto Social', description: 'Familias beneficiadas', unit: 'familias', target_value: 150 }
    ];

    return NextResponse.json({ indicators: mockIndicators });
  }
}
