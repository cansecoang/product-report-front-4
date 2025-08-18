import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'oroverde_dev',
  password: 'postgres',
  port: 5432,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Get phases that have tasks for the specific product - las fases vienen de las tareas, no del producto
    const phasesQuery = `
      SELECT DISTINCT 
        p.phase_id as id, 
        p.phase_name as name, 
        p.phase_id as order_index,
        COUNT(t.task_id) as task_count
      FROM tasks t
      INNER JOIN phases p ON p.phase_id = t.phase_id
      WHERE t.product_id = $1
      GROUP BY p.phase_id, p.phase_name
      ORDER BY p.phase_id ASC
    `;
    
    const phasesResult = await pool.query(phasesQuery, [productId]);
    
    return NextResponse.json({
      phases: phasesResult.rows
    });
    
  } catch (error) {
    console.error('Error fetching phases:', error);
    return NextResponse.json({ error: 'Failed to fetch phases' }, { status: 500 });
  }
}
