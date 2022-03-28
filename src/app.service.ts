import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(user: any): string {
    return `Hello, ${user.accountId}!`;
  }
}
