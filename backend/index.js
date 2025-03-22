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

/* ------------
 * GET METHODS
 * ------------ */


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
		const query = `SELECT * FROM GameGenres`;
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

app.get("/api/genres", async (req, res) => {
	try {
		const query = `SELECT * FROM Genres ORDER BY GenreID`;
		const results = await getData(query);
		res.json(results);
	} catch (error) {
		res.status(500).json({ error: "Failed to retrieve data", details: error.message });
	}
});

/* ------------
 * POST METHODS
 * ------------ */

app.post("/api/games", async (req, res) => {
	const connection = await pool.getConnection();

	try {
		const { GameTitle, ReleaseDate, Publisher, AgeRating } = req.body;
		const query = `INSERT INTO Games(GameTitle, ReleaseDate, Publisher, AgeRating) VALUES (?, ?, ?, ?)`;

		const [result] = await connection.execute(query, [GameTitle, ReleaseDate, Publisher, AgeRating]);

		res.status(201).json({ message: "Data inserted successfully", insertId: result.insertId });
	} catch (error) {
		console.error("Error inserting data:", error);
		res.status(500).json({ error: "Failed to post data", details: error.message });
	} finally {
		connection.release();
	}
});

// have post for games-genres
// Schema for GameGenres
// GameGenreID int pk
// GameID int fk
// GenreID int fk

app.post("/api/games-genres")


app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
