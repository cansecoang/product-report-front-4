import { NextResponse } from 'next/server';

export async function POST() {
  // Este endpoint limpia cookies expiradas y fuerza re-autenticación
  const response = NextResponse.json({
    success: true,
    message: 'Session cleared, please login again'
  });

  // Limpiar la cookie de autenticación
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0, // Expira inmediatamente
    path: '/'
  });

  return response;
}