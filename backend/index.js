const express = require("express");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const swaggerUI = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");

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

// Swagger Configuration
const swaggerOptions = {
	swaggerDefinition: {
		openapi: "3.0.0",
		info: {
			title: "Games API",
			version: "1.0.0",
			description: "API to manage games, genres, platforms, and user ratings",
		},
		servers: [
			{
				url: `http://localhost:${port}`,
			},
		],
	},
	apis: ["./index.js"],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));

// Utility function to handle database calls
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

/**
 * @swagger
 * /api/games:
 *   get:
 *     summary: Get all games
 *     description: Retrieve a list of all games with their genres
 *     responses:
 *       200:
 *         description: A list of games
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   GameID:
 *                     type: integer
 *                     description: The game ID
 *                   GameTitle:
 *                     type: string
 *                     description: The title of the game
 *                   ReleaseDate:
 *                     type: string
 *                     format: date
 *                     description: The release date of the game
 *                   Publisher:
 *                     type: string
 *                     description: The publisher of the game
 *                   AgeRating:
 *                     type: string
 *                     description: The age rating of the game
 *                   Genres:
 *                     type: string
 *                     description: Comma-separated list of genres associated with the game
 */
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

/**
 * @swagger
 * /api/games/{game_id}:
 *   get:
 *     summary: Get game by ID
 *     description: Retrieve a specific game by its ID
 *     parameters:
 *       - in: path
 *         name: game_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Game details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 GameID:
 *                   type: integer
 *                 GameTitle:
 *                   type: string
 *                 ReleaseDate:
 *                   type: string
 *                 Publisher:
 *                   type: string
 *                 AgeRating:
 *                   type: string
 *                 Genres:
 *                   type: string
 */
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
		const results = await getData(query, [gameID]);
		res.json(results);
	} catch (error) {
		res.status(500).json({ error: "Failed to retrieve data", details: error.message });
	}
});

/**
 * @swagger
 * /api/games-genres:
 *   get:
 *     summary: Get all games with their genres
 *     description: Retrieve a list of all games with their associated genres
 *     responses:
 *       200:
 *         description: A list of games with their genres
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   GameTitle:
 *                     type: string
 *                   GenreName:
 *                     type: string
 */
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

/**
 * @swagger
 * /api/games-platforms:
 *   get:
 *     summary: Get all games with their platforms
 *     description: Retrieve a list of all games with their associated platforms
 *     responses:
 *       200:
 *         description: A list of games with their platforms
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   GameTitle:
 *                     type: string
 *                   Platforms:
 *                     type: string
 */
app.get("/api/games-platforms", async (req, res) => {
	try {
		const query = `SELECT g.GameTitle, p.PlatformName
    FROM GamePlatforms gp
    JOIN Games g ON gp.GameID = g.GameID
    JOIN Platforms p ON gp.PlatformID = p.PlatformID;`;
		const results = await getData(query);

		const groupedResults = results.reduce((acc, { GameTitle, PlatformName }) => {
			if (!acc[GameTitle]) {
				acc[GameTitle] = {
					GameTitle,
					PlatformNames: []
				};
			}
			acc[GameTitle].PlatformNames.push(PlatformName);
			return acc;
		}, {});

		const finalResults = Object.values(groupedResults).map(item => ({
			GameTitle: item.GameTitle,
			Platforms: item.PlatformNames.join(', ')
		}));

		res.json(finalResults);
	} catch (error) {
		res.status(500).json({ error: "Failed to retrieve data", details: error.message });
	}
});

/**
 * @swagger
 * /api/games-genres/{game_id}:
 *   get:
 *     summary: Get game genres by game ID
 *     description: Retrieve genres for a specific game by its ID
 *     parameters:
 *       - in: path
 *         name: game_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Genres associated with the game
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   GameTitle:
 *                     type: string
 *                   GenreName:
 *                     type: string
 */
