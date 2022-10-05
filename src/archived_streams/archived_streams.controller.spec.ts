import { Test, TestingModule } from '@nestjs/testing';
import { ArchivedStreamsController } from './archived_streams.controller';

describe('ArchivedStreamsController', () => {
  let controller: ArchivedStreamsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArchivedStreamsController],
    }).compile();

    controller = module.get<ArchivedStreamsController>(ArchivedStreamsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
