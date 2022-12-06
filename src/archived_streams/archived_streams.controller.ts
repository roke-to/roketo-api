import { Controller, Get, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ArchivedStreamsService } from './archived_streams.service';

@ApiTags('archived_streams')
@ApiBearerAuth()
@Controller('archived_streams')
export class ArchivedStreamsController {
  constructor(private readonly archiveService: ArchivedStreamsService) {}

  @Get()
  findArchivedStreams(@Req() req) {
    return this.archiveService.findAll(req.user.accountId);
  }
}
