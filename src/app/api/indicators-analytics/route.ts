import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const outputFilter = searchParams.get('output');
    const indicatorFilter = searchParams.get('indicator');

    console.log('🔍 Analytics API called with filters:', { outputFilter, indicatorFilter });

    // PRIMER DEBUG: Verificar qué datos básicos existen
    if (indicatorFilter && indicatorFilter !== 'all') {
      console.log('🧪 Debug: Checking basic data for indicator', indicatorFilter);
      
      // Verificar que el indicador existe (buscar por código, no por ID)
      const indicatorCheck = await pool.query('SELECT * FROM indicators WHERE indicator_code = $1', [indicatorFilter]);
      console.log('📋 Indicator exists:', indicatorCheck.rows);
      
      // Verificar productos asociados al indicador
      const productCheck = await pool.query(`
        SELECT p.*, pi.indicator_id, i.indicator_code 
        FROM products p 
        INNER JOIN product_indicators pi ON p.product_id = pi.product_id 
        INNER JOIN indicators i ON pi.indicator_id = i.indicator_id
        WHERE i.indicator_code = $1
      `, [indicatorFilter]);
      console.log('📦 Products for indicator:', productCheck.rows);
      
      // Verificar tareas de esos productos
      const taskCheck = await pool.query(`
        SELECT t.*, p.product_name, s.status_name
        FROM tasks t 
        INNER JOIN products p ON t.product_id = p.product_id
        INNER JOIN product_indicators pi ON p.product_id = pi.product_id
        INNER JOIN indicators i ON pi.indicator_id = i.indicator_id
        LEFT JOIN status s ON t.status_id = s.status_id
        WHERE i.indicator_code = $1
      `, [indicatorFilter]);
      console.log('📋 Tasks for indicator:', taskCheck.rows);
    }

    const baseQuery = `-- Query structure for debugging reference only`;

    const queryParams: string[] = [];
    const whereConditions: string[] = [];

    // Aplicar filtros
    if (outputFilter && outputFilter !== 'all') {
      whereConditions.push(`i.output_number = $${queryParams.length + 1}`);
      queryParams.push(outputFilter);
    }

    if (indicatorFilter && indicatorFilter !== 'all') {
      whereConditions.push(`i.indicator_code = $${queryParams.length + 1}`);
      queryParams.push(indicatorFilter);
    }

    console.log('🔍 Final query:', baseQuery);
    console.log('🔍 Query params:', queryParams);

    // SIMPLIFIED APPROACH: Query each CTE separately
    let indicatorMetrics = [];
    let countryMetrics = [];
    let productMetrics = [];
    let taskStatusMetrics = [];

    try {
      // 1. Query indicator metrics
      const indicatorQuery = `
        SELECT
          i.indicator_id,
          i.indicator_code,
          i.indicator_name,
          i.output_number,
          COUNT(DISTINCT pi.product_id) as products_using,
          COUNT(DISTINCT p.country_id) as countries_covered,
          COUNT(DISTINCT t.task_id) as total_tasks,
          COUNT(DISTINCT CASE WHEN s.status_name = 'Completed' THEN t.task_id END) as completed_tasks,
          COALESCE(
            (COUNT(DISTINCT CASE WHEN s.status_name = 'Completed' THEN t.task_id END) * 100.0 / 
             NULLIF(COUNT(DISTINCT t.task_id), 0)), 0
          ) as completion_percentage,
          0 as avg_delay_days,
          COUNT(DISTINCT wg.workinggroup_id) as working_groups_using
        FROM indicators i
        INNER JOIN product_indicators pi ON i.indicator_id = pi.indicator_id
        INNER JOIN products p ON pi.product_id = p.product_id
        LEFT JOIN tasks t ON p.product_id = t.product_id
        LEFT JOIN status s ON t.status_id = s.status_id
        LEFT JOIN workinggroup wg ON p.workinggroup_id = wg.workinggroup_id
        WHERE ${whereConditions.length > 0 ? whereConditions.join(' AND ') : '1=1'}
        GROUP BY i.indicator_id, i.indicator_code, i.indicator_name, i.output_number
      `;
      
      const indicatorResult = await pool.query(indicatorQuery, queryParams);
      indicatorMetrics = indicatorResult.rows;
      console.log('� Indicator metrics:', indicatorMetrics);

      // 2. Query product metrics with delivery status
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
          
          -- Tareas vencidas (simplificado)
          COUNT(CASE 
            WHEN t.end_date_planned < CURRENT_DATE 
              AND (s.status_name IS NULL OR s.status_name != 'Completed') 
            THEN 1 
          END) as overdue_tasks,
          
          -- Adherencia al cronograma: porcentaje de tareas NO vencidas
          COALESCE(
            (COUNT(CASE 
              WHEN t.end_date_planned >= CURRENT_DATE 
                OR s.status_name = 'Completed'
              THEN 1 
            END) * 100.0 / NULLIF(COUNT(t.task_id), 0)), 0
          ) as schedule_adherence_percentage,
          CASE 
            WHEN COUNT(CASE 
              WHEN t.end_date_planned < CURRENT_DATE 
                AND (s.status_name IS NULL OR s.status_name != 'Completed') 
              THEN 1 
            END) > 0 
            THEN 'Retrasado'
            WHEN COUNT(CASE 
              WHEN DATE(t.end_date_planned) = CURRENT_DATE 
                AND (s.status_name IS NULL OR s.status_name != 'Completed') 
              THEN 1 
            END) > 0 
            THEN 'Vence Hoy'
            ELSE 'En Tiempo'
          END as delivery_status
        FROM products p
        INNER JOIN product_indicators pi ON p.product_id = pi.product_id
        INNER JOIN indicators i ON pi.indicator_id = i.indicator_id
        LEFT JOIN countries c ON p.country_id = c.country_id
        LEFT JOIN tasks t ON p.product_id = t.product_id
        LEFT JOIN status s ON t.status_id = s.status_id
        WHERE ${whereConditions.length > 0 ? whereConditions.join(' AND ') : '1=1'}
        GROUP BY p.product_id, p.product_name, p.country_id, c.country_name, i.indicator_code, i.indicator_name
        HAVING COUNT(t.task_id) > 0
      `;
      
      const productResult = await pool.query(productQuery, queryParams);
      productMetrics = productResult.rows;
      console.log('� Product metrics:', productMetrics);

      // 3. Query country metrics
      const countryQuery = `
        SELECT 
          c.country_name,
          COUNT(DISTINCT p.product_id) as total_products,
          COUNT(DISTINCT t.task_id) as total_tasks,
          COUNT(DISTINCT CASE WHEN s.status_name = 'Completed' THEN t.task_id END) as completed_tasks,
          COALESCE(
            (COUNT(DISTINCT CASE WHEN s.status_name = 'Completed' THEN t.task_id END) * 100.0 / 
             NULLIF(COUNT(DISTINCT t.task_id), 0)), 0
          ) as country_completion_rate,
          COUNT(DISTINCT CASE 
            WHEN t.end_date_planned < CURRENT_DATE AND s.status_name != 'Completed' 
            THEN p.product_id 
          END) as overdue_products
        FROM countries c
        INNER JOIN products p ON c.country_id = p.country_id
        INNER JOIN product_indicators pi ON p.product_id = pi.product_id
        INNER JOIN indicators i ON pi.indicator_id = i.indicator_id
        LEFT JOIN tasks t ON p.product_id = t.product_id
        LEFT JOIN status s ON t.status_id = s.status_id
        WHERE ${whereConditions.length > 0 ? whereConditions.join(' AND ') : '1=1'}
        GROUP BY c.country_id, c.country_name
        HAVING COUNT(DISTINCT p.product_id) > 0
      `;
      
      const countryResult = await pool.query(countryQuery, queryParams);
      countryMetrics = countryResult.rows;
      console.log('🌍 Country metrics:', countryMetrics);

      // 4. Query task status distribution
      const taskStatusQuery = `
        SELECT 
          COALESCE(s.status_name, 'Sin Estado') as status_name,
          COUNT(t.task_id) as task_count
        FROM tasks t
        INNER JOIN products p ON t.product_id = p.product_id
        INNER JOIN product_indicators pi ON p.product_id = pi.product_id
        INNER JOIN indicators i ON pi.indicator_id = i.indicator_id
        LEFT JOIN status s ON t.status_id = s.status_id
        WHERE ${whereConditions.length > 0 ? whereConditions.join(' AND ') : '1=1'}
        GROUP BY s.status_name
        ORDER BY task_count DESC
      `;
      
      const taskStatusResult = await pool.query(taskStatusQuery, queryParams);
      taskStatusMetrics = taskStatusResult.rows;
      console.log('📋 Task status metrics:', taskStatusMetrics);

    } catch (queryError) {
      console.error('Error in individual queries:', queryError);
    }

    // 🔧 FIX: Convert string numbers to actual numbers
    const convertedIndicatorMetrics = indicatorMetrics.map(metric => ({
      ...metric,
      products_using: parseInt(metric.products_using) || 0,
      countries_covered: parseInt(metric.countries_covered) || 0,
      total_tasks: parseInt(metric.total_tasks) || 0,
      completed_tasks: parseInt(metric.completed_tasks) || 0,
      completion_percentage: parseFloat(metric.completion_percentage) || 0,
      working_groups_using: parseInt(metric.working_groups_using) || 0
    }));

    const convertedCountryMetrics = countryMetrics.map(metric => ({
      ...metric,
      total_products: parseInt(metric.total_products) || 0,
      total_tasks: parseInt(metric.total_tasks) || 0,
      completed_tasks: parseInt(metric.completed_tasks) || 0,
      country_completion_rate: parseFloat(metric.country_completion_rate) || 0,
      overdue_products: parseInt(metric.overdue_products) || 0
    }));

    const convertedProductMetrics = productMetrics.map(metric => ({
      ...metric,
      total_tasks: parseInt(metric.total_tasks) || 0,
      completed_tasks: parseInt(metric.completed_tasks) || 0,
      completion_percentage: parseFloat(metric.completion_percentage) || 0,
      overdue_tasks: parseInt(metric.overdue_tasks) || 0,
      schedule_adherence_percentage: parseFloat(metric.schedule_adherence_percentage) || 0
    }));

    const convertedTaskStatusMetrics = taskStatusMetrics.map(metric => ({
      ...metric,
      task_count: parseInt(metric.task_count) || 0
    }));

    // Return the organized data with converted numbers
    const responseData = {
      indicatorMetrics: convertedIndicatorMetrics,
      countryMetrics: convertedCountryMetrics,
      productMetrics: convertedProductMetrics,
      taskStatusMetrics: convertedTaskStatusMetrics
    };

    console.log(`Fetched filtered indicator analytics: 
      - Indicators: ${responseData.indicatorMetrics.length}
      - Countries: ${responseData.countryMetrics.length} 
      - Products: ${responseData.productMetrics.length}
      - Task Status: ${responseData.taskStatusMetrics.length}
      - Filters: output=${outputFilter}, indicator=${indicatorFilter}`);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching filtered indicator analytics:', error);
    
    // Return empty data instead of mock data to show real state
    return NextResponse.json({
      indicatorMetrics: [],
      countryMetrics: [],
      productMetrics: [],
      taskStatusMetrics: []
    });
  }
}
