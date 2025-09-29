import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    console.log('🔔 Fetching upcoming check-in dates...');

    // Consultar tareas con fechas de check-in en los próximos 30 días usando las columnas correctas
    const upcomingCheckinsQuery = `
      SELECT 
        t.task_id,
        t.task_name,
        p.product_id,
        p.product_name,
        t.checkin_oro_verde AS checkin_date,
        'Oro Verde' AS checkin_type,
        c.country_name,
        o.organization_name,
        s.status_name,
        DATE_PART('day', t.checkin_oro_verde - CURRENT_DATE) as days_until_checkin,
        CASE 
          WHEN DATE(t.checkin_oro_verde) = CURRENT_DATE THEN 'today'
          WHEN DATE(t.checkin_oro_verde) = CURRENT_DATE + INTERVAL '1 day' THEN 'tomorrow'
          WHEN t.checkin_oro_verde BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days' THEN 'this_week'
          ELSE 'later'
        END as urgency_level
      FROM tasks t
      INNER JOIN products p ON t.product_id = p.product_id
      LEFT JOIN countries c ON p.country_id = c.country_id
      LEFT JOIN organizations o ON t.responsable_id = o.organization_id
      LEFT JOIN status s ON t.status_id = s.status_id
      WHERE t.checkin_oro_verde IS NOT NULL 
        AND t.checkin_oro_verde >= CURRENT_DATE
        AND t.checkin_oro_verde <= CURRENT_DATE + INTERVAL '30 days'
        AND (s.status_name IS NULL OR s.status_name NOT IN ('Completed', 'Reviewed'))
      
      UNION ALL
      
      SELECT 
        t.task_id,
        t.task_name,
        p.product_id,
        p.product_name,
        t.checkin_user AS checkin_date,
        'Usuario' AS checkin_type,
        c.country_name,
        o.organization_name,
        s.status_name,
        DATE_PART('day', t.checkin_user - CURRENT_DATE) as days_until_checkin,
        CASE 
          WHEN DATE(t.checkin_user) = CURRENT_DATE THEN 'today'
          WHEN DATE(t.checkin_user) = CURRENT_DATE + INTERVAL '1 day' THEN 'tomorrow'
          WHEN t.checkin_user BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days' THEN 'this_week'
          ELSE 'later'
        END as urgency_level
      FROM tasks t
      INNER JOIN products p ON t.product_id = p.product_id
      LEFT JOIN countries c ON p.country_id = c.country_id
      LEFT JOIN organizations o ON t.responsable_id = o.organization_id
      LEFT JOIN status s ON t.status_id = s.status_id
      WHERE t.checkin_user IS NOT NULL 
        AND t.checkin_user >= CURRENT_DATE
        AND t.checkin_user <= CURRENT_DATE + INTERVAL '30 days'
        AND (s.status_name IS NULL OR s.status_name NOT IN ('Completed', 'Reviewed'))
      
      UNION ALL
      
      SELECT 
        t.task_id,
        t.task_name,
        p.product_id,
        p.product_name,
        t.checkin_communication AS checkin_date,
        'Comunicación' AS checkin_type,
        c.country_name,
        o.organization_name,
        s.status_name,
        DATE_PART('day', t.checkin_communication - CURRENT_DATE) as days_until_checkin,
        CASE 
          WHEN DATE(t.checkin_communication) = CURRENT_DATE THEN 'today'
          WHEN DATE(t.checkin_communication) = CURRENT_DATE + INTERVAL '1 day' THEN 'tomorrow'
          WHEN t.checkin_communication BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days' THEN 'this_week'
          ELSE 'later'
        END as urgency_level
      FROM tasks t
      INNER JOIN products p ON t.product_id = p.product_id
      LEFT JOIN countries c ON p.country_id = c.country_id
      LEFT JOIN organizations o ON t.responsable_id = o.organization_id
      LEFT JOIN status s ON t.status_id = s.status_id
      WHERE t.checkin_communication IS NOT NULL 
        AND t.checkin_communication >= CURRENT_DATE
        AND t.checkin_communication <= CURRENT_DATE + INTERVAL '30 days'
        AND (s.status_name IS NULL OR s.status_name NOT IN ('Completed', 'Reviewed'))
      
      UNION ALL
      
      SELECT 
        t.task_id,
        t.task_name,
        p.product_id,
        p.product_name,
        t.checkin_gender AS checkin_date,
        'Género' AS checkin_type,
        c.country_name,
        o.organization_name,
        s.status_name,
        DATE_PART('day', t.checkin_gender - CURRENT_DATE) as days_until_checkin,
        CASE 
          WHEN DATE(t.checkin_gender) = CURRENT_DATE THEN 'today'
          WHEN DATE(t.checkin_gender) = CURRENT_DATE + INTERVAL '1 day' THEN 'tomorrow'
          WHEN t.checkin_gender BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days' THEN 'this_week'
          ELSE 'later'
        END as urgency_level
      FROM tasks t
      INNER JOIN products p ON t.product_id = p.product_id
      LEFT JOIN countries c ON p.country_id = c.country_id
      LEFT JOIN organizations o ON t.responsable_id = o.organization_id
      LEFT JOIN status s ON t.status_id = s.status_id
      WHERE t.checkin_gender IS NOT NULL 
        AND t.checkin_gender >= CURRENT_DATE
        AND t.checkin_gender <= CURRENT_DATE + INTERVAL '30 days'
        AND (s.status_name IS NULL OR s.status_name NOT IN ('Completed', 'Reviewed'))
      
      ORDER BY checkin_date ASC, task_name
      LIMIT 50
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
    
    // Devolver datos vacíos en lugar de mock data
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch check-ins',
      totalUpcoming: 0,
      urgentCount: 0,
      checkins: {
        today: [],
        tomorrow: [],
        this_week: [],
        later: []
      },
      allCheckins: []
    });
  }
}