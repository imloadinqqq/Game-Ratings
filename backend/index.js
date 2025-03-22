const express = require("express");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();

console.log(process.env.HOST, process.env.DB_USER, process.env.PASS, process.env.DATABASE);
const app = express();
const port = 8080;

const dbConfig = {
	host: process.env.HOST,
	user: process.env.DB_USER,
	password: process.env.PASS,
	database: process.env.DATABASE,
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
};

const pool = mysql.createPool(dbConfig);

app.use(express.json());

async function getData(query) {
	const connection = await pool.getConnection();

	try {
		const [rows] = await connection.execute(query);
		return rows;
	} catch (error) {
		console.error("Database error:", error);
		throw error;
	} finally {
		connection.release();
	}
}

app.get("/api/games", async (req, res) => {
	try {
		const query = "SELECT * FROM Games";
		const results = await getData(query);
		res.json(results);
	} catch (error) {
		res.status(500).json({ error: "Failed to retrieve data", details: error.message });
	}
});

app.get("/api/games-genres", async (req, res) => {
	try {
		const query = `SELECT Games.GameTitle, Genres.GenreName AS genre_name
FROM Games
JOIN Genres ON Games.GenreID = Genres.GenreID;
`;
		const results = await getData(query);
		res.json(results);
	} catch (error) {
		res.status(500).json({ error: "Failed to retrieve data", details: error.message });
	}
});

app.get("/api/games-release", async (req, res) => {
	try {
		const query = `SELECT Games.GameTitle, Games.ReleaseDate
FROM Games`;
		const results = await getData(query);
		res.json(results);
	} catch (error) {
		res.status(500).json({ error: "Failed to retrieve data", details: error.message });
	}
});

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
