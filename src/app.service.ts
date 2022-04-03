import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(user: any): { data: string } {
    return { data: `Hello, ${user.accountId}!` };
  }
}
