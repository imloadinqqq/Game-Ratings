const express = require("express");
const mysql = require("mysql2");
const dotenv = require("dotenv");

const host = process.env.HOST;
const user = process.env.USER;
const pass = process.env.PASSWORD;
const database = process.env.DATABASE;

const connection = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "",
	database: "GameDB",
});

connection.connect(err => {
	if (err) {
		console.log(err);
	}

	console.log("Connected!");
});

const query = "SELECT * FROM Games;";
const query2 = `
	SELECT Games.GameTitle, Genres.GenreName AS genre_name
	FROM Games
	JOIN Genres ON Games.GenreID = Genres.GenreID;
`;
const query3 = `
	SELECT Games.GameTitle, Games.ReleaseDate
	FROM Games
`;

connection.query(query, (err, results, fields) => {

	if (err) throw err;
	console.log("LIST OF GAMES\n")
	// loop for each game
	results.forEach(function(row) {
		console.log(row);
	});
});

connection.query(query2, (err, results, fields) => {
	if (err) throw err;
	console.log("GAME/GENRE\n")
	results.forEach(function(row) {
		console.log(row);
	});
});

connection.query(query3, (err, results, fields) => {
	if (err) throw err;
	console.log("GAME/RELEASE_DATE\n")
	results.forEach(function(row) {
		console.log(row);
	});
});

connection.end();
