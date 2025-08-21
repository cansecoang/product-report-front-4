import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    console.log('📊 Fetching performance dashboard data...');

    // Query para Dashboard principal de rendimiento por Work Package
    const query = `
      SELECT 
        w.workpackage_name,
        COUNT(DISTINCT p.product_id) as total_products,
        COUNT(t.task_id) as total_tasks,
        COUNT(CASE WHEN s.status_name IN ('completed', 'done', 'finished', 'completada') THEN 1 END) as completed_tasks,
        ROUND(
          (COUNT(CASE WHEN s.status_name IN ('completed', 'done', 'finished', 'completada') THEN 1 END) * 100.0 / 
           NULLIF(COUNT(t.task_id), 0)), 2
        ) as completion_percentage,
        COUNT(DISTINCT o.organization_id) as organizations_involved,
        COUNT(DISTINCT ph.phase_id) as phases_used
      FROM workpackages w
      LEFT JOIN products p ON w.workpackage_id = p.workpackage_id
      LEFT JOIN tasks t ON p.product_id = t.product_id
      LEFT JOIN status s ON t.status_id = s.status_id
      LEFT JOIN organizations o ON t.responsable_id = o.organization_id
      LEFT JOIN phases ph ON t.phase_id = ph.phase_id
      GROUP BY w.workpackage_id, w.workpackage_name
      ORDER BY completion_percentage DESC NULLS LAST;
    `;

    const result = await pool.query(query);
    
    console.log(`✅ Performance data fetched: ${result.rows.length} work packages`);

    // Transformar datos para asegurar tipos correctos
    const performanceData = result.rows.map(row => ({
      workpackage_name: row.workpackage_name,
      total_products: parseInt(row.total_products) || 0,
      total_tasks: parseInt(row.total_tasks) || 0,
      completed_tasks: parseInt(row.completed_tasks) || 0,
      completion_percentage: parseFloat(row.completion_percentage) || 0,
      organizations_involved: parseInt(row.organizations_involved) || 0,
      phases_used: parseInt(row.phases_used) || 0
    }));

    return NextResponse.json({ 
      success: true,
      data: performanceData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error fetching performance dashboard:', error);
    
    // Fallback data para desarrollo
    const mockData = [
      {
        workpackage_name: 'WP-001: Gestión de Fincas',
        total_products: 3,
        total_tasks: 15,
        completed_tasks: 10,
        completion_percentage: 66.67,
        organizations_involved: 5,
        phases_used: 4
      },
      {
        workpackage_name: 'WP-002: Control de Cultivos',
        total_products: 3,
        total_tasks: 12,
        completed_tasks: 8,
        completion_percentage: 66.67,
        organizations_involved: 4,
        phases_used: 3
      },
      {
        workpackage_name: 'WP-003: Análisis de Suelo',
        total_products: 3,
        total_tasks: 18,
        completed_tasks: 14,
        completion_percentage: 77.78,
        organizations_involved: 6,
        phases_used: 5
      }
    ];

    return NextResponse.json({ 
      success: false,
      data: mockData,
      error: 'Using mock data due to database error',
      timestamp: new Date().toISOString()
    });
  }
}
