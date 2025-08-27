import { NextResponse } from 'next/server';

export async function GET() {
  console.log('🧪 Test endpoint called');
  
  // Hacer la misma petición que haría el frontend
  const testUrl = 'http://localhost:3000/api/indicators-analytics?output=1&indicator=1.2';
  
  try {
    const response = await fetch(testUrl);
    const data = await response.json();
    
    console.log('🧪 Raw API response:', JSON.stringify(data, null, 2));
    
    // Verificar estructura específica
    const structureCheck = {
      hasIndicatorMetrics: !!data.indicatorMetrics,
      indicatorMetricsCount: data.indicatorMetrics?.length || 0,
      hasCountryMetrics: !!data.countryMetrics,
      countryMetricsCount: data.countryMetrics?.length || 0,
      hasProductMetrics: !!data.productMetrics,
      productMetricsCount: data.productMetrics?.length || 0,
      dataKeys: Object.keys(data)
    };
    
    console.log('🧪 Structure check:', structureCheck);
    
    // Simular el procesamiento de chart data como lo haría el frontend
    const { countryMetrics, productMetrics } = data;
    
    interface CountryMetric {
      country_name: string;
      total_products: number;
      total_tasks: number;
      completed_tasks: number;
      country_completion_rate: number;
    }

    const countryChartData = countryMetrics?.map((country: CountryMetric) => ({
      name: country.country_name,
      productos: country.total_products,
      tareas: country.total_tasks,
      completadas: country.completed_tasks,
      progreso: Number(country.country_completion_rate.toFixed(1)),
    })) || [];
    
    interface ProductMetric {
      product_name: string;
      delivery_status: string;
      completion_percentage: number;
      total_tasks: number;
      completed_tasks: number;
      // agrega otros campos si los usas en el archivo
    }

    const deliveryStatusData = productMetrics?.reduce(
      (acc: Record<string, number>, product: ProductMetric) => {
        const status = product.delivery_status;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ) || {};
    
    const pieChartData = Object.entries(deliveryStatusData).map(([status, count]) => ({
      name: status,
      value: count,
    }));
    
  const progressChartData = productMetrics?.map((product: ProductMetric) => ({
      name: product.product_name.length > 20 
        ? product.product_name.substring(0, 20) + "..." 
        : product.product_name,
      progreso: Number(product.completion_percentage.toFixed(1)),
      tareas_totales: product.total_tasks,
      tareas_completadas: product.completed_tasks,
    })) || [];
    
    const processedChartData = {
      countryChartData,
      pieChartData,
      progressChartData,
    };
    
    console.log('🧪 Processed chart data:', JSON.stringify(processedChartData, null, 2));
    
    return NextResponse.json({
      success: true,
      rawData: data,
      structureCheck,
      processedChartData
    });
    
  } catch (error) {
    console.error('🧪 Test endpoint error:', error);
    return NextResponse.json({ error: 'Test failed', details: error });
  }
}
