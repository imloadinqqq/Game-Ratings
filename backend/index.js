const express = require("express");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

dotenv.config();

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

async function getData(query, params = []) {
	const connection = await pool.getConnection();

	try {
		const [rows] = await connection.execute(query, params);
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

// request all games
app.get("/api/games", async (req, res) => {
	try {
		const query = `
            SELECT g.GameID, g.GameTitle, g.ReleaseDate, g.Publisher, g.AgeRating, 
                   GROUP_CONCAT(gr.GenreName ORDER BY gr.GenreName SEPARATOR ', ') AS Genres
            FROM Games g
            LEFT JOIN GameGenres gg ON g.GameID = gg.GameID
            LEFT JOIN Genres gr ON gg.GenreID = gr.GenreID
            GROUP BY g.GameID
            ORDER BY g.GameID;
        `;
		const results = await getData(query);
		res.json(results);
	} catch (error) {
		res.status(500).json({ error: "Failed to retrieve data", details: error.message });
	}
});

// request game by id
app.get("/api/games/:game_id", async (req, res) => {
	try {
		const query = `
            SELECT g.GameID, g.GameTitle, g.ReleaseDate, g.Publisher, g.AgeRating, 
                   GROUP_CONCAT(gr.GenreName ORDER BY gr.GenreName SEPARATOR ', ') AS Genres
            FROM Games g
            LEFT JOIN GameGenres gg ON g.GameID = gg.GameID
            LEFT JOIN Genres gr ON gg.GenreID = gr.GenreID
						WHERE g.GameID=?
            GROUP BY g.GameID
            ORDER BY g.GameID;
        `;

		const gameID = parseInt(req.params.game_id);
		console.log(`Retrieving data for GameID ${gameID}`);

		const results = await getData(query, [gameID]);
		res.json(results);
	} catch (error) {
		res.status(500).json({ error: "Failed to retrieve data", details: error.message });
	}
});

// request all games/genres
app.get("/api/games-genres", async (req, res) => {
	try {
		const query = `SELECT g.GameTitle, gr.GenreName
FROM GameGenres gg
JOIN Games g ON gg.GameID = g.GameID
JOIN Genres gr ON gg.GenreID = gr.GenreID;`;
		const results = await getData(query);
		res.json(results);
	} catch (error) {
		res.status(500).json({ error: "Failed to retrieve data", details: error.message });
	}
});

// request game/genre for specific game
// ex: sonic unleashed (action, adventure, fighting)
app.get("/api/games-genres/:game_id", async (req, res) => {
	try {
		const gameID = parseInt(req.params.game_id);
		console.log(`Retrieving data for GameGenreID ${gameID}`);
		const query = `SELECT g.GameTitle, gr.GenreName
FROM GameGenres gg
JOIN Games g ON gg.GameID = g.GameID
JOIN Genres gr ON gg.GenreID = gr.GenreID
WHERE g.GameID=?;`;
		const results = await getData(query, [gameID]);
		res.json(results);
	} catch (error) {
		res.status(500).json({ error: "Failed to retrieve data", details: error.message });
	}
});

// request games/release date
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

// request games/release date by gameID
// WIP
app.get("/api/games-release/:game_id", async (req, res) => {
	const gameID = parseInt(req.params.game_id);

	try {
		const query = `SELECT GameTitle, ReleaseDate FROM Games WHERE GameID=?`
		const results = await getData(query, [gameID]);
		res.json(results);
	} catch (error) {
		res.status(500).json({ error: "Failed to retrieve data", details: error.message });
	}
});

// request genres 
app.get("/api/genres", async (req, res) => {
	try {
		const query = `SELECT * FROM Genres ORDER BY GenreID`;
		const results = await getData(query);
		res.json(results);
	} catch (error) {
		res.status(500).json({ error: "Failed to retrieve data", details: error.message });
	}
});

// request reviews for specific user
app.get("/api/ratings/:id", async (req, res) => {
	const id = parseInt(req.params.id);
	try {
		const query = `
            SELECT r.RatingID, u.UserName, g.GameTitle, r.Rating
            FROM Ratings r
            JOIN Users u ON r.UserID = u.UserID
            JOIN Games g ON r.GameID = g.GameID
            WHERE r.RatingID = ?;
        `;
		const results = await getData(query, [id]);
		res.json(results);
	} catch (error) {
		res.status(500).json({ error: "Failed to retrieve data", details: error.message });
	}
});

/* ------------
 * POST METHODS
 * ------------ */

// create new entry for games
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

app.post("/api/games-genres", async (req, res) => {
	const connection = await pool.getConnection();

	try {
		const { GameID, GenreID } = req.body;
		const query = `INSERT INTO GameGenres(GameID, GenreID) VALUES (?, ?)`;

		const [result] = await connection.execute(query, [GameID, GenreID]);
		res.status(201).json({ message: "Data inserted successfully", insertId: result.insertId });
	} catch (error) {
		console.error("Error inserting data:", error);
		res.status(500).json({ error: "Failed to post data", details: error.message });
	} finally {
		connection.release();
	}
});

app.post("/api/users", async (req, res) => {
	const connection = await pool.getConnection();

	try {
		const { UserName, Email, PasswordHashed } = req.body;
		const salt = bcrypt.genSaltSync(10);
		const hash = await bcrypt.hash(`${PasswordHashed}`, salt);
		const query = `INSERT INTO Users(UserName, Email, PasswordHashed) VALUES (?, ?, ?)`;

		const [result] = await connection.execute(query, [UserName, Email, hash]);
		res.status(201).json({ message: "Data inserted successfully", insertId: result.insertId });
	} catch (error) {
		console.error("Error inserting data:", error);
		res.status(500).json({ error: "Failed to post data", details: error.message });
	} finally {
		connection.release();
	}
});


/* ------------
 * PATCH METHODS
 * ------------ */



/* ------------
 * DELETE METHODS
 * ------------ */

// delete user by id

app.delete("/api/users/:id", async (req, res) => {
	const id = parseInt(req.params.id);
	const connection = await pool.getConnection();

	try {
		const query = `DELETE FROM Users WHERE UserID=?`;
		const [result] = await connection.execute(query, [id]);

		if (result.affectedRows === 0) {
			return res.status(404).json({ error: "User not found" });
		}

		res.status(200).json({ message: "Data deleted successfully", deletedId: id });
	} catch (error) {
		console.error("Error deleting data:", error);
		res.status(500).json({ error: "Failed to delete data", details: error.message });
	} finally {
		connection.release();
	}
});


app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
