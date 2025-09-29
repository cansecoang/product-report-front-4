import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    
    try {
      const query = `
        SELECT *
        FROM users 
        ORDER BY user_name
      `;

      const result = await client.query(query);

      return NextResponse.json({
        users: result.rows
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, email, role, organization_id, is_active = true } = await request.json();
    const client = await pool.connect();
    
    try {
      const query = `
        INSERT INTO users (user_name, user_email, user_role, organization_id, is_active)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      
      const result = await client.query(query, [name, email, role, organization_id, is_active]);
      
      return NextResponse.json({
        success: true,
        user: result.rows[0]
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, email, role, organization_id, is_active } = await request.json();
    const client = await pool.connect();
    
    try {
      const query = `
        UPDATE users 
        SET user_name = $1, user_email = $2, user_role = $3, organization_id = $4, is_active = $5
        WHERE user_id = $6
        RETURNING *
      `;
      
      const result = await client.query(query, [name, email, role, organization_id, is_active, id]);
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        user: result.rows[0]
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
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
        DELETE FROM users 
        WHERE user_id = $1
        RETURNING user_id
      `;
      
      const result = await client.query(query, [id]);
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: 'User deleted successfully'
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}