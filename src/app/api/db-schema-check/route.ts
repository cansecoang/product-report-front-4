import { pool } from '@/lib/db';

export async function GET() {
  try {
    console.log('🔧 Checking database schema...');
    
    // Check what tables exist
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    const tablesResult = await pool.query(tablesQuery);
    const existingTables = tablesResult.rows.map(row => row.table_name);
    
    // Required tables for the application
    const requiredTables = [
      'countries',
      'organizations', 
      'users',
      'workpackages',
      'products',
      'indicators',
      'product_responsibles',
      'product_indicators', 
      'product_organizations',
      'product_distributor_orgs',
      'product_distributor_users',
      'product_distributor_others'
    ];
    
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));
    const existingRequiredTables = requiredTables.filter(table => existingTables.includes(table));
    
    console.log('📋 Existing tables:', existingTables);
    console.log('✅ Required tables found:', existingRequiredTables);
    console.log('❌ Missing tables:', missingTables);
    
    // Check products table structure
    let productColumns = [];
    if (existingTables.includes('products')) {
      const columnsQuery = `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'products' 
        ORDER BY ordinal_position;
      `;
      const columnsResult = await pool.query(columnsQuery);
      productColumns = columnsResult.rows;
    }
    
    return Response.json({
      status: 'success',
      database_info: {
        existing_tables: existingTables,
        required_tables: requiredTables,
        missing_tables: missingTables,
        existing_required_tables: existingRequiredTables,
        products_table_structure: productColumns,
        schema_complete: missingTables.length === 0
      }
    });
    
  } catch (error) {
    console.error('❌ Database schema check failed:', error);
    return Response.json({ 
      status: 'error',
      error: 'Failed to check database schema',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
