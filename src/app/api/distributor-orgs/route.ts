import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        organization_id,
        organization_name,
        organization_description
      FROM organizations
      ORDER BY organization_name
    `);

    return NextResponse.json({ distributorOrgs: result.rows });
  } catch (error) {
    console.error('Error fetching distributor organizations:', error);
    
    // Mock data as fallback
    const mockDistributorOrgs = [
      { organization_id: 1, organization_name: 'OroVerde', organization_description: 'German environmental organization' },
      { organization_id: 2, organization_name: 'Pronatura Sur', organization_description: 'Mexican conservation organization' },
      { organization_id: 3, organization_name: 'SINCHI', organization_description: 'Colombian research institute' }
    ];

    return NextResponse.json({ distributorOrgs: mockDistributorOrgs });
  }
}
