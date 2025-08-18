import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';



export async function GET() {
  try {
    // Get table structure for tasks
    const structureQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'tasks' 
      ORDER BY ordinal_position;
    `;
    
    // Get sample data from tasks
    const sampleQuery = `
      SELECT * FROM tasks LIMIT 5;
    `;
    
    const [structureResult, sampleResult] = await Promise.all([
      pool.query(structureQuery),
      pool.query(sampleQuery)
    ]);
    
    return NextResponse.json({
      structure: structureResult.rows,
      sampleData: sampleResult.rows
    });
    
  } catch (error) {
    console.error('Error exploring tasks table:', error);
    return NextResponse.json({ error: 'Failed to explore tasks table' }, { status: 500 });
  }
}
