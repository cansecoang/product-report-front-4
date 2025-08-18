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
    const result = await pool.query('SELECT id, name, email, phone, type FROM distributor_orgs ORDER BY name');
    const distributorOrgs = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      type: row.type
    }));

    return NextResponse.json({ distributorOrgs });
  } catch (error) {
    console.error('Error fetching distributor orgs:', error);
    
    // Mock data as fallback
    const mockDistributorOrgs = [
      { id: 1, name: 'AgroDistribuidor SA', email: 'info@agrodist.com', phone: '+57 310 111 1111', type: 'Mayorista' },
      { id: 2, name: 'EcoCorp Ltda', email: 'contact@ecocorp.com', phone: '+57 311 222 2222', type: 'Exportador' },
      { id: 3, name: 'BioMarket SAS', email: 'sales@biomarket.com', phone: '+57 312 333 3333', type: 'Retail' },
      { id: 4, name: 'GreenTrade Inc', email: 'info@greentrade.com', phone: '+57 313 444 4444', type: 'Internacional' },
      { id: 5, name: 'OrganicPlus SA', email: 'contact@organicplus.com', phone: '+57 314 555 5555', type: 'Especializado' }
    ];

    return NextResponse.json({ distributorOrgs: mockDistributorOrgs });
  }
}
