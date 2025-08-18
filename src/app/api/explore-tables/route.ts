import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    console.log('🔍 Explorando estructura de tablas...');
    
    // Ver estructura de workpackages
    const workpackagesStructure = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'workpackages' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);

    // Ver estructura de products
    const productsStructure = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'products' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);

    // Ver algunos datos de ejemplo de workpackages
    const workpackagesData = await query('SELECT * FROM workpackages LIMIT 5');
    
    // Ver algunos datos de ejemplo de products
    const productsData = await query('SELECT * FROM products LIMIT 5');

    return NextResponse.json({
      success: true,
      workpackages: {
        structure: workpackagesStructure.rows,
        sampleData: workpackagesData.rows
      },
      products: {
        structure: productsStructure.rows,
        sampleData: productsData.rows
      },
      message: '✅ Estructura de tablas obtenida'
    });

  } catch (error) {
    console.error('❌ Error explorando tablas:', error);
    return NextResponse.json({
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
