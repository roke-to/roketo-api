import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpStatus,
  Param,
  Patch,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';

import { UsersService } from './users.service';
import { Unauthorized } from '../common/dto/unauthorized.dto';
import { UpsertUserDto } from './upsert-user.dto';
import { Public } from '../auth/guards/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth()
  @Get(':accountId')
  @ApiUnauthorizedResponse({ type: Unauthorized })
  findOne(@Param('accountId') accountId: string, @Req() req) {
    if (req.user.accountId !== accountId) {
      throw new ForbiddenException();
    }

    return this.usersService.findOne(accountId);
  }

  @ApiBearerAuth()
  @Patch(':accountId')
  @ApiUnauthorizedResponse({ type: Unauthorized })
  upsert(
    @Param('accountId') accountId: string,
    @Req() req,
    @Body() body: UpsertUserDto,
  ) {
    if (req.user.accountId !== accountId) {
      throw new ForbiddenException();
    }

    if (Object.keys(body).length === 0) {
      return this.usersService.findOne(accountId);
    }

    return this.usersService.upsert(accountId, body);
  }

  @Public()
  @Get(':accountId/avatar')
  async getAvatarUrl(
    @Param('accountId') accountId: string,
    @Res() res: Response,
  ) {
    const url = await this.usersService.getAvatarUrl(accountId);

    return res.redirect(HttpStatus.TEMPORARY_REDIRECT, url);
  }
}
