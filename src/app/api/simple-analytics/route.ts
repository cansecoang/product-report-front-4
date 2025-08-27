import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const indicatorFilter = searchParams.get('indicator');

    console.log('🔍 Simple Analytics API called with indicator:', indicatorFilter);

    // Query super simple para indicator metrics
    const indicatorQuery = `
      SELECT
        i.indicator_id,
        i.indicator_code,
        i.indicator_name,
        i.output_number,
        COUNT(DISTINCT pi.product_id) as products_using,
        0 as countries_covered,
        0 as total_tasks,
        0 as completed_tasks,
        0 as completion_percentage,
        0 as avg_delay_days,
        0 as working_groups_using
      FROM indicators i
      INNER JOIN product_indicators pi ON i.indicator_id = pi.indicator_id
      WHERE i.indicator_code = $1
      GROUP BY i.indicator_id, i.indicator_code, i.indicator_name, i.output_number
    `;

    const indicatorResult = await pool.query(indicatorQuery, [indicatorFilter]);
    console.log('📊 Indicator result:', indicatorResult.rows);

    // Query super simple para product metrics
    const productQuery = `
      SELECT 
        p.product_id,
        p.product_name,
        p.country_id,
        c.country_name,
        i.indicator_code,
        i.indicator_name,
        COUNT(t.task_id) as total_tasks,
        COUNT(CASE WHEN s.status_name = 'Completed' THEN 1 END) as completed_tasks,
        COALESCE(
          (COUNT(CASE WHEN s.status_name = 'Completed' THEN 1 END) * 100.0 / 
           NULLIF(COUNT(t.task_id), 0)), 0
        ) as completion_percentage,
        'En Tiempo' as delivery_status
      FROM products p
      INNER JOIN product_indicators pi ON p.product_id = pi.product_id
      INNER JOIN indicators i ON pi.indicator_id = i.indicator_id
      LEFT JOIN countries c ON p.country_id = c.country_id
      LEFT JOIN tasks t ON p.product_id = t.product_id
      LEFT JOIN status s ON t.status_id = s.status_id
      WHERE i.indicator_code = $1
      GROUP BY p.product_id, p.product_name, p.country_id, c.country_name, i.indicator_code, i.indicator_name
    `;

    const productResult = await pool.query(productQuery, [indicatorFilter]);
    console.log('📦 Product result:', productResult.rows);

    return NextResponse.json({
      indicatorMetrics: indicatorResult.rows,
      countryMetrics: [],
      productMetrics: productResult.rows
    });

  } catch (error) {
    console.error('Error in simple analytics:', error);
    return NextResponse.json({
      indicatorMetrics: [],
      countryMetrics: [],
      productMetrics: []
    }, { status: 500 });
  }
}
