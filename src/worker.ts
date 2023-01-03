import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WorkerModule } from './worker.module';
import {Worker} from 'jest-worker';

declare module "jest-worker" {
  interface Worker {
    bootstrap: typeof bootstrap;
  }
}
export async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(WorkerModule)
  
  process.env.WORKER_HTTP_PORT = process.env.WORKER_HTTP_PORT ?? '4001';
  await app.listen(process.env.WORKER_HTTP_PORT);
  console.debug(`Worker is running on ${await app.getUrl()}`);
}

// run bootstrap automatically only in the main thread
if (!process.env.JEST_WORKER_ID) {
  bootstrap();
}