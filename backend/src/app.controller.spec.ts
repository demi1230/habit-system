import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('returns a health payload', () => {
    const response = appController.getHealth();

    expect(response.status).toBe('ok');
    expect(response.service).toBe(
      'behavior-based-habit-formation-system-backend',
    );
    expect(response.timestamp).toEqual(expect.any(String));
  });
});
