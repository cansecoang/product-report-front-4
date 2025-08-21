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
        country_id,
        created_at, 
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()) 
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
      country,
      delivery_date,
      description,
      budget,
      status || 'active'
    ]);

    const newProductId = productResult.rows[0].product_id;

    // 2. Insertar relaciones con indicadores
    if (indicator_ids.length > 0) {
      for (const indicatorId of indicator_ids) {
        await client.query(
          'INSERT INTO product_indicators (product_id, indicator_id, created_at) VALUES ($1, $2, NOW())',
          [newProductId, indicatorId]
        );
      }
    }

    // 3. Insertar relaciones con responsables
    if (responsible_ids.length > 0) {
      for (const responsibleId of responsible_ids) {
        await client.query(
          'INSERT INTO product_responsibles (product_id, responsible_id, created_at) VALUES ($1, $2, NOW())',
          [newProductId, responsibleId]
        );
      }
    }

    // 4. Insertar relaciones con organizaciones
    if (organization_ids.length > 0) {
      for (const organizationId of organization_ids) {
        await client.query(
          'INSERT INTO product_organizations (product_id, organization_id, created_at) VALUES ($1, $2, NOW())',
          [newProductId, organizationId]
        );
      }
    }

    // 5. Insertar relaciones con organizaciones distribuidoras
    if (distributor_org_ids.length > 0) {
      for (const distributorOrgId of distributor_org_ids) {
        await client.query(
          'INSERT INTO product_distributor_orgs (product_id, distributor_org_id, created_at) VALUES ($1, $2, NOW())',
          [newProductId, distributorOrgId]
        );
      }
    }

    // 6. Insertar relaciones con usuarios distribuidores
    if (distributor_user_ids.length > 0) {
      for (const distributorUserId of distributor_user_ids) {
        await client.query(
          'INSERT INTO product_distributor_users (product_id, distributor_user_id, created_at) VALUES ($1, $2, NOW())',
          [newProductId, distributorUserId]
        );
      }
    }

    // 7. Insertar relaciones con otros distribuidores
    if (distributor_other_ids.length > 0) {
      for (const distributorOtherId of distributor_other_ids) {
        await client.query(
          'INSERT INTO product_distributor_others (product_id, distributor_other_id, created_at) VALUES ($1, $2, NOW())',
          [newProductId, distributorOtherId]
        );
      }
    }

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      message: 'Producto creado exitosamente',
      product_id: newProductId
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Error al crear el producto' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
