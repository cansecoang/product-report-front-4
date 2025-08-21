import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('id');

    console.log('Product full edit endpoint called with ID:', productId);

    if (!productId) {
      console.log('No product ID provided');
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const client = await pool.connect();
    
    try {
      // Obtener información básica del producto
      console.log('Executing complete product query...');
      const productQuery = `
        SELECT 
          p.product_id,
          p.product_name,
          p.product_objective,
          p.deliverable,
          TO_CHAR(p.delivery_date, 'YYYY-MM-DD') AS delivery_date,
          p.methodology_description,
          p.gender_specific_actions,
          p.next_steps,
          p.workpackage_id,
          p.product_owner_id,
          p.country_id
        FROM products p
        WHERE p.product_id = $1
      `;
      
      const productResult = await client.query(productQuery, [productId]);
      
      console.log('Product query result:', productResult.rows.length, 'rows');
      
      if (productResult.rows.length === 0) {
        console.log('Product not found for ID:', productId);
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      const product = productResult.rows[0];
      console.log('Basic product data retrieved:', product.product_name);

      // Obtener responsables asignados
      console.log('Fetching responsibles...');
      const responsiblesQuery = `
        SELECT 
          pr.user_id,
          pr.role_label,
          COALESCE(pr.is_primary, false) AS is_primary,
          pr.position,
          u.user_name,
          u.user_last_name,
          u.user_email
        FROM product_responsibles pr
        LEFT JOIN users u ON pr.user_id = u.user_id
        WHERE pr.product_id = $1
        ORDER BY COALESCE(pr.position, 32767)
      `;
      
      const responsiblesResult = await client.query(responsiblesQuery, [productId]);
      console.log('Responsibles found:', responsiblesResult.rows.length);

      // Obtener organizaciones involucradas
      console.log('Fetching organizations...');
      const organizationsQuery = `
        SELECT 
          po.organization_id,
          po.relation_type,
          po.position,
          o.organization_name,
          o.organization_description
        FROM product_organizations po
        LEFT JOIN organizations o ON po.organization_id = o.organization_id
        WHERE po.product_id = $1
        ORDER BY COALESCE(po.position, 32767)
      `;
      
      const organizationsResult = await client.query(organizationsQuery, [productId]);
      console.log('Organizations found:', organizationsResult.rows.length);

      // Obtener indicadores relacionados
      console.log('Fetching indicators...');
      const indicatorsQuery = `
        SELECT 
          pi.indicator_id,
          i.indicator_code,
          i.output_number,
          i.indicator_name
        FROM product_indicators pi
        LEFT JOIN indicators i ON pi.indicator_id = i.indicator_id
        WHERE pi.product_id = $1
        ORDER BY i.indicator_id
      `;
      
      const indicatorsResult = await client.query(indicatorsQuery, [productId]);
      console.log('Indicators found:', indicatorsResult.rows.length);

      // Obtener el output_number de los indicadores relacionados
      const output_number = indicatorsResult.rows.length > 0 ? indicatorsResult.rows[0].output_number : '';

      // Obtener distribuidores (organizaciones)
      console.log('Fetching distributor orgs...');
      const distributorOrgsQuery = `
        SELECT organization_id
        FROM product_distributor_orgs
        WHERE product_id = $1
      `;
      
      const distributorOrgsResult = await client.query(distributorOrgsQuery, [productId]);
      console.log('Distributor orgs found:', distributorOrgsResult.rows.length);

      // Obtener distribuidores (usuarios)
      console.log('Fetching distributor users...');
      const distributorUsersQuery = `
        SELECT user_id
        FROM product_distributor_users
        WHERE product_id = $1
      `;
      
      const distributorUsersResult = await client.query(distributorUsersQuery, [productId]);
      console.log('Distributor users found:', distributorUsersResult.rows.length);

      // Obtener otros distribuidores
      console.log('Fetching distributor others...');
      const distributorOthersQuery = `
        SELECT display_name, contact
        FROM product_distributor_others
        WHERE product_id = $1
      `;
      
      const distributorOthersResult = await client.query(distributorOthersQuery, [productId]);
      console.log('Distributor others found:', distributorOthersResult.rows.length);

      // Construir la respuesta completa
      const fullProduct = {
        ...product,
        output_number,
        responsibles: responsiblesResult.rows,
        organizations: organizationsResult.rows,
        indicators: indicatorsResult.rows.map(row => row.indicator_id),
        distributorOrgs: distributorOrgsResult.rows.map(row => row.organization_id),
        distributorUsers: distributorUsersResult.rows.map(row => row.user_id),
        distributorOthers: distributorOthersResult.rows
      };

      console.log('Complete product data prepared for editing');
      return NextResponse.json({ product: fullProduct });

    } catch (error) {
      console.error('Query error:', error);
      return NextResponse.json({ 
        error: 'Database query failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }
}
