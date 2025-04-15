const express = require("express");
const router = express.Router();
const { getData, dbConfig } = require("../db.js");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

//routes
/**
 * @swagger
 * /api/users:
 *   get:
 *     tags:
 *     - Users
 *     summary: Get all users
 *     description: Retrieve a list of all created users
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   UserID:
 *                     type: integer
 *                   UserName:
 *                     type: string
 *                   PasswordHashed:
 *                     type: string
 */
router.get("/", async (req, res) => {
	try {
		const query = `SELECT * FROM Users`;
		const results = await getData(query);
		res.json(results);
	} catch (error) {
		res.status(500).json({ error: "Failed to retrieve data", details: error.message });
	}
});

/**
 * @swagger
 * /api/users/createUser:
 *   post:
 *     tags:
 *     - Users
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
router.post("/createUser", async (req, res) => {
	try {

		const { UserName, PasswordHashed } = req.body;
		const salt = bcrypt.genSaltSync(Math.random());
		const hash = await bcrypt.hash(`${PasswordHashed}`, salt);
		const query = `INSERT INTO Users(UserName, PasswordHashed) VALUES (?, ?)`;

		const [result] = await (await connection).query(query, [UserName, hash]);
		res.status(201).json({ message: "Data inserted successfully", insertId: result.insertId });
	} catch (error) {
		console.error("Error inserting data:", error);
		res.status(500).json({ error: "Failed to post data", details: error.message });
	} finally {
		if (connection) {
		}
	}
});

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     tags:
 *     - Users
 *     summary: Log in user
 *     description: Log in user and generate jwt token on success
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
router.post("/login", async (req, res) => { // user login
	try {

		const { UserName, PasswordHashed } = req.body; // values from request body

		const result = await getData(`SELECT PasswordHashed FROM Users WHERE UserName='${UserName}'`); // retrieving the PasswordHashed

		if (!result || result.length === 0) {
			return res.status(401).json({ error: "Invalid username or password" });
		}

		const passwordhashed = result[0].PasswordHashed;

		var match = await bcrypt.compare(PasswordHashed, passwordhashed); // true false
		console.log("matching");
		console.log(match);

		if (match) {
			const userIDResult = await getData(`SELECT UserID FROM Users WHERE UserName='${UserName}'`);
			const userID = userIDResult[0].UserID;

			const payload = { userID }; // data being stored in token
			const token = jwt.sign(payload, 'placeholder', { expiresIn: '1h' }); // token creation, want to be able to have a quick login by getting the userID from token and checking if they match, will be looking into this..
			const message = "Successful sign in!";
			console.log(token);
			return res.status(200).json({ userID: userIDResult[0].UserID, token, message });
		} else {
			return res.status(401).json({ error: "Invalid username or password" });
		}

	} catch (error) {
		console.log("failed");
		console.error("Error logging in user:", error);
		res.status(500).json({ error: "Failed to log user in", details: error.message });
	}

	finally { }
});


/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     tags:
 *     - Users
 *     summary: Update a user's details
 *     description: Update user information such as username by their ID.
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
router.patch("/:id", async (req, res) => {
	const id = parseInt(req.params.id);

	try {
		const { UserName, PasswordHashed } = req.body;

		let query = "UPDATE Users SET UserName = ?";
		const params = [UserName];

		// If PasswordHashed is provided, hash and update it
		if (PasswordHashed) {
			const salt = bcrypt.genSaltSync(10);
			const hash = await bcrypt.hash(PasswordHashed, salt);
			query += ", PasswordHashed = ?";
			params.push(hash);
		}

		query += " WHERE UserID = ?";
		params.push(id);

		const [result] = await (await connection).query(query, params);

		if (result.affectedRows === 0) {
			return res.status(404).json({ error: "User not found" });
		}

		res.status(200).json({ message: "User updated successfully" });
	} catch (error) {
		console.error("Error updating user:", error);
		res.status(500).json({ error: "Failed to update user data", details: error.message });
	} finally {
	}
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     tags:
 *     - Users
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
router.delete("/:id", async (req, res) => {
	const id = parseInt(req.params.id);

	try {
		const query = `DELETE FROM Users WHERE UserID=?`;
		const [result] = await (await connection).query(query, [id]);

		if (result.affectedRows === 0) {
			return res.status(404).json({ error: "User not found" });
		}

		res.status(200).json({ message: "Data deleted successfully", deletedId: id });
	} catch (error) {
		console.error("Error deleting data:", error);
		res.status(500).json({ error: "Failed to delete data", details: error.message });
	} finally {
	}
});

module.exports = router;
