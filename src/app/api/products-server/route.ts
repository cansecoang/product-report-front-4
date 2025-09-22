import { NextRequest, NextResponse } from 'next/server';
import { getProductsByWorkPackage, getProductsByWorkPackageAndOutput } from '@/lib/data-access';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workPackageId = searchParams.get('workPackageId');
    const outputNumber = searchParams.get('outputNumber');
    
    console.log(`🌐 API Call: workPackageId=${workPackageId}, outputNumber=${outputNumber}`);

    if (!workPackageId) {
      return NextResponse.json(
        { error: 'workPackageId parameter is required' },
        { status: 400 }
      );
    }

    let products;
    
    // Si se proporciona outputNumber, filtrar por ambos criterios
    if (outputNumber) {
      console.log(`🔄 Using getProductsByWorkPackageAndOutput`);
      products = await getProductsByWorkPackageAndOutput(workPackageId, outputNumber);
    } else {
      console.log(`🔄 Using getProductsByWorkPackage`);
      // Solo filtrar por workPackageId (comportamiento original)
      products = await getProductsByWorkPackage(workPackageId);
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
