import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';

import { NearAuthGuard } from './guards/near-auth.guard';
import { AuthService } from './auth.service';
import { Public } from './guards/jwt-auth.guard';
import { LoginDto } from './login.dto';
import { BadRequest } from '../common/dto/bad-request.dto';
import { AccessTokenDto } from './access-token.dto';

@Public()
@UseGuards(NearAuthGuard)
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiBody({ type: LoginDto })
  @ApiCreatedResponse({
    description: 'Issues JWT for accessing all the other endpoints',
    type: AccessTokenDto,
  })
  @ApiBadRequestResponse({ type: BadRequest })
  login(@Request() req): AccessTokenDto {
    return this.authService.login(req.user);
  }
}
