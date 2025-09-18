import { Pool } from 'pg';

// Debug: mostrar configuración de base de datos
console.log('🔧 DB Configuration:', {
  DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT_SET',
  POSTGRES_URL: process.env.POSTGRES_URL ? 'SET' : 'NOT_SET',
  DB_HOST: process.env.DB_HOST || 'NOT_SET',
  DB_PORT: process.env.DB_PORT || 'NOT_SET',
  DB_NAME: process.env.DB_NAME || 'NOT_SET',
  DB_USER: process.env.DB_USER || 'NOT_SET',
  DB_PASSWORD: process.env.DB_PASSWORD ? 'SET' : 'NOT_SET',
  NODE_ENV: process.env.NODE_ENV || 'NOT_SET',
  AZURE_ENV: process.env.WEBSITE_NODE_DEFAULT_VERSION ? 'AZURE_APP_SERVICE' : 'NOT_AZURE'
});

// Configuración flexible: DATABASE_URL, POSTGRES_URL o variables individuales
let connectionConfig;

if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('prisma+postgres://')) {
  // Para Prisma Accelerate, usar POSTGRES_URL para conexiones directas
  connectionConfig = {
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false },
  };
  console.log('🚀 Using Prisma Accelerate with direct PostgreSQL connection');
} else if (process.env.DATABASE_URL) {
  // DATABASE_URL estándar
  connectionConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  };
  console.log('🔗 Using DATABASE_URL connection');
} else {
  // Variables individuales (fallback)
  const isCloudEnvironment = process.env.DB_HOST?.includes('render.com') || 
                              process.env.DB_HOST?.includes('postgres') ||
                              process.env.DB_HOST?.includes('frankfurt-postgres') ||
                              process.env.DB_HOST?.includes('prisma.io') ||
                              process.env.DB_HOST?.includes('azure.com') ||
                              process.env.DB_HOST?.includes('amazonaws.com') ||
                              process.env.WEBSITE_NODE_DEFAULT_VERSION; // Azure App Service
  
  connectionConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'BioFincas',
    password: process.env.DB_PASSWORD || '2261',
    port: parseInt(process.env.DB_PORT || '5434'),
    // Para bases de datos en la nube o Azure, siempre usar SSL
    ssl: isCloudEnvironment ? { rejectUnauthorized: false } : false,
    // Connection pool settings for production
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
  };
  console.log('⚙️ Using individual environment variables', { 
    host: connectionConfig.host, 
    database: connectionConfig.database, 
    ssl: connectionConfig.ssl ? 'enabled' : 'disabled',
    isCloudEnvironment
  });
}

const pool = new Pool(connectionConfig);

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export async function query(text: string, params?: unknown[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('Executed query', { text, duration, rows: res.rowCount });
  return res;
}

export { pool };
