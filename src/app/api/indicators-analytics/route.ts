import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

interface IndicatorMetric {
  indicator_id: number;
  indicator_code: string;
  indicator_name: string;
  output_number: string;
  products_using: number;
  countries_covered: number;
  total_tasks: number;
  completed_tasks: number;
  completion_percentage: number;
  avg_delay_days: number;
  working_groups_using: number;
}

interface CountryMetric {
  country_name: string;
  total_products: number;
  total_tasks: number;
  completed_tasks: number;
  country_completion_rate: number;
  overdue_products: number;
}

interface ProductMetric {
  product_id: number;
  product_name: string;
  country_id: number;
  country_name: string;
  indicator_code: string;
  indicator_name: string;
  total_tasks: number;
  completed_tasks: number;
  completion_percentage: number;
  delivery_status: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const outputFilter = searchParams.get('output');
    const indicatorFilter = searchParams.get('indicator');

    console.log('🔍 Analytics API called with filters:', { outputFilter, indicatorFilter });

    // PRIMER DEBUG: Verificar qué datos básicos existen
    if (indicatorFilter && indicatorFilter !== 'all') {
      console.log('🧪 Debug: Checking basic data for indicator', indicatorFilter);
      
      // Verificar que el indicador existe
      const indicatorCheck = await pool.query('SELECT * FROM indicators WHERE indicator_id = $1', [indicatorFilter]);
      console.log('📋 Indicator exists:', indicatorCheck.rows);
      
      // Verificar productos asociados al indicador
      const productCheck = await pool.query(`
        SELECT p.*, pi.indicator_id 
        FROM products p 
        INNER JOIN product_indicators pi ON p.product_id = pi.product_id 
        WHERE pi.indicator_id = $1
      `, [indicatorFilter]);
      console.log('📦 Products for indicator:', productCheck.rows);
      
      // Verificar tareas de esos productos
      const taskCheck = await pool.query(`
        SELECT t.*, p.product_name, s.status_name
        FROM tasks t 
        INNER JOIN products p ON t.product_id = p.product_id
        INNER JOIN product_indicators pi ON p.product_id = pi.product_id
        LEFT JOIN status s ON t.status_id = s.status_id
        WHERE pi.indicator_id = $1
      `, [indicatorFilter]);
      console.log('📋 Tasks for indicator:', taskCheck.rows);
    }

    let baseQuery = `
      WITH indicator_metrics AS (
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
          -- AVG delay calculation simplified for now
          0 as avg_delay_days,
          COUNT(DISTINCT wg.workinggroup_id) as working_groups_using
        FROM indicators i
        LEFT JOIN product_indicators pi ON i.indicator_id = pi.indicator_id
        LEFT JOIN products p ON pi.product_id = p.product_id
        LEFT JOIN tasks t ON p.product_id = t.product_id
        LEFT JOIN status s ON t.status_id = s.status_id
        LEFT JOIN workinggroup wg ON p.workinggroup_id = wg.workinggroup_id
    `;

    const queryParams: string[] = [];
    const whereConditions: string[] = [];

    // Aplicar filtros
    if (outputFilter && outputFilter !== 'all') {
      whereConditions.push(`i.output_number = $${queryParams.length + 1}`);
      queryParams.push(outputFilter);
    }

    if (indicatorFilter && indicatorFilter !== 'all') {
      whereConditions.push(`i.indicator_id = $${queryParams.length + 1}`);
      queryParams.push(indicatorFilter);
    }

    if (whereConditions.length > 0) {
      baseQuery += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    baseQuery += `
        GROUP BY i.indicator_id, i.indicator_code, i.indicator_name, i.output_number
      ),
      country_metrics AS (
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
            WHEN t.end_date_planned < NOW() AND s.status_name != 'Completed' 
            THEN p.product_id 
          END) as overdue_products
        FROM countries c
        LEFT JOIN products p ON c.country_id = p.country_id
        LEFT JOIN product_indicators pi ON p.product_id = pi.product_id
        LEFT JOIN indicators i ON pi.indicator_id = i.indicator_id
        LEFT JOIN tasks t ON p.product_id = t.product_id
        LEFT JOIN status s ON t.status_id = s.status_id
    `;

    if (whereConditions.length > 0) {
      baseQuery += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    baseQuery += `
        GROUP BY c.country_id, c.country_name
        HAVING COUNT(DISTINCT p.product_id) > 0
      ),
      product_metrics AS (
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
          CASE 
            WHEN COUNT(CASE WHEN t.end_date_planned < NOW() AND s.status_name != 'Completed' THEN 1 END) > 0 
            THEN 'Retrasado'
            WHEN COUNT(CASE WHEN t.end_date_planned::date = CURRENT_DATE AND s.status_name != 'Completed' THEN 1 END) > 0 
            THEN 'Vence Hoy'
            ELSE 'En Tiempo'
          END as delivery_status
        FROM products p
        LEFT JOIN countries c ON p.country_id = c.country_id
        LEFT JOIN product_indicators pi ON p.product_id = pi.product_id
        LEFT JOIN indicators i ON pi.indicator_id = i.indicator_id
        LEFT JOIN tasks t ON p.product_id = t.product_id
        LEFT JOIN status s ON t.status_id = s.status_id
    `;

    if (whereConditions.length > 0) {
      baseQuery += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    baseQuery += `
        GROUP BY p.product_id, p.product_name, p.country_id, c.country_name, i.indicator_code, i.indicator_name
        HAVING COUNT(t.task_id) > 0
      )
      SELECT 
        'indicator_metrics' as data_type,
        json_agg(im.*) as data
      FROM indicator_metrics im
      UNION ALL
      SELECT 
        'country_metrics' as data_type,
        json_agg(cm.*) as data
      FROM country_metrics cm
      UNION ALL
      SELECT 
        'product_metrics' as data_type,
        json_agg(pm.*) as data
      FROM product_metrics pm
    `;

    console.log('🔍 Final query:', baseQuery);
    console.log('🔍 Query params:', queryParams);

    const result = await pool.query(baseQuery, queryParams);
    console.log('📊 Raw query result:', result.rows);

    // Organizar los datos por tipo
    const responseData: {
      indicatorMetrics: IndicatorMetric[];
      countryMetrics: CountryMetric[];
      productMetrics: ProductMetric[];
    } = {
      indicatorMetrics: [],
      countryMetrics: [],
      productMetrics: []
    };

    result.rows.forEach(row => {
      switch (row.data_type) {
        case 'indicator_metrics':
          responseData.indicatorMetrics = row.data || [];
          break;
        case 'country_metrics':
          responseData.countryMetrics = row.data || [];
          break;
        case 'product_metrics':
          responseData.productMetrics = row.data || [];
          break;
      }
    });

    console.log(`Fetched filtered indicator analytics: 
      - Indicators: ${responseData.indicatorMetrics.length}
      - Countries: ${responseData.countryMetrics.length} 
      - Products: ${responseData.productMetrics.length}
      - Filters: output=${outputFilter}, indicator=${indicatorFilter}`);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching filtered indicator analytics:', error);
    
    // Return empty data instead of mock data to show real state
    return NextResponse.json({
      indicatorMetrics: [],
      countryMetrics: [],
      productMetrics: []
    });
  }
}
