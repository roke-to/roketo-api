import { ArchiveService } from './archive.service';
import { Controller, Get, Req } from '@nestjs/common';
import { Public } from '../auth/guards/jwt-auth.guard';

@Controller('archive')
export class ArchiveController {
  constructor(private readonly archiveService: ArchiveService) {}

  // public decorator need to be deleted
  @Public()
  @Get()
  findAll(@Req() req) {
    // console.log(this.archiveService.findAll(req.user.accountId)
    return this.archiveService.findAll('katherine8.testnet');
  }
}
