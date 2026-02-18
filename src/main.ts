import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { EnvironmentValidator } from './common/config/environment.validator';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  logger.log('Starting application...');
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(logger);

  // Validate environment variables
  const configService = app.get(ConfigService);
  const envValidator = new EnvironmentValidator(configService);
  envValidator.validate();

  // Enable validation with enhanced security options
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      disableErrorMessages: configService.get<string>('NODE_ENV') === 'production',
    }),
  );

  // Global API prefix (health stays at /health, API at /v1)
  app.setGlobalPrefix('v1', { exclude: ['health'] });

  // Enable CORS with security settings
  const allowedOrigins = configService.get<string>('ALLOWED_ORIGINS');
  app.enableCors({
    origin: allowedOrigins?.split(',') || true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Per-Page'],
    maxAge: 3600,
  });

  const port = configService.get<number>('PORT') || 3000;

  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Environment: ${configService.get<string>('NODE_ENV') || 'development'}`);
  logger.log(`API Version: v1`);
}

bootstrap().catch((err) => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
