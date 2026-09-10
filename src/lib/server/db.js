import mysql from 'mysql2/promise';
import {
	DB_HOST,
	DB_PORT,
	DB_USER,
	DB_PASSWORD,
	DB_NAME
} from '$env/static/private';

export const pool = mysql.createPool({
	host: DB_HOST,
	port: Number(DB_PORT || 3306),
	user: DB_USER,
	password: DB_PASSWORD,
	database: DB_NAME,
	waitForConnections: true,
	connectionLimit: 5,
	maxIdle: 5,
	idleTimeout: 60000,
	ssl: { rejectUnauthorized: false }
});
