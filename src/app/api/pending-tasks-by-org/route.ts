import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    console.log('🏢 Fetching pending tasks by organization for product:', productId);

    // Consultar tareas pendientes por organización
    // Solo incluir organizaciones que tienen tareas asignadas en este producto
    const pendingTasksByOrgQuery = `
      SELECT 
        o.org_name,
        COUNT(t.task_id)::int as pending_count,
        ROUND(
          (COUNT(t.task_id)::decimal / 
           NULLIF(SUM(COUNT(t.task_id)) OVER (), 0)) * 100, 
          1
        )::float as percentage
      FROM organizations o
      INNER JOIN users u ON o.org_id = u.org_id
      INNER JOIN tasks t ON u.user_id = t.assigned_user_id
      INNER JOIN status s ON t.status_id = s.status_id
      WHERE t.product_id = $1
        AND s.status_name NOT IN ('Completed', 'Reviewed')
      GROUP BY o.org_id, o.org_name
      HAVING COUNT(t.task_id) > 0
      ORDER BY pending_count DESC
    `;

    const pendingTasksByOrgResult = await pool.query(pendingTasksByOrgQuery, [parseInt(productId)]);
    const pendingTasksByOrg = pendingTasksByOrgResult.rows;

    console.log('📊 Pending tasks by organization:', pendingTasksByOrg);

    // También obtener el total de tareas pendientes para validación
    const totalPendingQuery = `
      SELECT COUNT(t.task_id)::int as total_pending
      FROM tasks t
      INNER JOIN status s ON t.status_id = s.status_id
      WHERE t.product_id = $1
        AND s.status_name NOT IN ('Completed', 'Reviewed')
    `;

    const totalPendingResult = await pool.query(totalPendingQuery, [parseInt(productId)]);
    const totalPending = totalPendingResult.rows[0]?.total_pending || 0;

    const response = {
      pendingTasksByOrg: pendingTasksByOrg.map(item => ({
        organization: item.org_name,
        pending_count: item.pending_count,
        percentage: item.percentage
      })),
      totalPendingTasks: totalPending
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error fetching pending tasks by organization:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}