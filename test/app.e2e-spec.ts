import { Test } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { setupApp } from '../src/setup-app.js';

describe('OrderFlow Core (e2e)', () => {
    let app: NestExpressApplication;
    let token: string;

    beforeAll(async () => {
      const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
      app = setupApp(moduleRef.createNestApplication<NestExpressApplication>());   // ← la misma config que main
      await app.init();

      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'cliente@orderflow.dev', password: 'Password123!' })
        .expect(200);
      token = res.body.data.accessToken;
    });

    afterAll(() => app.close());

    it('todo está cerrado salvo @Public', () =>
      request(app.getHttpServer()).get('/api/auth/me').expect(401));

    it('nunca devuelve el hash', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/auth/me').set('Authorization', `Bearer ${token}`).expect(200);
      expect(JSON.stringify(res.body)).not.toContain('argon2');
    });

    it('los errores tienen formato único y requestId', async () => {
      const res = await request(app.getHttpServer()).get('/api/auth/me').expect(401);
      expect(res.body).toMatchObject({
        statusCode: 401, code: 'UNAUTHORIZED', requestId: expect.any(String),
      });
      expect(res.headers['x-request-id']).toBe(res.body.requestId);
    });

    it('un cliente no puede crear productos', () =>
      request(app.getHttpServer())
        .post('/api/products').set('Authorization', `Bearer ${token}`)
        .send({ name: 'x', price: 1, category: 'food' })
        .expect(403));

    it('no se crea un admin por mass assignment', () =>
      request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'h@x.com', password: 'Password123!', role: 'admin' })
        .expect(400));
});
