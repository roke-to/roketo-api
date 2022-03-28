import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';

import { AppService } from './app.service';
import { NearAuthGuard } from './auth/guards/near-auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseGuards(NearAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    return req.user;
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
