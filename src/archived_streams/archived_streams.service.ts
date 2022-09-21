import { ArchivedStreams } from './archived_streams.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ArchivedStreamsService {
  constructor(
    @InjectRepository(ArchivedStreams)
    private readonly archivedStreamsRepository: Repository<ArchivedStreams>,
  ) {}

  async findAll(accountId: string): Promise<ArchivedStreams[]> {
    return this.archivedStreamsRepository.find({
      where: { accountId },
      order: { startedAt: 'DESC' },
      take: 100,
    });
  }
}
