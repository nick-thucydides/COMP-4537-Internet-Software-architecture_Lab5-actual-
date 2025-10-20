import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL;

export const DB_CONFIG = connectionString
  ? {
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  }
  : {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'lab5user',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  };