import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Iniciando actualización de la base de datos...');

    // 1. Crear tabla working_groups si no existe
    await client.query(`
      CREATE TABLE IF NOT EXISTS working_groups (
        workinggroup_id SERIAL PRIMARY KEY,
        workinggroup_name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla working_groups creada');

    // 2. Verificar si la columna workinggroup_id existe en products
    const columnExists = await client.query(`
      SELECT 1 FROM information_schema.columns 
      WHERE table_name='products' AND column_name='workinggroup_id'
    `);

    if (columnExists.rows.length === 0) {
      await client.query(`
        ALTER TABLE products 
        ADD COLUMN workinggroup_id INTEGER REFERENCES working_groups(workinggroup_id);
      `);
      console.log('✅ Columna workinggroup_id agregada a products');
    } else {
      console.log('ℹ️ La columna workinggroup_id ya existe en products');
    }

    // 3. Insertar datos de ejemplo para working groups
    await client.query(`
      INSERT INTO working_groups (workinggroup_name, description) VALUES 
      ('Environmental Working Group', 'Focus on environmental protection and conservation'),
      ('Agricultural Working Group', 'Sustainable agriculture and farming practices'),
      ('Community Engagement Working Group', 'Community outreach and capacity building'),
      ('Research and Development Working Group', 'Scientific research and innovation'),
      ('Policy and Advocacy Working Group', 'Policy development and advocacy efforts')
      ON CONFLICT (workinggroup_name) DO NOTHING;
    `);
    console.log('✅ Datos de ejemplo para working groups insertados');

    return NextResponse.json({
      success: true,
      message: 'Base de datos actualizada correctamente con working groups'
    });
    
  } catch (error) {
    console.error('❌ Error durante la actualización:', error);
    return NextResponse.json(
      { 
        error: 'Error actualizando la base de datos',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
