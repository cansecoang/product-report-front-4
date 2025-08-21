import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // 1. Resumen general del producto
    const productSummary = await pool.query(`
      SELECT 
        p.product_name,
        COUNT(t.task_id) as total_tasks,
        COUNT(CASE WHEN s.status_name = 'Completed' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN s.status_name = 'In Progress' THEN 1 END) as in_progress_tasks,
        COUNT(CASE WHEN s.status_name = 'Pending' THEN 1 END) as pending_tasks,
        COUNT(CASE WHEN t.end_date_planned < CURRENT_DATE AND s.status_name != 'Completed' THEN 1 END) as overdue_tasks,
        ROUND(
          (COUNT(CASE WHEN s.status_name = 'Completed' THEN 1 END)::decimal / 
           NULLIF(COUNT(t.task_id), 0)) * 100, 2
        ) as completion_percentage
      FROM products p
      LEFT JOIN tasks t ON p.product_id = t.product_id
      LEFT JOIN status s ON t.status_id = s.status_id
      WHERE p.product_id = $1
      GROUP BY p.product_id, p.product_name
    `, [productId]);

    // 2. Distribución por estado
    const statusDistribution = await pool.query(`
      SELECT 
        s.status_name as name,
        COUNT(t.task_id) as value,
        ROUND((COUNT(t.task_id)::decimal / 
               (SELECT COUNT(*) FROM tasks WHERE product_id = $1)) * 100, 1) as percentage
      FROM status s
      LEFT JOIN tasks t ON s.status_id = t.status_id AND t.product_id = $1
      GROUP BY s.status_id, s.status_name
      HAVING COUNT(t.task_id) > 0
      ORDER BY COUNT(t.task_id) DESC
    `, [productId]);

    // 3. Distribución por fase
    const phaseDistribution = await pool.query(`
      SELECT 
        ph.phase_name as name,
        COUNT(t.task_id) as value,
        ROUND((COUNT(t.task_id)::decimal / 
               (SELECT COUNT(*) FROM tasks WHERE product_id = $1)) * 100, 1) as percentage
      FROM phases ph
      LEFT JOIN tasks t ON ph.phase_id = t.phase_id AND t.product_id = $1
      GROUP BY ph.phase_id, ph.phase_name
      HAVING COUNT(t.task_id) > 0
      ORDER BY ph.phase_id
    `, [productId]);

    // 4. Progreso por mes (tareas completadas)
    const monthlyProgress = await pool.query(`
      SELECT 
        TO_CHAR(t.end_date_actual, 'YYYY-MM') as month,
        COUNT(t.task_id) as completed_tasks
      FROM tasks t
      JOIN status s ON t.status_id = s.status_id
      WHERE t.product_id = $1 
        AND s.status_name = 'Completed'
        AND t.end_date_actual IS NOT NULL
      GROUP BY TO_CHAR(t.end_date_actual, 'YYYY-MM')
      ORDER BY month
    `, [productId]);

    // 5. Distribución por organización responsable
    const organizationDistribution = await pool.query(`
      SELECT 
        o.organization_name as name,
        COUNT(t.task_id) as total_tasks,
        COUNT(CASE WHEN s.status_name = 'Completed' THEN 1 END) as completed_tasks,
        ROUND(
          (COUNT(CASE WHEN s.status_name = 'Completed' THEN 1 END)::decimal / 
           NULLIF(COUNT(t.task_id), 0)) * 100, 1
        ) as completion_rate
      FROM organizations o
      LEFT JOIN tasks t ON o.organization_id = t.responsable_id AND t.product_id = $1
      LEFT JOIN status s ON t.status_id = s.status_id
      WHERE o.organization_type = 'M'
      GROUP BY o.organization_id, o.organization_name
      HAVING COUNT(t.task_id) > 0
      ORDER BY COUNT(t.task_id) DESC
    `, [productId]);

    // 6. Análisis de plazos (tasks con fechas)
    const timelineAnalysis = await pool.query(`
      SELECT 
        COUNT(CASE WHEN t.end_date_actual <= t.end_date_planned THEN 1 END) as on_time,
        COUNT(CASE WHEN t.end_date_actual > t.end_date_planned THEN 1 END) as delayed,
        COUNT(CASE WHEN t.end_date_actual IS NULL AND t.end_date_planned < CURRENT_DATE THEN 1 END) as overdue,
        COUNT(CASE WHEN t.end_date_actual IS NULL AND t.end_date_planned >= CURRENT_DATE THEN 1 END) as pending,
        AVG(CASE 
          WHEN t.end_date_actual IS NOT NULL AND t.end_date_planned IS NOT NULL 
          THEN EXTRACT(days FROM t.end_date_actual - t.end_date_planned)
        END) as avg_delay_days
      FROM tasks t
      WHERE t.product_id = $1
    `, [productId]);

    return NextResponse.json({
      productSummary: productSummary.rows[0] || null,
      statusDistribution: statusDistribution.rows,
      phaseDistribution: phaseDistribution.rows,
      monthlyProgress: monthlyProgress.rows,
      organizationDistribution: organizationDistribution.rows,
      timelineAnalysis: timelineAnalysis.rows[0] || null
    });

  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}
