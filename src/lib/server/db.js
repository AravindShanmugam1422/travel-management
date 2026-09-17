import mysql from 'mysql2/promise';
import { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } from '$env/static/private';

let pool;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: DB_HOST,
      port: Number(DB_PORT || 3306),
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      // Aiven requires SSL. rejectUnauthorized:false keeps setup simple for a demo;
      // for production, download Aiven's CA cert and verify against it instead.
      ssl: { rejectUnauthorized: false },
      waitForConnections: true,
      connectionLimit: 5
    });
  }
  return pool;
}
