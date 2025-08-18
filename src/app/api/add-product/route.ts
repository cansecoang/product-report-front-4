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
      work_package_id,
      country,
      delivery_date,
      description,
      budget,
      status,
      
      // Relaciones muchos a muchos
      indicator_ids = [],
      responsible_ids = [],
      organization_ids = [],
      distributor_org_ids = [],
      distributor_user_ids = [],
      distributor_other_ids = []
    } = body;

    // 1. Insertar el producto principal
    const productQuery = `
      INSERT INTO products (
        product_name, 
        work_package_id, 
        country, 
        delivery_date, 
        description, 
        budget, 
        status,
        created_at, 
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) 
      RETURNING product_id;
    `;

    const productResult = await client.query(productQuery, [
      product_name,
      work_package_id,
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
