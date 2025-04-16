const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
	const token = req.cookies.token;
	console.log("i hate my life");
	console.log(token);

	if (!token) {
		return res.status(401).json({ error: "No token provided" });
	}

	jwt.verify(token, process.env.SECRET, (err, decoded) => {
		if (err) {
			return res.status(403).json({ error: "Invalid token" });
		}
		req.user = decoded;
		next();
	});
};

module.exports = authenticateToken;
