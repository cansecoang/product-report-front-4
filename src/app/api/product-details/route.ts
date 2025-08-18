import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Ver qué tablas están relacionadas con products
    const tablesInfo = await query(`
      SELECT 
        tc.table_name, 
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND (tc.table_name = 'products' OR ccu.table_name = 'products')
    `);

    // Ver estructura de tablas relacionadas
    const organizationsStructure = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'organizations' AND table_schema = 'public'
    `);

    const countriesStructure = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'countries' AND table_schema = 'public'
    `);

    const usersStructure = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND table_schema = 'public'
    `);

    // Datos de ejemplo de countries y organizations
    const countries = await query('SELECT * FROM countries LIMIT 5');
    const organizations = await query('SELECT * FROM organizations LIMIT 5');

    return NextResponse.json({
      success: true,
      relationships: tablesInfo.rows,
      structures: {
        organizations: organizationsStructure.rows,
        countries: countriesStructure.rows,
        users: usersStructure.rows
      },
      sampleData: {
        countries: countries.rows,
        organizations: organizations.rows
      }
    });

  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
