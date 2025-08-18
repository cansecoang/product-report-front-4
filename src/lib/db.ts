import { Pool } from 'pg';

// Debug: mostrar configuración de base de datos
console.log('🔧 DB Configuration:', {
  DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT_SET',
  DB_HOST: process.env.DB_HOST || 'NOT_SET',
  DB_PORT: process.env.DB_PORT || 'NOT_SET',
  DB_NAME: process.env.DB_NAME || 'NOT_SET',
  DB_USER: process.env.DB_USER || 'NOT_SET',
  DB_PASSWORD: process.env.DB_PASSWORD ? 'SET' : 'NOT_SET'
});

// Configuración flexible: DATABASE_URL o variables individuales
const pool = new Pool(
  process.env.DATABASE_URL 
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'BioFincas',
        password: process.env.DB_PASSWORD || '2261',
        port: parseInt(process.env.DB_PORT || '5434'),
        // Para Render y otras bases de datos en la nube, siempre usar SSL
        ssl: process.env.DB_HOST?.includes('render.com') || 
             process.env.DB_HOST?.includes('postgres') ||
             process.env.DB_HOST?.includes('frankfurt-postgres')
          ? { rejectUnauthorized: false } 
          : false,
      }
);

export async function query(text: string, params?: unknown[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('Executed query', { text, duration, rows: res.rowCount });
  return res;
}

export { pool };
