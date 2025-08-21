import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(request: NextRequest) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const body = await request.json();
    const {
      // Datos básicos del producto
      product_name,
      product_objective,
      deliverable,
      delivery_date,
      product_output,
      methodology_description,
      gender_specific_actions,
      next_steps,
      workpackage_id,
      product_owner_id,
      country_id,
      
      // Relaciones
      responsibles = [],
      organizations = [],
      indicators = [],
      distributor_orgs = [],
      distributor_users = [],
      distributor_others = []
    } = body;

    // 1. Insertar el producto principal
    const productQuery = `
      INSERT INTO products (
        product_name, 
        product_objective,
        deliverable,
        delivery_date,
        product_output,
        methodology_description,
        gender_specific_actions,
        next_steps,
        workpackage_id,
        product_owner_id,
        country_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
      RETURNING product_id;
    `;

    const productResult = await client.query(productQuery, [
      product_name,
      product_objective,
      deliverable,
      delivery_date,
      product_output,
      methodology_description,
      gender_specific_actions,
      next_steps,
      workpackage_id,
      product_owner_id,
      country_id
    ]);

    const productId = productResult.rows[0].product_id;

    // 2. Insertar responsables
    if (responsibles && responsibles.length > 0) {
      for (const responsible of responsibles) {
        await client.query(
          `INSERT INTO product_responsibles (product_id, user_id, role_label, is_primary, position)
           VALUES ($1, $2, $3, $4, $5)`,
          [productId, responsible.user_id, responsible.role_label, responsible.is_primary, responsible.position]
        );
      }
    }

    // 3. Insertar organizaciones involucradas
    if (organizations && organizations.length > 0) {
      for (const org of organizations) {
        await client.query(
          `INSERT INTO product_organizations (product_id, organization_id, relation_type, position)
           VALUES ($1, $2, $3, $4)`,
          [productId, org.organization_id, org.relation_type, org.position]
        );
      }
    }

    // 4. Insertar indicadores relacionados
    if (indicators && indicators.length > 0) {
      for (const indicatorId of indicators) {
        await client.query(
          `INSERT INTO product_indicators (product_id, indicator_id)
           VALUES ($1, $2)`,
          [productId, indicatorId]
        );
      }
    }

    // 5. Insertar distribuidores organizaciones
    if (distributor_orgs && distributor_orgs.length > 0) {
      for (let i = 0; i < distributor_orgs.length; i++) {
        await client.query(
          `INSERT INTO product_distributor_orgs (product_id, organization_id, position)
           VALUES ($1, $2, $3)`,
          [productId, distributor_orgs[i], i + 1]
        );
      }
    }

    // 6. Insertar distribuidores usuarios
    if (distributor_users && distributor_users.length > 0) {
      for (let i = 0; i < distributor_users.length; i++) {
        await client.query(
          `INSERT INTO product_distributor_users (product_id, user_id, position)
           VALUES ($1, $2, $3)`,
          [productId, distributor_users[i], i + 1]
        );
      }
    }

    // 7. Insertar otros distribuidores
    if (distributor_others && distributor_others.length > 0) {
      for (let i = 0; i < distributor_others.length; i++) {
        const other = distributor_others[i];
        await client.query(
          `INSERT INTO product_distributor_others (product_id, display_name, contact, position)
           VALUES ($1, $2, $3, $4)`,
          [productId, other.display_name, other.contact, i + 1]
        );
      }
    }

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      productId: productId
    }, { status: 201 });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating product:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error creating product',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });

  } finally {
    client.release();
  }
}
