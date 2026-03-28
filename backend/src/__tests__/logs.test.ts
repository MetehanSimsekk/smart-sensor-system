import request from 'supertest';
import { app } from '../app';

describe('Log Endpoints', () => {
  it('token olmadan loglar görüntülenememeli', async () => {
    const res = await request(app).get('/api/logs');
    expect(res.status).toBe(401);
  });

  it('token olmadan log oluşturulamamalı', async () => {
    const res = await request(app).post('/api/logs').send({});
    expect(res.status).toBe(401);
  });

  it('token olmadan analytics görüntülenememeli', async () => {
    const res = await request(app).get('/api/logs/analytics');
    expect(res.status).toBe(401);
  });
});