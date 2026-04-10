import 'reflect-metadata';
jest.mock('./../src/infrastructure/prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/infrastructure/prisma/prisma.service';

describe('Backend foundation (e2e)', () => {
  const userId = '8e42d9f7-36f5-4d1c-8f3d-90ddf1fb878f';

  const prismaMock = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    user: {
      findUnique: jest.fn().mockResolvedValue({
        id: userId,
        email: 'user@example.com',
        passwordHash: 'hash',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    },
    habit: {
      findMany: jest.fn().mockResolvedValue([]),
    },
  };

  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', async () => {
    const response = await request(app.getHttpServer()).get('/').expect(200);

    expect(response.body.status).toBe('ok');
    expect(response.body.service).toBe(
      'behavior-based-habit-formation-system-backend',
    );
    expect(response.body.timestamp).toEqual(expect.any(String));
  });

  it('/users/:userId/habits (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get(`/users/${userId}/habits`)
      .expect(200);

    expect(response.body).toEqual([]);
  });
});
