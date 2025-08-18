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
    const result = await pool.query('SELECT id, name, contact_info, type, description FROM distributor_others ORDER BY name');
    const distributorOthers = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      contact_info: row.contact_info,
      type: row.type,
      description: row.description
    }));

    return NextResponse.json({ distributorOthers });
  } catch (error) {
    console.error('Error fetching distributor others:', error);
    
    // Mock data as fallback
    const mockDistributorOthers = [
      { id: 1, name: 'Mercado Local San Juan', contact_info: 'Plaza Central Local 15', type: 'Mercado', description: 'Mercado tradicional' },
      { id: 2, name: 'Feria Orgánica Centro', contact_info: 'Calle 10 #15-30', type: 'Feria', description: 'Feria semanal orgánica' },
      { id: 3, name: 'Cooperativa El Progreso', contact_info: 'Km 5 Vía Rural', type: 'Cooperativa', description: 'Cooperativa de productores' },
      { id: 4, name: 'Tienda Verde', contact_info: 'Av. Principal 45', type: 'Tienda', description: 'Tienda especializada' },
      { id: 5, name: 'Red de Acopio Norte', contact_info: 'Zona Industrial Lote 8', type: 'Centro Acopio', description: 'Centro de acopio regional' }
    ];

    return NextResponse.json({ distributorOthers: mockDistributorOthers });
  }
}
