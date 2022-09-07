import { Test, TestingModule } from '@nestjs/testing';
import { ArchiveController } from './archive.controller';

describe('ArchiveController', () => {
  let controller: ArchiveController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArchiveController],
    }).compile();

    controller = module.get<ArchiveController>(ArchiveController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
