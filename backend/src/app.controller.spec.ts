import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { PrismaService } from './prisma/prisma.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: PrismaService, useValue: { $queryRaw: jest.fn().mockResolvedValue([]) } }],
    }).compile();
    appController = app.get<AppController>(AppController);
  });

  it('ping returns ok', async () => {
    const result = await appController.ping();
    expect(result.status).toBe('ok');
  });
});
