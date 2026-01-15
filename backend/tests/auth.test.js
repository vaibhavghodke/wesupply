const request = require('supertest');
const app = require('../server');
const db = require('../db');
const bcrypt = require('bcryptjs');

beforeAll(async () => {
  // insert a test user (ignore if exists)
  const pw = await bcrypt.hash('testpass', 10);
  await new Promise((resolve, reject) => {
    db.run('INSERT OR IGNORE INTO users (id, firstname, lastname, userid, password, email, role) VALUES (?, ?, ?, ?, ?, ?, ?)', [9999, 'Test', 'User', 'testuser', pw, 'test@example.com', 'user'], function(err) {
      if (err) return reject(err);
      resolve();
    });
  });
});

describe('Auth routes', () => {
  test('login with valid credentials sets cookie and /me returns user', async () => {
    const agent = request.agent(app);
    const loginRes = await agent.post('/api/auth/login').send({ userid: 'testuser', password: 'testpass' });
    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body).toHaveProperty('ok', true);

    const me = await agent.get('/api/auth/me');
    expect(me.statusCode).toBe(200);
    expect(me.body.user).toBeTruthy();
    expect(me.body.user.userid).toBe('testuser');
  });

  test('login with invalid credentials returns 401', async () => {
    const res = await request(app).post('/api/auth/login').send({ userid: 'nope', password: 'bad' });
    expect(res.statusCode).toBe(401);
  });
});
