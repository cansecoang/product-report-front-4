import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// Helper function to get table columns
import type { PoolClient } from 'pg';

async function getTableColumns(client: PoolClient, tableName: string) {
  const result = await client.query(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = $1 
    ORDER BY ordinal_position
  `, [tableName]);
  
  return result.rows.map((row: { column_name: string }) => row.column_name);
}

// Helper function to build dynamic SELECT query
function buildSelectQuery(tableName: string, columns: string[], idColumn: string) {
  const selectColumns = columns.join(', ');
  return `SELECT ${selectColumns} FROM ${tableName} ORDER BY ${idColumn}`;
}

export async function GET() {
  try {
    const client = await pool.connect();
    
    try {
      // Check if table exists
      const tableCheck = await client.query(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_name = 'countries' AND table_schema = 'public'
      `);
      
      if (tableCheck.rows.length === 0) {
        return NextResponse.json({ countries: [] });
      }

      // Get all columns dynamically
      const columns = await getTableColumns(client, 'countries');
      const query = buildSelectQuery('countries', columns, columns[0]);
      
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
      { error: 'Failed to fetch countries', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, code } = await request.json();
    const client = await pool.connect();
    
    try {
      const query = `
        INSERT INTO countries (country_name, country_code)
        VALUES ($1, $2)
        RETURNING *
      `;
      
      const result = await client.query(query, [name, code]);
      
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
    const { id, name, code } = await request.json();
    const client = await pool.connect();
    
    try {
      const query = `
        UPDATE countries 
        SET country_name = $1, country_code = $2
        WHERE country_id = $3
        RETURNING *
      `;
      
      const result = await client.query(query, [name, code, id]);
      
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