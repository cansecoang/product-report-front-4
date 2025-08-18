import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    dbConfig: {
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT_SET',
      DB_HOST: process.env.DB_HOST || 'NOT_SET',
      DB_PORT: process.env.DB_PORT || 'NOT_SET', 
      DB_NAME: process.env.DB_NAME || 'NOT_SET',
      DB_USER: process.env.DB_USER || 'NOT_SET',
      DB_PASSWORD: process.env.DB_PASSWORD ? 'SET' : 'NOT_SET'
    },
    allEnvKeys: Object.keys(process.env).filter(key => key.startsWith('DB_'))
  });
}
