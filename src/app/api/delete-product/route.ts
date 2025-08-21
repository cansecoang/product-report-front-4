import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function DELETE(request: NextRequest) {
  const client = await pool.connect();
  
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    console.log(`🗑️ [API] Iniciando eliminación del producto ${productId}...`);

    await client.query('BEGIN');

    // 1. Primero verificar que el producto existe
    const productCheck = await client.query(
      'SELECT product_id, product_name FROM products WHERE product_id = $1',
      [productId]
    );

    if (productCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const productName = productCheck.rows[0].product_name;
    console.log(`📋 Producto encontrado: "${productName}"`);

    // 2. Eliminar tareas relacionadas al producto
    const tasksResult = await client.query(
      'DELETE FROM tasks WHERE product_id = $1 RETURNING task_id, task_name',
      [productId]
    );
    console.log(`🔧 Eliminadas ${tasksResult.rows.length} tareas relacionadas`);

    // 3. Eliminar relaciones del producto (en orden para evitar conflictos de FK)
    
    // Distribuidores
    await client.query('DELETE FROM product_distributor_others WHERE product_id = $1', [productId]);
    await client.query('DELETE FROM product_distributor_users WHERE product_id = $1', [productId]);
    await client.query('DELETE FROM product_distributor_orgs WHERE product_id = $1', [productId]);
    console.log('📤 Eliminadas relaciones de distribuidores');

    // Indicadores
    const indicatorsResult = await client.query('DELETE FROM product_indicators WHERE product_id = $1 RETURNING indicator_id', [productId]);
    console.log(`📊 Eliminadas ${indicatorsResult.rows.length} relaciones de indicadores`);

    // Organizaciones
    const orgsResult = await client.query('DELETE FROM product_organizations WHERE product_id = $1 RETURNING organization_id', [productId]);
    console.log(`🏢 Eliminadas ${orgsResult.rows.length} relaciones de organizaciones`);

    // Responsables
    const responsiblesResult = await client.query('DELETE FROM product_responsibles WHERE product_id = $1 RETURNING user_id', [productId]);
    console.log(`👥 Eliminadas ${responsiblesResult.rows.length} relaciones de responsables`);

    // 4. Finalmente eliminar el producto principal
    await client.query('DELETE FROM products WHERE product_id = $1', [productId]);
    console.log(`✅ Producto "${productName}" eliminado completamente`);

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      message: `Producto "${productName}" y todas sus relaciones eliminadas correctamente`,
      details: {
        productName,
        tasksDeleted: tasksResult.rows.length,
        indicatorsDeleted: indicatorsResult.rows.length,
        organizationsDeleted: orgsResult.rows.length,
        responsiblesDeleted: responsiblesResult.rows.length
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ [API] Error eliminando producto:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete product',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
