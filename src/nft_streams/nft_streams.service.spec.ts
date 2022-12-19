import { Test, TestingModule } from '@nestjs/testing';
import { NftStreamsService } from './nft_streams.service';

describe('NftStreamsService', () => {
  let service: NftStreamsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NftStreamsService],
    }).compile();

    service = module.get<NftStreamsService>(NftStreamsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
