import { Module } from '@nestjs/common';

import { NearModule } from '../near/near.module';
import { NearService } from '../near/near.service';
import { ContractService } from './contract.service';

@Module({
  imports: [NearModule],
  providers: [
    {
      provide: ContractService,
      useFactory: async (nearService) => {
        const contractService = new ContractService(nearService);

        await contractService.initContract();

        return contractService;
      },
      inject: [NearService],
    },
  ],
  exports: [ContractService],
})
export class ContractModule {}
