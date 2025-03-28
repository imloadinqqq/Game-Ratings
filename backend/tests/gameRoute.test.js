const request = require('supertest');
const express = require('express');
const gameRouter = require('../routes/games');
const { getData } = require('../db');

process.env.API_KEY = 'test-api-key';

jest.mock('../db', () => ({
	getData: jest.fn(),
	release: jest.fn(),
}));

jest.mock('mysql2', () => ({
	createPool: jest.fn(() => ({
		promise: () => ({
			getConnection: jest.fn().mockResolvedValue({
				query: jest.fn().mockResolvedValue([]),
				release: jest.fn(),
			}),
		}),
	})),
}));

const app = express();
app.use(express.json());

app.use('/api', (req, res, next) => {
	req.headers['X-API-KEY'] = 'test-api-key';
	next();
});
app.use('/api', gameRouter);

describe('GET /api/games', () => {
	it('should return a list of games', async () => {
		const mockGames = [
			{
				GameID: 1,
				GameTitle: 'Game One',
				ReleaseDate: '2023-01-01',
				Publishers: 'Publisher One',
				AgeRating: 'E',
				Genres: 'Action, Adventure',
				Platforms: 'Xbox',
			},
			{
				GameID: 2,
				GameTitle: 'Game Two',
				ReleaseDate: '2024-02-02',
				Publishers: 'Publisher Two',
				AgeRating: 'T',
				Genres: 'RPG',
				Platforms: 'Xbox',
			},
		];

		getData.mockResolvedValue(mockGames);

		const res = await request(app)
			.get('/api/games')
			.set('X-API-KEY', 'test-api-key');

		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual(mockGames);
		expect(getData).toHaveBeenCalledTimes(1);
	});

	it('should return a 500 status code if the query fails', async () => {
		getData.mockRejectedValue(new Error('Database error'));

		const res = await request(app)
			.get('/api/games')
			.set('X-API-KEY', 'test-api-key');

		expect(res.statusCode).toBe(500);
		expect(res.body).toHaveProperty('error', 'Failed to retrieve data');
	});
});

describe('GET /api/games/:game_id', () => {
	it('should return the correct game details', async () => {
		const mockGame = {
			GameID: 1,
			GameTitle: 'Game One',
			ReleaseDate: '2023-01-01',
			Publishers: 'Publisher One',
			AgeRating: 'E',
			Genres: 'Action, Adventure',
			Platforms: 'Xbox',
		};

		getData.mockResolvedValue(mockGame);

		const res = await request(app)
			.get(`/api/games/1`)
			.set('X-API-KEY', 'test-api-key');

		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual(mockGame);
		expect(getData).toHaveBeenCalledWith(expect.any(String), [1]);
	});

	it('should return 404 if game is not found', async () => {
		getData.mockResolvedValue([])

		const res = await request(app)
			.get(`/api/games/999`)
			.set('X-API-KEY', 'test-api-key');

		expect(res.statusCode).toBe(404);
		expect(res.body).toHaveProperty('error', 'Game not found');
	});

	it('should return a 500 status code if the query fails', async () => {
		getData.mockRejectedValue(new Error('Database error'));

		const res = await request(app)
			.get('/api/games/1')
			.set('X-API-KEY', 'test-api-key');

		expect(res.statusCode).toBe(500);
		expect(res.body).toHaveProperty('error', 'Failed to retrieve data');
	});
});

describe('GET /games-genres', () => {
	it('should return a list of games with their genres', async () => {
		const mockGameGenre = {
			GameTitle: "Game One",
			Genres: "Action, Adventure",
		};

		getData.mockResolvedValue(mockGameGenre);


		const res = await request(app)
			.get(`/api/games-genres`)
			.set('X-API-KEY', 'test-api-key');

		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual(mockGameGenre);
	});

	it('should return a 500 status code if the query fails', async () => {
		getData.mockRejectedValue(new Error('Database error'));

		const res = await request(app)
			.get('/api/games-genres')
			.set('X-API-KEY', 'test-api-key');

		expect(res.statusCode).toBe(500);
		expect(res.body).toHaveProperty('error', 'Failed to retrieve data');
	});
});

