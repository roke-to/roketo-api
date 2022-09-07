"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const fs_1 = require("fs");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { cors: true });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Roke.to')
        .setDescription('The best realtime streaming solution')
        .setVersion('0.0.1')
        .addServer('https://roketo-test-api.herokuapp.com')
        .addBearerAuth()
        .build();
    const options = {
        operationIdFactory: (controllerKey, methodKey) => methodKey,
    };
    const document = swagger_1.SwaggerModule.createDocument(app, config, options);
    if (process.env.GENERATE_SWAGGER_JSON) {
        const outputPath = (0, path_1.resolve)(process.cwd(), 'swagger.json');
        (0, fs_1.writeFileSync)(outputPath, JSON.stringify(document), { encoding: 'utf8' });
        await app.close();
        return;
    }
    swagger_1.SwaggerModule.setup('api', app, document);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    await app.listen(process.env.PORT || 3000);
}
bootstrap();
//# sourceMappingURL=main.js.map