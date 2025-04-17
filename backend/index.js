const express = require("express");
const swaggerUI = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");
const cors = require("cors");
const morgan = require("morgan");
const userRouter = require("./routes/users");
const gameRouter = require("./routes/games");
const authenticateToken = require("./auth");
//const ratingRouter = require("./routes/ratings");

const app = express();
const port = 8080;

// Cross origin
app.use(cors({
	origin: "http://localhost:4200",
	methods: ["GET", "POST", "PUT", "DELETE"],
	allowedHeaders: ["X-API-KEY", "Content-Type"],
	credentials: true
}));

app.use(express.json());
app.use(morgan('tiny'));
app.disable('x-powered-by');

// Swagger Configuration
const swaggerOptions = {
	swaggerDefinition: {
		openapi: "3.0.0",
		info: {
			title: "Games API",
			version: "1.0.0",
			description: "API to manage games, genres, platforms, and user ratings",
		},
		components: {
			securitySchemes: {
				ApiKeyAuth: {
					type: "apiKey",
					in: "header",
					name: "X-API-KEY"
				}
			}
		},
		security: [{ ApiKeyAuth: [] }],
		servers: [
			{
				url: `http://localhost:${port}`,
			},
		],
	},
	apis: ["./index.js", "./routes/users.js", "./routes/games.js"],
};

const apiKeyMiddleware = (req, res, next) => {
	const apiKey = req.header("X-API-KEY");
	if (!apiKey || apiKey !== process.env.API_KEY) {
		return res.status(401).json({ message: "Unauthorized: Invalid API Key" });
	}
	next();
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);

app.use("/api/users", userRouter);
app.use("/api/", gameRouter);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
