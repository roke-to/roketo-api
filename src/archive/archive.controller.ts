import { ArchiveService } from './archive.service';
import { Controller, Get, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('archive')
@ApiBearerAuth()
@Controller('archive')
export class ArchiveController {
  constructor(private readonly archiveService: ArchiveService) {}

  @Get()
  findAll(@Req() req) {
    console.log(this.archiveService.findAll(req.user.accountId))
  }
}
