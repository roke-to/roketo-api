import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { NearStrategy } from './strategies/near.strategy';

@Module({
  imports: [PassportModule],
  providers: [AuthService, NearStrategy],
})
export class AuthModule {}
