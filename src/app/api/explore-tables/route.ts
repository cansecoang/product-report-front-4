import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    console.log('🔍 Explorando estructura de tablas...');
    
    // Ver estructura de users para responsibles
    const usersStructure = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);

    // Ver algunos datos de ejemplo de users
    const usersData = await query('SELECT * FROM users LIMIT 5');

    return NextResponse.json({
      success: true,
      users: {
        structure: usersStructure.rows,
        sampleData: usersData.rows
      },
      message: '✅ Estructura de tabla users obtenida'
    });

  } catch (error) {
    console.error('❌ Error explorando tablas:', error);
    return NextResponse.json({
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
