import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'BioFincas',
  password: '2261',
  port: 5434,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    
    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    // Query para obtener los detalles completos de una tarea
    const query = `
      SELECT
        t.task_id               AS id,
        t.task_name             AS name,
        t.task_detail           AS detail,
        t.start_date_planned    AS start_planned,
        t.end_date_planned      AS end_planned,
        t.start_date_actual     AS start_actual,
        t.end_date_actual       AS end_actual,
        t.checkin_oro_verde     AS checkin_oro_verde,
        t.checkin_user          AS checkin_user,
        t.checkin_communication AS checkin_communication,
        t.checkin_gender        AS checkin_gender,
        t.phase_id              AS phase_id,
        p.phase_name            AS phase_name,
        t.status_id             AS status_id,
        s.status_name           AS status_name,
        t.responsable_id        AS org_id,
        o.organization_name     AS org_name,
        t.product_id            AS product_id,
        z.product_name          AS product_name,
        t.created_at,
        t.updated_at
      FROM tasks t
      LEFT JOIN phases        p ON p.phase_id        = t.phase_id
      LEFT JOIN status        s ON s.status_id       = t.status_id
      LEFT JOIN organizations o ON o.organization_id = t.responsable_id
      LEFT JOIN products      z ON z.product_id      = t.product_id
      WHERE t.task_id = $1
    `;
    
    const result = await pool.query(query, [taskId]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      task: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error fetching task details:', error);
    return NextResponse.json({ error: 'Failed to fetch task details' }, { status: 500 });
  }
}
