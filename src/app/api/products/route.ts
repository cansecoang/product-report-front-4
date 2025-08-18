// 🚨 ARCHIVO DEPRECATED - Ya no se usa con Server Components
// La nueva API está en: /api/products-server/route.ts
// Este archivo se mantiene solo como referencia. Puedes eliminarlo.

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: "This endpoint is deprecated. Use /api/products-server instead." 
  }, { status: 410 });
}