describe('GET /api/games-genres/:game_id', () => {
	it('should return the correct game details', async () => {
		const mockGameGenre = {
			GameTitle: "Game One",
			Genres: "Action, Adventure",
		};

		getData.mockResolvedValue(mockGameGenre);

		const res = await request(app)
			.get(`/api/games-genres/1`)
			.set('X-API-KEY', 'test-api-key');

		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual(mockGameGenre);
		expect(getData).toHaveBeenCalledWith(expect.any(String), [1]);
	});

	it('should return 404 if game is not found', async () => {
		getData.mockResolvedValue([])

		const res = await request(app)
			.get(`/api/games-genres/999`)
			.set('X-API-KEY', 'test-api-key');

		expect(res.statusCode).toBe(404);
		expect(res.body).toHaveProperty('error', 'Game not found');
	});

	it('should return a 500 status code if the query fails', async () => {
		getData.mockRejectedValue(new Error('Database error'));

		const res = await request(app)
			.get('/api/games-genres/:game_id')
			.set('X-API-KEY', 'test-api-key');

		expect(res.statusCode).toBe(500);
		expect(res.body).toHaveProperty('error', 'Failed to retrieve data');
	});
});

describe('GET /games-platforms', () => {
	it('should return a list of games with their platforms', async () => {
		const mockGamePlatform = [
			{
				GameTitle: "Game One",
				Platforms: "Platform One, Platform Two",
			},
			{
				GameTitle: "Game Two",
				Platforms: "Platform Two, Platform Three",
			}
		];

		getData.mockResolvedValue(mockGamePlatform);


		const res = await request(app)
			.get(`/api/games-platforms`)
			.set('X-API-KEY', 'test-api-key');

		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual(mockGamePlatform);
	});

	it('should return a 500 status code if the query fails', async () => {
		getData.mockRejectedValue(new Error('Database error'));

		const res = await request(app)
			.get('/api/games-platforms')
			.set('X-API-KEY', 'test-api-key');

		expect(res.statusCode).toBe(500);
		expect(res.body).toHaveProperty('error', 'Failed to retrieve data');
	});
});

describe('GET /api/games-release', () => {
	it('should return a list of games with their release date', async () => {
		const mockGameRelease = [
			{
				GameTitle: "Game One",
				ReleaseDate: "1111-11-11",
			},
			{
				GameTitle: "Game Two",
				ReleaseDate: "1111-11-11",
			}
		];

		getData.mockResolvedValue(mockGameRelease);

		const res = await request(app)
			.get(`/api/games-release`)
			.set('X-API-KEY', 'test-api-key');

		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual(mockGameRelease);
	});

	it('should return a 500 status code if the query fails', async () => {
		getData.mockRejectedValue(new Error('Database error'));

		const res = await request(app)
			.get('/api/games-release')
			.set('X-API-KEY', 'test-api-key');

		expect(res.statusCode).toBe(500);
		expect(res.body).toHaveProperty('error', 'Failed to retrieve data');
	});
});

describe('GET /api/games-release/:game_id', () => {
	it('should return the correct game title and release date', async () => {
		const mockGameRelease = {
			GameTitle: "Game One",
			ReleaseDate: "1111-11-11",
		};

		getData.mockResolvedValue(mockGameRelease);

		const res = await request(app)
			.get(`/api/games-release/1`)
			.set('X-API-KEY', 'test-api-key');

		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual(mockGameRelease);
		expect(getData).toHaveBeenCalledWith(expect.any(String), [1]);
	});

	it('should return 404 if game is not found', async () => {
		getData.mockResolvedValue([])

		const res = await request(app)
			.get(`/api/games-release/999`)
			.set('X-API-KEY', 'test-api-key');

		expect(res.statusCode).toBe(404);
		expect(res.body).toHaveProperty('error', 'Game not found');
	});

	it('should return a 500 status code if the query fails', async () => {
		getData.mockRejectedValue(new Error('Database error'));

		const res = await request(app)
			.get('/api/games-release/:game_id')
			.set('X-API-KEY', 'test-api-key');

		expect(res.statusCode).toBe(500);
		expect(res.body).toHaveProperty('error', 'Failed to retrieve data');
	});
});

/* TODO
describe('POST /api/games', () => {
	it('should return 201 created with the correct game data', async () => {
		const gameData = {
			GameTitle: "Game One",
			ReleaseDate: "1111-11-11",
			AgeRating: "E"
		};

		try {
			const res = await request(app)
				.post('/api/games')
				.send(gameData)
				.set('X-API-KEY', 'test-api-key');

			console.log(typeof (res.body));
			console.log(res.body);

			expect(res.statusCode).toBe(201);
			expect(response.body).toHaveProperty("message", "Game created successfully");
			expect(response.body).toHaveProperty("insertId", 1);

		} catch (error) {
			// Catch any unexpected errors
			console.error("Test encountered an error:", error);
			throw error; // Ensure the test fails if an error occurs
		}
	});
});
*/

describe('POST /api/games-genres', () => {

});


describe('GET /api/publishers', () => {

});

describe('POST /api/publishers', () => {

});

describe('GET /api/games-publishers/:game_id', () => {

});

describe('POST /api/games-publishers', () => {

});


