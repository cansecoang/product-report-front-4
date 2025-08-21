import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Para otros distribuidores, retornamos datos de ejemplo ya que
    // esta es una tabla que se llena dinámicamente en el modal
    const mockDistributorOthers = [
      { id: 1, display_name: 'Cooperativa Cafetera Regional', contact: 'info@cooperativa.com' },
      { id: 2, display_name: 'Asociación de Agricultores', contact: '+57 300 555 0123' },
      { id: 3, display_name: 'Centro de Capacitación Rural', contact: 'contacto@centro.org' }
    ];

    return NextResponse.json({ distributorOthers: mockDistributorOthers });
  } catch (error) {
    console.error('Error fetching distributor others:', error);
    
    // Empty array as fallback
    return NextResponse.json({ distributorOthers: [] });
  }
}
