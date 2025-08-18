import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'BioFincas',
  password: '2261',
  port: 5434,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Query simple para verificar las tareas de un producto específico
    const query = `
      SELECT
        t.task_id,
        t.task_name,
        t.product_id,
        p.product_name
      FROM tasks t
      LEFT JOIN products p ON p.product_id = t.product_id
      WHERE t.product_id = $1
      ORDER BY t.task_id
      LIMIT 20
    `;
    
    // También contar cuántas tareas tiene este producto
    const countQuery = `
      SELECT COUNT(*) as total
      FROM tasks t
      WHERE t.product_id = $1
    `;
    
    const [tasksResult, countResult] = await Promise.all([
      pool.query(query, [productId]),
      pool.query(countQuery, [productId])
    ]);
    
    return NextResponse.json({
      productId: productId,
      totalTasks: parseInt(countResult.rows[0].total),
      tasks: tasksResult.rows,
      message: `Found ${tasksResult.rows.length} tasks for product ID ${productId}`
    });
    
  } catch (error) {
    console.error('Error in test-tasks:', error);
    return NextResponse.json({ 
      error: 'Database error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
