import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query('SELECT workpackage_id, workpackage_name FROM workpackages ORDER BY workpackage_name');
    
    return NextResponse.json({
      workpackages: result.rows
    });

  } catch (error) {
    console.error('Error fetching work packages:', error);
    
    // Fallback data
    const mockWorkPackages = [
      { workpackage_id: 1, workpackage_name: 'Conservation & Restoration' },
      { workpackage_id: 2, workpackage_name: 'Sustainable Agriculture' },
      { workpackage_id: 3, workpackage_name: 'Capacity Building' },
      { workpackage_id: 4, workpackage_name: 'Research & Monitoring' }
    ];
    
    return NextResponse.json({
      workpackages: mockWorkPackages
    });
  }
}
}
