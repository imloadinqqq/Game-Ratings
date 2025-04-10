
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
	origin: "http://localhost:4200",
	methods: ["GET"],
	allowedHeaders: ["X-API-KEY", "Content-Type"]
}));

app.get('/api/key', (req, res) => {
	res.json({ apiKey: process.env.API_KEY });
});

app.listen(3000, () => console.log('Server running on port 3000'));
