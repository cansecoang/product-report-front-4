import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';



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
        p.phase_id, 
        p.phase_name, 
        COUNT(t.task_id) as task_count
      FROM tasks t
      INNER JOIN phases p ON p.phase_id = t.phase_id
      WHERE t.product_id = $1
      GROUP BY p.phase_id, p.phase_name
      ORDER BY p.phase_id ASC
    `;
    
    const phasesResult = await pool.query(phasesQuery, [productId]);
    
    console.log(`📋 Fases obtenidas para producto ${productId}:`, phasesResult.rows.length);
    
    return NextResponse.json({
      phases: phasesResult.rows.map(row => ({
        phase_id: row.phase_id,
        phase_name: row.phase_name,
        task_count: parseInt(row.task_count)
      }))
    });
    
  } catch (error) {
    console.error('Error fetching phases:', error);
    return NextResponse.json({ error: 'Failed to fetch phases' }, { status: 500 });
  }
}
