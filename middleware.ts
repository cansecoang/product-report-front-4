import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log(`🔒 Middleware checking: ${pathname}`);
  
  // Rutas públicas que no requieren autenticación
  const publicPaths = ['/login', '/api/auth/login', '/api/auth/logout', '/api/auth/refresh'];
  
  // Rutas de assets y archivos estáticos
  const staticPaths = ['/_next', '/favicon.ico', '/public'];
  
  // Permitir acceso a rutas públicas y archivos estáticos
  if (publicPaths.includes(pathname) || staticPaths.some(path => pathname.startsWith(path))) {
    console.log(`✅ Allowing public/static path: ${pathname}`);
    return NextResponse.next();
  }
  
  // Verificar si el usuario está autenticado
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    console.log(`❌ No token found, redirecting to login from: ${pathname}`);
    // Si no hay token, redirigir al login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verificar la validez del token
  try {
    jwt.verify(token, JWT_SECRET);
    console.log(`✅ Token válido, permitiendo acceso a: ${pathname}`);
    // Token válido, continuar
    return NextResponse.next();
  } catch (error) {
    console.log(`❌ Token inválido o expirado en middleware (${pathname}):`, error instanceof jwt.TokenExpiredError ? 'Token expired' : 'Token invalid');
    
    // Token inválido o expirado, limpiar cookie y redirigir al login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    
    const response = NextResponse.redirect(loginUrl);
    
    // Limpiar la cookie expirada
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });
    
    return response;
  }
}

export const config = {
  matcher: [
    // Temporalmente deshabilitado - dejamos que AuthGuard maneje la redirección
    // '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};