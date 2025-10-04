import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const client = await pool.connect();
    
    try {
      const { searchParams } = new URL(request.url);
      const outputFilter = searchParams.get('output');

      let query = `
        SELECT *
        FROM indicators
      `;
      const queryParams: string[] = [];

      // Si hay filtro de output, agregarlo a la consulta
      if (outputFilter) {
        query += ' WHERE output_number = $1';
        queryParams.push(outputFilter);
      }

      query += ' ORDER BY indicator_name';

      const result = await client.query(query, queryParams);

      return NextResponse.json({ 
        indicators: result.rows 
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching indicators:', error);
    return NextResponse.json(
      { error: 'Failed to fetch indicators' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { code, name, description, output_number } = await request.json();
    const client = await pool.connect();
    
    try {
      const query = `
        INSERT INTO indicators (indicator_code, indicator_name, indicator_description, output_number)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      
      const result = await client.query(query, [code, name, description, output_number]);
      
      return NextResponse.json({
        success: true,
        indicator: result.rows[0]
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating indicator:', error);
    return NextResponse.json(
      { error: 'Failed to create indicator' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, code, name, description, output_number } = await request.json();
    const client = await pool.connect();
    
    try {
      const query = `
        UPDATE indicators 
        SET indicator_code = $1, indicator_name = $2, indicator_description = $3, 
            output_number = $4
        WHERE indicator_id = $5
        RETURNING *
      `;
      
      const result = await client.query(query, [code, name, description, output_number, id]);
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Indicator not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        indicator: result.rows[0]
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating indicator:', error);
    return NextResponse.json(
      { error: 'Failed to update indicator' },
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
        DELETE FROM indicators 
        WHERE indicator_id = $1
        RETURNING indicator_id
      `;
      
      const result = await client.query(query, [id]);
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Indicator not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: 'Indicator deleted successfully'
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error deleting indicator:', error);
    return NextResponse.json(
      { error: 'Failed to delete indicator' },
      { status: 500 }
    );
  }
}
