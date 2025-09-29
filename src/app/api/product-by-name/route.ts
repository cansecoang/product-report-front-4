import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productName = searchParams.get('name');
    
    if (!productName) {
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Searching product by name:', productName);

    // Consulta para obtener información del producto por nombre
    const productQuery = `
      SELECT 
        p.product_id,
        p.product_name,
        TO_CHAR(p.delivery_date, 'DD/MM/YYYY') AS delivery_date,
        o.organization_name AS product_owner_name,
        c.country_name
      FROM products p
      LEFT JOIN countries c ON p.country_id = c.country_id
      LEFT JOIN organizations o ON p.product_owner_id = o.organization_id
      WHERE p.product_name = $1
      LIMIT 1
    `;

    const result = await pool.query(productQuery, [productName]);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const product = result.rows[0];

    console.log('✅ Product found:', {
      productId: product.product_id,
      productName: product.product_name
    });

    return NextResponse.json({
      success: true,
      product: product
    });

  } catch (error) {
    console.error('❌ Error searching product by name:', error);
    return NextResponse.json(
      { error: 'Failed to search product' },
      { status: 500 }
    );
  }
}