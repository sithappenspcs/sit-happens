import { Test, TestingModule } from '@nestjs/testing';
import { StaffOperationsService } from './staff-operations.service';

describe('StaffOperationsService', () => {
  let service: StaffOperationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StaffOperationsService],
    }).compile();

    service = module.get<StaffOperationsService>(StaffOperationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
