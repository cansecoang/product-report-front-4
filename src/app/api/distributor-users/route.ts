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
    const result = await pool.query('SELECT id, name, email, phone, specialty FROM distributor_users ORDER BY name');
    const distributorUsers = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      specialty: row.specialty
    }));

    return NextResponse.json({ distributorUsers });
  } catch (error) {
    console.error('Error fetching distributor users:', error);
    
    // Mock data as fallback
    const mockDistributorUsers = [
      { id: 1, name: 'Pedro Ramírez', email: 'pedro@distribuidora.com', phone: '+57 320 111 1111', specialty: 'Orgánicos' },
      { id: 2, name: 'Laura Fernández', email: 'laura@comercial.com', phone: '+57 321 222 2222', specialty: 'Exportación' },
      { id: 3, name: 'Miguel Torres', email: 'miguel@ventas.com', phone: '+57 322 333 3333', specialty: 'Retail' },
      { id: 4, name: 'Carmen Silva', email: 'carmen@logistica.com', phone: '+57 323 444 4444', specialty: 'Logística' },
      { id: 5, name: 'Roberto Díaz', email: 'roberto@broker.com', phone: '+57 324 555 5555', specialty: 'Broker' }
    ];

    return NextResponse.json({ distributorUsers: mockDistributorUsers });
  }
}
