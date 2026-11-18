import 'reflect-metadata';
jest.mock('./../src/infrastructure/prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));
// The generated Prisma client is an ES module (it uses `import.meta`), which
// Jest's CommonJS runtime cannot load. Repositories only need these runtime
// values from it; the database itself is replaced by `prismaMock` below.
jest.mock('./../src/generated/prisma/client', () => ({
  PrismaClient: class PrismaClient {},
  Prisma: { JsonNull: null },
}));

import type { NestExpressApplication } from '@nestjs/platform-express';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { configureApp } from './../src/app.setup';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/infrastructure/prisma/prisma.service';

const TEST_JWT_SECRET = 'e2e-test-secret';

describe('Backend foundation (e2e)', () => {
  const userId = '8e42d9f7-36f5-4d1c-8f3d-90ddf1fb878f';
  const otherUserId = '0b7f6c1e-2d4a-4c55-9f0e-6a2b3c4d5e6f';

  const prismaMock = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
    },
    habit: {
      findMany: jest.fn().mockResolvedValue([]),
    },
  };

  let app: NestExpressApplication;
  let originalJwtSecret: string | undefined;

  const tokenFor = (sub: string) =>
    new JwtService({ secret: TEST_JWT_SECRET }).sign({
      sub,
      email: 'user@example.com',
    });

  beforeAll(() => {
    // Use a fixed secret so the test does not depend on a local .env file.
    originalJwtSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = TEST_JWT_SECRET;
  });

  afterAll(() => {
    if (originalJwtSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalJwtSecret;
    }
  });

  beforeEach(async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: userId,
      email: 'user@example.com',
      passwordHash: 'hash',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    // Same prefix and validation as production (src/main.ts).
    configureApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET) reports service health', async () => {
    const response = await request(app.getHttpServer()).get('/api').expect(200);
    const body = response.body as {
      status: string;
      service: string;
      timestamp: string;
    };

    expect(body.status).toBe('ok');
    expect(body.service).toBe('behavior-based-habit-formation-system-backend');
    expect(body.timestamp).toEqual(expect.any(String));
  });

  it('/users/:userId/habits (GET) rejects requests without a token', async () => {
    await request(app.getHttpServer())
      .get(`/api/users/${userId}/habits`)
      .expect(401);
  });

  it("/users/:userId/habits (GET) rejects another user's token", async () => {
    await request(app.getHttpServer())
      .get(`/api/users/${userId}/habits`)
      .set('Authorization', `Bearer ${tokenFor(otherUserId)}`)
      .expect(403);
  });

  it('/users/:userId/habits (GET) returns the owner habits', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/users/${userId}/habits`)
      .set('Authorization', `Bearer ${tokenFor(userId)}`)
      .expect(200);

    expect(response.body).toEqual([]);
  });

  it('/auth/login (POST) is rate-limited per client', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    const attempt = () =>
      request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: 'wrong-password' });

    for (let i = 0; i < 10; i += 1) {
      await attempt().expect(401);
    }
    await attempt().expect(429);
  }, 30_000);

  it('/users/:userId/push-subscriptions (POST) rejects non-push-service endpoints', async () => {
    await request(app.getHttpServer())
      .post(`/api/users/${userId}/push-subscriptions`)
      .set('Authorization', `Bearer ${tokenFor(userId)}`)
      .send({
        endpoint: 'https://169.254.169.254/latest/meta-data',
        p256dh: 'key',
        auth: 'secret',
      })
      .expect(400);
  });
});
