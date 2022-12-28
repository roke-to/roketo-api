import { NestFactory } from '@nestjs/core';
import {
  DocumentBuilder,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { resolve } from 'path';
import { writeFileSync } from 'fs';
import {Worker} from 'jest-worker';

import { AppModule } from './app.module';

async function bootstrap() {
  // TODO: Set up CORS properly for allowed origins
  const app = await NestFactory.create(AppModule, { cors: true });

  const config = new DocumentBuilder()
    .setTitle('Roke.to')
    .setDescription('The best realtime streaming solution')
    .setVersion('0.0.1')
    .addServer('https://roketo-test-api.herokuapp.com')
    .addBearerAuth()
    .build();
  const options: SwaggerDocumentOptions = {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  };
  const document = SwaggerModule.createDocument(app, config, options);

  if (process.env.GENERATE_SWAGGER_JSON) {
    const outputPath = resolve(process.cwd(), 'swagger.json');
    writeFileSync(outputPath, JSON.stringify(document), { encoding: 'utf8' });

    await app.close();

    return;
  }

  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const worker = new Worker(__filename, {
    numWorkers: 1,
    exposedMethods: [
      "bootstrap",
    ],
  });

  if (worker.getStdout()) worker.getStdout().pipe(process.stdout);
  if (worker.getStderr()) worker.getStderr().pipe(process.stderr);

  await app.listen(process.env.PORT || 3000);
}
// run bootstrap automatically only in the main thread
if (!process.env.JEST_WORKER_ID) {
  bootstrap();
}