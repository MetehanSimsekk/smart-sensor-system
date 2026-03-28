import request from 'supertest';
import { app } from '../app';

describe('Sensor Endpoints', () => {
  it('token olmadan 401 dönmeli', async () => {
    const res = await request(app).get('/api/sensors');
    expect(res.status).toBe(401);
  });

  it('token olmadan sensör oluşturulamamalı', async () => {
    const res = await request(app).post('/api/sensors').send({});
    expect(res.status).toBe(401);
  });
});