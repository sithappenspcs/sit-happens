import { Test, TestingModule } from '@nestjs/testing';
import { PetProfilesController } from './pet-profiles.controller';

describe('PetProfilesController', () => {
  let controller: PetProfilesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PetProfilesController],
    }).compile();

    controller = module.get<PetProfilesController>(PetProfilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
