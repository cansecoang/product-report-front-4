import { NextRequest, NextResponse } from 'next/server';
import { getProductsByWorkPackage, getProductsByWorkPackageAndOutput, getAllProducts } from '@/lib/data-access';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workPackageId = searchParams.get('workPackageId');
    const outputNumber = searchParams.get('outputNumber');
    
    console.log(`🌐 API Call: workPackageId=${workPackageId}, outputNumber=${outputNumber}`);

    let products;
    
    // Si no hay filtros, devolver todos los productos
    if (!workPackageId && !outputNumber) {
      console.log(`🔄 Using getAllProducts (no filters)`);
      products = await getAllProducts();
    }
    // Si se proporciona outputNumber, filtrar por ambos criterios
    else if (workPackageId && outputNumber) {
      console.log(`🔄 Using getProductsByWorkPackageAndOutput`);
      products = await getProductsByWorkPackageAndOutput(workPackageId, outputNumber);
    }
    // Solo filtrar por workPackageId
    else if (workPackageId) {
      console.log(`🔄 Using getProductsByWorkPackage`);
      products = await getProductsByWorkPackage(workPackageId);
    }
    else {
      console.log(`🔄 Using getAllProducts (fallback)`);
      products = await getAllProducts();
    }
    
    return NextResponse.json(products);

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
