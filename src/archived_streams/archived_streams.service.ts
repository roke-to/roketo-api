import { ArchivedStream } from './archived_stream.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ArchivedStreamsService {
  constructor(
    @InjectRepository(ArchivedStream)
    private readonly archivedStreamsRepository: Repository<ArchivedStream>,
  ) {}

  async findAll(accountId: string): Promise<ArchivedStream[]> {
    return this.archivedStreamsRepository.find({
      where: { accountId },
      order: { startedAt: 'DESC' },
      take: 100,
    });
  }
}
