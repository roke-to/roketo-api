import { Test, TestingModule } from '@nestjs/testing';
import { NftStreamsController } from './nft_streams.controller';
import { NftStreamsService } from './nft_streams.service';

describe('NftStreamsController', () => {
  let controller: NftStreamsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NftStreamsController],
      providers: [NftStreamsService],
    }).compile();

    controller = module.get<NftStreamsController>(NftStreamsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
