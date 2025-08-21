import { db } from './src/lib/db.ts';

async function runMigrations() {
  try {
    console.log('🚀 Iniciando migraciones de la base de datos...');

    // 1. Crear tabla working_groups si no existe
    await db`
      CREATE TABLE IF NOT EXISTS working_groups (
        workinggroup_id SERIAL PRIMARY KEY,
        workinggroup_name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✅ Tabla working_groups creada');

    // 2. Verificar si la columna workinggroup_id existe en products
    const columnExists = await db`
      SELECT 1 FROM information_schema.columns 
      WHERE table_name='products' AND column_name='workinggroup_id'
    `;

    if (columnExists.length === 0) {
      await db`
        ALTER TABLE products 
        ADD COLUMN workinggroup_id INTEGER REFERENCES working_groups(workinggroup_id);
      `;
      console.log('✅ Columna workinggroup_id agregada a products');
    } else {
      console.log('ℹ️ La columna workinggroup_id ya existe en products');
    }

    // 3. Insertar datos de ejemplo para working groups
    await db`
      INSERT INTO working_groups (workinggroup_name, description) VALUES 
      ('Environmental Working Group', 'Focus on environmental protection and conservation'),
      ('Agricultural Working Group', 'Sustainable agriculture and farming practices'),
      ('Community Engagement Working Group', 'Community outreach and capacity building'),
      ('Research and Development Working Group', 'Scientific research and innovation'),
      ('Policy and Advocacy Working Group', 'Policy development and advocacy efforts')
      ON CONFLICT (workinggroup_name) DO NOTHING;
    `;
    console.log('✅ Datos de ejemplo para working groups insertados');

    console.log('🎉 ¡Migraciones completadas exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante las migraciones:', error);
    throw error;
  }
}

// Ejecutar migraciones
runMigrations().catch(console.error);
