import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        user_id,
        user_name,
        user_last_name,
        user_email,
        user_phone
      FROM users
      ORDER BY user_name
    `);

    return NextResponse.json({ distributorUsers: result.rows });
  } catch (error) {
    console.error('Error fetching distributor users:', error);
    
    // Mock data as fallback
    const mockDistributorUsers = [
      { user_id: 1, user_name: 'Juan', user_last_name: 'Pérez', user_email: 'juan@example.com', user_phone: '+57 300 123 4567' },
      { user_id: 2, user_name: 'María', user_last_name: 'García', user_email: 'maria@example.com', user_phone: '+57 301 234 5678' },
      { user_id: 3, user_name: 'Carlos', user_last_name: 'López', user_email: 'carlos@example.com', user_phone: '+57 302 345 6789' }
    ];

    return NextResponse.json({ distributorUsers: mockDistributorUsers });
  }
}
