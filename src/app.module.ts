import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { NotificationsModule } from './notifications/notifications.module';
import { NearModule } from './near/near.module';
import { ContractModule } from './contract/contract.module';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: 'postgres://ocsyabkkhkcmow:66e37405a5823e3be8ce153eeba7db2e81a40ca7075321f3d2d0a5b0250b7b7b@ec2-3-217-251-77.compute-1.amazonaws.com:5432/dbtg2a2glq2orn',
      autoLoadEntities: true,
      synchronize: true, // TODO: DISABLE AND SWITCH TO MIGRATIONS WHEN THERE'S ACTUAL DATA IN DATABASE.
      ssl: {
        rejectUnauthorized: false,
      },
    }),
    NotificationsModule,
    ScheduleModule.forRoot(),
    NearModule,
    ContractModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
