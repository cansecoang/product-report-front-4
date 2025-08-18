import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// Configuración de la base de datos


export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      detail,
      start_planned,
      end_planned,
      start_actual,
      end_actual,
      checkin_oro_verde,
      checkin_user,
      checkin_communication,
      checkin_gender,
      phase_id,
      status_id,
      org_id
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      // Verificar que la tarea existe
      const checkQuery = 'SELECT task_id FROM tasks WHERE task_id = $1';
      const checkResult = await client.query(checkQuery, [parseInt(id)]);
      
      if (checkResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Task not found' },
          { status: 404 }
        );
      }

      // Actualizar la tarea
      const updateQuery = `
        UPDATE tasks SET
          task_name = $1,
          task_detail = $2,
          start_date_planned = $3,
          end_date_planned = $4,
          start_date_actual = $5,
          end_date_actual = $6,
          checkin_oro_verde = $7,
          checkin_user = $8,
          checkin_communication = $9,
          checkin_gender = $10,
          phase_id = $11,
          status_id = $12,
          responsable_id = $13,
          updated_at = NOW()
        WHERE task_id = $14
        RETURNING *
      `;
      
      const values = [
        name,
        detail || null,
        start_planned && start_planned.trim() ? new Date(start_planned).toISOString() : null,
        end_planned && end_planned.trim() ? new Date(end_planned).toISOString() : null,
        start_actual && start_actual.trim() ? new Date(start_actual).toISOString() : null,
        end_actual && end_actual.trim() ? new Date(end_actual).toISOString() : null,
        checkin_oro_verde && checkin_oro_verde.trim() ? new Date(checkin_oro_verde).toISOString() : null,
        checkin_user && checkin_user.trim() ? new Date(checkin_user).toISOString() : null,
        checkin_communication && checkin_communication.trim() ? new Date(checkin_communication).toISOString() : null,
        checkin_gender && checkin_gender.trim() ? new Date(checkin_gender).toISOString() : null,
        phase_id ? parseInt(phase_id) : null,
        status_id ? parseInt(status_id) : null,
        org_id ? parseInt(org_id) : null,
        parseInt(id)
      ];
      
      await client.query(updateQuery, values);
      
      // Obtener los datos actualizados con los joins necesarios
      const selectQuery = `
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
      
      const updatedTaskResult = await client.query(selectQuery, [parseInt(id)]);
      
      return NextResponse.json({
        success: true,
        task: updatedTaskResult.rows[0]
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}
