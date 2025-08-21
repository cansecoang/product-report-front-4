import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';



export async function GET() {
  try {
    const result = await pool.query(`
      SELECT user_id, 
             user_name, 
             user_last_name,
             user_email, 
             user_phone
      FROM users 
      ORDER BY user_name
    `);

    return NextResponse.json({ responsibles: result.rows });
  } catch (error) {
    console.error('Error fetching responsibles:', error);
    
    // Mock data as fallback
    const mockResponsibles = [
      { user_id: 1, user_name: 'Juan', user_last_name: 'Pérez', user_email: 'juan@example.com', user_phone: '+57 300 123 4567' },
      { user_id: 2, user_name: 'María', user_last_name: 'García', user_email: 'maria@example.com', user_phone: '+57 301 234 5678' },
      { user_id: 3, user_name: 'Carlos', user_last_name: 'López', user_email: 'carlos@example.com', user_phone: '+57 302 345 6789' },
      { user_id: 4, user_name: 'Ana', user_last_name: 'Rodríguez', user_email: 'ana@example.com', user_phone: '+57 303 456 7890' },
      { user_id: 5, user_name: 'Luis', user_last_name: 'Martínez', user_email: 'luis@example.com', user_phone: '+57 304 567 8901' }
    ];

    return NextResponse.json({ responsibles: mockResponsibles });
  }
}
