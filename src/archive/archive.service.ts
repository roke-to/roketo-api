import { Archive } from './archive.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ArchiveService {
  constructor(
    @InjectRepository(Archive)
    private readonly archiveRepository: Repository<Archive>,
  ) {}

  async findAll(accountId: string): Promise<Archive[]> {
    return this.archiveRepository.find({
      where: { accountId },
      order: { startedAt: 'DESC' },
      take: 100,
    });
  }
}
