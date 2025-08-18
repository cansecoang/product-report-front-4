import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Esta tabla no existe en la base de datos actual
    // Retornar array vacío en lugar de fallar
    console.log('distributor_orgs table does not exist, returning empty array');
    
    return NextResponse.json({ 
      distributorOrgs: [] 
    });
  } catch (error) {
    console.error('Error fetching distributor orgs:', error);
    
    // Empty array as fallback
    return NextResponse.json({ distributorOrgs: [] });
  }
}
