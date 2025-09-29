import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No authenticated' },
        { status: 401 }
      );
    }

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & {
      userId: number;
      email: string;
      name: string;
    };

    return NextResponse.json({
      success: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name
      }
    });

  } catch (error) {
    console.error('❌ Auth verification error:', error);
    
    // Crear respuesta con cookie limpia para tokens expirados o inválidos
    const response = NextResponse.json(
      { success: false, error: 'Invalid or expired token' },
      { status: 401 }
    );

    // Limpiar la cookie si el token es inválido/expirado
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expira inmediatamente
      path: '/'
    });

    return response;
  }
}