import { Test, TestingModule } from '@nestjs/testing';
import { ArchiveService } from './archive.service';

describe('ArchiveService', () => {
  let service: ArchiveService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ArchiveService],
    }).compile();

    service = module.get<ArchiveService>(ArchiveService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
