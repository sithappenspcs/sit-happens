import { Test, TestingModule } from '@nestjs/testing';
import { StaffOperationsController } from './staff-operations.controller';

describe('StaffOperationsController', () => {
  let controller: StaffOperationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StaffOperationsController],
    }).compile();

    controller = module.get<StaffOperationsController>(StaffOperationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
