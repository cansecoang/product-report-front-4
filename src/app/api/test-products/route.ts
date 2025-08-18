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
    // Query para ver todos los productos y cuántas tareas tiene cada uno
    const query = `
      SELECT 
        p.product_id,
        p.product_name,
        p.workpackage_id,
        COUNT(t.task_id) as task_count
      FROM products p
      LEFT JOIN tasks t ON t.product_id = p.product_id
      GROUP BY p.product_id, p.product_name, p.workpackage_id
      ORDER BY p.product_id
    `;
    
    const result = await pool.query(query);
    
    return NextResponse.json({
      message: "Productos disponibles y sus tareas",
      products: result.rows,
      total: result.rows.length
    });
    
  } catch (error) {
    console.error('Error in test-products:', error);
    return NextResponse.json({ 
      error: 'Database error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
