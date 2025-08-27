import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const indicatorCode = searchParams.get('indicator') || '1.2';
    
    console.log('🔍 Task analysis for indicator:', indicatorCode);
    
    // Obtener tareas detalladas para el indicador (simplificado)
    const taskQuery = `
      SELECT 
        t.task_id,
        t.task_name,
        t.start_date_planned,
        t.end_date_planned,
        t.start_date_actual,
        t.end_date_actual,
        p.product_id,
        p.product_name,
        s.status_name,
        c.country_name,
        i.indicator_code,
        -- Análisis temporal básico
        CASE 
          WHEN t.end_date_planned < CURRENT_DATE AND (s.status_name != 'Completed' OR s.status_name IS NULL) 
          THEN true 
          ELSE false 
        END as is_overdue,
        CASE 
          WHEN DATE(t.end_date_planned) = CURRENT_DATE 
          THEN true 
          ELSE false 
        END as due_today
      FROM tasks t
      INNER JOIN products p ON t.product_id = p.product_id
      INNER JOIN product_indicators pi ON p.product_id = pi.product_id
      INNER JOIN indicators i ON pi.indicator_id = i.indicator_id
      LEFT JOIN status s ON t.status_id = s.status_id
      LEFT JOIN countries c ON p.country_id = c.country_id
      WHERE i.indicator_code = $1
      ORDER BY p.product_name, t.start_date_planned
    `;
    
    const result = await pool.query(taskQuery, [indicatorCode]);
    
    // Analizar el estado de entregas por producto
    const productAnalysis = result.rows.reduce((acc, task) => {
      const productId = task.product_id;
      
      if (!acc[productId]) {
        acc[productId] = {
          product_id: productId,
          product_name: task.product_name,
          country_name: task.country_name,
          indicator_code: task.indicator_code,
          tasks: [],
          analysis: {
            total_tasks: 0,
            completed_tasks: 0,
            overdue_tasks: 0,
            due_today_tasks: 0,
            in_progress_tasks: 0,
            not_started_tasks: 0,
            completion_percentage: 0,
            max_days_overdue: 0,
            delivery_status: 'En Tiempo'
          }
        };
      }
      
      acc[productId].tasks.push(task);
      
      // Actualizar análisis
      const analysis = acc[productId].analysis;
      analysis.total_tasks++;
      
      if (task.status_name === 'Completed') {
        analysis.completed_tasks++;
      } else if (task.is_overdue) {
        analysis.overdue_tasks++;
        if (task.days_overdue > analysis.max_days_overdue) {
          analysis.max_days_overdue = task.days_overdue;
        }
      } else if (task.due_today) {
        analysis.due_today_tasks++;
      } else if (task.is_active_period) {
        analysis.in_progress_tasks++;
      } else {
        analysis.not_started_tasks++;
      }
      
      return acc;
    }, {});
    
    // Definir el tipo para las tareas y el análisis de producto
    interface Task {
      task_id: number;
      task_name: string;
      start_date_planned: string;
      end_date_planned: string;
      start_date_actual: string | null;
      end_date_actual: string | null;
      product_id: number;
      product_name: string;
      status_name: string | null;
      country_name: string;
      indicator_code: string;
      is_overdue: boolean;
      due_today: boolean;
      days_overdue?: number;
      is_active_period?: boolean;
    }

    interface ProductAnalysis {
      product_id: number;
      product_name: string;
      country_name: string;
      indicator_code: string;
      tasks: Task[];
      analysis: {
        total_tasks: number;
        completed_tasks: number;
        overdue_tasks: number;
        due_today_tasks: number;
        in_progress_tasks: number;
        not_started_tasks: number;
        completion_percentage: number;
        max_days_overdue: number;
        delivery_status: string;
      };
    }

    // Calcular estado de entrega para cada producto
    Object.values(productAnalysis).forEach((product) => {
      const analysis = (product as ProductAnalysis).analysis;
      
      analysis.completion_percentage = analysis.total_tasks > 0 
        ? (analysis.completed_tasks / analysis.total_tasks) * 100 
        : 0;
      
      // Lógica de estado de entrega mejorada
      if (analysis.overdue_tasks > 0) {
        if (analysis.max_days_overdue > 30) {
          analysis.delivery_status = 'Crítico';
        } else if (analysis.max_days_overdue > 7) {
          analysis.delivery_status = 'Muy Retrasado';
        } else {
          analysis.delivery_status = 'Retrasado';
        }
      } else if (analysis.due_today_tasks > 0) {
        analysis.delivery_status = 'Vence Hoy';
      } else if (analysis.completion_percentage >= 90) {
        analysis.delivery_status = 'Casi Completo';
      } else if (analysis.completion_percentage >= 50) {
        analysis.delivery_status = 'En Progreso';
      } else {
        analysis.delivery_status = 'En Tiempo';
      }
    });
    
    console.log('📊 Product delivery analysis:', Object.keys(productAnalysis).length, 'products');
    
    return NextResponse.json({
      indicator: indicatorCode,
      totalTasks: result.rows.length,
      products: Object.values(productAnalysis),
      rawTasks: result.rows
    });
    
  } catch (error) {
    console.error('Error in task analysis:', error);
    return NextResponse.json({ error: 'Failed to analyze tasks' }, { status: 500 });
  }
}
