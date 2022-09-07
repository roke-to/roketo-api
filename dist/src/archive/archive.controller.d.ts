import { ArchiveService } from './archive.service';
export declare class ArchiveController {
    private readonly archiveService;
    constructor(archiveService: ArchiveService);
    findAll(req: any): Promise<import("./archive.entity").Archive[]>;
}
