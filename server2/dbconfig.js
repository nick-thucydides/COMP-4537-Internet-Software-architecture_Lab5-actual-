import dotenv from 'dotenv';
dotenv.config();

export const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};