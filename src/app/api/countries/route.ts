import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    
    try {
      const query = `SELECT * FROM countries ORDER BY country_name`;
      const result = await client.query(query);

      return NextResponse.json({
        countries: result.rows
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching countries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch countries' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('POST /api/countries - Body received:', body);
    
    const { name } = body;
    
    if (!name) {
      console.error('POST /api/countries - Name is missing');
      return NextResponse.json(
        { error: 'Country name is required' },
        { status: 400 }
      );
    }
    
    const client = await pool.connect();
    
    try {
      const query = `
        INSERT INTO countries (country_name)
        VALUES ($1)
        RETURNING *
      `;
      
      console.log('POST /api/countries - Executing query with name:', name);
      const result = await client.query(query, [name]);
      console.log('POST /api/countries - Success:', result.rows[0]);
      
      return NextResponse.json({
        success: true,
        country: result.rows[0]
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating country:', error);
    return NextResponse.json(
      { error: 'Failed to create country' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name } = await request.json();
    const client = await pool.connect();
    
    try {
      const query = `
        UPDATE countries 
        SET country_name = $1
        WHERE country_id = $2
        RETURNING *
      `;
      
      const result = await client.query(query, [name, id]);
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Country not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        country: result.rows[0]
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating country:', error);
    return NextResponse.json(
      { error: 'Failed to update country' },
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
        DELETE FROM countries 
        WHERE country_id = $1
        RETURNING country_id
      `;
      
      const result = await client.query(query, [id]);
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Country not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: 'Country deleted successfully'
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error deleting country:', error);
    return NextResponse.json(
      { error: 'Failed to delete country' },
      { status: 500 }
    );
  }
}
