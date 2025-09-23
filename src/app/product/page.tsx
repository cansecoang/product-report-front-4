import { getWorkPackages } from '@/lib/data-access';
import { ProductMatrix } from '@/components/product-matrix';

export default async function ProductPage() {
  try {
    const workPackages = await getWorkPackages();
    
    return (
      <div className="container mx-auto p-6">
        <ProductMatrix workPackages={workPackages} />
      </div>
    );
  } catch (error) {
    console.error('Error loading work packages:', error);
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <h2 className="text-lg font-medium text-red-600">Error loading data</h2>
          <p className="text-muted-foreground">Please try again later.</p>
        </div>
      </div>
    );
  }
}