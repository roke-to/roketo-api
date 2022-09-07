import { Archive } from './archive.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
// import { JwtService } from '@nestjs/jwt';
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
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async create(finishedStream) {
    const stream = this.archiveRepository.create(finishedStream);
    await this.archiveRepository.save(stream);
  }
}
