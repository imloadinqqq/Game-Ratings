
require('dotenv').config();
const express = require('express');
const app = express();

app.get('/api/key', (req, res) => {
	res.json({ apiKey: process.env.API_KEY });
});

app.listen(3000, () => console.log('Server running on port 3000'));
