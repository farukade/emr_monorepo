import { Test, TestingModule } from '@nestjs/testing';
import { HmoController } from './hmo.controller';

describe('Hmo Controller', () => {
  let controller: HmoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HmoController],
    }).compile();

    controller = module.get<HmoController>(HmoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
