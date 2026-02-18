"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _core = require("@nestjs/core");
const _common = require("@nestjs/common");
const _appmodule = require("./app.module");
async function bootstrap() {
    const logger = new _common.Logger('Bootstrap');
    logger.log('Starting application...');
    const app = await _core.NestFactory.create(_appmodule.AppModule, {
        bufferLogs: true
    });
    app.useLogger(logger);
    // Enable validation
    app.useGlobalPipes(new _common.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true
    }));
    // Global API prefix (health stays at /health, API at /v1)
    app.setGlobalPrefix('v1', {
        exclude: [
            'health'
        ]
    });
    // Enable CORS
    app.enableCors({
        origin: process.env.ALLOWED_ORIGINS?.split(',') || true,
        credentials: true
    });
    const port = process.env.PORT || 3000;
    await app.listen(port);
    logger.log(`Application is running on: http://localhost:${port}`);
    logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}
bootstrap().catch((err)=>{
    console.error('Bootstrap failed:', err);
    process.exit(1);
});

//# sourceMappingURL=main.js.map