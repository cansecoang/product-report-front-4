import { NextRequest, NextResponse } from 'next/server';
import { getProductsByWorkPackage } from '@/lib/data-access';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workPackageId = searchParams.get('workPackageId');

    if (!workPackageId) {
      return NextResponse.json(
        { error: 'workPackageId parameter is required' },
        { status: 400 }
      );
    }

    const products = await getProductsByWorkPackage(workPackageId);
    return NextResponse.json(products);

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
