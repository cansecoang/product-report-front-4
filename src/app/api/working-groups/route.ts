import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    console.log('🔍 [API] Fetching working groups...');
    
    const client = await pool.connect();
    
    try {
      // Primero verificar si la tabla workinggroup existe (sin guión bajo)
      const tableCheck = await client.query(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_name IN ('workinggroup', 'working_groups')
      `);
      
      let tableName = 'workinggroup'; // Por defecto usar workinggroup
      if (tableCheck.rows.length === 0) {
        throw new Error('No se encontró tabla workinggroup ni working_groups');
      }
      
      // Si existe working_groups, usarla
      if (tableCheck.rows.some(row => row.table_name === 'working_groups')) {
        tableName = 'working_groups';
      }
      
      console.log(`Using table: ${tableName}`);
      
      const workingGroups = await client.query(`
        SELECT * FROM ${tableName} ORDER BY 1 ASC
      `);

      console.log(`✅ [API] Found ${workingGroups.rows.length} working groups`);
      
      return NextResponse.json({
        success: true,
        workingGroups: workingGroups.rows
      });
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ [API] Error fetching working groups:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch working groups',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
