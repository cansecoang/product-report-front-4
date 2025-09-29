import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    
    try {
      const query = `SELECT * FROM organizations ORDER BY organization_name`;
      const result = await client.query(query);
      
      return NextResponse.json({
        organizations: result.rows
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organizations' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, description, type, country } = await request.json();
    const client = await pool.connect();
    
    try {
      const query = `
        INSERT INTO organizations (organization_name, organization_description, organization_type, organization_country)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      
      const result = await client.query(query, [name, description, type, country]);
      
      return NextResponse.json({
        success: true,
        organization: result.rows[0]
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json(
      { error: 'Failed to create organization' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, description, type, country } = await request.json();
    const client = await pool.connect();
    
    try {
      const query = `
        UPDATE organizations 
        SET organization_name = $1, organization_description = $2, organization_type = $3, organization_country = $4
        WHERE organization_id = $5
        RETURNING *
      `;
      
      const result = await client.query(query, [name, description, type, country, id]);
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Organization not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        organization: result.rows[0]
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating organization:', error);
    return NextResponse.json(
      { error: 'Failed to update organization' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const client = await pool.connect();
    
    try {
      const query = `
        DELETE FROM organizations 
        WHERE organization_id = $1
        RETURNING organization_id
      `;
      
      const result = await client.query(query, [id]);
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Organization not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: 'Organization deleted successfully'
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error deleting organization:', error);
    return NextResponse.json(
      { error: 'Failed to delete organization' },
      { status: 500 }
    );
  }
}
