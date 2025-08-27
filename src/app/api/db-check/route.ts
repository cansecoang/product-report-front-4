import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    console.log('🔍 Database structure check');
    
    // 1. Verificar tabla product_indicators
    const piQuery = 'SELECT * FROM product_indicators LIMIT 5';
    const piResult = await pool.query(piQuery);
    console.log('Product_indicators count:', piResult.rows.length);
    
    // 2. Verificar relación de indicador 1.2
    const relationQuery = `
      SELECT 
        pi.product_id,
        pi.indicator_id,
        p.product_name,
        i.indicator_code,
        i.indicator_name
      FROM product_indicators pi
      INNER JOIN products p ON pi.product_id = p.product_id
      INNER JOIN indicators i ON pi.indicator_id = i.indicator_id
      WHERE i.indicator_code = '1.2'
    `;
    const relationResult = await pool.query(relationQuery);
    console.log('Relations for indicator 1.2:', relationResult.rows.length);
    
    // 3. Verificar indicadores disponibles
    const indicatorQuery = 'SELECT indicator_code, indicator_name FROM indicators';
    const indicatorResult = await pool.query(indicatorQuery);
    
    // 4. Verificar productos con tareas
    const productTaskQuery = `
      SELECT 
        p.product_id,
        p.product_name,
        COUNT(t.task_id) as task_count
      FROM products p
      LEFT JOIN tasks t ON p.product_id = t.product_id
      GROUP BY p.product_id, p.product_name
      HAVING COUNT(t.task_id) > 0
      ORDER BY task_count DESC
    `;
    const productTaskResult = await pool.query(productTaskQuery);
    
    return NextResponse.json({
      product_indicators: {
        count: piResult.rows.length,
        sample: piResult.rows
      },
      indicator_12_relations: {
        count: relationResult.rows.length,
        data: relationResult.rows
      },
      available_indicators: {
        count: indicatorResult.rows.length,
        data: indicatorResult.rows
      },
      products_with_tasks: {
        count: productTaskResult.rows.length,
        data: productTaskResult.rows
      }
    });
    
  } catch (error) {
    console.error('Error checking database structure:', error);
    return NextResponse.json({ error: 'Failed to check database' }, { status: 500 });
  }
}
