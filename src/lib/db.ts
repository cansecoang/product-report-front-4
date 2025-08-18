import { Pool } from 'pg';

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
        ssl: process.env.DB_HOST?.includes('render.com') || process.env.DB_HOST?.includes('postgres') 
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
