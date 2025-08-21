import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('Metrics endpoint called');
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    
    console.log('Product ID received:', productId);
    
    if (!productId) {
      console.log('No product ID provided');
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Test simple query first
    console.log('Testing simple query');
    const simpleTest = await pool.query('SELECT NOW() as current_time');
    console.log('Simple query result:', simpleTest.rows[0]);

    // 1. Resumen general del producto (simplificado)
    console.log('Executing product summary query');
    const productSummary = await pool.query(`
      SELECT 
        p.product_name,
        COUNT(t.task_id) as total_tasks,
        COUNT(CASE WHEN s.status_name = 'Completed' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN s.status_name = 'In Progress' THEN 1 END) as in_progress_tasks,
        COUNT(CASE WHEN s.status_name = 'Pending' THEN 1 END) as pending_tasks,
        COALESCE(ROUND(
          (COUNT(CASE WHEN s.status_name = 'Completed' THEN 1 END)::decimal / 
           NULLIF(COUNT(t.task_id), 0)) * 100, 2
        ), 0) as completion_percentage
      FROM products p
      LEFT JOIN tasks t ON p.product_id = t.product_id
      LEFT JOIN status s ON t.status_id = s.status_id
      WHERE p.product_id = $1
      GROUP BY p.product_id, p.product_name
    `, [productId]);

    console.log('Product summary result:', productSummary.rows[0]);

    // 2. Distribución por estado (simplificado)
    const statusDistribution = await pool.query(`
      SELECT 
        s.status_name as name,
        COUNT(t.task_id) as value,
        ROUND((COUNT(t.task_id)::decimal / 
               NULLIF((SELECT COUNT(*) FROM tasks WHERE product_id = $1), 0)) * 100, 1) as percentage
      FROM status s
      LEFT JOIN tasks t ON s.status_id = t.status_id AND t.product_id = $1
      GROUP BY s.status_id, s.status_name
      HAVING COUNT(t.task_id) > 0
      ORDER BY COUNT(t.task_id) DESC
    `, [productId]);

    console.log('Status distribution result:', statusDistribution.rows);

    return NextResponse.json({
      productSummary: productSummary.rows[0] || null,
      statusDistribution: statusDistribution.rows || [],
      phaseDistribution: [],
      monthlyProgress: [],
      organizationDistribution: [],
      timelineAnalysis: null
    });

  } catch (error) {
    console.error('Error in metrics endpoint:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch metrics', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
