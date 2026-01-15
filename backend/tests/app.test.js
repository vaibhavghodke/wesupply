const request = require('supertest');
const app = require('../server');

describe('Basic server smoke tests', () => {
  test('GET / should respond with status ok', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });
});
