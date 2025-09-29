import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Fetching product info for ID:', productId);

    // Consulta para obtener información básica del producto
    const productInfoQuery = `
      SELECT 
        p.product_id,
        p.product_name,
        TO_CHAR(p.delivery_date, 'DD/MM/YYYY') AS delivery_date,
        o.organization_name AS product_owner_name,
        c.country_name
      FROM products p
      LEFT JOIN countries c ON p.country_id = c.country_id
      LEFT JOIN organizations o ON p.product_owner_id = o.organization_id
      WHERE p.product_id = $1
    `;

    const result = await pool.query(productInfoQuery, [productId]);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const productInfo = result.rows[0];

    console.log('✅ Product info retrieved:', {
      productId: productInfo.product_id,
      productName: productInfo.product_name
    });

    return NextResponse.json({
      success: true,
      product: productInfo
    });

  } catch (error) {
    console.error('❌ Error fetching product info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product information' },
      { status: 500 }
    );
  }
}