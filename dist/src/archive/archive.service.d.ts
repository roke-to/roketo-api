import { Archive } from './archive.entity';
import { Repository } from 'typeorm';
export declare class ArchiveService {
    private readonly archiveRepository;
    constructor(archiveRepository: Repository<Archive>);
    findAll(accountId: string): Promise<Archive[]>;
    create(finishedStream: any): Promise<void>;
}
