import { Controller, Get, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ArchiveService } from './archive.service';

@ApiTags('archive')
@ApiBearerAuth()
@Controller('archive')
export class ArchiveController {
  constructor(private readonly archiveService: ArchiveService) {}

  @Get()
  findAll(@Req() req) {
    return this.archiveService.findAll(req.user.accountId);
  }
}
