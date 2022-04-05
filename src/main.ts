import { NestFactory } from '@nestjs/core';
import {
  DocumentBuilder,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { resolve } from 'path';
import { writeFileSync } from 'fs';

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

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
