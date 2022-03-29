import { Controller, Post, Request, UseGuards } from '@nestjs/common';

import { NearAuthGuard } from './guards/near-auth.guard';
import { AuthService } from './auth.service';
import { Public } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(NearAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
}
