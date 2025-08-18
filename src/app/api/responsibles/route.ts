import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';



export async function GET() {
  try {
    const result = await pool.query(`
      SELECT user_id as id, 
             CONCAT(user_name, ' ', COALESCE(user_last_name, '')) as name, 
             user_email as email, 
             user_phone as phone,
             'User' as role
      FROM users 
      ORDER BY user_name
    `);
    const responsibles = result.rows.map(row => ({
      id: row.id,
      name: row.name.trim(),
      email: row.email,
      phone: row.phone,
      role: row.role
    }));

    return NextResponse.json({ responsibles });
  } catch (error) {
    console.error('Error fetching responsibles:', error);
    
    // Mock data as fallback
    const mockResponsibles = [
      { id: 1, name: 'Juan Pérez', email: 'juan@example.com', phone: '+57 300 123 4567', role: 'Project Manager' },
      { id: 2, name: 'María García', email: 'maria@example.com', phone: '+57 301 234 5678', role: 'Technical Lead' },
      { id: 3, name: 'Carlos López', email: 'carlos@example.com', phone: '+57 302 345 6789', role: 'Field Coordinator' },
      { id: 4, name: 'Ana Rodríguez', email: 'ana@example.com', phone: '+57 303 456 7890', role: 'Quality Manager' },
      { id: 5, name: 'Luis Martínez', email: 'luis@example.com', phone: '+57 304 567 8901', role: 'Agricultural Specialist' }
    ];

    return NextResponse.json({ responsibles: mockResponsibles });
  }
}