app.get("/api/games-genres/:game_id", async (req, res) => {
	try {
		const gameID = parseInt(req.params.game_id);
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

/**
 * @swagger
 * /api/games-release:
 *   get:
 *     summary: Get games and their release dates
 *     description: Retrieve a list of all games with their release dates
 *     responses:
 *       200:
 *         description: A list of games with their release dates
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   GameTitle:
 *                     type: string
 *                   ReleaseDate:
 *                     type: string
 */
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

/**
 * @swagger
 * /api/games-release/{game_id}:
 *   get:
 *     summary: Get release date for a game by ID
 *     description: Retrieve the release date for a specific game by its ID
 *     parameters:
 *       - in: path
 *         name: game_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Release date for the game
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 GameTitle:
 *                   type: string
 *                 ReleaseDate:
 *                   type: string
 */
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

/**
 * @swagger
 * /api/genres:
 *   get:
 *     summary: Get all genres
 *     description: Retrieve a list of all available genres
 *     responses:
 *       200:
 *         description: A list of genres
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   GenreID:
 *                     type: integer
 *                   GenreName:
 *                     type: string
 */
app.get("/api/genres", async (req, res) => {
	try {
		const query = `SELECT GenreID, GenreName FROM Genres`;
		const results = await getData(query);
		res.json(results);
	} catch (error) {
		res.status(500).json({ error: "Failed to retrieve data", details: error.message });
	}
});

/* ------------
 * POST METHODS
 * ------------ */

/**
 * @swagger
 * /api/games:
 *   post:
 *     summary: Create a new game
 *     description: Insert a new game record into the database
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               GameTitle:
 *                 type: string
 *               ReleaseDate:
 *                 type: string
 *               Publisher:
 *                 type: string
 *               AgeRating:
 *                 type: string
 *     responses:
 *       201:
 *         description: Game created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 insertId:
 *                   type: integer
 *                   description: The ID of the inserted game
 *       500:
 *         description: Failed to create game
 */
app.post("/api/games", async (req, res) => {
	const connection = await pool.getConnection();
	try {
		const { GameTitle, ReleaseDate, Publisher, AgeRating } = req.body;
		const query = `INSERT INTO Games(GameTitle, ReleaseDate, Publisher, AgeRating) VALUES (?, ?, ?, ?)`;

		const [result] = await connection.execute(query, [GameTitle, ReleaseDate, Publisher, AgeRating]);
		res.status(201).json({ message: "Game created successfully", insertId: result.insertId });
	} catch (error) {
		console.error("Error inserting data:", error);
		res.status(500).json({ error: "Failed to create game", details: error.message });
	} finally {
		connection.release();
	}
});


/* ------------
 * POST METHODS
 * ------------ */

/**
 * @swagger
 * /api/games-genres:
 *   post:
 *     summary: Create a new game-genre relationship
 *     description: Insert a new record into the GameGenres table, linking a game and a genre.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               GameID:
 *                 type: integer
 *                 description: The ID of the game
 *               GenreID:
 *                 type: integer
 *                 description: The ID of the genre
 *     responses:
 *       201:
 *         description: Data inserted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 insertId:
 *                   type: integer
 *                   description: The ID of the inserted record
 *       500:
 *         description: Failed to post data
 */
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

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     description: Insert a new user into the Users table with hashed password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               UserName:
 *                 type: string
 *                 description: The user's username
 *               Email:
 *                 type: string
 *                 description: The user's email address
 *               PasswordHashed:
 *                 type: string
 *                 description: The password in plain text, will be hashed before insertion
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 insertId:
 *                   type: integer
 *                   description: The ID of the inserted user
 *       500:
 *         description: Failed to post data
 */
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

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Update a user's details
 *     description: Update user information such as username or email by their ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               UserName:
 *                 type: string
 *                 description: The new username of the user
 *               Email:
 *                 type: string
 *                 description: The new email of the user
 *               PasswordHashed:
 *                 type: string
 *                 description: The new password, will be hashed before updating
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid user data provided
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to update user data
 */
app.patch("/api/users/:id", async (req, res) => {
	const id = parseInt(req.params.id);
	const connection = await pool.getConnection();

	try {
		const { UserName, Email, PasswordHashed } = req.body;

		let query = "UPDATE Users SET UserName = ?, Email = ?";
		const params = [UserName, Email];

		// If PasswordHashed is provided, hash and update it
		if (PasswordHashed) {
			const salt = bcrypt.genSaltSync(10);
			const hash = await bcrypt.hash(PasswordHashed, salt);
			query += ", PasswordHashed = ?";
			params.push(hash);
		}

		query += " WHERE UserID = ?";
		params.push(id);

		const [result] = await connection.execute(query, params);

		if (result.affectedRows === 0) {
			return res.status(404).json({ error: "User not found" });
		}

		res.status(200).json({ message: "User updated successfully" });
	} catch (error) {
		console.error("Error updating user:", error);
		res.status(500).json({ error: "Failed to update user data", details: error.message });
	} finally {
		connection.release();
	}
});

/* ------------
 * DELETE METHODS
 * ------------ */

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     description: Delete a specific user from the Users table by their ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 deletedId:
 *                   type: integer
 *                   description: The ID of the deleted user
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to delete data
 */
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
