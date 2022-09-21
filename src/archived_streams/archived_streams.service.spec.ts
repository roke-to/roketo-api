import { Test, TestingModule } from '@nestjs/testing';
import { ArchivedStreamsService } from './archived_streams.service';

describe('ArchivedStreamsService', () => {
  let service: ArchivedStreamsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ArchivedStreamsService],
    }).compile();

    service = module.get<ArchivedStreamsService>(ArchivedStreamsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
