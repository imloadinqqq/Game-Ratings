const mysql = require("mysql2/promise");
require("dotenv").config();

const dbConfig = {
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME,
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
};

const pool = mysql.createPool(dbConfig);

async function getData(query, params = []) {
	let connection;
	try {
		connection = await pool.getConnection();
		const [rows] = await connection.query(query, params);
		return rows;
	} catch (error) {
		console.error("Database error:", error);
		throw error;
	} finally {
		if (connection) connection.release();
	}
}

module.exports = { getData, pool };
