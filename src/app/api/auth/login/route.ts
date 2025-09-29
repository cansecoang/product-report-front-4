import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    console.log('🔐 Attempting login for:', email);

    // Buscar usuario en la base de datos por email o nombre de usuario
    const userQuery = `
      SELECT 
        user_id,
        user_email,
        password,
        user_name,
        user_last_name,
        is_active
      FROM users 
      WHERE (user_email = $1 OR user_name = $1) AND is_active = true
    `;

    const result = await pool.query(userQuery, [email.toLowerCase()]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Crear JWT token
    const token = jwt.sign(
      { 
        userId: user.user_id,
        email: user.user_email,
        name: `${user.user_name} ${user.user_last_name || ''}`.trim()
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Login successful for:', email, '(Usuario:', user.user_name, ')');

    // Crear respuesta con cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.user_id,
        email: user.user_email,
        name: `${user.user_name} ${user.user_last_name || ''}`.trim()
      }
    });

    // Configurar cookie httpOnly para seguridad
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 // 24 horas
    });

    return response;

  } catch (error) {
    console.error('❌ Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}