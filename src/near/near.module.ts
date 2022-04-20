import { Module } from '@nestjs/common';

import { NearService } from './near.service';

@Module({
  providers: [
    {
      provide: NearService,
      useFactory: async () => {
        const nearService = new NearService();

        await nearService.initContract();

        return nearService;
      },
    },
  ],
  exports: [NearService],
})
export class NearModule {}
