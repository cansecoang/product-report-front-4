import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Fetching checkins for product ID:', productId);

    // Consulta para obtener check-ins del producto (todas las columnas de check-in)
    const checkinsQuery = `
      SELECT 
        t.task_id,
        t.task_name,
        t.checkin_oro_verde AS checkin_date,
        'Oro Verde' AS checkin_type,
        s.status_name,
        o.organization_name,
        DATE_PART('day', t.checkin_oro_verde - CURRENT_DATE) as days_until_checkin,
        CASE 
          WHEN t.checkin_oro_verde < CURRENT_DATE THEN 'overdue'
          WHEN DATE(t.checkin_oro_verde) = CURRENT_DATE THEN 'today'
          WHEN DATE(t.checkin_oro_verde) = CURRENT_DATE + INTERVAL '1 day' THEN 'tomorrow'
          WHEN t.checkin_oro_verde BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days' THEN 'this_week'
          ELSE 'later'
        END as urgency_level
      FROM tasks t
      LEFT JOIN status s ON t.status_id = s.status_id
      LEFT JOIN organizations o ON t.responsable_id = o.organization_id
      WHERE t.product_id = $1 
        AND t.checkin_oro_verde IS NOT NULL
      
      UNION ALL
      
      SELECT 
        t.task_id,
        t.task_name,
        t.checkin_user AS checkin_date,
        'Usuario' AS checkin_type,
        s.status_name,
        o.organization_name,
        DATE_PART('day', t.checkin_user - CURRENT_DATE) as days_until_checkin,
        CASE 
          WHEN t.checkin_user < CURRENT_DATE THEN 'overdue'
          WHEN DATE(t.checkin_user) = CURRENT_DATE THEN 'today'
          WHEN DATE(t.checkin_user) = CURRENT_DATE + INTERVAL '1 day' THEN 'tomorrow'
          WHEN t.checkin_user BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days' THEN 'this_week'
          ELSE 'later'
        END as urgency_level
      FROM tasks t
      LEFT JOIN status s ON t.status_id = s.status_id
      LEFT JOIN organizations o ON t.responsable_id = o.organization_id
      WHERE t.product_id = $1 
        AND t.checkin_user IS NOT NULL
      
      UNION ALL
      
      SELECT 
        t.task_id,
        t.task_name,
        t.checkin_communication AS checkin_date,
        'Comunicación' AS checkin_type,
        s.status_name,
        o.organization_name,
        DATE_PART('day', t.checkin_communication - CURRENT_DATE) as days_until_checkin,
        CASE 
          WHEN t.checkin_communication < CURRENT_DATE THEN 'overdue'
          WHEN DATE(t.checkin_communication) = CURRENT_DATE THEN 'today'
          WHEN DATE(t.checkin_communication) = CURRENT_DATE + INTERVAL '1 day' THEN 'tomorrow'
          WHEN t.checkin_communication BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days' THEN 'this_week'
          ELSE 'later'
        END as urgency_level
      FROM tasks t
      LEFT JOIN status s ON t.status_id = s.status_id
      LEFT JOIN organizations o ON t.responsable_id = o.organization_id
      WHERE t.product_id = $1 
        AND t.checkin_communication IS NOT NULL
      
      UNION ALL
      
      SELECT 
        t.task_id,
        t.task_name,
        t.checkin_gender AS checkin_date,
        'Género' AS checkin_type,
        s.status_name,
        o.organization_name,
        DATE_PART('day', t.checkin_gender - CURRENT_DATE) as days_until_checkin,
        CASE 
          WHEN t.checkin_gender < CURRENT_DATE THEN 'overdue'
          WHEN DATE(t.checkin_gender) = CURRENT_DATE THEN 'today'
          WHEN DATE(t.checkin_gender) = CURRENT_DATE + INTERVAL '1 day' THEN 'tomorrow'
          WHEN t.checkin_gender BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days' THEN 'this_week'
          ELSE 'later'
        END as urgency_level
      FROM tasks t
      LEFT JOIN status s ON t.status_id = s.status_id
      LEFT JOIN organizations o ON t.responsable_id = o.organization_id
      WHERE t.product_id = $1 
        AND t.checkin_gender IS NOT NULL
      
      ORDER BY checkin_date ASC
    `;

    const result = await pool.query(checkinsQuery, [productId]);
    const checkins = result.rows;

    // Agrupar por estado
    const groupedCheckins = {
      overdue: checkins.filter(task => task.urgency_level === 'overdue'),
      today: checkins.filter(task => task.urgency_level === 'today'),
      tomorrow: checkins.filter(task => task.urgency_level === 'tomorrow'),
      this_week: checkins.filter(task => task.urgency_level === 'this_week'),
      later: checkins.filter(task => task.urgency_level === 'later')
    };

    console.log('✅ Product checkins retrieved:', {
      productId: productId,
      totalCheckins: checkins.length
    });

    return NextResponse.json({
      success: true,
      totalCheckins: checkins.length,
      checkins: groupedCheckins,
      allCheckins: checkins
    });

  } catch (error) {
    console.error('❌ Error fetching product checkins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product check-ins' },
      { status: 500 }
    );
  }
}