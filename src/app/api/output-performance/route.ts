import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const outputFilter = searchParams.get('output');
    const workPackageFilter = searchParams.get('workPackage');

    console.log('🎯 Output Performance API called with filters:', { outputFilter, workPackageFilter });

    if (!outputFilter) {
      return NextResponse.json({ error: 'Output parameter is required' }, { status: 400 });
    }

    // 🎯 QUERY SIMPLIFICADA: Obtener indicadores con métricas básicas por output
    const baseQuery = `
      SELECT 
        i.indicator_id,
        i.indicator_code,
        i.indicator_name,
        COALESCE(i.indicator_description, '') as indicator_description,
        i.output_number,
        COUNT(DISTINCT pi.product_id) as assigned_products_count,
        COUNT(t.task_id) as total_tasks,
        COUNT(CASE WHEN s.status_name IN ('Completed', 'Reviewed') THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN t.end_date_planned < CURRENT_DATE AND s.status_name NOT IN ('Completed', 'Reviewed') THEN 1 END) as overdue_tasks,
        ROUND(
          (COUNT(CASE WHEN s.status_name IN ('Completed', 'Reviewed') THEN 1 END) * 100.0 / 
           NULLIF(COUNT(t.task_id), 0)), 1
        ) as completion_percentage
      FROM indicators i
      INNER JOIN product_indicators pi ON i.indicator_id = pi.indicator_id
      INNER JOIN products p ON pi.product_id = p.product_id
      LEFT JOIN tasks t ON p.product_id = t.product_id
      LEFT JOIN status s ON t.status_id = s.status_id
      WHERE i.output_number = $1
      ${workPackageFilter && workPackageFilter !== 'all' ? 'AND p.workpackage_id = $2' : ''}
      GROUP BY i.indicator_id, i.indicator_code, i.indicator_name, i.indicator_description, i.output_number
      HAVING COUNT(DISTINCT pi.product_id) > 0
      ORDER BY i.indicator_code
    `;

    const queryParams = [outputFilter];
    if (workPackageFilter && workPackageFilter !== 'all') {
      queryParams.push(workPackageFilter);
    }

    console.log('🔍 Executing main query with params:', queryParams);
    const result = await pool.query(baseQuery, queryParams);
    
    console.log('📊 Main query result:', result.rows);

    // 🎯 Para cada indicador, obtener productos asignados
    const indicators = await Promise.all(result.rows.map(async (row) => {
      // Obtener productos asignados a este indicador
      const productsQuery = `
        SELECT 
          p.product_id,
          p.product_name,
          COALESCE(c.country_name, 'Sin país') as country_name,
          COALESCE(wp.workpackage_name, 'Sin WP') as workpackage_name
        FROM product_indicators pi
        INNER JOIN products p ON pi.product_id = p.product_id
        LEFT JOIN countries c ON p.country_id = c.country_id
        LEFT JOIN workpackages wp ON p.workpackage_id = wp.workpackage_id
        WHERE pi.indicator_id = $1
        ${workPackageFilter && workPackageFilter !== 'all' ? 'AND p.workpackage_id = $2' : ''}
        ORDER BY p.product_name
      `;
      
      const productsParams = [row.indicator_id];
      if (workPackageFilter && workPackageFilter !== 'all') {
        productsParams.push(workPackageFilter);
      }
      
      const productsResult = await pool.query(productsQuery, productsParams);

      // Obtener distribución de estados para este indicador
      const statusQuery = `
        SELECT 
          s.status_name,
          COUNT(t.task_id) as count,
          ROUND(
            (COUNT(t.task_id) * 100.0 / 
             NULLIF(SUM(COUNT(t.task_id)) OVER (), 0)), 1
          ) as percentage
        FROM product_indicators pi
        INNER JOIN products p ON pi.product_id = p.product_id
        LEFT JOIN tasks t ON p.product_id = t.product_id
        LEFT JOIN status s ON t.status_id = s.status_id
        WHERE pi.indicator_id = $1
        ${workPackageFilter && workPackageFilter !== 'all' ? 'AND p.workpackage_id = $2' : ''}
        AND s.status_name IS NOT NULL
        GROUP BY s.status_name
        ORDER BY count DESC
      `;
      
      const statusResult = await pool.query(statusQuery, productsParams);

      return {
        indicator_id: row.indicator_id,
        indicator_code: row.indicator_code,
        indicator_name: row.indicator_name,
        indicator_description: row.indicator_description,
        assigned_products_count: parseInt(row.assigned_products_count) || 0,
        assigned_products: productsResult.rows,
        total_tasks: parseInt(row.total_tasks) || 0,
        completed_tasks: parseInt(row.completed_tasks) || 0,
        completion_percentage: parseFloat(row.completion_percentage) || 0,
        overdue_tasks: parseInt(row.overdue_tasks) || 0,
        status_distribution: statusResult.rows,
        trend: parseFloat(row.completion_percentage) >= 75 ? 'up' : 
               parseFloat(row.completion_percentage) >= 50 ? 'stable' : 'down',
        performance_rating: parseFloat(row.completion_percentage) >= 90 ? 'excellent' :
                           parseFloat(row.completion_percentage) >= 75 ? 'good' :
                           parseFloat(row.completion_percentage) >= 50 ? 'warning' : 'critical'
      };
    }));

    // 🎯 Calcular métricas resumen
    const summary = {
      total_indicators: indicators.length,
      avg_completion: indicators.length > 0 ? 
        indicators.reduce((acc, ind) => acc + ind.completion_percentage, 0) / indicators.length : 0,
      total_tasks: indicators.reduce((acc, ind) => acc + ind.total_tasks, 0),
      completed_tasks: indicators.reduce((acc, ind) => acc + ind.completed_tasks, 0),
      overdue_tasks: indicators.reduce((acc, ind) => acc + ind.overdue_tasks, 0),
    };

    const responseData = {
      output_number: outputFilter,
      indicators,
      summary,
      filters: {
        output: outputFilter,
        workPackage: workPackageFilter
      }
    };

    console.log('✅ Final response data:', responseData);
    
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('❌ Error in output performance API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}