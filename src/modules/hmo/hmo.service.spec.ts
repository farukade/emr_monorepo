import { Test, TestingModule } from '@nestjs/testing';
import { HmoService } from './hmo.service';

describe('HmoService', () => {
  let service: HmoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HmoService],
    }).compile();

    service = module.get<HmoService>(HmoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
