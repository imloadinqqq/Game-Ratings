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
			},
			{
				GameID: 2,
				GameTitle: 'Game Two',
				ReleaseDate: '2024-02-02',
				Publishers: 'Publisher Two',
				AgeRating: 'T',
				Genres: 'RPG',
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
