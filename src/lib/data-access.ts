import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'BioFincas',
  password: '2261',
  port: 5434,
});

// Interfaces para TypeScript basadas en tu estructura real
export interface WorkPackage {
  id: string;
  name: string;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  workPackageId: string;
  objective?: string;
}

// Función para obtener todos los work packages desde tu tabla real
export const getWorkPackages = async (): Promise<WorkPackage[]> => {
  try {
    const result = await pool.query(`
      SELECT workpackage_id, workpackage_name, workpackage_description 
      FROM workpackages 
      ORDER BY workpackage_name
    `);
    
    console.log('📋 Work packages obtenidos:', result.rows.length);
    
    return result.rows.map((row: any) => ({
      id: row.workpackage_id.toString(),
      name: row.workpackage_name,
      description: row.workpackage_description
    }));
  } catch (error) {
    console.error('Error fetching work packages:', error);
    throw new Error('Failed to fetch work packages');
  }
};

// Función para obtener products por work package desde tu tabla real
export const getProductsByWorkPackage = async (workPackageId: string): Promise<Product[]> => {
  try {
    const result = await pool.query(`
      SELECT 
        product_id, 
        product_name, 
        product_objective,
        workpackage_id
      FROM products 
      WHERE workpackage_id = $1 
      ORDER BY product_name
    `, [workPackageId]);
    
    console.log(`📋 Products obtenidos para WP ${workPackageId}:`, result.rows.length);
    
    return result.rows.map((row: any) => ({
      id: row.product_id.toString(),
      name: row.product_name,
      workPackageId: row.workpackage_id.toString(),
      objective: row.product_objective
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    throw new Error('Failed to fetch products');
  }
};

// Función para obtener todos los products
export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const result = await pool.query(`
      SELECT 
        product_id, 
        product_name, 
        product_objective,
        workpackage_id
      FROM products 
      ORDER BY product_name
    `);
    
    console.log('📋 Total products obtenidos:', result.rows.length);
    
    return result.rows.map((row: any) => ({
      id: row.product_id.toString(),
      name: row.product_name,
      workPackageId: row.workpackage_id?.toString() || '0',
      objective: row.product_objective
    }));
  } catch (error) {
    console.error('Error fetching all products:', error);
    throw new Error('Failed to fetch products');
  }
};
