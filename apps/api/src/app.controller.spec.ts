import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: PrismaService, useValue: { waitlistLead: { create: jest.fn() } } },
      ],
    }).compile();
    appController = app.get<AppController>(AppController);
  });

  it('health check returns ok', () => {
    const result = appController.healthCheck();
    expect(result.status).toBe('ok');
  });
});
