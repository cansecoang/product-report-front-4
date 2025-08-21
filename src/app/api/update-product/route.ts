import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    console.log('Update product endpoint called with data:', JSON.stringify(body, null, 2));
    
    const {
      product_id,
      product_name,
      product_objective,
      deliverable,
      delivery_date,
      methodology_description,
      gender_specific_actions,
      next_steps,
      workpackage_id,
      workinggroup_id, // Nuevo campo working group
      product_owner_id,
      country_id,
      responsibles = [],
      organizations = [],
      indicators = [],
      distributor_orgs = [],
      distributor_users = [],
      distributor_others = []
    } = body;

    if (!product_id) {
      console.log('No product ID provided');
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    console.log('Updating product with ID:', product_id);

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Actualizar información básica del producto
      const updateProductQuery = `
        UPDATE products SET 
          product_name = $1,
          product_objective = $2,
          deliverable = $3,
          delivery_date = $4,
          methodology_description = $5,
          gender_specific_actions = $6,
          next_steps = $7,
          workpackage_id = $8,
          workinggroup_id = $9,
          product_owner_id = $10,
          country_id = $11
        WHERE product_id = $12
      `;

      await client.query(updateProductQuery, [
        product_name,
        product_objective,
        deliverable,
        delivery_date,
        methodology_description,
        gender_specific_actions,
        next_steps,
        workpackage_id,
        workinggroup_id,
        product_owner_id,
        country_id,
        product_id
      ]);

      console.log('Basic product data updated successfully');

      // Eliminar relaciones existentes
      await client.query('DELETE FROM product_responsibles WHERE product_id = $1', [product_id]);
      await client.query('DELETE FROM product_organizations WHERE product_id = $1', [product_id]);
      await client.query('DELETE FROM product_indicators WHERE product_id = $1', [product_id]);
      await client.query('DELETE FROM product_distributor_orgs WHERE product_id = $1', [product_id]);
      await client.query('DELETE FROM product_distributor_users WHERE product_id = $1', [product_id]);
      await client.query('DELETE FROM product_distributor_others WHERE product_id = $1', [product_id]);

      // Insertar nuevas relaciones de responsables
      for (let i = 0; i < responsibles.length; i++) {
        const responsible = responsibles[i];
        await client.query(
          `INSERT INTO product_responsibles (product_id, user_id, role_label, is_primary, position) 
           VALUES ($1, $2, $3, $4, $5)`,
          [product_id, responsible.user_id, responsible.role_label, responsible.is_primary, i]
        );
      }

      // Insertar nuevas relaciones de organizaciones
      for (let i = 0; i < organizations.length; i++) {
        const org = organizations[i];
        await client.query(
          `INSERT INTO product_organizations (product_id, organization_id, relation_type, position) 
           VALUES ($1, $2, $3, $4)`,
          [product_id, org.organization_id, org.relation_type, i]
        );
      }

      // Insertar nuevas relaciones de indicadores
      for (const indicatorId of indicators) {
        await client.query(
          `INSERT INTO product_indicators (product_id, indicator_id) VALUES ($1, $2)`,
          [product_id, indicatorId]
        );
      }

      // Insertar nuevas relaciones de distribuidores (organizaciones)
      for (const orgId of distributor_orgs) {
        await client.query(
          `INSERT INTO product_distributor_orgs (product_id, organization_id) VALUES ($1, $2)`,
          [product_id, orgId]
        );
      }

      // Insertar nuevas relaciones de distribuidores (usuarios)
      for (const userId of distributor_users) {
        await client.query(
          `INSERT INTO product_distributor_users (product_id, user_id) VALUES ($1, $2)`,
          [product_id, userId]
        );
      }

      // Insertar nuevas relaciones de otros distribuidores
      for (const other of distributor_others) {
        await client.query(
          `INSERT INTO product_distributor_others (product_id, display_name, contact) VALUES ($1, $2, $3)`,
          [product_id, other.display_name, other.contact]
        );
      }

      await client.query('COMMIT');
      
      return NextResponse.json({ 
        message: 'Product updated successfully',
        product_id: product_id
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Transaction error:', error);
      return NextResponse.json({ 
        error: 'Failed to update product', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({ 
      error: 'Database connection failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
