import { Test, TestingModule } from '@nestjs/testing';
import { PetProfilesService } from './pet-profiles.service';

describe('PetProfilesService', () => {
  let service: PetProfilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PetProfilesService],
    }).compile();

    service = module.get<PetProfilesService>(PetProfilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
