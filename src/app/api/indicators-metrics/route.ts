import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const indicatorId = searchParams.get('indicatorId');

    // 1. Progreso por Indicador - Vista General
    const indicatorProgressQuery = `
      SELECT 
        i.indicator_id,
        i.indicator_code,
        i.indicator_name,
        i.indicator_description,
        i.output_number,
        COUNT(DISTINCT pi.product_id) as products_using,
        COUNT(DISTINCT p.country_id) as countries_covered,
        COUNT(DISTINCT p.workinggroup_id) as working_groups_using,
        ROUND(
          (COUNT(DISTINCT pi.product_id) * 100.0) / 
          NULLIF((SELECT COUNT(*) FROM products), 0), 2
        ) as adoption_percentage,
        AVG(
          CASE 
            WHEN p.delivery_date IS NOT NULL AND p.delivery_date > CURRENT_DATE 
            THEN EXTRACT(EPOCH FROM (p.delivery_date - CURRENT_DATE)) / 86400
            ELSE 0 
          END
        ) as avg_days_to_delivery
      FROM indicators i
      LEFT JOIN product_indicators pi ON i.indicator_id = pi.indicator_id
      LEFT JOIN products p ON pi.product_id = p.product_id
      ${indicatorId ? 'WHERE i.indicator_id = $1' : ''}
      GROUP BY i.indicator_id, i.indicator_code, i.indicator_name, i.indicator_description, i.output_number
      ORDER BY adoption_percentage DESC, i.indicator_name
    `;

    // 2. Progreso de Tareas por Indicador
    const taskProgressByIndicatorQuery = `
      SELECT 
        i.indicator_name,
        i.indicator_code,
        p.product_name,
        p.country_id,
        c.country_name,
        COUNT(t.id) as total_tasks,
        COUNT(CASE WHEN s.name IN ('completed', 'done', 'finished', 'completada') THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN s.name IN ('in_progress', 'en_progreso', 'working') THEN 1 END) as in_progress_tasks,
        COUNT(CASE WHEN s.name IN ('pending', 'pendiente', 'not_started') THEN 1 END) as pending_tasks,
        ROUND(
          (COUNT(CASE WHEN s.name IN ('completed', 'done', 'finished', 'completada') THEN 1 END) * 100.0) / 
          NULLIF(COUNT(t.id), 0), 2
        ) as completion_percentage,
        p.delivery_date,
        CASE 
          WHEN p.delivery_date > CURRENT_DATE THEN 'En Tiempo'
          WHEN p.delivery_date = CURRENT_DATE THEN 'Vence Hoy'
          ELSE 'Retrasado'
        END as delivery_status
      FROM indicators i
      LEFT JOIN product_indicators pi ON i.indicator_id = pi.indicator_id
      LEFT JOIN products p ON pi.product_id = p.product_id
      LEFT JOIN countries c ON p.country_id = c.country_id
      LEFT JOIN tasks t ON p.product_id = t.product_id
      LEFT JOIN status s ON t.status_id = s.id
      ${indicatorId ? 'WHERE i.indicator_id = $1' : ''}
      GROUP BY i.indicator_id, i.indicator_name, i.indicator_code, p.product_id, p.product_name, 
               p.country_id, c.country_name, p.delivery_date
      ORDER BY i.indicator_name, completion_percentage DESC
    `;

    // 3. Timeline de Indicadores (por fecha de entrega)
    const indicatorTimelineQuery = `
      SELECT 
        i.indicator_name,
        i.output_number,
        p.product_name,
        p.delivery_date,
        COUNT(t.id) as total_tasks,
        ROUND(
          (COUNT(CASE WHEN s.name IN ('completed', 'done', 'finished', 'completada') THEN 1 END) * 100.0) / 
          NULLIF(COUNT(t.id), 0), 2
        ) as progress_percentage,
        EXTRACT(MONTH FROM p.delivery_date) as delivery_month,
        EXTRACT(YEAR FROM p.delivery_date) as delivery_year
      FROM indicators i
      LEFT JOIN product_indicators pi ON i.indicator_id = pi.indicator_id
      LEFT JOIN products p ON pi.product_id = p.product_id
      LEFT JOIN tasks t ON p.product_id = t.product_id
      LEFT JOIN status s ON t.status_id = s.id
      WHERE p.delivery_date IS NOT NULL
      ${indicatorId ? 'AND i.indicator_id = $2' : ''}
      GROUP BY i.indicator_id, i.indicator_name, i.output_number, p.product_id, p.product_name, p.delivery_date
      ORDER BY p.delivery_date, i.indicator_name
    `;

    // 4. Comparación de Indicadores por Output
    const outputComparisonQuery = `
      SELECT 
        i.output_number,
        COUNT(DISTINCT i.indicator_id) as indicators_count,
        COUNT(DISTINCT pi.product_id) as products_count,
        AVG(
          ROUND(
            (COUNT(CASE WHEN s.name IN ('completed', 'done', 'finished', 'completada') THEN 1 END) * 100.0) / 
            NULLIF(COUNT(t.id), 0), 2
          )
        ) as avg_completion_rate,
        COUNT(t.id) as total_tasks_all_products
      FROM indicators i
      LEFT JOIN product_indicators pi ON i.indicator_id = pi.indicator_id
      LEFT JOIN products p ON pi.product_id = p.product_id
      LEFT JOIN tasks t ON p.product_id = t.product_id
      LEFT JOIN status s ON t.status_id = s.id
      GROUP BY i.output_number
      ORDER BY avg_completion_rate DESC
    `;

    // 5. Distribución Geográfica del Progreso
    const geographicDistributionQuery = `
      SELECT 
        c.country_name,
        COUNT(DISTINCT i.indicator_id) as indicators_used,
        COUNT(DISTINCT p.product_id) as products_count,
        COUNT(t.id) as total_tasks,
        ROUND(
          (COUNT(CASE WHEN s.name IN ('completed', 'done', 'finished', 'completada') THEN 1 END) * 100.0) / 
          NULLIF(COUNT(t.id), 0), 2
        ) as country_completion_rate,
        COUNT(CASE WHEN p.delivery_date < CURRENT_DATE THEN 1 END) as overdue_products
      FROM countries c
      LEFT JOIN products p ON c.country_id = p.country_id
      LEFT JOIN product_indicators pi ON p.product_id = pi.product_id
      LEFT JOIN indicators i ON pi.indicator_id = i.indicator_id
      LEFT JOIN tasks t ON p.product_id = t.product_id
      LEFT JOIN status s ON t.status_id = s.id
      GROUP BY c.country_id, c.country_name
      HAVING COUNT(DISTINCT p.product_id) > 0
      ORDER BY country_completion_rate DESC
    `;

    const queryParams = indicatorId ? [indicatorId] : [];

    // Ejecutar consultas en paralelo
    const [
      progressResult,
      taskProgressResult,
      timelineResult,
      outputComparisonResult,
      geographicResult
    ] = await Promise.all([
      pool.query(indicatorProgressQuery, queryParams),
      pool.query(taskProgressByIndicatorQuery, queryParams),
      pool.query(indicatorTimelineQuery, indicatorId ? [indicatorId] : []),
      pool.query(outputComparisonQuery),
      pool.query(geographicDistributionQuery)
    ]);

    return NextResponse.json({
      indicatorProgress: progressResult.rows || [],
      taskProgress: taskProgressResult.rows || [],
      timeline: timelineResult.rows || [],
      outputComparison: outputComparisonResult.rows || [],
      geographicDistribution: geographicResult.rows || []
    });

  } catch (error) {
    console.error('Error fetching indicator progress metrics:', error);
    
    // Datos de respaldo realistas para desarrollo
    return NextResponse.json({
      indicatorProgress: [
        {
          indicator_id: 1,
          indicator_code: 'IND-001',
          indicator_name: 'Forest Coverage Increase',
          indicator_description: 'Percentage increase in forest coverage',
          output_number: 'OUT-1.1',
          products_using: 4,
          countries_covered: 3,
          working_groups_using: 2,
          adoption_percentage: 66.67,
          avg_days_to_delivery: 45
        },
        {
          indicator_id: 2,
          indicator_code: 'IND-002',
          indicator_name: 'Biodiversity Index',
          indicator_description: 'Species diversity measurement',
          output_number: 'OUT-1.2',
          products_using: 3,
          countries_covered: 2,
          working_groups_using: 2,
          adoption_percentage: 50.0,
          avg_days_to_delivery: 62
        },
        {
          indicator_id: 3,
          indicator_code: 'IND-003',
          indicator_name: 'Organic Certification',
          indicator_description: 'Farms with organic certification',
          output_number: 'OUT-2.1',
          products_using: 3,
          countries_covered: 2,
          working_groups_using: 1,
          adoption_percentage: 50.0,
          avg_days_to_delivery: 30
        }
      ],
      taskProgress: [
        {
          indicator_name: 'Forest Coverage Increase',
          indicator_code: 'IND-001',
          product_name: 'Forest Restoration Program',
          country_id: 1,
          country_name: 'Colombia',
          total_tasks: 25,
          completed_tasks: 18,
          in_progress_tasks: 5,
          pending_tasks: 2,
          completion_percentage: 72.0,
          delivery_date: '2025-12-31',
          delivery_status: 'En Tiempo'
        },
        {
          indicator_name: 'Biodiversity Index',
          indicator_code: 'IND-002',
          product_name: 'Biodiversity Monitoring System',
          country_id: 2,
          country_name: 'Ecuador',
          total_tasks: 20,
          completed_tasks: 12,
          in_progress_tasks: 6,
          pending_tasks: 2,
          completion_percentage: 60.0,
          delivery_date: '2025-09-15',
          delivery_status: 'En Tiempo'
        },
        {
          indicator_name: 'Organic Certification',
          indicator_code: 'IND-003',
          product_name: 'Organic Farm Certification',
          country_id: 1,
          country_name: 'Colombia',
          total_tasks: 30,
          completed_tasks: 22,
          in_progress_tasks: 6,
          pending_tasks: 2,
          completion_percentage: 73.33,
          delivery_date: '2025-06-30',
          delivery_status: 'En Tiempo'
        }
      ],
      timeline: [
        {
          indicator_name: 'Organic Certification',
          output_number: 'OUT-2.1',
          product_name: 'Organic Farm Certification',
          delivery_date: '2025-06-30',
          total_tasks: 30,
          progress_percentage: 73.33,
          delivery_month: 6,
          delivery_year: 2025
        },
        {
          indicator_name: 'Soil Health Assessment',
          output_number: 'OUT-2.2',
          product_name: 'Soil Health Assessment',
          delivery_date: '2025-07-15',
          total_tasks: 15,
          progress_percentage: 40.0,
          delivery_month: 7,
          delivery_year: 2025
        },
        {
          indicator_name: 'Community Education Program',
          output_number: 'OUT-3.1',
          product_name: 'Community Education Program',
          delivery_date: '2025-08-31',
          total_tasks: 22,
          progress_percentage: 68.18,
          delivery_month: 8,
          delivery_year: 2025
        }
      ],
      outputComparison: [
        {
          output_number: 'OUT-2.1',
          indicators_count: 2,
          products_count: 2,
          avg_completion_rate: 73.33,
          total_tasks_all_products: 45
        },
        {
          output_number: 'OUT-1.1',
          indicators_count: 1,
          products_count: 1,
          avg_completion_rate: 72.0,
          total_tasks_all_products: 25
        },
        {
          output_number: 'OUT-3.1',
          indicators_count: 1,
          products_count: 1,
          avg_completion_rate: 68.18,
          total_tasks_all_products: 22
        }
      ],
      geographicDistribution: [
        {
          country_name: 'Colombia',
          indicators_used: 3,
          products_count: 3,
          total_tasks: 70,
          country_completion_rate: 71.43,
          overdue_products: 0
        },
        {
          country_name: 'Ecuador',
          indicators_used: 2,
          products_count: 2,
          total_tasks: 35,
          country_completion_rate: 60.0,
          overdue_products: 0
        },
        {
          country_name: 'Perú',
          indicators_used: 1,
          products_count: 1,
          total_tasks: 18,
          country_completion_rate: 55.56,
          overdue_products: 1
        }
      ]
    });
  }
}
