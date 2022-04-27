import { Module } from '@nestjs/common';

import { NearModule } from '../near/near.module';
import { ContractService } from './contract.service';

@Module({
  imports: [NearModule],
  providers: [ContractService],
  exports: [ContractService],
})
export class ContractModule {}
