import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'BioFincas',
  password: '2261',
  port: 5434,
});

// Mock data for testing (remove when database is ready)
const mockWorkPackages = [
  { id: '1', name: 'WP-001: Frontend Development' },
  { id: '2', name: 'WP-002: Backend API' },
  { id: '3', name: 'WP-003: Database Design' },
  { id: '4', name: 'WP-004: Testing & QA' },
  { id: '5', name: 'WP-005: DevOps & Deployment' },
];

export async function GET() {
  try {
    // USANDO LA CONFIGURACIÓN DIRECTA COMO EN PRODUCT-TASKS
    const result = await pool.query('SELECT id, name FROM work_packages ORDER BY name');
    const workPackages = result.rows.map(row => ({
      id: row.id.toString(),
      name: row.name
    }));
    return NextResponse.json(workPackages);

  } catch (error) {
    console.error('Error fetching work packages:', error);
    // FALLBACK: usar mock data si hay error de BD
    console.log('Using mock data as fallback');
    return NextResponse.json(mockWorkPackages);
  }
}
