import request from 'supertest';
import { app } from '../app';

describe('Auth Endpoints', () => {
  describe('POST /api/auth/login', () => {
    it('email olmadan 400 dönmeli', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/auth/me', () => {
    it('token olmadan 401 dönmeli', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });
});