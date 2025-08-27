import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    // Check product_indicators data
    const productIndicators = await pool.query(`
      SELECT pi.*, p.product_name, i.indicator_code, i.indicator_name 
      FROM product_indicators pi
      LEFT JOIN products p ON pi.product_id = p.product_id
      LEFT JOIN indicators i ON pi.indicator_id = i.indicator_id
      ORDER BY i.indicator_code, p.product_name
      LIMIT 20
    `);

    // Check products data
    const products = await pool.query('SELECT * FROM products LIMIT 10');

    // Check tasks data
    const tasks = await pool.query(`
      SELECT t.*, p.product_name, s.status_name 
      FROM tasks t 
      LEFT JOIN products p ON t.product_id = p.product_id 
      LEFT JOIN status s ON t.status_id = s.status_id 
      LIMIT 10
    `);

    return NextResponse.json({
      productIndicators: productIndicators.rows,
      products: products.rows,
      tasks: tasks.rows
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ error: 'Failed to debug data' }, { status: 500 });
  }
}
