import { Test, TestingModule } from '@nestjs/testing';
import { StaffPayoutsController } from './staff-payouts.controller';

describe('StaffPayoutsController', () => {
  let controller: StaffPayoutsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StaffPayoutsController],
    }).compile();

    controller = module.get<StaffPayoutsController>(StaffPayoutsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
