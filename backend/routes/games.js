
const express = require("express");
const router = express.Router();
const { getData, dbConfig } = require("../db.js");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");

const pool = mysql.createPool(dbConfig);
const connection = pool.promise().getConnection();

const apiKeyMiddleware = (req, res, next) => {
	const apiKey = req.header("X-API-KEY");
	if (!apiKey || apiKey !== process.env.API_KEY) {
		return res.status(401).json({ message: "Unauthorized: Invalid API Key" });
	}
	next();
};

router.use(apiKeyMiddleware);

/**
 * @swagger
 * /api/games:
 *   get:
 *     tags:
 *     - Games
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
 *                   Publishers:
 *                     type: string
 *                     description: The publisher of the game
 *                   AgeRating:
 *                     type: string
 *                     description: The age rating of the game
 *                   Genres:
 *                     type: string
 *                     description: Comma-separated list of genres associated with the game
 */
router.get("/games", async (req, res) => {
	try {
		const query = `
SELECT 
				g.GameID, 
				g.GameTitle, 
				g.ReleaseDate, 
				COALESCE(GROUP_CONCAT(DISTINCT p.PublisherName ORDER BY p.PublisherName SEPARATOR ', '), '') AS Publishers,
				g.AgeRating, 
				COALESCE(GROUP_CONCAT(DISTINCT gr.GenreName ORDER BY gr.GenreName SEPARATOR ', '), '') AS Genres
			FROM Games g
			LEFT JOIN GameGenres gg ON g.GameID = gg.GameID
			LEFT JOIN Genres gr ON gg.GenreID = gr.GenreID
			LEFT JOIN GamePublishers gp ON g.GameID = gp.GameID
			LEFT JOIN Publishers p ON gp.PublisherID = p.PublisherID
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
 *     tags:
 *     - Games
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
 *                 Publishers:
 *                   type: string
 *                 AgeRating:
 *                   type: string
 *                 Genres:
 *                   type: string
 */
router.get("/games/:game_id", async (req, res) => {
	try {
		const query = `
SELECT 
				g.GameID, 
				g.GameTitle, 
				g.ReleaseDate, 
				COALESCE(GROUP_CONCAT(DISTINCT p.PublisherName ORDER BY p.PublisherName SEPARATOR ', '), '') AS Publishers,
				g.AgeRating, 
				COALESCE(GROUP_CONCAT(DISTINCT gr.GenreName ORDER BY gr.GenreName SEPARATOR ', '), '') AS Genres
			FROM Games g
			LEFT JOIN GameGenres gg ON g.GameID = gg.GameID
			LEFT JOIN Genres gr ON gg.GenreID = gr.GenreID
			LEFT JOIN GamePublishers gp ON g.GameID = gp.GameID
			LEFT JOIN Publishers p ON gp.PublisherID = p.PublisherID
			WHERE g.GameID=?
			GROUP BY g.gameID
    `;
		const gameID = parseInt(req.params.game_id);
		const results = await getData(query, [gameID]);
		if (results.length === 0) {
			return res.status(404).json({ error: "Game not found" });
		}
		res.json(results);
	} catch (error) {
		res.status(500).json({ error: "Failed to retrieve data", details: error.message });
	}
});

/**
 * @swagger
 * /api/games-genres:
 *   get:
 *     tags:
 *     - Games
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
 *                   Genres:
 *                     type: string
 */
router.get("/games-genres", async (req, res) => {
	try {
		const query = `
			SELECT g.GameTitle, 
			       GROUP_CONCAT(gr.GenreName ORDER BY gr.GenreName SEPARATOR ', ') AS Genres
			FROM GameGenres gg
			JOIN Games g ON gg.GameID = g.GameID
			JOIN Genres gr ON gg.GenreID = gr.GenreID
			GROUP BY g.GameID, g.GameTitle;
		`;
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
 *     tags:
 *     - Games
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
router.get("/games-platforms", async (req, res) => {
	try {
		const query = `
			SELECT g.GameTitle, 
			       GROUP_CONCAT(p.PlatformName ORDER BY p.PlatformName SEPARATOR ', ') AS Platforms
			FROM GamePlatforms gp
			JOIN Games g ON gp.GameID = g.GameID
			LEFT JOIN Platforms p ON gp.PlatformID = p.PlatformID
			GROUP BY g.GameID, g.GameTitle;
		`;
		const results = await getData(query);
		res.json(results);
	} catch (error) {
		res.status(500).json({ error: "Failed to retrieve data", details: error.message });
	}
});

/**
 * @swagger
 * /api/games-genres/{game_id}:
 *   get:
 *     tags:
 *     - Games
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
router.get("/games-genres/:game_id", async (req, res) => {
	try {
		const gameID = parseInt(req.params.game_id);
		const query = `SELECT g.GameTitle, gr.GenreName
    FROM GameGenres gg
    JOIN Games g ON gg.GameID = g.GameID
    JOIN Genres gr ON gg.GenreID = gr.GenreID
    WHERE g.GameID=?;`;
		const results = await getData(query, [gameID]);
		if (results.length === 0) {
			return res.status(404).json({ error: "Game not found" });
		}
		res.json(results);
	} catch (error) {
		res.status(500).json({ error: "Failed to retrieve data", details: error.message });
	}
});

/**
 * @swagger
 * /api/games-release:
 *   get:
 *     tags:
 *     - Games
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
router.get("/games-release", async (req, res) => {
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
 *     tags:
 *     - Games
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
router.get("/games-release/:game_id", async (req, res) => {
	const gameID = parseInt(req.params.game_id);
	try {
		const query = `SELECT GameTitle, ReleaseDate FROM Games WHERE GameID=?`
		const results = await getData(query, [gameID]);
		if (results.length === 0) {
			return res.status(404).json({ error: "Game not found" });
		}
		res.json(results);
	} catch (error) {
		res.status(500).json({ error: "Failed to retrieve data", details: error.message });
	}
});

/**
 * @swagger
 * /api/genres:
 *   get:
 *     tags:
 *     - Games
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
router.get("/genres", async (req, res) => {
	try {
		const query = `SELECT GenreID, GenreName FROM Genres`;
		const results = await getData(query);
		res.json(results);
	} catch (error) {
		res.status(500).json({ error: "Failed to retrieve data", details: error.message });
	}
});

/**
 * @swagger
 * /api/games:
 *   post:
 *     tags:
 *     - Games
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
router.post("/games", async (req, res) => {
	try {
		const { GameTitle, ReleaseDate, Publisher, AgeRating } = req.body;
		const query = `INSERT INTO Games(GameTitle, ReleaseDate, AgeRating) VALUES (?, ?, ?)`;

		const [result] = await (await connection).query(query, [GameTitle, ReleaseDate, AgeRating]);
		res.status(201).json({ message: "Game created successfully", insertId: result.insertId });
	} catch (error) {
		console.error("Error inserting data:", error);
		res.status(500).json({ error: "Failed to create game", details: error.message });
	} finally {
		connection.release();
	}
});

/**
 * @swagger
 * /api/games-genres:
 *   post:
 *     tags:
 *     - Games
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
router.post("/games-genres", async (req, res) => {

	try {
		const { GameID, GenreID } = req.body;
		const query = `INSERT INTO GameGenres(GameID, GenreID) VALUES (?, ?)`;

		const [result] = await (await connection).query(query, [GameID, GenreID]);
		res.status(201).json({ message: "Data inserted successfully", insertId: result.insertId });
	} catch (error) {
		console.error("Error inserting data:", error);
		res.status(500).json({ error: "Failed to post data", details: error.message });
	} finally {
	}
});

/**
 * @swagger
 * /api/publishers:
 *   get:
 *     tags:
 *     - Games
 *     summary: Get all publishers
 *     description: Retrieve a list of all available publishers
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
 *                   PublisherID:
 *                     type: integer
 *                   PublisherName:
 *                     type: string
 */
router.get("/publishers", async (req, res) => {
	try {
		const query = `SELECT * FROM Publishers`;
		const results = await getData(query);
		res.json(results);
	} catch (error) {
		res.status(500)({ error: "Failed to retrive data", details: error.message });
	}
});

/**
 * @swagger
 * /api/publishers:
 *   post:
 *     tags:
 *     - Games
 *     summary: Create a new publisher
 *     description: Insert a new publisher record into the database
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *              PublisherName:
 *                type: string
 *     responses:
 *       201:
 *         description: Publisher created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 insertId:
 *                   type: integer
 *                   description: The ID of the inserted publisher
 *       500:
 *         description: Failed to create game
 */
router.post("/publishers", async (req, res) => {
	try {
		const { PublisherName } = req.body;
		const query = `INSERT INTO Publishers(PublisherName) VALUES (?)`;
		const [result] = await (await connection).query(query, [[PublisherName]]);
		res.status(201).json({ message: "Data inserted successfully", insertId: result.insertId });
	} catch (error) {
		console.error("Error inserting data:", error);
		res.status(500).json({ error: "Failed to post data", details: error.message });
	} finally {
	}
});

/**
 * @swagger
 * /api/games-publishers:
 *   get:
 *     tags:
 *     - Games
 *     summary: Get games and their publishers
 *     description: Retrieve a list of all games with their publishers
 *     responses:
 *       200:
 *         description: A list of games with their publishers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   GameTitle:
 *                     type: string
 *                   Publishers:
 *                     type: string
 */
router.get("/games-publishers", async (req, res) => {
	try {
		const query = `SELECT 
	g.GameTitle,
	GROUP_CONCAT(p.PublisherName ORDER BY p.PublisherName SEPARATOR ', ') AS Publishers
FROM GamePublishers gp
JOIN Games g ON gp.GameID = g.GameID
JOIN Publishers p ON gp.PublisherID = p.PublisherID
GROUP BY g.GameTitle;`;
		const results = await getData(query);
		res.json(results);
	} catch (error) {
		res.status(500).json({ error: "Failed to retrieve data", details: error.message });
	}
});

/**
 * @swagger
 * /api/games-genres/{game_id}:
 *   get:
 *     tags:
 *     - Games
 *     summary: Get game publishers by game ID
 *     description: Retrieve publishers for a specific game by its ID
 *     parameters:
 *       - in: path
 *         name: game_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Publishers associated with the game
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   GameTitle:
 *                     type: string
 *                   Publishers:
 *                     type: string
 */
router.get("/games-publishers/:game_id", async (req, res) => {
	try {
		const gameID = parseInt(req.params.game_id);
		const query = `SELECT 
	g.GameTitle,
	GROUP_CONCAT(p.PublisherName ORDER BY p.PublisherName SEPARATOR ', ') AS Publishers
FROM GamePublishers gp
JOIN Games g ON gp.GameID = g.GameID
JOIN Publishers p ON gp.PublisherID = p.PublisherID
GROUP BY g.GameTitle
WHERE g.GameID=?`;
		const results = await getData(query, [gameID]);
		if (results.length === 0) {
			return res.status(404).json({ error: "Game not found" });
		}
		res.json(results);
	} catch (error) {
		res.status(500).json({ error: "Failed to retrieve data", details: error.message });
	}
});

/**
 * @swagger
 * /api/games-publishers:
 *   post:
 *     tags:
 *     - Games
 *     summary: Create a new game-publisher relationship
 *     description: Insert a new record into the GamePublishers table, linking a game and a publisher.
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
 *               PublisherID:
 *                 type: integer
 *                 description: The ID of the publisher
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
router.post("/games-publishers", async (req, res) => {
	try {
		const { GameID, PublisherID } = req.body;
		const query = `INSERT INTO GamePublishers(GameID, PublisherID) VALUES (?, ?)`;
		const [result] = await (await connection).query(query, [GameID, PublisherID]);
		res.status(201).json({ message: "Data inserted successfully", insertId: result.insertId });
	} catch (error) {
		console.error("Error inserting data:", error);
		res.status(500).json({ error: "Failed to post data", details: error.message });
	} finally {
	}
});

module.exports = router;
