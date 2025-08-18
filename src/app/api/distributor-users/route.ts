import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Esta tabla no existe en la base de datos actual
    // Retornar array vacío en lugar de fallar
    console.log('distributor_users table does not exist, returning empty array');
    
    return NextResponse.json({ 
      distributorUsers: [] 
    });
  } catch (error) {
    console.error('Error fetching distributor users:', error);
    
    // Empty array as fallback
    return NextResponse.json({ distributorUsers: [] });
  }
}
