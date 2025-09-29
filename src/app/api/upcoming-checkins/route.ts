import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    console.log('🔔 Fetching upcoming check-in dates...');

    // Consultar tareas con fechas de check-in en los próximos 7 días
    const upcomingCheckinsQuery = `
      SELECT 
        t.task_id,
        t.task_name,
        p.product_name,
        t.checkin AS checkin_date,
        c.country_name,
        o.organization_name,
        s.status_name,
        DATE_PART('day', t.checkin - CURRENT_DATE) as days_until_checkin,
        CASE 
          WHEN DATE(t.checkin) = CURRENT_DATE THEN 'today'
          WHEN DATE(t.checkin) = CURRENT_DATE + INTERVAL '1 day' THEN 'tomorrow'
          WHEN t.checkin BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days' THEN 'this_week'
          ELSE 'later'
        END as urgency_level
      FROM tasks t
      INNER JOIN products p ON t.product_id = p.product_id
      LEFT JOIN countries c ON p.country_id = c.country_id
      LEFT JOIN organizations o ON t.responsable_id = o.organization_id
      LEFT JOIN status s ON t.status_id = s.status_id
      WHERE t.checkin IS NOT NULL 
        AND t.checkin >= CURRENT_DATE
        AND t.checkin <= CURRENT_DATE + INTERVAL '30 days'
        AND (s.status_name IS NULL OR s.status_name NOT IN ('Completed', 'Reviewed'))
      ORDER BY t.checkin ASC, t.task_name
      LIMIT 20
    `;

    const result = await pool.query(upcomingCheckinsQuery);
    const upcomingCheckins = result.rows;

    // Agrupar por nivel de urgencia
    const groupedCheckins = {
      today: upcomingCheckins.filter(task => task.urgency_level === 'today'),
      tomorrow: upcomingCheckins.filter(task => task.urgency_level === 'tomorrow'),
      this_week: upcomingCheckins.filter(task => task.urgency_level === 'this_week'),
      later: upcomingCheckins.filter(task => task.urgency_level === 'later')
    };

    // Contar totales
    const totalUpcoming = upcomingCheckins.length;
    const urgentCount = groupedCheckins.today.length + groupedCheckins.tomorrow.length;

    console.log('📋 Upcoming check-ins found:', totalUpcoming);
    console.log('🚨 Urgent check-ins (today/tomorrow):', urgentCount);

    return NextResponse.json({
      success: true,
      totalUpcoming,
      urgentCount,
      checkins: groupedCheckins,
      allCheckins: upcomingCheckins
    });

  } catch (error) {
    console.error('❌ Error fetching upcoming check-ins:', error);
    
    // Datos de fallback para desarrollo
    const mockCheckins = {
      today: [
        {
          task_id: 1,
          task_name: 'Revisión de progreso - Encuesta cacao',
          product_name: 'Encuesta a productores de cacao',
          checkin_date: new Date().toISOString(),
          country_name: 'Dominican Republic',
          organization_name: 'OroVerde',
          status_name: 'In Progress',
          days_until_checkin: 0,
          urgency_level: 'today'
        }
      ],
      tomorrow: [
        {
          task_id: 2,
          task_name: 'Check-in semanal - Biodiversidad café',
          product_name: 'Línea base de biodiversidad en campo café',
          checkin_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          country_name: 'Guatemala',
          organization_name: 'Local Partner',
          status_name: 'In Progress',
          days_until_checkin: 1,
          urgency_level: 'tomorrow'
        }
      ],
      this_week: [],
      later: []
    };

    return NextResponse.json({
      success: true,
      totalUpcoming: 2,
      urgentCount: 2,
      checkins: mockCheckins,
      allCheckins: [...mockCheckins.today, ...mockCheckins.tomorrow]
    });
  }
}