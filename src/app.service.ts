import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(user: any) {
    return { data: `Hello, ${user.accountId}!` };
  }
}
