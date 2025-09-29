import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

interface MatrixProduct {
  id: number;
  name: string;
  workPackageId: number;
  outputNumber: number;
  deliveryDate?: string;
  productOwnerName?: string;
}

interface MatrixIndicator {
  id: number;
  code: string;
  name: string;
  outputNumber: number;
}

interface MatrixCountry {
  id: number;
  name: string;
}

interface MatrixCell {
  indicator: MatrixIndicator;
  country: MatrixCountry;
  products: MatrixProduct[];
}

interface DatabaseRow {
  product_id: number;
  product_name: string;
  workpackage_id: number;
  product_output: number;
  country_id: number;
  country_name: string;
  indicator_id: number | null;
  indicator_code: string | null;
  indicator_name: string | null;
  output_number: number | null;
  delivery_date: string | null;
  product_owner_name: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workPackageId = searchParams.get('workPackageId');
    const outputNumber = searchParams.get('outputNumber');
    const countryId = searchParams.get('countryId');

    if (!workPackageId || !outputNumber) {
      return NextResponse.json(
        { error: 'workPackageId and outputNumber parameters are required' },
        { status: 400 }
      );
    }

    console.log('🔄 Fetching products matrix for:', { workPackageId, outputNumber, countryId });

    // Query para obtener la matriz de productos por indicadores y países
    let query = `
      SELECT 
        p.product_id,
        p.product_name,
        p.workpackage_id,
        p.product_output,
        TO_CHAR(p.delivery_date, 'YYYY-MM-DD') AS delivery_date,
        o.organization_name AS product_owner_name,
        c.country_id,
        c.country_name,
        i.indicator_id,
        i.indicator_code,
        i.indicator_name,
        i.output_number
      FROM products p
      INNER JOIN countries c ON p.country_id = c.country_id
      LEFT JOIN organizations o ON o.organization_id = p.product_owner_id
      LEFT JOIN product_indicators pi ON p.product_id = pi.product_id
      LEFT JOIN indicators i ON pi.indicator_id = i.indicator_id
      WHERE p.workpackage_id = $1 
      AND p.product_output = $2
    `;

    const queryParams = [workPackageId, outputNumber];

    // Filtro opcional por país
    if (countryId) {
      query += ` AND p.country_id = $3`;
      queryParams.push(countryId);
    }

    query += ` ORDER BY c.country_name, i.indicator_code`;

    const result = await pool.query(query, queryParams);
    
    console.log('✅ Products matrix fetched:', result.rows.length, 'records');

    // Procesar los datos para crear la estructura de matriz
    const matrixData = processMatrixData(result.rows);

    return NextResponse.json(matrixData);

  } catch (error) {
    console.error('❌ Error fetching products matrix:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products matrix' },
      { status: 500 }
    );
  }
}

function processMatrixData(rows: DatabaseRow[]) {
  // Obtener indicadores únicos usando un Map para mejor deduplicación
  const indicatorMap = new Map<number, MatrixIndicator>();
  rows.forEach(row => {
    if (row.indicator_id && !indicatorMap.has(row.indicator_id)) {
      indicatorMap.set(row.indicator_id, {
        id: row.indicator_id,
        code: row.indicator_code!,
        name: row.indicator_name!,
        outputNumber: row.output_number!
      });
    }
  });
  const indicators = Array.from(indicatorMap.values());

  // Obtener países únicos usando un Map
  const countryMap = new Map<number, MatrixCountry>();
  rows.forEach(row => {
    if (!countryMap.has(row.country_id)) {
      countryMap.set(row.country_id, {
        id: row.country_id,
        name: row.country_name
      });
    }
  });
  const countries = Array.from(countryMap.values());

  // Crear matriz de productos
  const matrix: (MatrixCountry | MatrixCell)[][] = [];
  
  countries.forEach(country => {
    const row: (MatrixCountry | MatrixCell)[] = [country]; // Primera columna es el país
    
    indicators.forEach(indicator => {
      // Buscar productos únicos para este país e indicador
      const productMap = new Map<number, MatrixProduct>();
      rows.forEach(r => {
        if (r.country_id === country.id && r.indicator_id === indicator.id) {
          productMap.set(r.product_id, {
            id: r.product_id,
            name: r.product_name,
            workPackageId: r.workpackage_id,
            outputNumber: r.product_output,
            deliveryDate: r.delivery_date || undefined,
            productOwnerName: r.product_owner_name || undefined
          });
        }
      });
      
      row.push({
        indicator,
        country,
        products: Array.from(productMap.values())
      });
    });
    
    matrix.push(row);
  });

  // Contar productos únicos
  const uniqueProducts = new Set(rows.map(r => r.product_id));

  return {
    indicators,
    countries,
    matrix,
    totalProducts: uniqueProducts.size
  };
}